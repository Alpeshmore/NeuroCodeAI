# CloudWatch Log Group for Application Logs
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/ec2/${var.project_name}"
  retention_in_days = 7 # Keep logs for 7 days to save costs

  tags = {
    Name = "${var.project_name}-app-logs"
  }
}

# CloudWatch Log Group for SageMaker Training
resource "aws_cloudwatch_log_group" "sagemaker_logs" {
  name              = "/aws/sagemaker/TrainingJobs"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-sagemaker-logs"
  }
}

# SNS Topic for Billing Alerts
resource "aws_sns_topic" "billing_alerts" {
  name = "${var.project_name}-billing-alerts"

  tags = {
    Name = "${var.project_name}-billing-alerts"
  }
}

# SNS Topic Subscription
resource "aws_sns_topic_subscription" "billing_alerts_email" {
  topic_arn = aws_sns_topic.billing_alerts.arn
  protocol  = "email"
  endpoint  = var.billing_alert_email
}

# CloudWatch Billing Alarm - $100
resource "aws_cloudwatch_metric_alarm" "billing_100" {
  alarm_name          = "${var.project_name}-billing-100"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = 21600 # 6 hours
  statistic           = "Maximum"
  threshold           = 100
  alarm_description   = "Billing alert at $100"
  alarm_actions       = [aws_sns_topic.billing_alerts.arn]

  dimensions = {
    Currency = "USD"
  }
}

# CloudWatch Billing Alarm - $150
resource "aws_cloudwatch_metric_alarm" "billing_150" {
  alarm_name          = "${var.project_name}-billing-150"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = 21600
  statistic           = "Maximum"
  threshold           = 150
  alarm_description   = "Billing alert at $150 - WARNING"
  alarm_actions       = [aws_sns_topic.billing_alerts.arn]

  dimensions = {
    Currency = "USD"
  }
}

# CloudWatch Billing Alarm - $180
resource "aws_cloudwatch_metric_alarm" "billing_180" {
  alarm_name          = "${var.project_name}-billing-180"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = 21600
  statistic           = "Maximum"
  threshold           = 180
  alarm_description   = "Billing alert at $180 - CRITICAL"
  alarm_actions       = [aws_sns_topic.billing_alerts.arn]

  dimensions = {
    Currency = "USD"
  }
}

# CloudWatch Alarm for EC2 CPU Idle (cost optimization)
resource "aws_cloudwatch_metric_alarm" "ec2_cpu_idle" {
  alarm_name          = "${var.project_name}-ec2-cpu-idle"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 6 # 30 minutes
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300 # 5 minutes
  statistic           = "Average"
  threshold           = 5 # 5% CPU
  alarm_description   = "EC2 CPU idle for 30 minutes"
  alarm_actions       = [aws_sns_topic.billing_alerts.arn]

  dimensions = {
    InstanceId = aws_instance.main.id
  }
}

# CloudWatch Alarm for SQS Queue Depth
resource "aws_cloudwatch_metric_alarm" "sqs_queue_depth" {
  alarm_name          = "${var.project_name}-sqs-queue-depth"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Average"
  threshold           = 100
  alarm_description   = "SQS queue has too many messages"
  alarm_actions       = [aws_sns_topic.billing_alerts.arn]

  dimensions = {
    QueueName = aws_sqs_queue.analysis_queue.name
  }
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", { stat = "Average", label = "EC2 CPU" }],
            ["AWS/RDS", "CPUUtilization", { stat = "Average", label = "RDS CPU" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "CPU Utilization"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", { stat = "Sum", label = "Analysis Queue" }],
            ["...", { stat = "Sum", label = "Training Queue" }]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "SQS Queue Depth"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/Billing", "EstimatedCharges", { stat = "Maximum", label = "Total Cost" }]
          ]
          period = 21600
          stat   = "Maximum"
          region = "us-east-1"
          title  = "Estimated Charges"
        }
      }
    ]
  })
}
