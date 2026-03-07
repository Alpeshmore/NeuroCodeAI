# Get latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 Key Pair (you need to create this manually or import existing)
resource "aws_key_pair" "main" {
  key_name   = "${var.project_name}-key"
  public_key = file("~/.ssh/id_rsa.pub") # Change to your public key path

  tags = {
    Name = "${var.project_name}-key"
  }
}

# EC2 Instance
resource "aws_instance" "main" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.ec2_instance_type
  key_name               = aws_key_pair.main.key_name
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  # Root volume
  root_block_device {
    volume_size           = 30 # GB
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  # User data script
  user_data = templatefile("${path.module}/../ec2-userdata.sh", {
    db_secret_arn       = aws_secretsmanager_secret.db_password.arn
    s3_datasets_bucket  = aws_s3_bucket.datasets.id
    s3_models_bucket    = aws_s3_bucket.models.id
    sqs_analysis_queue  = aws_sqs_queue.analysis_queue.url
    sqs_training_queue  = aws_sqs_queue.training_queue.url
    aws_region          = var.aws_region
    project_name        = var.project_name
  })

  # Enable detailed monitoring (free tier)
  monitoring = true

  # Instance metadata options (security)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # IMDSv2
    http_put_response_hop_limit = 1
  }

  tags = {
    Name = "${var.project_name}-ec2"
  }

  lifecycle {
    ignore_changes = [ami] # Don't replace instance on AMI updates
  }
}

# Elastic IP for EC2 (optional, adds ~$3.6/month)
resource "aws_eip" "main" {
  instance = aws_instance.main.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-eip"
  }

  depends_on = [aws_internet_gateway.main]
}
