# SQS Queue for Code Analysis Events
resource "aws_sqs_queue" "analysis_queue" {
  name                       = "${var.project_name}-analysis-queue"
  delay_seconds              = 0
  max_message_size           = 262144 # 256 KB
  message_retention_seconds  = 345600 # 4 days
  receive_wait_time_seconds  = 10     # Long polling
  visibility_timeout_seconds = 300    # 5 minutes

  tags = {
    Name = "${var.project_name}-analysis-queue"
  }
}

# Dead Letter Queue for failed analysis
resource "aws_sqs_queue" "analysis_dlq" {
  name                      = "${var.project_name}-analysis-dlq"
  message_retention_seconds = 1209600 # 14 days

  tags = {
    Name = "${var.project_name}-analysis-dlq"
  }
}

# Redrive policy for analysis queue
resource "aws_sqs_queue_redrive_policy" "analysis_queue" {
  queue_url = aws_sqs_queue.analysis_queue.id

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.analysis_dlq.arn
    maxReceiveCount     = 3
  })
}

# SQS Queue for ML Training Events
resource "aws_sqs_queue" "training_queue" {
  name                       = "${var.project_name}-training-queue"
  delay_seconds              = 0
  max_message_size           = 262144
  message_retention_seconds  = 345600
  receive_wait_time_seconds  = 10
  visibility_timeout_seconds = 3600 # 1 hour for training jobs

  tags = {
    Name = "${var.project_name}-training-queue"
  }
}

# Dead Letter Queue for failed training
resource "aws_sqs_queue" "training_dlq" {
  name                      = "${var.project_name}-training-dlq"
  message_retention_seconds = 1209600

  tags = {
    Name = "${var.project_name}-training-dlq"
  }
}

# Redrive policy for training queue
resource "aws_sqs_queue_redrive_policy" "training_queue" {
  queue_url = aws_sqs_queue.training_queue.id

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.training_dlq.arn
    maxReceiveCount     = 2
  })
}
