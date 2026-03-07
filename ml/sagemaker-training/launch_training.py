#!/usr/bin/env python3
"""
Launch SageMaker Training Job with Spot Instances
Cost-optimized configuration
"""

import boto3
import sagemaker
from sagemaker.pytorch import PyTorch
from datetime import datetime
import os
import json

# Configuration
PROJECT_NAME = os.environ.get('PROJECT_NAME', 'neurocode-ai')
AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')
S3_DATASETS_BUCKET = os.environ.get('S3_DATASETS_BUCKET')
S3_MODELS_BUCKET = os.environ.get('S3_MODELS_BUCKET')
SAGEMAKER_ROLE_ARN = os.environ.get('SAGEMAKER_ROLE_ARN')

# Training configuration
INSTANCE_TYPE = 'ml.g4dn.xlarge'  # GPU instance for training
INSTANCE_COUNT = 1
MAX_RUN_SECONDS = 1800  # 30 minutes max
MAX_WAIT_SECONDS = 3600  # 1 hour max wait for spot
USE_SPOT_INSTANCES = True
SPOT_INTERRUPTION_BEHAVIOR = 'Stop'  # Resume if interrupted


def create_training_job(dataset_s3_path: str, job_name: str = None):
    """
    Create and launch SageMaker training job
    
    Args:
        dataset_s3_path: S3 path to training dataset
        job_name: Optional custom job name
    """
    
    if not job_name:
        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        job_name = f'{PROJECT_NAME}-confusion-{timestamp}'
    
    print("=" * 60)
    print("Launching SageMaker Training Job")
    print("=" * 60)
    print(f"Job Name: {job_name}")
    print(f"Instance Type: {INSTANCE_TYPE}")
    print(f"Spot Instances: {USE_SPOT_INSTANCES}")
    print(f"Dataset: {dataset_s3_path}")
    print("=" * 60)
    
    # Initialize SageMaker session
    session = sagemaker.Session()
    
    # Output path for model artifacts
    output_path = f's3://{S3_MODELS_BUCKET}/training-jobs/{job_name}'
    
    # Create PyTorch estimator
    estimator = PyTorch(
        entry_point='train_confusion_model.py',
        source_dir='.',
        role=SAGEMAKER_ROLE_ARN,
        instance_type=INSTANCE_TYPE,
        instance_count=INSTANCE_COUNT,
        framework_version='2.1.0',
        py_version='py310',
        
        # Spot instance configuration (COST SAVINGS!)
        use_spot_instances=USE_SPOT_INSTANCES,
        max_run=MAX_RUN_SECONDS,
        max_wait=MAX_WAIT_SECONDS if USE_SPOT_INSTANCES else None,
        
        # Output configuration
        output_path=output_path,
        
        # Hyperparameters
        hyperparameters={
            'epochs': 20,
            'batch-size': 64,
            'lr': 0.001,
            'input-dim': 50,
        },
        
        # Logging
        enable_sagemaker_metrics=True,
        
        # Job name
        base_job_name=f'{PROJECT_NAME}-confusion',
        
        # Checkpointing (for spot instance recovery)
        checkpoint_s3_uri=f's3://{S3_MODELS_BUCKET}/checkpoints/{job_name}' if USE_SPOT_INSTANCES else None,
        checkpoint_local_path='/opt/ml/checkpoints' if USE_SPOT_INSTANCES else None,
    )
    
    # Start training
    print("\nStarting training job...")
    print("This will use spot instances to save costs (~70% savings)")
    print("Training may be interrupted and resumed automatically")
    print("\nMonitor progress:")
    print(f"  AWS Console: https://console.aws.amazon.com/sagemaker/home?region={AWS_REGION}#/jobs/{job_name}")
    print(f"  CloudWatch Logs: /aws/sagemaker/TrainingJobs")
    
    estimator.fit(
        inputs={'training': dataset_s3_path},
        job_name=job_name,
        wait=False,  # Don't wait for completion (async)
    )
    
    # Save job info
    job_info = {
        'job_name': job_name,
        'instance_type': INSTANCE_TYPE,
        'spot_instances': USE_SPOT_INSTANCES,
        'dataset_path': dataset_s3_path,
        'output_path': output_path,
        'status': 'InProgress',
        'created_at': datetime.now().isoformat(),
    }
    
    print("\n" + "=" * 60)
    print("Training job launched successfully!")
    print("=" * 60)
    print(json.dumps(job_info, indent=2))
    
    return job_info


def check_training_status(job_name: str):
    """Check status of training job"""
    
    sagemaker_client = boto3.client('sagemaker', region_name=AWS_REGION)
    
    try:
        response = sagemaker_client.describe_training_job(TrainingJobName=job_name)
        
        status = response['TrainingJobStatus']
        print(f"\nJob: {job_name}")
        print(f"Status: {status}")
        
        if status == 'Completed':
            print(f"Model Artifacts: {response['ModelArtifacts']['S3ModelArtifacts']}")
            print(f"Training Time: {response.get('TrainingTimeInSeconds', 0)} seconds")
            print(f"Billable Time: {response.get('BillableTimeInSeconds', 0)} seconds")
            
            # Calculate cost (approximate)
            billable_hours = response.get('BillableTimeInSeconds', 0) / 3600
            cost_per_hour = 0.526  # ml.g4dn.xlarge spot price
            estimated_cost = billable_hours * cost_per_hour
            print(f"Estimated Cost: ${estimated_cost:.2f}")
        
        elif status == 'Failed':
            print(f"Failure Reason: {response.get('FailureReason', 'Unknown')}")
        
        return response
        
    except Exception as e:
        print(f"Error checking job status: {e}")
        return None


def download_trained_model(job_name: str, local_path: str = './models'):
    """Download trained model from S3"""
    
    print(f"\nDownloading model from training job: {job_name}")
    
    s3_client = boto3.client('s3', region_name=AWS_REGION)
    
    # Get model artifact location
    sagemaker_client = boto3.client('sagemaker', region_name=AWS_REGION)
    response = sagemaker_client.describe_training_job(TrainingJobName=job_name)
    
    if response['TrainingJobStatus'] != 'Completed':
        print(f"Training job not completed yet. Status: {response['TrainingJobStatus']}")
        return None
    
    model_s3_uri = response['ModelArtifacts']['S3ModelArtifacts']
    
    # Parse S3 URI
    bucket = model_s3_uri.split('/')[2]
    key = '/'.join(model_s3_uri.split('/')[3:])
    
    # Download
    os.makedirs(local_path, exist_ok=True)
    local_file = os.path.join(local_path, f'{job_name}.tar.gz')
    
    print(f"Downloading from: {model_s3_uri}")
    print(f"Saving to: {local_file}")
    
    s3_client.download_file(bucket, key, local_file)
    
    print("Model downloaded successfully!")
    print(f"Extract with: tar -xzf {local_file} -C {local_path}")
    
    return local_file


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Launch training: python launch_training.py train <dataset-s3-path>")
        print("  Check status:    python launch_training.py status <job-name>")
        print("  Download model:  python launch_training.py download <job-name>")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'train':
        if len(sys.argv) < 3:
            print("Error: Dataset S3 path required")
            print("Example: python launch_training.py train s3://bucket/datasets/dataset.json")
            sys.exit(1)
        
        dataset_path = sys.argv[2]
        create_training_job(dataset_path)
    
    elif command == 'status':
        if len(sys.argv) < 3:
            print("Error: Job name required")
            sys.exit(1)
        
        job_name = sys.argv[2]
        check_training_status(job_name)
    
    elif command == 'download':
        if len(sys.argv) < 3:
            print("Error: Job name required")
            sys.exit(1)
        
        job_name = sys.argv[2]
        download_trained_model(job_name)
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
