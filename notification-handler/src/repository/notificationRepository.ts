import { MongoClient, Collection } from 'mongodb';
import { NotificationLog } from '../types/notification';
import { logger } from '../utils/logger';

let client: MongoClient | null = null;

const getClient = async (): Promise<MongoClient> => {
  if (client) {
    return client;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  client = new MongoClient(uri);
  await client.connect();

  logger.info('MongoDB client connected');

  return client;
};

const getCollection = async (): Promise<Collection<NotificationLog>> => {
  const mongoClient = await getClient();
  return mongoClient
    .db('facility-care')
    .collection<NotificationLog>('notification-logs');
};

export const logNotification = async (
  log: NotificationLog
): Promise<void> => {
  try {
    const collection = await getCollection();
    await collection.insertOne(log);
    logger.info('Notification logged to MongoDB', {
      requestId: log.requestId,
      type: log.type,
      success: log.success,
    });
  } catch (error) {
    logger.error('Failed to log notification to MongoDB', {
      requestId: log.requestId,
      error: (error as Error).message,
    });
  }
};