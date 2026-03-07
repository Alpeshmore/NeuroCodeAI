import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { logger } from '../api-gateway/src/utils/logger'
import { Readable } from 'stream'

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })

export const DATASETS_BUCKET = process.env.S3_DATASETS_BUCKET!
export const MODELS_BUCKET = process.env.S3_MODELS_BUCKET!

export class S3Service {
  /**
   * Upload file to S3
   */
  static async uploadFile(
    bucket: string,
    key: string,
    body: Buffer | Readable | string,
    contentType?: string
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
      })

      await s3Client.send(command)
      const url = `s3://${bucket}/${key}`
      logger.info(`File uploaded to S3: ${url}`)
      return url
    } catch (error) {
      logger.error('Failed to upload to S3:', error)
      throw error
    }
  }

  /**
   * Download file from S3
   */
  static async downloadFile(bucket: string, key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })

      const response = await s3Client.send(command)
      const stream = response.Body as Readable
      
      const chunks: Buffer[] = []
      for await (const chunk of stream) {
        chunks.push(chunk)
      }

      logger.info(`File downloaded from S3: s3://${bucket}/${key}`)
      return Buffer.concat(chunks)
    } catch (error) {
      logger.error('Failed to download from S3:', error)
      throw error
    }
  }

  /**
   * Get presigned URL for download
   */
  static async getPresignedUrl(bucket: string, key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })

      const url = await getSignedUrl(s3Client, command, { expiresIn })
      logger.info(`Generated presigned URL for: s3://${bucket}/${key}`)
      return url
    } catch (error) {
      logger.error('Failed to generate presigned URL:', error)
      throw error
    }
  }

  /**
   * List files in S3 bucket
   */
  static async listFiles(bucket: string, prefix?: string): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
      })

      const response = await s3Client.send(command)
      const keys = response.Contents?.map(obj => obj.Key!) || []
      
      logger.info(`Listed ${keys.length} files from S3: s3://${bucket}/${prefix || ''}`)
      return keys
    } catch (error) {
      logger.error('Failed to list S3 files:', error)
      throw error
    }
  }

  /**
   * Delete file from S3
   */
  static async deleteFile(bucket: string, key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })

      await s3Client.send(command)
      logger.info(`File deleted from S3: s3://${bucket}/${key}`)
    } catch (error) {
      logger.error('Failed to delete from S3:', error)
      throw error
    }
  }

  /**
   * Upload dataset to S3
   */
  static async uploadDataset(datasetId: string, data: any): Promise<string> {
    const key = `datasets/${datasetId}.json`
    const body = JSON.stringify(data)
    return this.uploadFile(DATASETS_BUCKET, key, body, 'application/json')
  }

  /**
   * Upload model artifact to S3
   */
  static async uploadModel(modelId: string, modelData: Buffer): Promise<string> {
    const key = `models/${modelId}/model.tar.gz`
    return this.uploadFile(MODELS_BUCKET, key, modelData, 'application/gzip')
  }

  /**
   * Download model artifact from S3
   */
  static async downloadModel(modelId: string): Promise<Buffer> {
    const key = `models/${modelId}/model.tar.gz`
    return this.downloadFile(MODELS_BUCKET, key)
  }

  /**
   * List all models
   */
  static async listModels(): Promise<string[]> {
    const keys = await this.listFiles(MODELS_BUCKET, 'models/')
    return keys.map(key => key.split('/')[1]).filter(Boolean)
  }
}
