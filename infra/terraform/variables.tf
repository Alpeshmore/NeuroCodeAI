variable "project_name" {
  description = "Project name"
  type        = string
  default     = "neurocode-ai"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "ec2_instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small" # 2 vCPU, 2GB RAM - ~$15/month
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro" # 2 vCPU, 1GB RAM - ~$12/month
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "neurocode"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "neurocode_admin"
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH into EC2"
  type        = list(string)
  default     = ["0.0.0.0/0"] # CHANGE THIS to your IP for security
}

variable "s3_lifecycle_glacier_days" {
  description = "Days before moving to Glacier"
  type        = number
  default     = 30
}

variable "billing_alert_email" {
  description = "Email for billing alerts"
  type        = string
  default     = "admin@neurocode.ai"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "NeuroCode-AI"
    ManagedBy   = "Terraform"
    CostCenter  = "Startup"
  }
}
