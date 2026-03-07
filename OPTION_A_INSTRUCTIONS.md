# Option A: Get IAM Permissions - Step-by-Step Instructions

## Current Situation

✅ AWS CLI configured  
✅ Credentials valid (Account: 455162985715, User: NeuroCodeAI)  
✅ Environment files created  
❌ IAM permissions needed to create resources

## Step-by-Step Process

### Step 1: Request IAM Permissions

You need to contact your AWS account administrator to grant permissions.

**Option 1a: If you ARE the AWS account owner**

1. Log into [AWS Console](https://console.aws.amazon.com/) with your root account or admin user
2. Go to [IAM Console](https://console.aws.amazon.com/iam/)
3. Click **Users** → **NeuroCodeAI**
4. Click **Add permissions** → **Attach policies directly**
5. Search and select these policies:
   - ✅ AmazonS3FullAccess
   - ✅ AmazonSQSFullAccess
   - ✅ IAMFullAccess
6. Click **Add permissions**
7. **Proceed to Step 2**

**Option 1b: If you need to request from an administrator**

1. Send them the file: **IAM_PERMISSIONS_REQUEST.md**
2. Or send this email:

```
Subject: IAM Permissions Request for NeuroCode AI Development

Hi [Admin Name],

I need IAM permissions for the NeuroCodeAI user (Account: 455162985715) 
to create AWS resources for development.

Please attach these AWS managed policies:
- AmazonS3FullAccess
- AmazonSQSFullAccess  
- IAMFullAccess

These will allow creation of:
- 2 S3 buckets (~$0.23/month)
- 2 SQS queues (~$0.40/month)
- 1 IAM role (free)

Total cost: ~$0.63/month

See attached IAM_PERMISSIONS_REQUEST.md for details.

Thanks!
```

3. **Wait for confirmation**
4. **Proceed to Step 2 once granted**

---

### Step 2: Verify Permissions

Once permissions are granted, verify they work:

```bash
# Test S3 access
aws s3 ls

# Test SQS access  
aws sqs list-queues

# Test IAM access
aws iam list-roles
```

**Expected Result:** Commands should work without "AccessDenied" errors.

If you still get errors, permissions weren't granted correctly. Contact your admin again.

---

### Step 3: Create AWS Resources

Now run the automated resource creation script:

```bash
cd "NeuroCode AI"
create-aws-resources.bat
```

**What this does:**
1. Creates 2 S3 buckets (datasets and models)
2. Creates 2 SQS queues (analysis and training)
3. Creates 1 IAM role (SageMaker)
4. Updates all .env files with resource details

**Expected Output:**
```
==========================================
Resources Created Successfully!
==========================================

S3 Datasets Bucket: neurocode-ai-datasets-xxxxx
S3 Models Bucket: neurocode-ai-models-xxxxx
SQS Analysis Queue: https://sqs.us-east-1.amazonaws.com/...
SQS Training Queue: https://sqs.us-east-1.amazonaws.com/...
SageMaker Role ARN: arn:aws:iam::455162985715:role/...

[OK] Configuration files updated
```

**If it fails:** Check the error messages and ensure permissions were granted correctly.

---

### Step 4: Install Dependencies

```bash
npm install
```

This installs:
- AWS SDK packages
- PostgreSQL client
- Testing dependencies

**Expected time:** 2-3 minutes

---

### Step 5: Test AWS Connections

```bash
npm run test:aws
```

**What this tests:**
- ✅ AWS credentials valid
- ✅ S3 buckets accessible
- ✅ SQS queues accessible
- ✅ Secrets Manager accessible (if configured)
- ⚠️ Database connection (will fail if RDS not created yet)

**Expected Output:**
```
==========================================
NeuroCode AI - AWS Connection Test
==========================================

✓ AWS credentials valid
  Account: 455162985715
  User ARN: arn:aws:iam::455162985715:user/NeuroCodeAI

✓ S3 datasets bucket accessible
✓ S3 models bucket accessible
✓ SQS analysis queue accessible
  Messages in queue: 0
✓ SQS training queue accessible
  Messages in queue: 0

⚠ Database connection failed (expected if RDS not created)

==========================================
Test Summary
==========================================
✓ All tests passed! AWS integration is ready.
```

---

### Step 6: (Optional) Create RDS Database

If you want to use AWS RDS instead of local PostgreSQL:

**Option 6a: Using AWS Console**

1. Go to [RDS Console](https://console.aws.amazon.com/rds/)
2. Click **Create database**
3. Choose:
   - Engine: PostgreSQL 14+
   - Template: Free tier
   - DB identifier: `neurocode-ai-db`
   - Master username: `neurocode_admin`
   - Master password: (create strong password)
   - Instance: db.t3.micro
   - Storage: 20 GB
   - Public access: No
4. Click **Create database**
5. Wait 5-10 minutes for creation
6. Copy the endpoint (e.g., `neurocode-ai-db.xxxxx.us-east-1.rds.amazonaws.com`)
7. Update `backend/api-gateway/.env`:
   ```env
   DB_HOST=neurocode-ai-db.xxxxx.us-east-1.rds.amazonaws.com
   DB_PASSWORD=your-password
   POSTGRES_URL=postgresql://neurocode_admin:your-password@neurocode-ai-db.xxxxx.us-east-1.rds.amazonaws.com:5432/neurocode
   ```

**Option 6b: Skip RDS for now**

Use local PostgreSQL for development:
```env
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/neurocode
```

---

### Step 7: Start Development

**Option 7a: Local Development (Recommended for testing)**

```bash
# Terminal 1: Start local services (PostgreSQL, Redis, RabbitMQ)
start-local.bat

# Terminal 2: Start backend
start-backend.bat

# Terminal 3: Start frontend
start-frontend.bat
```

Access at: http://localhost:3000

**Option 7b: Deploy to AWS EC2**

See: `infra/README.md` for full deployment instructions

---

## Troubleshooting

### Issue: "AccessDenied" errors in Step 3

**Cause:** Permissions not granted or not applied yet

**Solution:**
1. Wait 1-2 minutes for IAM changes to propagate
2. Verify permissions in AWS Console
3. Contact your admin if still failing

### Issue: S3 bucket name already exists

**Cause:** Bucket names must be globally unique

**Solution:** The script uses random suffixes, but if it fails:
```bash
# Manually create with different name
aws s3 mb s3://neurocode-ai-datasets-$(date +%s)
```

### Issue: npm install fails

**Cause:** Node.js version or network issues

**Solution:**
```bash
# Check Node version (need 18+)
node --version

# Clear cache and retry
npm cache clean --force
npm install
```

### Issue: Database connection fails

**Cause:** RDS not created or security group blocking access

**Solution:**
- Use local PostgreSQL for development
- Or check RDS security group allows connections
- Or enable RDS public access (not recommended for production)

### Issue: Test script shows warnings

**Cause:** Some resources not created yet (normal)

**Solution:** 
- Warnings for RDS are expected if not created
- Only errors for S3/SQS indicate problems

---

## Success Checklist

After completing all steps, verify:

- [ ] IAM permissions granted
- [ ] AWS resources created (S3, SQS, IAM role)
- [ ] .env files updated with resource details
- [ ] npm dependencies installed
- [ ] Connection tests pass (npm run test:aws)
- [ ] Can access S3 buckets
- [ ] Can send messages to SQS queues
- [ ] Local development environment running

---

## What's Next?

Once Option A is complete:

1. ✅ **AWS integration ready**
2. 🚀 **Start building features**
3. 📊 **Upload datasets to S3**
4. 🤖 **Train ML models with SageMaker**
5. 🌐 **Deploy to production**

---

## Cost Monitoring

Keep track of your AWS costs:

```bash
# Check current month costs
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost"
```

**Expected costs:**
- S3: $0.23/month
- SQS: $0.40/month
- RDS (if created): $12.41/month
- **Total: $0.63-13/month**

---

## Need Help?

**Permissions Issues:**
- Share IAM_PERMISSIONS_REQUEST.md with your admin
- Check AWS Console → IAM → Users → NeuroCodeAI → Permissions

**Resource Creation Issues:**
- Check error messages in create-aws-resources.bat output
- Verify permissions are attached
- Try creating resources manually via AWS Console

**Connection Issues:**
- Run: `npm run test:aws` for diagnostics
- Check .env files have correct values
- Verify resources exist in AWS Console

**General Questions:**
- See: AWS_INTEGRATION_README.md
- See: AWS_QUICK_REFERENCE.md
- See: AWS_SETUP_GUIDE.md

---

**Current Status:** ⏳ Waiting for IAM permissions  
**Next Step:** Complete Step 1 (Request permissions)  
**Time to Complete:** 30 minutes after permissions granted  
**Estimated Cost:** $0.63-13/month
