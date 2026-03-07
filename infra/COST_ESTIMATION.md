# NeuroCode AI - Detailed Cost Estimation

## 💰 Monthly Cost Breakdown

### Base Infrastructure (Always Running)

| Service | Configuration | Unit Cost | Quantity | Monthly Cost | Notes |
|---------|--------------|-----------|----------|--------------|-------|
| **EC2 Instance** | t3.small (2 vCPU, 2GB) | $0.0208/hr | 730 hrs | $15.18 | Can stop when idle |
| **RDS Instance** | db.t3.micro (2 vCPU, 1GB) | $0.017/hr | 730 hrs | $12.41 | Single AZ |
| **EBS Volume (EC2)** | 30GB GP3 | $0.08/GB | 30 GB | $2.40 | Root volume |
| **EBS Volume (RDS)** | 20GB GP3 | $0.115/GB | 20 GB | $2.30 | Database storage |
| **Elastic IP** | 1 IP address | $0.005/hr | 730 hrs | $3.65 | Static IP |
| **S3 Storage** | Standard | $0.023/GB | 10 GB | $0.23 | Datasets + models |
| **S3 Requests** | PUT/GET | $0.005/1000 | 10K | $0.05 | API calls |
| **Data Transfer** | Outbound | $0.09/GB | 5 GB | $0.45 | To internet |
| **SQS Requests** | Standard | $0.40/1M | 1M | $0.40 | Message queue |
| **Secrets Manager** | 1 secret | $0.40/secret | 1 | $0.40 | DB credentials |
| **CloudWatch Logs** | Ingestion | $0.50/GB | 0.5 GB | $0.25 | Application logs |
| **CloudWatch Alarms** | Standard | $0.10/alarm | 5 | $0.50 | Billing + monitoring |
| | | | **SUBTOTAL** | **$38.22** | |

### ML Training (On-Demand)

| Service | Configuration | Unit Cost | Usage | Monthly Cost | Notes |
|---------|--------------|-----------|-------|--------------|-------|
| **SageMaker Training** | ml.g4dn.xlarge (Spot) | $0.526/hr | 5 hrs | $2.63 | 70% savings vs on-demand |
| **SageMaker Training** | ml.g4dn.xlarge (On-Demand) | $1.505/hr | 0 hrs | $0.00 | Fallback if spot unavailable |
| **S3 Training Data** | Transfer | $0.00/GB | 1 GB | $0.00 | Free within region |
| **S3 Model Artifacts** | Storage | $0.023/GB | 2 GB | $0.05 | Trained models |
| | | | **SUBTOTAL** | **$2.68** | |

### Optional Services (Not Included by Default)

| Service | Configuration | Unit Cost | Usage | Monthly Cost | Notes |
|---------|--------------|-----------|-------|--------------|-------|
| **NAT Gateway** | Per hour + data | $0.045/hr + $0.045/GB | 730 hrs | $32.85 | NOT USED - cost savings |
| **Application Load Balancer** | Per hour + LCU | $0.0225/hr | 730 hrs | $16.43 | NOT USED - use EC2 directly |
| **ElastiCache Redis** | cache.t3.micro | $0.017/hr | 730 hrs | $12.41 | NOT USED - use Docker Redis |
| **RDS Multi-AZ** | Additional cost | +100% | N/A | +$12.41 | NOT USED - single AZ |
| **CloudFront** | CDN | $0.085/GB | 10 GB | $0.85 | NOT USED - Vercel handles frontend |

## 📊 Total Monthly Cost Summary

| Category | Cost | Percentage |
|----------|------|------------|
| Base Infrastructure | $38.22 | 93.5% |
| ML Training (5 hrs/month) | $2.68 | 6.5% |
| **TOTAL** | **$40.90** | **100%** |

### With Heavy ML Usage (20 hours/month)
| Category | Cost |
|----------|------|
| Base Infrastructure | $38.22 |
| ML Training (20 hrs) | $10.52 |
| **TOTAL** | **$48.74** |

### With Maximum ML Usage (50 hours/month)
| Category | Cost |
|----------|------|
| Base Infrastructure | $38.22 |
| ML Training (50 hrs) | $26.30 |
| **TOTAL** | **$64.52** |

## 🎯 Budget Scenarios

### Scenario 1: Minimal Usage (Development)
**Monthly Cost: $40.90**

- EC2 running 24/7
- RDS running 24/7
- 5 hours ML training/month
- Minimal data transfer

**Budget Timeline:**
- $200 / $40.90 = **4.9 months**

### Scenario 2: Moderate Usage (Testing)
**Monthly Cost: $55.00**

- EC2 running 24/7
- RDS running 24/7
- 15 hours ML training/month
- Moderate data transfer (10GB)

**Budget Timeline:**
- $200 / $55.00 = **3.6 months**

### Scenario 3: Heavy Usage (Production)
**Monthly Cost: $75.00**

- EC2 running 24/7
- RDS running 24/7
- 30 hours ML training/month
- Heavy data transfer (20GB)
- Additional S3 storage (50GB)

**Budget Timeline:**
- $200 / $75.00 = **2.7 months**

### Scenario 4: Maximum Optimization
**Monthly Cost: $25.00**

- EC2 stopped 16 hours/day (only 8 hrs running)
- RDS stopped when not needed
- 2 hours ML training/month
- Minimal data transfer

**Budget Timeline:**
- $200 / $25.00 = **8 months**

## 💡 Cost Optimization Strategies

### 1. Stop EC2 When Idle
**Savings: $10.14/month (16 hours/day stopped)**

```bash
# Stop EC2 overnight (8pm - 8am)
./cost-optimization.sh stop

# Savings calculation
# 12 hours/day * 30 days = 360 hours
# 360 hours * $0.0208/hr = $7.49/month saved
```

### 2. Use Spot Instances for Training
**Savings: 70% on training costs**

- On-Demand: $1.505/hr
- Spot: $0.526/hr
- Savings: $0.979/hr (65% discount)

### 3. Optimize S3 Storage
**Savings: $0.15/month per 10GB moved to Glacier**

- Standard: $0.023/GB/month
- Glacier: $0.004/GB/month
- Savings: $0.019/GB/month

### 4. Reduce Data Transfer
**Savings: $0.09/GB**

- Use CloudFront (Vercel) for frontend
- Compress API responses
- Cache frequently accessed data

### 5. Right-Size Instances
**Potential Savings: $7.59/month**

If workload allows:
- EC2: t3.small → t3.micro ($7.59/month savings)
- RDS: db.t3.micro → db.t3.micro (already minimal)

## 📈 Cost Scaling Plan

### Phase 1: Startup ($200 budget)
**Target: 3-4 months operation**

- Current configuration
- Minimal ML training
- Stop resources when idle
- **Estimated: $40-60/month**

### Phase 2: Growth ($500 budget)
**Target: Scale to 100 users**

- Upgrade EC2 to t3.medium ($30.37/month)
- Upgrade RDS to db.t3.small ($24.82/month)
- More ML training (20 hrs/month)
- **Estimated: $80-100/month**

### Phase 3: Production ($1000+ budget)
**Target: Scale to 1000+ users**

- Multi-AZ RDS
- Auto Scaling Group
- Application Load Balancer
- ElastiCache Redis
- More frequent ML training
- **Estimated: $200-300/month**

## 🚨 Cost Alerts Configuration

### Alert Thresholds

| Threshold | Action | Urgency |
|-----------|--------|---------|
| $50 | Email notification | Low |
| $100 | Email + SMS | Medium |
| $150 | Email + SMS + Slack | High |
| $180 | Emergency shutdown consideration | Critical |
| $200 | Automatic resource shutdown | Critical |

### Monitoring Frequency

- **Real-time**: CloudWatch billing metrics
- **Daily**: Cost Explorer review
- **Weekly**: Resource utilization analysis
- **Monthly**: Comprehensive cost review

## 📊 Cost Tracking Template

### Daily Cost Log

| Date | EC2 | RDS | S3 | SageMaker | Other | Total | Notes |
|------|-----|-----|----|-----------| ------|-------|-------|
| Day 1 | $0.50 | $0.41 | $0.02 | $0.00 | $0.15 | $1.08 | Initial setup |
| Day 2 | $0.50 | $0.41 | $0.02 | $2.63 | $0.15 | $3.71 | ML training |
| ... | | | | | | | |

### Weekly Summary

| Week | Total Cost | Budget Used | Budget Remaining | On Track? |
|------|-----------|-------------|------------------|-----------|
| Week 1 | $10.50 | 5.25% | $189.50 | ✅ Yes |
| Week 2 | $9.80 | 10.15% | $179.70 | ✅ Yes |
| ... | | | | |

## 🎓 Cost Optimization Best Practices

### DO's ✅

1. **Stop EC2 when not in use** - Saves ~$0.50/day
2. **Use spot instances for ML** - Saves 70% on training
3. **Enable S3 lifecycle policies** - Auto-archive old data
4. **Monitor costs daily** - Catch issues early
5. **Set up billing alerts** - Get notified before overspending
6. **Use free tier services** - CloudWatch basic, S3 first 5GB
7. **Compress data** - Reduce storage and transfer costs
8. **Cache frequently accessed data** - Reduce API calls

### DON'Ts ❌

1. **Don't leave EC2 running idle** - Wastes $15/month
2. **Don't use on-demand training** - 3x more expensive than spot
3. **Don't store everything in S3 Standard** - Use Glacier for old data
4. **Don't enable Multi-AZ without need** - Doubles RDS cost
5. **Don't use NAT Gateway** - Adds $33/month
6. **Don't over-provision** - Start small, scale up
7. **Don't ignore billing alerts** - Can lead to overspending
8. **Don't forget to delete test resources** - Clean up regularly

## 📞 Support & Resources

### Cost Optimization Tools

- **AWS Cost Explorer**: Analyze spending patterns
- **AWS Budgets**: Set custom cost budgets
- **AWS Trusted Advisor**: Get cost optimization recommendations
- **CloudWatch Billing Alarms**: Real-time cost alerts

### Useful Commands

```bash
# Check current month costs
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost"

# Get cost by service
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=SERVICE

# Forecast next month
aws ce get-cost-forecast \
  --time-period Start=$(date +%Y-%m-%d),End=$(date -d '+30 days' +%Y-%m-%d) \
  --metric UNBLENDED_COST \
  --granularity MONTHLY
```

---

**Last Updated:** January 24, 2026  
**Budget:** $200  
**Target Duration:** 3-4 months  
**Estimated Monthly Cost:** $40-65  
**Status:** ✅ Within Budget
