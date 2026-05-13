import { SQSEvent, SQSRecord } from 'aws-lambda';
import { lambdaHandler } from '../../src/handlers/notificationHandler';
import { processNotification } from '../../src/services/notificationService';
import { NotificationPayload } from '../../src/types/notification';

jest.mock('../../src/services/notificationService');

const mockProcessNotification = processNotification as jest.MockedFunction<typeof processNotification>;

const validPayload: NotificationPayload = {
  requestId: 1,
  type: 'STATUS_CHANGED',
  recipientEmail: 'customer@demo.com',
  recipientName: 'Demo Customer',
  recipientRole: 'customer',
  service: 'Air Conditioning',
  building: 'Headquarters',
  priority: 'high',
  slaDate: '2026-05-12T15:59:00Z',
  timestamp: '2026-05-11T15:59:00Z',
  previousStatus: 'open',
  newStatus: 'in_progress',
};

const buildSQSEvent = (body: string): SQSEvent => ({
  Records: [
    {
      messageId: 'test-message-1',
      receiptHandle: 'test-receipt',
      body,
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1715000000000',
        SenderId: 'test',
        ApproximateFirstReceiveTimestamp: '1715000000000',
      },
      messageAttributes: {},
      md5OfBody: '',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:eu-north-1:123456789:facility-care-notification-queue',
      awsRegion: 'eu-north-1',
    } as SQSRecord,
  ],
});

describe('lambdaHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProcessNotification.mockResolvedValue(undefined);
  });

  it('processes a valid SQS record successfully', async () => {
    const event = buildSQSEvent(JSON.stringify(validPayload));
    await lambdaHandler(event);
    expect(mockProcessNotification).toHaveBeenCalledTimes(1);
    expect(mockProcessNotification).toHaveBeenCalledWith(validPayload);
  });

  it('processes multiple SQS records', async () => {
    const event = buildSQSEvent(JSON.stringify(validPayload));
    event.Records.push({ ...event.Records[0], messageId: 'test-message-2' });
    await lambdaHandler(event);
    expect(mockProcessNotification).toHaveBeenCalledTimes(2);
  });

  it('throws on invalid JSON in SQS record body', async () => {
    const event = buildSQSEvent('invalid-json');
    await expect(lambdaHandler(event)).rejects.toThrow();
    expect(mockProcessNotification).not.toHaveBeenCalled();
  });
});