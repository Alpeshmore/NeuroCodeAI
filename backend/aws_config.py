"""
aws_config.py
Centralized AWS configuration and boto3 session factory.
Uses IAM roles when running on AWS (EC2/ECS/Lambda) — no hardcoded credentials.
Falls back to env vars or ~/.aws/credentials for local development.
"""
import os
import logging
import boto3
from botocore.config import Config

logger = logging.getLogger("neurocode.aws")

# ---------------------------------------------------------------------------
# Environment-driven configuration
# ---------------------------------------------------------------------------
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET = os.getenv("S3_BUCKET", "neurocode-ai-snippets")
DYNAMODB_TABLE = os.getenv("DYNAMODB_TABLE", "neurocode-analyses")
SQS_QUEUE_URL = os.getenv("SQS_QUEUE_URL", "")
LAMBDA_FUNCTION_NAME = os.getenv("LAMBDA_FUNCTION_NAME", "neurocode-process-job")
CLOUDWATCH_LOG_GROUP = os.getenv("CLOUDWATCH_LOG_GROUP", "/neurocode-ai/backend")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Retry / timeout configuration
_BOTO_CONFIG = Config(
    region_name=AWS_REGION,
    retries={"max_attempts": 3, "mode": "adaptive"},
    connect_timeout=5,
    read_timeout=10,
)


def _build_session() -> boto3.Session:
    """
    Build a boto3 Session.
    On AWS infra the instance profile / task role is picked up automatically.
    For local dev you can set AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY env vars
    or configure an AWS CLI profile.
    """
    profile = os.getenv("AWS_PROFILE")  # optional for local dev
    return boto3.Session(region_name=AWS_REGION, profile_name=profile)


# Singleton session — reused across all service modules
_session: boto3.Session | None = None


def get_session() -> boto3.Session:
    global _session
    if _session is None:
        _session = _build_session()
        logger.info("AWS session initialized (region=%s)", AWS_REGION)
    return _session


def get_client(service_name: str):
    """Return a low-level boto3 client with standard retry/timeout config."""
    return get_session().client(service_name, config=_BOTO_CONFIG)


def get_resource(service_name: str):
    """Return a high-level boto3 resource."""
    return get_session().resource(service_name, config=_BOTO_CONFIG)


def is_aws_configured() -> bool:
    """Quick check: can we reach AWS at all?"""
    try:
        sts = get_client("sts")
        sts.get_caller_identity()
        return True
    except Exception:
        return False
