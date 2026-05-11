import { SQSEvent, SQSRecord } from 'aws-lambda';
import { NotificationPayload } from '../types/notification';
import { processNotification } from '../services/notificationService';
import { logger } from '../utils/logger';

const parseRecord = (record: SQSRecord): NotificationPayload => {
  try {
    return JSON.parse(record.body) as NotificationPayload;
  } catch (error) {
    logger.error('Failed to parse SQS record', {
      messageId: record.messageId,
      error: (error as Error).message,
    });
    throw error;
  }
};

export const lambdaHandler = async (event: SQSEvent): Promise<void> => {
  logger.info('Notification handler invoked', {
    recordCount: event.Records.length,
  });

  await Promise.all(
    event.Records.map(async (record) => {
      const payload = parseRecord(record);
      await processNotification(payload);
    })
  );

  logger.info('Notification handler completed', {
    recordCount: event.Records.length,
  });
};