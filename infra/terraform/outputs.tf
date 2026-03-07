output "ec2_public_ip" {
  description = "Public IP of EC2 instance"
  value       = aws_eip.main.public_ip
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.main.id
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}

output "db_secret_arn" {
  description = "ARN of database credentials secret"
  value       = aws_secretsmanager_secret.db_password.arn
  sensitive   = true
}

output "s3_datasets_bucket" {
  description = "S3 bucket for datasets"
  value       = aws_s3_bucket.datasets.id
}

output "s3_models_bucket" {
  description = "S3 bucket for models"
  value       = aws_s3_bucket.models.id
}

output "sqs_analysis_queue_url" {
  description = "SQS analysis queue URL"
  value       = aws_sqs_queue.analysis_queue.url
}

output "sqs_training_queue_url" {
  description = "SQS training queue URL"
  value       = aws_sqs_queue.training_queue.url
}

output "sagemaker_role_arn" {
  description = "SageMaker execution role ARN"
  value       = aws_iam_role.sagemaker_role.arn
}

output "cloudwatch_dashboard_url" {
  description = "CloudWatch dashboard URL"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}

output "ssh_command" {
  description = "SSH command to connect to EC2"
  value       = "ssh -i ~/.ssh/id_rsa ec2-user@${aws_eip.main.public_ip}"
}

output "api_endpoint" {
  description = "API endpoint URL"
  value       = "http://${aws_eip.main.public_ip}:4000"
}

# Cost estimation output
output "estimated_monthly_cost" {
  description = "Estimated monthly cost breakdown"
  value = {
    ec2_t3_small      = "$15.18"
    rds_t3_micro      = "$12.41"
    ebs_30gb          = "$3.00"
    rds_storage_20gb  = "$2.30"
    elastic_ip        = "$3.60"
    s3_storage_10gb   = "$0.23"
    data_transfer_5gb = "$0.45"
    cloudwatch_basic  = "$0.00"
    sqs_1m_requests   = "$0.40"
    secrets_manager   = "$0.40"
    total_estimated   = "$37.97/month"
    buffer_for_ml     = "$30-50/month for SageMaker training"
    total_with_ml     = "$67-87/month"
    budget_remaining  = "Can run 2-3 months on $200"
  }
}
