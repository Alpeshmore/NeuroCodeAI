# NeuroCode AI

**AI-powered code learning platform** — paste any code, get instant line-by-line explanations, confusion detection, and complexity analysis powered by AWS Bedrock (Claude 3).

---

## Features

- **Line-by-line AI Explanation** — every line explained in plain English via AWS Bedrock (Claude 3 Haiku)
- **Confusion Detection** — flags tricky patterns: lambda, recursion, nested loops, comprehensions, async/await
- **Complexity Scoring** — McCabe-style cyclomatic complexity analysis (0–10 scale)
- **Learning Insights** — difficulty breakdown, concept recommendations, code structure visualization
- **Multi-language Support** — Python, JavaScript, Java, C++
- **Monaco Editor** — VS Code-quality editor with syntax highlighting and hotspot markers
- **AWS Cloud Backend** — S3 storage, DynamoDB persistence, SQS async processing, CloudWatch monitoring
- **Local Fallback** — works without AWS credentials using built-in analysis engine

---

## Architecture

```
                        ┌─────────────┐
                        │   Frontend  │
                        │ React/Vite  │
                        └──────┬──────┘
                               │ POST /analyze
                        ┌──────▼──────┐
                        │   FastAPI   │
                        │   Backend   │
                        └──────┬──────┘
                               │
         ┌──────────┬──────────┼──────────┬──────────┐
         │          │          │          │          │
    ┌────▼────┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼────┐
    │Bedrock  │ │  S3   │ │Dynamo │ │  SQS  │ │Cloud   │
    │Claude 3 │ │Storage│ │  DB   │ │Queue  │ │Watch   │
    └─────────┘ └───────┘ └───┬───┘ └───┬───┘ └────────┘
                              │         │
                         ┌────▼─────────▼────┐
                         │      Lambda       │
                         │  (deep analysis)  │
                         └───────────────────┘
```

**Data Flow:**
1. User pastes code → frontend calls `POST /analyze`
2. Backend runs Bedrock AI + local confusion/complexity engines
3. Code stored in S3, analysis saved to DynamoDB
4. Background deep-analysis job queued to SQS → processed by Lambda
5. CloudWatch captures structured logs and custom metrics

---

## Project Structure

```
neurocode-ai/
├── frontend/                        # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── MonacoEditor.jsx     # Code editor with language tabs
│   │   │   ├── ExplanationPanel.jsx # Line-by-line AI explanations
│   │   │   ├── InsightsPanel.jsx    # Scores, concepts, structure
│   │   │   └── Navbar.jsx           # Top navigation bar
│   │   ├── pages/
│   │   │   └── Dashboard.jsx        # Main 3-panel dashboard
│   │   ├── App.jsx                  # Router setup
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Tailwind + custom styles
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                         # FastAPI Python backend
│   ├── main.py                      # API server + all endpoints
│   ├── aws_config.py                # Centralized AWS session factory
│   ├── bedrock_service.py           # AWS Bedrock AI integration
│   ├── s3_service.py                # S3 file/snippet storage
│   ├── dynamodb_service.py          # DynamoDB CRUD operations
│   ├── sqs_service.py               # SQS async job queue
│   ├── lambda_service.py            # Lambda invocation
│   ├── lambda_handler.py            # Lambda function code (deployed to AWS)
│   ├── cloudwatch_logger.py         # Structured logging + CloudWatch metrics
│   ├── recursive_engine.py          # AST-based code block parser
│   ├── confusion_detector.py        # Pattern-based confusion detection
│   ├── requirements.txt
│   └── .env.example
│
├── infra/
│   └── main.tf                      # Terraform infrastructure-as-code
│
├── DEPLOYMENT.md                    # Full AWS deployment guide
└── README.md
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **AWS Account** with Bedrock model access enabled (optional — falls back to local engine)

### 1. Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set AWS_REGION, S3_BUCKET, DYNAMODB_TABLE, SQS_QUEUE_URL

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at `http://localhost:8000` — API docs at `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:3000`

### 3. AWS Setup (Optional)

Without AWS credentials, the app uses a local analysis engine. To enable AI-powered explanations:

```bash
# Configure AWS CLI
aws configure

# Enable Bedrock model access:
# AWS Console → Bedrock → Model access → Enable "Claude 3 Haiku"

# Create resources (via Terraform)
cd infra
terraform init
terraform apply
```

Or create resources manually — see [DEPLOYMENT.md](DEPLOYMENT.md) for full instructions.

---

## API Reference

### `GET /health`

Returns service status for all AWS integrations.

```json
{
  "status": "healthy",
  "services": {
    "s3": true,
    "dynamodb": true,
    "sqs": true,
    "lambda": true,
    "bedrock": true
  }
}
```

### `POST /analyze`

Analyze code and get line-by-line AI explanations.

**Request:**
```json
{
  "code": "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)",
  "language": "python",
  "user_id": "optional-user-id"
}
```

**Response:**
```json
{
  "analysis_id": "75a2f937500d4f609b27008b12c282f5",
  "analysis": [
    {
      "line": 1,
      "code": "def factorial(n):",
      "explanation": "Defines a function named 'factorial' that takes parameter 'n'...",
      "difficulty": "easy",
      "confusion_hotspot": false,
      "block_type": "recursive_function",
      "concepts": ["function definition", "parameter"]
    }
  ],
  "complexity_score": 5.4,
  "confusion_score": 1.5,
  "blocks": [...],
  "summary": "Recursive factorial implementation...",
  "recommended_concepts": ["Recursion", "Functions & Scope"],
  "s3_key": "snippets/user/2026/03/08/abc123.txt"
}
```

### `POST /upload`

Upload a file for analysis.

### `GET /analysis/{analysis_id}`

Retrieve a stored analysis from DynamoDB.

### `GET /analyses?user_id=xxx&limit=20`

List recent analyses for a user.

### `GET /files?user_id=xxx`

List uploaded files for a user.

### `GET /download-url?key=xxx`

Generate a pre-signed S3 download URL.

### `GET /queue-status`

Return SQS queue depth.

---

## Confusion Detection

| Pattern | Weight | Example |
|---------|--------|---------|
| Lambda functions | 2 | `lambda x: x*2` |
| List comprehensions | 2 | `[x for x in range(10)]` |
| Nested loops (3+) | 3 | Triple-nested for loops |
| Walrus operator | 3 | `if (n := len(a)) > 10` |
| Async/await | 3 | `await fetch(url)` |
| Yield/generators | 3 | `yield value` |
| Recursion | +1.5 | Function calling itself |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion |
| Code Editor | Monaco Editor |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| AI/LLM | AWS Bedrock (Claude 3 Haiku) |
| Database | Amazon DynamoDB |
| Storage | Amazon S3 (KMS encrypted) |
| Queue | Amazon SQS |
| Compute | AWS Lambda |
| Monitoring | Amazon CloudWatch |
| Infrastructure | Terraform |

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full AWS deployment guide including:
- Terraform infrastructure provisioning
- IAM role and policy setup
- EC2/ECS backend deployment
- AWS Amplify frontend hosting
- Security best practices

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AWS_REGION` | `us-east-1` | AWS region |
| `S3_BUCKET` | `neurocode-ai-snippets` | S3 bucket for code storage |
| `DYNAMODB_TABLE` | `neurocode-analyses` | DynamoDB table name |
| `SQS_QUEUE_URL` | — | SQS queue URL for async jobs |
| `LAMBDA_FUNCTION_NAME` | `neurocode-process-job` | Lambda function name |
| `CLOUDWATCH_LOG_GROUP` | `/neurocode-ai/backend` | CloudWatch log group |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS allowed origins |
| `LOG_LEVEL` | `INFO` | Logging level |
| `VITE_API_URL` | `http://localhost:8000` | Backend URL (frontend) |

---

## License

MIT
