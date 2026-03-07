# IAM Permissions Request for NeuroCode AI

## Request Summary

**User:** NeuroCodeAI  
**Account ID:** 455162985715  
**Purpose:** Create AWS resources for NeuroCode AI application development

## Required Permissions

The IAM user `NeuroCodeAI` needs the following AWS managed policies attached:

### 1. AmazonS3FullAccess
**Purpose:** Create and manage S3 buckets for datasets and ML models  
**Policy ARN:** `arn:aws:iam::aws:policy/AmazonS3FullAccess`

### 2. AmazonSQSFullAccess
**Purpose:** Create and manage SQS queues for async processing  
**Policy ARN:** `arn:aws:iam::aws:policy/AmazonSQSFullAccess`

### 3. IAMFullAccess (or limited IAM permissions)
**Purpose:** Create IAM role for SageMaker  
**Policy ARN:** `arn:aws:iam::aws:policy/IAMFullAccess`

**Alternative (More Restrictive):** If full IAM access is too broad, use this custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:GetRole",
        "iam:PassRole",
        "iam:ListAttachedRolePolicies"
      ],
      "Resource": "arn:aws:iam::455162985715:role/neurocode-ai-*"
    }
  ]
}
```

### 4. AmazonRDSFullAccess (Optional - for database)
**Purpose:** Create and manage RDS PostgreSQL database  
**Policy ARN:** `arn:aws:iam::aws:policy/AmazonRDSFullAccess`

### 5. SecretsManagerReadWrite (Optional - for secure credentials)
**Purpose:** Store and retrieve database passwords securely  
**Policy ARN:** `arn:aws:iam::aws:policy/SecretsManagerReadWrite`

## How to Grant Permissions

### Option 1: Using AWS Console

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** in the left sidebar
3. Click on user **NeuroCodeAI**
4. Click **Add permissions** button
5. Select **Attach policies directly**
6. Search and select:
   - AmazonS3FullAccess
   - AmazonSQSFullAccess
   - IAMFullAccess (or the custom policy above)
   - AmazonRDSFullAccess (optional)
   - SecretsManagerReadWrite (optional)
7. Click **Add permissions**

### Option 2: Using AWS CLI

```bash
# Attach S3 permissions
aws iam attach-user-policy \
  --user-name NeuroCodeAI \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Attach SQS permissions
aws iam attach-user-policy \
  --user-name NeuroCodeAI \
  --policy-arn arn:aws:iam::aws:policy/AmazonSQSFullAccess

# Attach IAM permissions
aws iam attach-user-policy \
  --user-name NeuroCodeAI \
  --policy-arn arn:aws:iam::aws:policy/IAMFullAccess

# Optional: Attach RDS permissions
aws iam attach-user-policy \
  --user-name NeuroCodeAI \
  --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess

# Optional: Attach Secrets Manager permissions
aws iam attach-user-policy \
  --user-name NeuroCodeAI \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

### Option 3: Using Terraform

```hcl
resource "aws_iam_user_policy_attachment" "neurocode_s3" {
  user       = "NeuroCodeAI"
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_user_policy_attachment" "neurocode_sqs" {
  user       = "NeuroCodeAI"
  policy_arn = "arn:aws:iam::aws:policy/AmazonSQSFullAccess"
}

resource "aws_iam_user_policy_attachment" "neurocode_iam" {
  user       = "arn:aws:iam::aws:policy/IAMFullAccess"
  policy_arn = "arn:aws:iam::aws:policy/IAMFullAccess"
}
```

## Resources to be Created

Once permissions are granted, the following resources will be created:

### S3 Buckets (2)
- `neurocode-ai-datasets-<random>` - Store training datasets
- `neurocode-ai-models-<random>` - Store trained ML models

**Estimated Cost:** $0.23/month for 10GB

### SQS Queues (2)
- `neurocode-ai-analysis-queue` - Code analysis requests
- `neurocode-ai-training-queue` - ML training job requests

**Estimated Cost:** $0.40/month for 1M requests

### IAM Role (1)
- `neurocode-ai-sagemaker-role` - SageMaker execution role

**Cost:** Free

### Optional: RDS Database
- `neurocode-ai-db` - PostgreSQL database

**Estimated Cost:** $12.41/month (db.t3.micro)

## Total Estimated Cost

**Minimum (S3 + SQS + IAM):** $0.63/month  
**With RDS:** $13.04/month  
**With full infrastructure:** $28-40/month

## Security Considerations

### Why These Permissions Are Safe

1. **Scoped to specific resources:** Resources will be named with `neurocode-ai-*` prefix
2. **No EC2 permissions:** Cannot launch expensive compute instances
3. **No billing access:** Cannot modify billing or payment methods
4. **Auditable:** All actions logged in CloudTrail
5. **Revocable:** Permissions can be removed at any time

### Best Practices Applied

- ✅ Encryption at rest for S3 and RDS
- ✅ Versioning enabled on S3 buckets
- ✅ Least privilege IAM policies
- ✅ Secrets stored in Secrets Manager
- ✅ No public access to resources

## Verification Steps

After permissions are granted, verify with:

```bash
# Check current permissions
aws iam list-attached-user-policies --user-name NeuroCodeAI

# Test S3 access
aws s3 ls

# Test SQS access
aws sqs list-queues

# Test IAM access
aws iam list-roles
```

## Timeline

1. **Request submitted:** Now
2. **Permissions granted:** (Waiting for admin)
3. **Resources created:** 5 minutes after permissions granted
4. **Testing complete:** 10 minutes after resource creation
5. **Development ready:** Same day

## Contact Information

**Requester:** [Your Name]  
**Project:** NeuroCode AI  
**Purpose:** Development and testing  
**Duration:** Ongoing (development project)  
**Cost Impact:** ~$13-40/month

## Questions?

**Q: Why does the user need IAM permissions?**  
A: To create a SageMaker execution role for ML model training.

**Q: Can we use more restrictive permissions?**  
A: Yes, see the custom IAM policy above for limited IAM access.

**Q: What if we don't grant RDS permissions?**  
A: The application can use local PostgreSQL for development.

**Q: How do we revoke these permissions later?**  
A: Use AWS Console or CLI to detach the policies from the user.

**Q: Will this affect other AWS resources?**  
A: No, the user will only create new resources with the `neurocode-ai-*` prefix.

---

**Status:** ⏳ Awaiting approval  
**Priority:** Medium  
**Risk Level:** Low  
**Cost Impact:** $13-40/month
