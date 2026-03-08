"""
s3_service.py
AWS S3 integration for storing code snippets and uploaded files.
Uses IAM roles on AWS infra — no hardcoded credentials.
"""
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional

from aws_config import get_client, S3_BUCKET, is_aws_configured

logger = logging.getLogger("neurocode.s3")


class S3Service:
    """Upload, retrieve, and list code snippets / files stored in S3."""

    def __init__(self):
        self.bucket = S3_BUCKET
        self.client = None
        self._init_client()

    def _init_client(self):
        if not is_aws_configured():
            logger.warning("AWS not configured — S3 uploads disabled")
            return
        try:
            self.client = get_client("s3")
            self.client.head_bucket(Bucket=self.bucket)
            logger.info("S3 connected to bucket '%s'", self.bucket)
        except Exception as e:
            logger.warning("S3 init failed (%s) — uploads disabled", e)
            self.client = None

    # ------------------------------------------------------------------
    # Snippets
    # ------------------------------------------------------------------
    def upload_snippet(self, code: str, user_id: Optional[str] = None) -> Optional[str]:
        """Upload a code snippet. Returns the S3 key or None."""
        if not self.client:
            return None
        now = datetime.now(timezone.utc)
        snippet_id = uuid.uuid4().hex[:8]
        user_prefix = (user_id or "anonymous")[:32]
        key = f"snippets/{user_prefix}/{now:%Y/%m/%d}/{snippet_id}.txt"
        try:
            self.client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=code.encode("utf-8"),
                ContentType="text/plain",
                ServerSideEncryption="aws:kms",
                Metadata={"user_id": user_prefix, "uploaded_at": now.isoformat()},
            )
            logger.info("Uploaded snippet s3://%s/%s", self.bucket, key)
            return key
        except Exception as e:
            logger.error("S3 snippet upload failed: %s", e)
            return None

    # ------------------------------------------------------------------
    # Generic file upload
    # ------------------------------------------------------------------
    def upload_file(self, file_bytes: bytes, filename: str, content_type: str,
                    user_id: Optional[str] = None) -> Optional[str]:
        """Upload an arbitrary file. Returns the S3 key or None."""
        if not self.client:
            return None
        now = datetime.now(timezone.utc)
        ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
        file_id = uuid.uuid4().hex[:12]
        user_prefix = (user_id or "anonymous")[:32]
        key = f"uploads/{user_prefix}/{now:%Y/%m/%d}/{file_id}.{ext}"
        try:
            self.client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=file_bytes,
                ContentType=content_type,
                ServerSideEncryption="aws:kms",
                Metadata={
                    "original_filename": filename[:255],
                    "user_id": user_prefix,
                    "uploaded_at": now.isoformat(),
                },
            )
            logger.info("Uploaded file s3://%s/%s (%s)", self.bucket, key, content_type)
            return key
        except Exception as e:
            logger.error("S3 file upload failed: %s", e)
            return None

    # ------------------------------------------------------------------
    # Download helpers
    # ------------------------------------------------------------------
    def generate_presigned_url(self, key: str, expires_in: int = 3600) -> Optional[str]:
        """Pre-signed download URL (default 1 h)."""
        if not self.client:
            return None
        try:
            return self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expires_in,
            )
        except Exception as e:
            logger.error("Presigned URL failed: %s", e)
            return None

    def get_snippet(self, key: str) -> Optional[str]:
        if not self.client:
            return None
        try:
            resp = self.client.get_object(Bucket=self.bucket, Key=key)
            return resp["Body"].read().decode("utf-8")
        except Exception as e:
            logger.error("S3 get failed: %s", e)
            return None

    # ------------------------------------------------------------------
    # Listing / deletion
    # ------------------------------------------------------------------
    def list_user_files(self, user_id: str, prefix: str = "uploads") -> list:
        if not self.client:
            return []
        safe_user = (user_id or "anonymous")[:32]
        try:
            paginator = self.client.get_paginator("list_objects_v2")
            results = []
            for page in paginator.paginate(Bucket=self.bucket, Prefix=f"{prefix}/{safe_user}/"):
                for obj in page.get("Contents", []):
                    results.append({
                        "key": obj["Key"],
                        "size": obj["Size"],
                        "last_modified": obj["LastModified"].isoformat(),
                    })
            return results
        except Exception as e:
            logger.error("S3 list failed: %s", e)
            return []

    def delete_file(self, key: str) -> bool:
        if not self.client:
            return False
        try:
            self.client.delete_object(Bucket=self.bucket, Key=key)
            logger.info("Deleted s3://%s/%s", self.bucket, key)
            return True
        except Exception as e:
            logger.error("S3 delete failed: %s", e)
            return False
