import { MongoClient, ServerApiVersion } from 'mongodb';
import { NotificationLog } from '../types/notification';
import { logger } from '../utils/logger';

export const logNotification = async (
  log: NotificationLog
): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await client.connect();
    logger.info('MongoDB client connected');

    const collection = client
      .db('facility-care-notifications')
      .collection<NotificationLog>('notification-logs');

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
  } finally {
    await client.close();
    logger.info('MongoDB client closed');
  }
};