# ======================================================================
# Terraform — NeuroCode AI AWS Infrastructure
# ======================================================================
# Usage:
#   cd infra/
#   terraform init
#   terraform plan -var="environment=production"
#   terraform apply -var="environment=production"
# ======================================================================

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ──────────────────────────────────────────────────────────────
# Variables
# ──────────────────────────────────────────────────────────────
variable "aws_region" {
  default = "us-east-1"
}

variable "environment" {
  default = "production"
}

variable "project" {
  default = "neurocode-ai"
}

locals {
  prefix = "${var.project}-${var.environment}"
}

# ======================================================================
# S3 Bucket
# ======================================================================
resource "aws_s3_bucket" "snippets" {
  bucket = "${local.prefix}-snippets"

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "snippets" {
  bucket = aws_s3_bucket.snippets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "snippets" {
  bucket = aws_s3_bucket.snippets.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "snippets" {
  bucket                  = aws_s3_bucket.snippets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "snippets" {
  bucket = aws_s3_bucket.snippets.id
  rule {
    id     = "archive-old-snippets"
    status = "Enabled"
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
    expiration {
      days = 365
    }
  }
}

# ======================================================================
# DynamoDB Table
# ======================================================================
resource "aws_dynamodb_table" "analyses" {
  name         = "${local.prefix}-analyses"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "analysis_id"

  attribute {
    name = "analysis_id"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  global_secondary_index {
    name            = "user_id-created_at-index"
    hash_key        = "user_id"
    range_key       = "created_at"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

# ======================================================================
# SQS Queue
# ======================================================================
resource "aws_sqs_queue" "jobs" {
  name                       = "${local.prefix}-jobs"
  visibility_timeout_seconds = 300   # 5 min — matches Lambda timeout
  message_retention_seconds  = 86400 # 1 day
  receive_wait_time_seconds  = 10    # long polling

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.jobs_dlq.arn
    maxReceiveCount     = 3
  })

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_sqs_queue" "jobs_dlq" {
  name                      = "${local.prefix}-jobs-dlq"
  message_retention_seconds = 1209600 # 14 days

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

# ======================================================================
# Lambda Function
# ======================================================================
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/lambda_handler.py"
  output_path = "${path.module}/lambda_handler.zip"
}

resource "aws_lambda_function" "process_job" {
  function_name = "${local.prefix}-process-job"
  role          = aws_iam_role.lambda_role.arn
  handler       = "lambda_handler.lambda_handler"
  runtime       = "python3.12"
  timeout       = 300
  memory_size   = 256

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      AWS_REGION     = var.aws_region
      DYNAMODB_TABLE = aws_dynamodb_table.analyses.name
      S3_BUCKET      = aws_s3_bucket.snippets.id
      ENVIRONMENT    = var.environment
    }
  }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

# SQS → Lambda trigger
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = aws_sqs_queue.jobs.arn
  function_name    = aws_lambda_function.process_job.arn
  batch_size       = 5
  enabled          = true
}

# ======================================================================
# CloudWatch Log Group
# ======================================================================
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/neurocode-ai/backend"
  retention_in_days = 30

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.process_job.function_name}"
  retention_in_days = 14

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

# ======================================================================
# IAM — Lambda execution role
# ======================================================================
resource "aws_iam_role" "lambda_role" {
  name = "${local.prefix}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "${local.prefix}-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3ReadOnly"
        Effect = "Allow"
        Action = ["s3:GetObject"]
        Resource = ["${aws_s3_bucket.snippets.arn}/*"]
      },
      {
        Sid    = "DynamoDB"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
        ]
        Resource = [
          aws_dynamodb_table.analyses.arn,
          "${aws_dynamodb_table.analyses.arn}/index/*",
        ]
      },
      {
        Sid    = "SQS"
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
        ]
        Resource = [aws_sqs_queue.jobs.arn]
      },
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Resource = ["arn:aws:logs:${var.aws_region}:*:*"]
      },
    ]
  })
}

# ======================================================================
# IAM — EC2 / ECS backend role
# ======================================================================
resource "aws_iam_role" "backend_role" {
  name = "${local.prefix}-backend-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_iam_instance_profile" "backend" {
  name = "${local.prefix}-backend-profile"
  role = aws_iam_role.backend_role.name
}

resource "aws_iam_role_policy" "backend_policy" {
  name = "${local.prefix}-backend-policy"
  role = aws_iam_role.backend_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:DeleteObject",
        ]
        Resource = [
          aws_s3_bucket.snippets.arn,
          "${aws_s3_bucket.snippets.arn}/*",
        ]
      },
      {
        Sid    = "DynamoDB"
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
        ]
        Resource = [
          aws_dynamodb_table.analyses.arn,
          "${aws_dynamodb_table.analyses.arn}/index/*",
        ]
      },
      {
        Sid    = "SQS"
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:GetQueueAttributes",
        ]
        Resource = [aws_sqs_queue.jobs.arn]
      },
      {
        Sid    = "Lambda"
        Effect = "Allow"
        Action = ["lambda:InvokeFunction"]
        Resource = [aws_lambda_function.process_job.arn]
      },
      {
        Sid    = "Bedrock"
        Effect = "Allow"
        Action = ["bedrock:InvokeModel"]
        Resource = ["arn:aws:bedrock:${var.aws_region}::foundation-model/*"]
      },
      {
        Sid    = "CloudWatch"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "cloudwatch:PutMetricData",
        ]
        Resource = ["*"]
      },
    ]
  })
}

# ======================================================================
# Outputs
# ======================================================================
output "s3_bucket" {
  value = aws_s3_bucket.snippets.id
}

output "dynamodb_table" {
  value = aws_dynamodb_table.analyses.name
}

output "sqs_queue_url" {
  value = aws_sqs_queue.jobs.url
}

output "lambda_function" {
  value = aws_lambda_function.process_job.function_name
}

output "backend_instance_profile" {
  value = aws_iam_instance_profile.backend.name
}
