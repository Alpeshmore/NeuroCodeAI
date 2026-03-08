"""
lambda_handler.py
AWS Lambda function for background code processing.
Deploy this as a standalone Lambda — it reads from S3, processes, and writes to DynamoDB.
Triggered by SQS events or direct invocation from the backend.
"""
import os
import json
import re
import ast
import logging
import boto3
from decimal import Decimal

logger = logging.getLogger()
logger.setLevel(logging.INFO)

REGION = os.environ.get("AWS_REGION", "us-east-1")
DYNAMODB_TABLE = os.environ.get("DYNAMODB_TABLE", "neurocode-analyses")
S3_BUCKET = os.environ.get("S3_BUCKET", "neurocode-ai-snippets")

s3 = boto3.client("s3", region_name=REGION)
dynamodb = boto3.resource("dynamodb", region_name=REGION)
table = dynamodb.Table(DYNAMODB_TABLE)


def lambda_handler(event, context):
    """
    Entry point.
    Supports two trigger types:
      1. Direct invocation — event is the job payload dict
      2. SQS trigger — event["Records"] contains SQS messages
    """
    records = event.get("Records", [])
    if records:
        # SQS trigger
        for record in records:
            body = json.loads(record["body"])
            _process_job(body)
    else:
        # Direct invocation
        _process_job(event)

    return {"statusCode": 200, "body": "OK"}


def _process_job(job: dict):
    analysis_id = job.get("analysis_id")
    s3_key = job.get("s3_key")
    language = job.get("language", "python")

    if not analysis_id or not s3_key:
        logger.error("Invalid job payload: %s", json.dumps(job))
        return

    logger.info("Processing job: analysis_id=%s  s3_key=%s", analysis_id, s3_key)

    # 1. Read code from S3
    try:
        resp = s3.get_object(Bucket=S3_BUCKET, Key=s3_key)
        code = resp["Body"].read().decode("utf-8")
    except Exception as e:
        logger.error("Failed to read s3://%s/%s: %s", S3_BUCKET, s3_key, e)
        _store_error(analysis_id, str(e))
        return

    # 2. Deep analysis
    result = _deep_analysis(code, language)

    # 3. Store back in DynamoDB
    try:
        table.update_item(
            Key={"analysis_id": analysis_id},
            UpdateExpression="SET #s = :s, job_result = :r",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={
                ":s": "processed",
                ":r": _float_to_decimal(result),
            },
        )
        logger.info("Stored result for %s", analysis_id)
    except Exception as e:
        logger.error("DynamoDB update failed: %s", e)


def _deep_analysis(code: str, language: str) -> dict:
    """Extended static analysis — runs inside Lambda."""
    lines = code.split("\n")
    code_lines = [l for l in lines if l.strip() and not l.strip().startswith("#")]

    result = {
        "total_lines": len(lines),
        "code_lines": len(code_lines),
        "blank_lines": sum(1 for l in lines if not l.strip()),
        "comment_lines": sum(1 for l in lines if l.strip().startswith("#")),
        "functions": [],
        "classes": [],
        "imports": [],
        "complexity_details": {},
    }

    if language == "python":
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    result["functions"].append({
                        "name": node.name,
                        "line": node.lineno,
                        "args": len(node.args.args),
                        "is_recursive": _is_recursive(node),
                    })
                elif isinstance(node, ast.ClassDef):
                    methods = [n.name for n in ast.walk(node) if isinstance(n, ast.FunctionDef)]
                    result["classes"].append({
                        "name": node.name,
                        "line": node.lineno,
                        "method_count": len(methods),
                    })
                elif isinstance(node, (ast.Import, ast.ImportFrom)):
                    module = getattr(node, "module", None)
                    names = [alias.name for alias in node.names]
                    result["imports"].append({"module": module, "names": names})
        except SyntaxError as e:
            result["syntax_error"] = str(e)

    return result


def _is_recursive(func_node):
    name = func_node.name
    for child in ast.walk(func_node):
        if isinstance(child, ast.Call) and isinstance(child.func, ast.Name) and child.func.id == name:
            return True
    return False


def _store_error(analysis_id: str, error: str):
    try:
        table.update_item(
            Key={"analysis_id": analysis_id},
            UpdateExpression="SET #s = :s, job_error = :e",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":s": "error", ":e": error},
        )
    except Exception:
        pass


def _float_to_decimal(obj):
    if isinstance(obj, float):
        return Decimal(str(obj))
    if isinstance(obj, dict):
        return {k: _float_to_decimal(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_float_to_decimal(i) for i in obj]
    return obj
