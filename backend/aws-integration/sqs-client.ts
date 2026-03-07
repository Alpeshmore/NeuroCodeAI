import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand, GetQueueAttributesCommand } from '@aws-sdk/client-sqs'
import { logger } from '../api-gateway/src/utils/logger'

const sqsClient = new SQSClient({ region: process.env.AWS_REGION || 'us-east-1' })

export interface SQSMessage {
  id: string
  body: any
  receiptHandle: string
}

export class SQSService {
  /**
   * Send message to SQS queue
   */
  static async sendMessage(queueUrl: string, message: any, delaySeconds: number = 0): Promise<string> {
    try {
      const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
        DelaySeconds: delaySeconds,
      })

      const response = await sqsClient.send(command)
      logger.info(`Message sent to SQS: ${response.MessageId}`)
      return response.MessageId!
    } catch (error) {
      logger.error('Failed to send SQS message:', error)
      throw error
    }
  }

  /**
   * Receive messages from SQS queue
   */
  static async receiveMessages(
    queueUrl: string,
    maxMessages: number = 1,
    waitTimeSeconds: number = 10
  ): Promise<SQSMessage[]> {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxMessages,
        WaitTimeSeconds: waitTimeSeconds,
        MessageAttributeNames: ['All'],
      })

      const response = await sqsClient.send(command)
      
      if (!response.Messages || response.Messages.length === 0) {
        return []
      }

      return response.Messages.map(msg => ({
        id: msg.MessageId!,
        body: JSON.parse(msg.Body!),
        receiptHandle: msg.ReceiptHandle!,
      }))
    } catch (error) {
      logger.error('Failed to receive SQS messages:', error)
      throw error
    }
  }

  /**
   * Delete message from SQS queue
   */
  static async deleteMessage(queueUrl: string, receiptHandle: string): Promise<void> {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      })

      await sqsClient.send(command)
      logger.info('Message deleted from SQS')
    } catch (error) {
      logger.error('Failed to delete SQS message:', error)
      throw error
    }
  }

  /**
   * Get queue attributes (depth, etc.)
   */
  static async getQueueDepth(queueUrl: string): Promise<number> {
    try {
      const command = new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: ['ApproximateNumberOfMessages'],
      })

      const response = await sqsClient.send(command)
      return parseInt(response.Attributes?.ApproximateNumberOfMessages || '0')
    } catch (error) {
      logger.error('Failed to get queue depth:', error)
      throw error
    }
  }

  /**
   * Start polling queue (for workers)
   */
  static async startPolling(
    queueUrl: string,
    handler: (message: SQSMessage) => Promise<void>,
    options: { maxMessages?: number; pollInterval?: number } = {}
  ): Promise<void> {
    const { maxMessages = 1, pollInterval = 1000 } = options

    logger.info(`Starting SQS polling for queue: ${queueUrl}`)

    const poll = async () => {
      try {
        const messages = await this.receiveMessages(queueUrl, maxMessages)

        for (const message of messages) {
          try {
            await handler(message)
            await this.deleteMessage(queueUrl, message.receiptHandle)
          } catch (error) {
            logger.error('Error processing message:', error)
            // Message will be returned to queue after visibility timeout
          }
        }
      } catch (error) {
        logger.error('Error polling SQS:', error)
      }

      // Continue polling
      setTimeout(poll, pollInterval)
    }

    poll()
  }
}

// Queue URLs from environment
export const ANALYSIS_QUEUE_URL = process.env.SQS_ANALYSIS_QUEUE_URL!
export const TRAINING_QUEUE_URL = process.env.SQS_TRAINING_QUEUE_URL!
