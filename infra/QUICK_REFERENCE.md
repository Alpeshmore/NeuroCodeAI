# NeuroCode AI - Quick Reference Card

## 🚀 Essential Commands

### Deploy Infrastructure
```bash
cd infra/terraform
terraform init
terraform apply
terraform output > outputs.txt
```

### Access EC2
```bash
ssh -i ~/.ssh/id_rsa ec2-user@<PUBLIC_IP>
```

### Application Control
```bash
# On EC2
cd neurocode-ai
./start-app.sh      # Start application
./stop-app.sh       # Stop application
./view-logs.sh      # View logs
docker-compose ps   # Check status
```

### Cost Management
```bash
cd infra/scripts
./cost-optimization.sh costs      # Check costs
./cost-optimization.sh stop       # Stop EC2
./cost-optimization.sh start      # Start EC2
./cost-optimization.sh check      # Check idle resources
./cost-optimization.sh emergency  # Emergency shutdown
```

### ML Training
```bash
cd ml/sagemaker-training

# Launch training
python launch_training.py train s3://bucket/dataset.json

# Check status
python launch_training.py status <job-name>

# Download model
python launch_training.py download <job-name>
```

## 📊 Key Metrics

### Monthly Costs
- **Base Infrastructure**: $38.22
- **ML Training (5hrs)**: $2.68
- **Total**: $40.90/month
- **Budget Duration**: 4.9 months on $200

### Resource Specs
- **EC2**: t3.small (2 vCPU, 2GB RAM)
- **RDS**: db.t3.micro (2 vCPU, 1GB RAM)
- **Storage**: 30GB (EC2) + 20GB (RDS)
- **S3**: Unlimited, pay per use

## 🔗 Important URLs

### AWS Console
- **EC2**: https://console.aws.amazon.com/ec2
- **RDS**: https://console.aws.amazon.com/rds
- **S3**: https://console.aws.amazon.com/s3
- **CloudWatch**: https://console.aws.amazon.com/cloudwatch
- **Cost Explorer**: https://console.aws.amazon.com/cost-management

### Application
- **API**: http://<EC2_IP>:4000
- **Health**: http://<EC2_IP>:4000/health
- **Frontend**: https://<vercel-url>

## 🆘 Emergency Contacts

### Billing Alerts
- **$100**: First warning
- **$150**: Second warning
- **$180**: Critical - consider shutdown
- **$200**: Emergency shutdown

### Emergency Shutdown
```bash
cd infra/scripts
./cost-optimization.sh emergency
```

### Complete Teardown
```bash
cd infra/terraform
terraform destroy
```

## 📝 Daily Checklist

### Morning
- [ ] Check costs: `./cost-optimization.sh costs`
- [ ] Check EC2 status
- [ ] Review CloudWatch alarms
- [ ] Check application logs

### Evening
- [ ] Review daily costs
- [ ] Stop EC2 if not needed
- [ ] Check for idle resources
- [ ] Backup important data

## 🔧 Troubleshooting

### Can't SSH to EC2
```bash
# Check instance status
aws ec2 describe-instances --instance-ids <ID>

# Check security group
aws ec2 describe-security-groups --group-ids <SG_ID>
```

### Application Not Responding
```bash
# On EC2
docker-compose ps
docker-compose logs
docker-compose restart
```

### High Costs
```bash
# Check cost breakdown
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=SERVICE
```

### Database Connection Failed
```bash
# Get DB credentials
aws secretsmanager get-secret-value \
  --secret-id <SECRET_ARN> \
  --query SecretString \
  --output text | jq .

# Test connection
psql -h <RDS_ENDPOINT> -U <USER> -d neurocode
```

## 📞 Support Resources

- **Documentation**: infra/README.md
- **Checklist**: infra/DEPLOYMENT_CHECKLIST.md
- **Cost Guide**: infra/COST_ESTIMATION.md
- **AWS Docs**: https://docs.aws.amazon.com

## 💡 Pro Tips

1. **Stop EC2 overnight** - Saves $0.50/day
2. **Use spot instances** - Saves 70% on ML training
3. **Monitor costs daily** - Catch issues early
4. **Set billing alerts** - Get notified before overspending
5. **Clean up old data** - S3 lifecycle policies help
6. **Test in dev first** - Avoid costly mistakes
7. **Document everything** - Future you will thank you
8. **Backup regularly** - RDS snapshots are cheap

## 🎯 Success Indicators

✅ Monthly cost < $50
✅ No surprise charges
✅ Application running smoothly
✅ Backups configured
✅ Monitoring active
✅ Documentation updated

---

**Keep this card handy for quick reference!**

**Last Updated**: January 24, 2026
**Version**: 1.0.0
