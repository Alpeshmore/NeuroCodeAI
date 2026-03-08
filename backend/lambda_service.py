"""
lambda_service.py
AWS Lambda integration for triggering background processing jobs.
"""
import json
import logging
from typing import Optional

from aws_config import get_client, LAMBDA_FUNCTION_NAME, is_aws_configured

logger = logging.getLogger("neurocode.lambda")


class LambdaService:
    """Invoke AWS Lambda functions for background code processing."""

    def __init__(self):
        self.function_name = LAMBDA_FUNCTION_NAME
        self.client = None
        self._init_client()

    def _init_client(self):
        if not is_aws_configured():
            logger.warning("AWS not configured — Lambda invocation disabled")
            return
        try:
            self.client = get_client("lambda")
            logger.info("Lambda client ready (function=%s)", self.function_name)
        except Exception as e:
            logger.warning("Lambda init failed (%s) — invocation disabled", e)
            self.client = None

    # ------------------------------------------------------------------
    # Async (fire-and-forget) invocation
    # ------------------------------------------------------------------
    def invoke_async(self, payload: dict) -> Optional[int]:
        """
        Invoke the Lambda function asynchronously (Event type).
        Returns the HTTP status code (202 on success) or None.
        """
        if not self.client:
            return None
        try:
            resp = self.client.invoke(
                FunctionName=self.function_name,
                InvocationType="Event",            # async — returns immediately
                Payload=json.dumps(payload).encode(),
            )
            status = resp["StatusCode"]
            logger.info("Lambda async invoke → %d", status)
            return status
        except Exception as e:
            logger.error("Lambda async invoke failed: %s", e)
            return None

    # ------------------------------------------------------------------
    # Synchronous invocation (for immediate results)
    # ------------------------------------------------------------------
    def invoke_sync(self, payload: dict) -> Optional[dict]:
        """
        Invoke the Lambda function synchronously and return the parsed response.
        """
        if not self.client:
            return None
        try:
            resp = self.client.invoke(
                FunctionName=self.function_name,
                InvocationType="RequestResponse",  # sync — waits for response
                Payload=json.dumps(payload).encode(),
            )
            if "FunctionError" in resp:
                error_payload = json.loads(resp["Payload"].read())
                logger.error("Lambda returned error: %s", error_payload)
                return None

            result = json.loads(resp["Payload"].read())
            logger.info("Lambda sync invoke completed")
            return result
        except Exception as e:
            logger.error("Lambda sync invoke failed: %s", e)
            return None

    # ------------------------------------------------------------------
    # Helper: trigger a processing job
    # ------------------------------------------------------------------
    def trigger_processing_job(
        self,
        analysis_id: str,
        s3_key: str,
        language: str,
        user_id: str = "anonymous",
    ) -> bool:
        """
        Fire-and-forget a processing job to Lambda.
        The Lambda function reads from S3, processes, and writes results to DynamoDB.
        """
        payload = {
            "analysis_id": analysis_id,
            "s3_key": s3_key,
            "language": language,
            "user_id": user_id,
            "action": "deep_analysis",
        }
        status = self.invoke_async(payload)
        return status == 202
