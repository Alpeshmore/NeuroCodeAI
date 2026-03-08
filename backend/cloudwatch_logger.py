"""
cloudwatch_logger.py
Structured logging with CloudWatch Logs integration.
Configures Python logging to emit structured JSON and optionally push to CloudWatch.
"""
import os
import json
import time
import logging
import sys
from datetime import datetime, timezone
from typing import Optional

from aws_config import get_client, CLOUDWATCH_LOG_GROUP, ENVIRONMENT, is_aws_configured

logger = logging.getLogger("neurocode.cloudwatch")


# ---------------------------------------------------------------------------
# JSON Formatter — structured logs for CloudWatch / container stdout
# ---------------------------------------------------------------------------
class JsonFormatter(logging.Formatter):
    """Emit each log record as a single JSON line (CloudWatch-friendly)."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        if record.exc_info and record.exc_info[0]:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry, default=str)


# ---------------------------------------------------------------------------
# CloudWatch Logs pusher
# ---------------------------------------------------------------------------
class CloudWatchHandler(logging.Handler):
    """
    Custom logging handler that pushes log events to CloudWatch Logs.
    Batches events to reduce API calls. Use flush() to force send.
    """

    def __init__(self, log_group: str, log_stream: Optional[str] = None,
                 batch_size: int = 25, flush_interval: int = 10):
        super().__init__()
        self.log_group = log_group
        self.log_stream = log_stream or f"backend/{os.getpid()}/{datetime.now(timezone.utc):%Y%m%d-%H%M%S}"
        self.batch_size = batch_size
        self.flush_interval = flush_interval
        self._buffer: list = []
        self._last_flush = time.monotonic()
        self._sequence_token: Optional[str] = None
        self.client = None

        if is_aws_configured():
            try:
                self.client = get_client("logs")
                self._ensure_group_and_stream()
                logger.info("CloudWatch handler: %s / %s", self.log_group, self.log_stream)
            except Exception as e:
                # Fall through — logs still go to stdout via other handlers
                print(f"[CloudWatch] Handler init failed: {e}", file=sys.stderr)

    def _ensure_group_and_stream(self):
        try:
            self.client.create_log_group(logGroupName=self.log_group)
        except self.client.exceptions.ResourceAlreadyExistsException:
            pass
        try:
            self.client.create_log_stream(
                logGroupName=self.log_group,
                logStreamName=self.log_stream,
            )
        except self.client.exceptions.ResourceAlreadyExistsException:
            pass

    def emit(self, record: logging.LogRecord):
        if not self.client:
            return
        self._buffer.append({
            "timestamp": int(record.created * 1000),
            "message": self.format(record),
        })
        if len(self._buffer) >= self.batch_size or \
                (time.monotonic() - self._last_flush) >= self.flush_interval:
            self.flush()

    def flush(self):
        if not self.client or not self._buffer:
            return
        events = sorted(self._buffer, key=lambda e: e["timestamp"])
        self._buffer = []
        self._last_flush = time.monotonic()

        kwargs = {
            "logGroupName": self.log_group,
            "logStreamName": self.log_stream,
            "logEvents": events,
        }
        if self._sequence_token:
            kwargs["sequenceToken"] = self._sequence_token

        try:
            resp = self.client.put_log_events(**kwargs)
            self._sequence_token = resp.get("nextSequenceToken")
        except Exception as e:
            print(f"[CloudWatch] put_log_events failed: {e}", file=sys.stderr)


# ---------------------------------------------------------------------------
# Custom metrics helper
# ---------------------------------------------------------------------------
class CloudWatchMetrics:
    """Publish custom metrics to CloudWatch (analysis counts, latency, etc.)."""

    NAMESPACE = "NeuroCodeAI"

    def __init__(self):
        self.client = None
        if is_aws_configured():
            try:
                self.client = get_client("cloudwatch")
            except Exception as e:
                logger.warning("CloudWatch metrics init failed: %s", e)

    def put_metric(self, name: str, value: float, unit: str = "Count",
                   dimensions: Optional[dict] = None):
        if not self.client:
            return
        dims = [{"Name": k, "Value": str(v)} for k, v in (dimensions or {}).items()]
        try:
            self.client.put_metric_data(
                Namespace=self.NAMESPACE,
                MetricData=[{
                    "MetricName": name,
                    "Dimensions": dims,
                    "Value": value,
                    "Unit": unit,
                    "Timestamp": datetime.now(timezone.utc),
                }],
            )
        except Exception as e:
            logger.error("CloudWatch put_metric failed: %s", e)

    def record_analysis(self, language: str, latency_ms: float):
        self.put_metric("AnalysisCount", 1, "Count", {"Language": language})
        self.put_metric("AnalysisLatencyMs", latency_ms, "Milliseconds", {"Language": language})

    def record_error(self, error_type: str):
        self.put_metric("ErrorCount", 1, "Count", {"ErrorType": error_type})


# ---------------------------------------------------------------------------
# Setup helper — call once at app startup
# ---------------------------------------------------------------------------
def setup_logging(level: str = "INFO"):
    """
    Configure structured JSON logging.
    - Always writes to stdout (for container / systemd).
    - Optionally pushes to CloudWatch Logs.
    """
    root = logging.getLogger()
    root.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Console handler (structured JSON)
    console = logging.StreamHandler(sys.stdout)
    console.setFormatter(JsonFormatter())
    root.addHandler(console)

    # CloudWatch handler (production only)
    if ENVIRONMENT == "production" and is_aws_configured():
        cw_handler = CloudWatchHandler(log_group=CLOUDWATCH_LOG_GROUP)
        cw_handler.setFormatter(JsonFormatter())
        root.addHandler(cw_handler)
        logger.info("CloudWatch logging active → %s", CLOUDWATCH_LOG_GROUP)

    return root
