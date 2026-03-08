"""
sqs_service.py
Amazon SQS integration for asynchronous job processing.
"""
import json
import uuid
import logging
from typing import Optional

from aws_config import get_client, SQS_QUEUE_URL, is_aws_configured

logger = logging.getLogger("neurocode.sqs")


class SQSService:
    """Send and receive processing jobs via Amazon SQS."""

    def __init__(self):
        self.queue_url = SQS_QUEUE_URL
        self.client = None
        self._init_client()

    def _init_client(self):
        if not is_aws_configured() or not self.queue_url:
            logger.warning("SQS not configured — async processing disabled")
            return
        try:
            self.client = get_client("sqs")
            # Validate the queue exists
            self.client.get_queue_attributes(
                QueueUrl=self.queue_url,
                AttributeNames=["QueueArn"],
            )
            logger.info("SQS connected to %s", self.queue_url)
        except Exception as e:
            logger.warning("SQS init failed (%s) — async processing disabled", e)
            self.client = None

    # ------------------------------------------------------------------
    # Send
    # ------------------------------------------------------------------
    def send_processing_job(
        self,
        analysis_id: str,
        s3_key: str,
        language: str,
        user_id: str = "anonymous",
    ) -> Optional[str]:
        """
        Enqueue a background processing job.
        Returns the SQS MessageId or None if send failed / SQS disabled.
        """
        if not self.client:
            return None

        message = {
            "job_id": uuid.uuid4().hex[:12],
            "analysis_id": analysis_id,
            "s3_key": s3_key,
            "language": language,
            "user_id": user_id,
            "action": "deep_analysis",
        }

        try:
            resp = self.client.send_message(
                QueueUrl=self.queue_url,
                MessageBody=json.dumps(message),
                MessageGroupId=user_id if self.queue_url.endswith(".fifo") else None,
                MessageDeduplicationId=(
                    uuid.uuid4().hex if self.queue_url.endswith(".fifo") else None
                ),
            )
            msg_id = resp["MessageId"]
            logger.info("Enqueued job %s (MessageId=%s)", message["job_id"], msg_id)
            return msg_id
        except Exception as e:
            logger.error("SQS send failed: %s", e)
            return None

    # ------------------------------------------------------------------
    # Receive (used by worker / polling mode)
    # ------------------------------------------------------------------
    def receive_jobs(self, max_messages: int = 5, wait_seconds: int = 10) -> list:
        """Long-poll for messages. Returns list of (receipt_handle, body_dict)."""
        if not self.client:
            return []
        try:
            resp = self.client.receive_message(
                QueueUrl=self.queue_url,
                MaxNumberOfMessages=min(max_messages, 10),
                WaitTimeSeconds=wait_seconds,
                AttributeNames=["SentTimestamp"],
            )
            messages = []
            for msg in resp.get("Messages", []):
                body = json.loads(msg["Body"])
                messages.append((msg["ReceiptHandle"], body))
            return messages
        except Exception as e:
            logger.error("SQS receive failed: %s", e)
            return []

    def delete_message(self, receipt_handle: str) -> bool:
        if not self.client:
            return False
        try:
            self.client.delete_message(
                QueueUrl=self.queue_url,
                ReceiptHandle=receipt_handle,
            )
            return True
        except Exception as e:
            logger.error("SQS delete failed: %s", e)
            return False

    def get_queue_depth(self) -> int:
        """Return approximate number of messages in the queue."""
        if not self.client:
            return -1
        try:
            resp = self.client.get_queue_attributes(
                QueueUrl=self.queue_url,
                AttributeNames=["ApproximateNumberOfMessages"],
            )
            return int(resp["Attributes"]["ApproximateNumberOfMessages"])
        except Exception as e:
            logger.error("SQS depth check failed: %s", e)
            return -1
