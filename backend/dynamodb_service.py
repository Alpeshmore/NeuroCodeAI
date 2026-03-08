"""
dynamodb_service.py
Amazon DynamoDB integration for storing analysis metadata and results.
"""
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, List
from decimal import Decimal

from aws_config import get_resource, get_client, DYNAMODB_TABLE, is_aws_configured

logger = logging.getLogger("neurocode.dynamodb")


def _float_to_decimal(obj):
    """DynamoDB requires Decimal instead of float."""
    if isinstance(obj, float):
        return Decimal(str(obj))
    if isinstance(obj, dict):
        return {k: _float_to_decimal(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_float_to_decimal(i) for i in obj]
    return obj


def _decimal_to_float(obj):
    """Convert Decimal back to float for JSON serialisation."""
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, dict):
        return {k: _decimal_to_float(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_decimal_to_float(i) for i in obj]
    return obj


class DynamoDBService:
    """CRUD operations for code-analysis records in DynamoDB."""

    def __init__(self):
        self.table_name = DYNAMODB_TABLE
        self.table = None
        self._init_table()

    def _init_table(self):
        if not is_aws_configured():
            logger.warning("AWS not configured — DynamoDB disabled")
            return
        try:
            dynamo = get_resource("dynamodb")
            self.table = dynamo.Table(self.table_name)
            # Verify table is active
            self.table.load()
            logger.info("DynamoDB connected to table '%s'", self.table_name)
        except Exception as e:
            logger.warning("DynamoDB init failed (%s) — storage disabled", e)
            self.table = None

    # ------------------------------------------------------------------
    # Store analysis
    # ------------------------------------------------------------------
    def store_analysis(
        self,
        user_id: str,
        code_snippet: str,
        language: str,
        analysis: list,
        confusion_score: float,
        complexity_score: float,
        s3_key: Optional[str] = None,
        summary: str = "",
    ) -> Optional[str]:
        """
        Persist an analysis record. Returns the generated analysis_id or None.
        """
        if not self.table:
            return None

        analysis_id = uuid.uuid4().hex
        now = datetime.now(timezone.utc).isoformat()

        item = _float_to_decimal({
            "analysis_id": analysis_id,
            "user_id": user_id or "anonymous",
            "created_at": now,
            "language": language,
            "code_snippet": code_snippet[:2000],
            "analysis": analysis,
            "confusion_score": confusion_score,
            "complexity_score": complexity_score,
            "s3_key": s3_key or "",
            "summary": summary,
            "status": "completed",
        })

        try:
            self.table.put_item(Item=item)
            logger.info("Stored analysis %s for user %s", analysis_id, user_id)
            return analysis_id
        except Exception as e:
            logger.error("DynamoDB put_item failed: %s", e)
            return None

    # ------------------------------------------------------------------
    # Store processing-job result (from Lambda)
    # ------------------------------------------------------------------
    def store_job_result(self, analysis_id: str, result: dict) -> bool:
        """Update an existing record with processing results."""
        if not self.table:
            return False
        try:
            self.table.update_item(
                Key={"analysis_id": analysis_id},
                UpdateExpression="SET #s = :s, job_result = :r, completed_at = :t",
                ExpressionAttributeNames={"#s": "status"},
                ExpressionAttributeValues=_float_to_decimal({
                    ":s": "processed",
                    ":r": result,
                    ":t": datetime.now(timezone.utc).isoformat(),
                }),
            )
            logger.info("Updated analysis %s with job result", analysis_id)
            return True
        except Exception as e:
            logger.error("DynamoDB update failed: %s", e)
            return False

    # ------------------------------------------------------------------
    # Query helpers
    # ------------------------------------------------------------------
    def get_analysis(self, analysis_id: str) -> Optional[dict]:
        if not self.table:
            return None
        try:
            resp = self.table.get_item(Key={"analysis_id": analysis_id})
            item = resp.get("Item")
            return _decimal_to_float(item) if item else None
        except Exception as e:
            logger.error("DynamoDB get_item failed: %s", e)
            return None

    def list_user_analyses(self, user_id: str, limit: int = 20) -> List[dict]:
        """List recent analyses for a user (requires GSI on user_id)."""
        if not self.table:
            return []
        try:
            resp = self.table.query(
                IndexName="user_id-created_at-index",
                KeyConditionExpression="user_id = :uid",
                ExpressionAttributeValues={":uid": user_id},
                ScanIndexForward=False,
                Limit=limit,
            )
            return [_decimal_to_float(i) for i in resp.get("Items", [])]
        except Exception as e:
            logger.error("DynamoDB query failed: %s", e)
            return []

    def delete_analysis(self, analysis_id: str) -> bool:
        if not self.table:
            return False
        try:
            self.table.delete_item(Key={"analysis_id": analysis_id})
            logger.info("Deleted analysis %s", analysis_id)
            return True
        except Exception as e:
            logger.error("DynamoDB delete failed: %s", e)
            return False
