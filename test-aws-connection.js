#!/usr/bin/env node

/**
 * NeuroCode AI - AWS Connection Test Script
 * Tests all AWS service connections and credentials
 */

const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const { SQSClient, GetQueueAttributesCommand } = require('@aws-sdk/client-sqs');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const { Client } = require('pg');
require('dotenv').config({ path: './backend/api-gateway/.env' });

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

async function testAWSCredentials() {
  logInfo('Testing AWS credentials...');
  try {
    const stsClient = new STSClient({ region: AWS_REGION });
    const command = new GetCallerIdentityCommand({});
    const response = await stsClient.send(command);
    
    logSuccess(`AWS credentials valid`);
    console.log(`  Account: ${response.Account}`);
    console.log(`  User ARN: ${response.Arn}`);
    return true;
  } catch (error) {
    logError(`AWS credentials invalid: ${error.message}`);
    return false;
  }
}

async function testS3Access() {
  logInfo('Testing S3 access...');
  try {
    const s3Client = new S3Client({ region: AWS_REGION });
    
    // Test datasets bucket
    const datasetsBucket = process.env.S3_DATASETS_BUCKET;
    if (datasetsBucket) {
      try {
        // Try to list objects (will fail if bucket doesn't exist or no access)
        const { S3Client: S3, ListObjectsV2Command } = require('@aws-sdk/client-s3');
        const s3 = new S3({ region: AWS_REGION });
        await s3.send(new ListObjectsV2Command({ Bucket: datasetsBucket, MaxKeys: 1 }));
        logSuccess(`S3 datasets bucket accessible: ${datasetsBucket}`);
      } catch (error) {
        if (error.name === 'NoSuchBucket') {
          logWarning(`S3 datasets bucket does not exist: ${datasetsBucket}`);
        } else {
          logError(`S3 datasets bucket not accessible: ${error.message}`);
        }
      }
    } else {
      logWarning('S3_DATASETS_BUCKET not configured');
    }
    
    // Test models bucket
    const modelsBucket = process.env.S3_MODELS_BUCKET;
    if (modelsBucket) {
      try {
        const { S3Client: S3, ListObjectsV2Command } = require('@aws-sdk/client-s3');
        const s3 = new S3({ region: AWS_REGION });
        await s3.send(new ListObjectsV2Command({ Bucket: modelsBucket, MaxKeys: 1 }));
        logSuccess(`S3 models bucket accessible: ${modelsBucket}`);
      } catch (error) {
        if (error.name === 'NoSuchBucket') {
          logWarning(`S3 models bucket does not exist: ${modelsBucket}`);
        } else {
          logError(`S3 models bucket not accessible: ${error.message}`);
        }
      }
    } else {
      logWarning('S3_MODELS_BUCKET not configured');
    }
    
    return true;
  } catch (error) {
    logError(`S3 access test failed: ${error.message}`);
    return false;
  }
}

async function testSQSAccess() {
  logInfo('Testing SQS access...');
  try {
    const sqsClient = new SQSClient({ region: AWS_REGION });
    
    // Test analysis queue
    const analysisQueueUrl = process.env.SQS_ANALYSIS_QUEUE_URL;
    if (analysisQueueUrl) {
      try {
        const command = new GetQueueAttributesCommand({
          QueueUrl: analysisQueueUrl,
          AttributeNames: ['ApproximateNumberOfMessages'],
        });
        const response = await sqsClient.send(command);
        logSuccess(`SQS analysis queue accessible`);
        console.log(`  Messages in queue: ${response.Attributes.ApproximateNumberOfMessages}`);
      } catch (error) {
        logError(`SQS analysis queue not accessible: ${error.message}`);
      }
    } else {
      logWarning('SQS_ANALYSIS_QUEUE_URL not configured');
    }
    
    // Test training queue
    const trainingQueueUrl = process.env.SQS_TRAINING_QUEUE_URL;
    if (trainingQueueUrl) {
      try {
        const command = new GetQueueAttributesCommand({
          QueueUrl: trainingQueueUrl,
          AttributeNames: ['ApproximateNumberOfMessages'],
        });
        const response = await sqsClient.send(command);
        logSuccess(`SQS training queue accessible`);
        console.log(`  Messages in queue: ${response.Attributes.ApproximateNumberOfMessages}`);
      } catch (error) {
        logError(`SQS training queue not accessible: ${error.message}`);
      }
    } else {
      logWarning('SQS_TRAINING_QUEUE_URL not configured');
    }
    
    return true;
  } catch (error) {
    logError(`SQS access test failed: ${error.message}`);
    return false;
  }
}

async function testSecretsManager() {
  logInfo('Testing Secrets Manager access...');
  try {
    const secretsClient = new SecretsManagerClient({ region: AWS_REGION });
    
    const secretArn = process.env.DB_SECRET_ARN;
    if (secretArn) {
      try {
        const command = new GetSecretValueCommand({ SecretId: secretArn });
        const response = await secretsClient.send(command);
        logSuccess(`Secrets Manager accessible`);
        console.log(`  Secret ARN: ${secretArn}`);
      } catch (error) {
        logError(`Secrets Manager not accessible: ${error.message}`);
      }
    } else {
      logWarning('DB_SECRET_ARN not configured');
    }
    
    return true;
  } catch (error) {
    logError(`Secrets Manager test failed: ${error.message}`);
    return false;
  }
}

async function testDatabaseConnection() {
  logInfo('Testing database connection...');
  
  const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionTimeoutMillis: 5000,
  };
  
  if (!dbConfig.host || !dbConfig.database || !dbConfig.user || !dbConfig.password) {
    logWarning('Database credentials not fully configured');
    return false;
  }
  
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    const result = await client.query('SELECT version()');
    logSuccess('Database connection successful');
    console.log(`  PostgreSQL version: ${result.rows[0].version.split(',')[0]}`);
    await client.end();
    return true;
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      logWarning('  Make sure the database is running and accessible');
    } else if (error.code === 'ENOTFOUND') {
      logWarning('  Check DB_HOST configuration');
    } else if (error.code === '28P01') {
      logWarning('  Check DB_USER and DB_PASSWORD');
    }
    return false;
  }
}

async function testEnvironmentVariables() {
  logInfo('Checking environment variables...');
  
  const requiredVars = [
    'AWS_REGION',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'S3_DATASETS_BUCKET',
    'S3_MODELS_BUCKET',
    'SQS_ANALYSIS_QUEUE_URL',
    'SQS_TRAINING_QUEUE_URL',
    'SAGEMAKER_ROLE_ARN',
  ];
  
  let allPresent = true;
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logSuccess(`${varName} is set`);
    } else {
      logError(`${varName} is not set`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

async function main() {
  console.log('==========================================');
  console.log('NeuroCode AI - AWS Connection Test');
  console.log('==========================================');
  console.log('');
  
  const results = {
    envVars: false,
    awsCredentials: false,
    s3: false,
    sqs: false,
    secretsManager: false,
    database: false,
  };
  
  // Test environment variables
  results.envVars = await testEnvironmentVariables();
  console.log('');
  
  // Test AWS credentials
  results.awsCredentials = await testAWSCredentials();
  console.log('');
  
  // Test S3 access
  results.s3 = await testS3Access();
  console.log('');
  
  // Test SQS access
  results.sqs = await testSQSAccess();
  console.log('');
  
  // Test Secrets Manager
  results.secretsManager = await testSecretsManager();
  console.log('');
  
  // Test database connection
  results.database = await testDatabaseConnection();
  console.log('');
  
  // Summary
  console.log('==========================================');
  console.log('Test Summary');
  console.log('==========================================');
  
  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    logSuccess('All tests passed! AWS integration is ready.');
  } else {
    logWarning('Some tests failed. Please review the errors above.');
    console.log('');
    console.log('Failed tests:');
    Object.entries(results).forEach(([test, passed]) => {
      if (!passed) {
        logError(`  - ${test}`);
      }
    });
  }
  
  console.log('');
  process.exit(allPassed ? 0 : 1);
}

// Run tests
main().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
