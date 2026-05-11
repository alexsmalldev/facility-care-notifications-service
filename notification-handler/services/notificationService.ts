import { NotificationPayload, NotificationLog, RequestStatus } from '../types/notification';
import { sendEmail } from './emailService';
import { logNotification } from '../repository/notificationRepository';
import { logger } from '../utils/logger';

const STATUS_LABELS: Record<RequestStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const buildStatusChangedMessage = (payload: NotificationPayload): string => {
  const previous = STATUS_LABELS[payload.previousStatus!];
  const next = STATUS_LABELS[payload.newStatus!];
  return `Your ${payload.service} request at ${payload.building} has been updated from ${previous} to ${next}.`;
};

export const buildCommentAddedMessage = (payload: NotificationPayload): string => {
  return `${payload.commentAuthor} has left a comment on your ${payload.service} request at ${payload.building}: "${payload.commentContent}"`;
};

const buildNotificationLog = (
  payload: NotificationPayload,
  success: boolean,
  errorMessage?: string
): NotificationLog => ({
  requestId: payload.requestId,
  type: payload.type,
  recipientEmail: payload.recipientEmail,
  recipientRole: payload.recipientRole,
  service: payload.service,
  building: payload.building,
  priority: payload.priority,
  sentAt: new Date().toISOString(),
  success,
  errorMessage,
});

export const processNotification = async (
  payload: NotificationPayload
): Promise<void> => {
  logger.info('Processing notification', {
    requestId: payload.requestId,
    type: payload.type,
    recipientEmail: payload.recipientEmail,
    recipientRole: payload.recipientRole,
  });

  if (payload.type === 'STATUS_CHANGED') {
    if (!payload.previousStatus || !payload.newStatus) {
      logger.error('Missing status fields for STATUS_CHANGED notification', {
        requestId: payload.requestId,
      });
      return;
    }
  } else if (payload.type === 'COMMENT_ADDED') {
    if (!payload.commentAuthor || !payload.commentContent) {
      logger.error('Missing comment fields for COMMENT_ADDED notification', {
        requestId: payload.requestId,
      });
      return;
    }
  } else {
    logger.warn('Unknown notification type received', {
      requestId: payload.requestId,
      type: payload.type,
    });
    return;
  }

  try {
    await sendEmail(payload);
    await logNotification(buildNotificationLog(payload, true));
  } catch (error) {
    logger.error('Failed to process notification', {
      requestId: payload.requestId,
      error: (error as Error).message,
    });
    await logNotification(
      buildNotificationLog(payload, false, (error as Error).message)
    );
    throw error;
  }
};