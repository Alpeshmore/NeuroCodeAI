import os
import time
import logging
from typing import Optional, List

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from cloudwatch_logger import setup_logging, CloudWatchMetrics
from recursive_engine import RecursiveReasoningEngine
from confusion_detector import ConfusionDetector
from bedrock_service import BedrockService
from s3_service import S3Service
from dynamodb_service import DynamoDBService
from sqs_service import SQSService
from lambda_service import LambdaService

# ---------------------------------------------------------------------------
# Logging — structured JSON, optional CloudWatch push
# ---------------------------------------------------------------------------
setup_logging(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("neurocode.api")

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="NeuroCode AI API", version="2.0.0")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    code: str
    language: Optional[str] = "python"
    user_id: Optional[str] = None

class SaveRequest(BaseModel):
    user_id: str
    code_snippet: str
    analysis: dict
    confusion_score: float
    complexity_score: float

# ---------------------------------------------------------------------------
# Service instances (singletons) — each gracefully degrades when AWS is absent
# ---------------------------------------------------------------------------
recursive_engine = RecursiveReasoningEngine()
confusion_detector = ConfusionDetector()
bedrock_service = BedrockService()
s3_service = S3Service()
dynamodb_service = DynamoDBService()
sqs_service = SQSService()
lambda_service = LambdaService()
cw_metrics = CloudWatchMetrics()

@app.get("/")
def root():
    return {"status": "NeuroCode AI API is running", "version": "2.0.0"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "services": {
            "s3": s3_service.client is not None,
            "dynamodb": dynamodb_service.table is not None,
            "sqs": sqs_service.client is not None,
            "lambda": lambda_service.client is not None,
            "bedrock": bedrock_service.client is not None,
        },
    }

@app.post("/analyze")
async def analyze_code(request: AnalyzeRequest):
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    start = time.monotonic()
    try:
        lines = request.code.split("\n")
        confusion_flags = confusion_detector.detect(request.code, request.language)
        blocks = recursive_engine.parse_blocks(request.code, request.language)
        ai_explanations = await bedrock_service.explain_code(
            request.code, request.language, blocks
        )

        analysis = []
        for i, line in enumerate(lines):
            line_num = i + 1
            stripped = line.strip()
            if not stripped:
                continue

            confusion_flag = confusion_flags.get(line_num, False)
            explanation = ai_explanations.get(line_num, {})
            block_context = recursive_engine.get_block_context(blocks, line_num)

            analysis.append({
                "line": line_num,
                "code": line,
                "explanation": explanation.get("explanation", _local_explain(stripped, request.language)),
                "difficulty": explanation.get("difficulty", _assess_difficulty(stripped, confusion_flag)),
                "confusion_hotspot": confusion_flag,
                "block_type": block_context.get("type", "statement"),
                "concepts": explanation.get("concepts", []),
            })

        confusion_score = confusion_detector.score(confusion_flags, lines)
        complexity_score = recursive_engine.complexity_score(blocks, lines)

        # ── AWS integrations (all non-blocking / best-effort) ─────────
        s3_key = None
        analysis_id = None
        try:
            s3_key = s3_service.upload_snippet(request.code, request.user_id)
        except Exception:
            logger.debug("S3 upload skipped")

        try:
            analysis_id = dynamodb_service.store_analysis(
                user_id=request.user_id or "anonymous",
                code_snippet=request.code,
                language=request.language,
                analysis=analysis,
                confusion_score=confusion_score,
                complexity_score=complexity_score,
                s3_key=s3_key,
                summary=ai_explanations.get("summary", ""),
            )
        except Exception:
            logger.debug("DynamoDB store skipped")

        # Queue background deep-analysis job
        if analysis_id and s3_key:
            try:
                sqs_service.send_processing_job(
                    analysis_id=analysis_id,
                    s3_key=s3_key,
                    language=request.language,
                    user_id=request.user_id or "anonymous",
                )
            except Exception:
                logger.debug("SQS send skipped")

        # Record CloudWatch metrics
        latency_ms = (time.monotonic() - start) * 1000
        cw_metrics.record_analysis(request.language, latency_ms)

        return {
            "analysis_id": analysis_id,
            "analysis": analysis,
            "complexity_score": round(complexity_score, 1),
            "confusion_score": round(confusion_score, 1),
            "blocks": blocks,
            "summary": ai_explanations.get("summary", ""),
            "recommended_concepts": _get_recommended_concepts(analysis),
            "s3_key": s3_key,
        }

    except Exception as e:
        cw_metrics.record_error(type(e).__name__)
        logger.exception("Analysis failed")
        raise HTTPException(status_code=500, detail=str(e))


# ======================================================================
# File upload endpoint
# ======================================================================
@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user_id: str = Form("anonymous"),
):
    """Upload a file to S3 and store metadata in DynamoDB."""
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")

    s3_key = s3_service.upload_file(
        file_bytes=contents,
        filename=file.filename,
        content_type=file.content_type or "application/octet-stream",
        user_id=user_id,
    )
    if not s3_key:
        raise HTTPException(status_code=502, detail="File upload failed")

    # Store metadata in DynamoDB
    analysis_id = dynamodb_service.store_analysis(
        user_id=user_id,
        code_snippet=contents.decode("utf-8", errors="replace")[:2000],
        language="unknown",
        analysis=[],
        confusion_score=0,
        complexity_score=0,
        s3_key=s3_key,
        summary="File uploaded — awaiting analysis",
    )

    # Trigger Lambda processing
    if analysis_id:
        lambda_service.trigger_processing_job(
            analysis_id=analysis_id,
            s3_key=s3_key,
            language="auto",
            user_id=user_id,
        )

    return {
        "analysis_id": analysis_id,
        "s3_key": s3_key,
        "filename": file.filename,
        "size_bytes": len(contents),
        "status": "processing",
    }


# ======================================================================
# Results retrieval
# ======================================================================
@app.get("/analysis/{analysis_id}")
def get_analysis(analysis_id: str):
    """Retrieve a stored analysis and its job results from DynamoDB."""
    record = dynamodb_service.get_analysis(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return record


@app.get("/analyses")
def list_analyses(user_id: str, limit: int = 20):
    """List recent analyses for a user."""
    return dynamodb_service.list_user_analyses(user_id, limit=min(limit, 100))


@app.get("/files")
def list_files(user_id: str):
    """List files uploaded by a user."""
    return s3_service.list_user_files(user_id)


@app.get("/download-url")
def get_download_url(key: str):
    """Generate a pre-signed S3 download URL."""
    url = s3_service.generate_presigned_url(key)
    if not url:
        raise HTTPException(status_code=404, detail="File not found or S3 unavailable")
    return {"url": url}


@app.get("/queue-status")
def queue_status():
    """Return SQS queue depth."""
    depth = sqs_service.get_queue_depth()
    return {"queue_depth": depth, "queue_url": sqs_service.queue_url or "not configured"}

def _local_explain(line: str, language: str) -> str:
    line_lower = line.lower()
    if line_lower.startswith("def "):
        return f"Function definition: defines a reusable block of code named '{line.split('(')[0][4:]}'"
    elif line_lower.startswith("class "):
        return f"Class definition: creates a blueprint for objects"
    elif line_lower.startswith("for "):
        return "For loop: iterates over a sequence of values"
    elif line_lower.startswith("while "):
        return "While loop: repeats a block as long as condition is true"
    elif line_lower.startswith("if "):
        return "Conditional: executes code only if condition is true"
    elif line_lower.startswith("elif "):
        return "Else-if: checks another condition if previous was false"
    elif line_lower.startswith("else"):
        return "Else: executes when all previous conditions were false"
    elif line_lower.startswith("return "):
        return "Return statement: exits function and sends back a value"
    elif line_lower.startswith("import ") or line_lower.startswith("from "):
        return "Import: loads external module or function for use"
    elif "=" in line and "==" not in line:
        var = line.split("=")[0].strip()
        return f"Assignment: stores a value in variable '{var}'"
    elif line_lower.startswith("print("):
        return "Print: outputs a value to the console/screen"
    elif line_lower.startswith("#"):
        return "Comment: human-readable note ignored by the computer"
    elif line_lower.startswith("try:"):
        return "Try block: attempts code that might fail"
    elif line_lower.startswith("except"):
        return "Except: handles errors caught in the try block"
    return "Statement: executes an operation or expression"

def _assess_difficulty(line: str, confusion_flag: bool) -> str:
    if confusion_flag:
        return "hard"
    if any(kw in line for kw in ["lambda", "comprehension", "yield", "async", "await", "decorator"]):
        return "hard"
    if any(kw in line for kw in ["class", "recursion", "nested", "complex"]):
        return "medium"
    return "easy"

def _get_recommended_concepts(analysis: list) -> list:
    concepts = set()
    for item in analysis:
        for c in item.get("concepts", []):
            concepts.add(c)
        if item.get("confusion_hotspot"):
            code = item.get("code", "").lower()
            if "for" in code or "while" in code:
                concepts.add("Loops & Iteration")
            if "def " in code:
                concepts.add("Functions & Scope")
            if "class " in code:
                concepts.add("Object-Oriented Programming")
            if "recursion" in code or item.get("block_type") == "recursive_function":
                concepts.add("Recursion")
            if "lambda" in code:
                concepts.add("Lambda Functions")
            if "[" in code and "for" in code:
                concepts.add("List Comprehensions")
    return list(concepts)[:6]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
