#!/bin/bash
# Cost Optimization Scripts for NeuroCode AI

set -e

PROJECT_NAME="${PROJECT_NAME:-neurocode-ai}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================="
echo "NeuroCode AI - Cost Optimization"
echo "=================================="

# Function to get current AWS costs
get_current_costs() {
    echo -e "\n${GREEN}Current Month Costs:${NC}"
    
    START_DATE=$(date -u +%Y-%m-01)
    END_DATE=$(date -u +%Y-%m-%d)
    
    aws ce get-cost-and-usage \
        --time-period Start=$START_DATE,End=$END_DATE \
        --granularity MONTHLY \
        --metrics "UnblendedCost" \
        --query 'ResultsByTime[0].Total.UnblendedCost.Amount' \
        --output text | xargs printf "Total: $%.2f\n"
}

# Function to stop EC2 instance
stop_ec2() {
    echo -e "\n${YELLOW}Stopping EC2 instance...${NC}"
    
    INSTANCE_ID=$(aws ec2 describe-instances \
        --filters "Name=tag:Name,Values=${PROJECT_NAME}-ec2" \
                  "Name=instance-state-name,Values=running" \
        --query 'Reservations[0].Instances[0].InstanceId' \
        --output text)
    
    if [ "$INSTANCE_ID" != "None" ] && [ -n "$INSTANCE_ID" ]; then
        aws ec2 stop-instances --instance-ids $INSTANCE_ID
        echo -e "${GREEN}EC2 instance stopped: $INSTANCE_ID${NC}"
        echo "Savings: ~$0.50/day (~$15/month)"
    else
        echo "No running EC2 instance found"
    fi
}

# Function to start EC2 instance
start_ec2() {
    echo -e "\n${GREEN}Starting EC2 instance...${NC}"
    
    INSTANCE_ID=$(aws ec2 describe-instances \
        --filters "Name=tag:Name,Values=${PROJECT_NAME}-ec2" \
                  "Name=instance-state-name,Values=stopped" \
        --query 'Reservations[0].Instances[0].InstanceId' \
        --output text)
    
    if [ "$INSTANCE_ID" != "None" ] && [ -n "$INSTANCE_ID" ]; then
        aws ec2 start-instances --instance-ids $INSTANCE_ID
        echo -e "${GREEN}EC2 instance started: $INSTANCE_ID${NC}"
        
        # Wait for instance to be running
        aws ec2 wait instance-running --instance-ids $INSTANCE_ID
        
        # Get public IP
        PUBLIC_IP=$(aws ec2 describe-instances \
            --instance-ids $INSTANCE_ID \
            --query 'Reservations[0].Instances[0].PublicIpAddress' \
            --output text)
        
        echo "Public IP: $PUBLIC_IP"
        echo "SSH: ssh ec2-user@$PUBLIC_IP"
    else
        echo "No stopped EC2 instance found"
    fi
}

# Function to check idle resources
check_idle_resources() {
    echo -e "\n${YELLOW}Checking for idle resources...${NC}"
    
    # Check EC2 CPU utilization
    INSTANCE_ID=$(aws ec2 describe-instances \
        --filters "Name=tag:Name,Values=${PROJECT_NAME}-ec2" \
                  "Name=instance-state-name,Values=running" \
        --query 'Reservations[0].Instances[0].InstanceId' \
        --output text)
    
    if [ "$INSTANCE_ID" != "None" ] && [ -n "$INSTANCE_ID" ]; then
        CPU_AVG=$(aws cloudwatch get-metric-statistics \
            --namespace AWS/EC2 \
            --metric-name CPUUtilization \
            --dimensions Name=InstanceId,Value=$INSTANCE_ID \
            --start-time $(date -u -d '2 hours ago' +%Y-%m-%dT%H:%M:%S) \
            --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
            --period 3600 \
            --statistics Average \
            --query 'Datapoints[0].Average' \
            --output text)
        
        echo "EC2 CPU Average (last 2h): ${CPU_AVG}%"
        
        if (( $(echo "$CPU_AVG < 5" | bc -l) )); then
            echo -e "${RED}⚠️  EC2 is idle! Consider stopping it.${NC}"
        fi
    fi
    
    # Check SQS queue depth
    QUEUE_URL=$(aws sqs get-queue-url \
        --queue-name ${PROJECT_NAME}-analysis-queue \
        --query 'QueueUrl' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$QUEUE_URL" ]; then
        QUEUE_DEPTH=$(aws sqs get-queue-attributes \
            --queue-url $QUEUE_URL \
            --attribute-names ApproximateNumberOfMessages \
            --query 'Attributes.ApproximateNumberOfMessages' \
            --output text)
        
        echo "SQS Queue Depth: $QUEUE_DEPTH messages"
    fi
}

# Function to cleanup old S3 objects
cleanup_s3() {
    echo -e "\n${YELLOW}Cleaning up old S3 objects...${NC}"
    
    DATASETS_BUCKET=$(aws s3api list-buckets \
        --query "Buckets[?contains(Name, '${PROJECT_NAME}-datasets')].Name" \
        --output text)
    
    if [ -n "$DATASETS_BUCKET" ]; then
        echo "Checking bucket: $DATASETS_BUCKET"
        
        # List objects older than 30 days
        OLD_OBJECTS=$(aws s3api list-objects-v2 \
            --bucket $DATASETS_BUCKET \
            --query "Contents[?LastModified<='$(date -u -d '30 days ago' +%Y-%m-%d)'].Key" \
            --output text)
        
        if [ -n "$OLD_OBJECTS" ]; then
            echo "Found old objects (>30 days):"
            echo "$OLD_OBJECTS"
            echo -e "${YELLOW}These will be moved to Glacier automatically by lifecycle policy${NC}"
        else
            echo "No old objects found"
        fi
    fi
}

# Function to show resource inventory
show_inventory() {
    echo -e "\n${GREEN}Resource Inventory:${NC}"
    
    echo -e "\n📦 EC2 Instances:"
    aws ec2 describe-instances \
        --filters "Name=tag:Project,Values=NeuroCode-AI" \
        --query 'Reservations[*].Instances[*].[InstanceId,InstanceType,State.Name,PublicIpAddress]' \
        --output table
    
    echo -e "\n💾 RDS Instances:"
    aws rds describe-db-instances \
        --query 'DBInstances[*].[DBInstanceIdentifier,DBInstanceClass,DBInstanceStatus,Endpoint.Address]' \
        --output table
    
    echo -e "\n📁 S3 Buckets:"
    aws s3api list-buckets \
        --query "Buckets[?contains(Name, '${PROJECT_NAME}')].[Name,CreationDate]" \
        --output table
    
    echo -e "\n📨 SQS Queues:"
    aws sqs list-queues \
        --queue-name-prefix ${PROJECT_NAME} \
        --query 'QueueUrls' \
        --output table
}

# Function to emergency shutdown
emergency_shutdown() {
    echo -e "\n${RED}🚨 EMERGENCY SHUTDOWN${NC}"
    echo "This will stop all billable resources"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "Cancelled"
        return
    fi
    
    echo "Stopping EC2..."
    stop_ec2
    
    echo -e "\n${GREEN}Emergency shutdown complete${NC}"
    echo "RDS will continue running (minimal cost)"
    echo "To stop RDS: aws rds stop-db-instance --db-instance-identifier ${PROJECT_NAME}-db"
}

# Main menu
case "${1:-menu}" in
    costs)
        get_current_costs
        ;;
    stop)
        stop_ec2
        ;;
    start)
        start_ec2
        ;;
    check)
        check_idle_resources
        ;;
    cleanup)
        cleanup_s3
        ;;
    inventory)
        show_inventory
        ;;
    emergency)
        emergency_shutdown
        ;;
    menu|*)
        echo ""
        echo "Usage: $0 {costs|stop|start|check|cleanup|inventory|emergency}"
        echo ""
        echo "Commands:"
        echo "  costs      - Show current month AWS costs"
        echo "  stop       - Stop EC2 instance (save ~$15/month)"
        echo "  start      - Start EC2 instance"
        echo "  check      - Check for idle resources"
        echo "  cleanup    - Cleanup old S3 objects"
        echo "  inventory  - Show all resources"
        echo "  emergency  - Emergency shutdown of all resources"
        echo ""
        ;;
esac
