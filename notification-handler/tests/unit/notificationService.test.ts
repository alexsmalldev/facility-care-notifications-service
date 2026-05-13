import {
  buildStatusChangedMessage,
  buildCommentAddedMessage,
  processNotification,
} from '../../src/services/notificationService';
import { sendEmail } from '../../src/services/emailService';
import { logNotification } from '../../src/repository/notificationRepository';
import { NotificationPayload } from '../../src/types/notification';

jest.mock('../../src/services/emailService');
jest.mock('../../src/repository/notificationRepository');

const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
const mockLogNotification = logNotification as jest.MockedFunction<typeof logNotification>;

const basePayload: NotificationPayload = {
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
};

describe('buildStatusChangedMessage', () => {
  it('returns correct message for status change', () => {
    const payload: NotificationPayload = {
      ...basePayload,
      previousStatus: 'open',
      newStatus: 'in_progress',
    };
    const message = buildStatusChangedMessage(payload);
    expect(message).toBe(
      'Your Air Conditioning request at Headquarters has been updated from Open to In Progress.'
    );
  });

  it('returns correct message for completed status', () => {
    const payload: NotificationPayload = {
      ...basePayload,
      previousStatus: 'in_progress',
      newStatus: 'completed',
    };
    const message = buildStatusChangedMessage(payload);
    expect(message).toBe(
      'Your Air Conditioning request at Headquarters has been updated from In Progress to Completed.'
    );
  });
});

describe('buildCommentAddedMessage', () => {
  it('returns correct message for comment added', () => {
    const payload: NotificationPayload = {
      ...basePayload,
      type: 'COMMENT_ADDED',
      commentAuthor: 'Admin User',
      commentContent: 'We will be with you shortly.',
    };
    const message = buildCommentAddedMessage(payload);
    expect(message).toBe(
      'Admin User has left a comment on your Air Conditioning request at Headquarters: "We will be with you shortly."'
    );
  });
});

describe('processNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendEmail.mockResolvedValue(undefined);
    mockLogNotification.mockResolvedValue(undefined);
  });

  it('processes STATUS_CHANGED notification successfully', async () => {
    const payload: NotificationPayload = {
      ...basePayload,
      previousStatus: 'open',
      newStatus: 'in_progress',
    };
    await processNotification(payload);
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockLogNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 1,
        type: 'STATUS_CHANGED',
        success: true,
      })
    );
  });

  it('processes COMMENT_ADDED notification successfully', async () => {
    const payload: NotificationPayload = {
      ...basePayload,
      type: 'COMMENT_ADDED',
      commentAuthor: 'Admin User',
      commentContent: 'We will be with you shortly.',
    };
    await processNotification(payload);
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockLogNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 1,
        type: 'COMMENT_ADDED',
        success: true,
      })
    );
  });

  it('returns early if STATUS_CHANGED is missing status fields', async () => {
    await processNotification(basePayload);
    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(mockLogNotification).not.toHaveBeenCalled();
  });

  it('returns early if COMMENT_ADDED is missing comment fields', async () => {
    const payload: NotificationPayload = {
      ...basePayload,
      type: 'COMMENT_ADDED',
    };
    await processNotification(payload);
    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(mockLogNotification).not.toHaveBeenCalled();
  });

  it('logs failure if sendEmail throws', async () => {
    const payload: NotificationPayload = {
      ...basePayload,
      previousStatus: 'open',
      newStatus: 'in_progress',
    };
    mockSendEmail.mockRejectedValue(new Error('SES error'));
    await expect(processNotification(payload)).rejects.toThrow('SES error');
    expect(mockLogNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errorMessage: 'SES error',
      })
    );
  });
});