import { NotificationPayload, RequestStatus } from '../types/notification';
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
    const message = buildStatusChangedMessage(payload);
    logger.info('Status change message built', {
      requestId: payload.requestId,
      message,
    });
    // email service comming
    // mongodb log coming

  } else if (payload.type === 'COMMENT_ADDED') {
    if (!payload.commentAuthor || !payload.commentContent) {
      logger.error('Missing comment fields for COMMENT_ADDED notification', {
        requestId: payload.requestId,
      });
      return;
    }
    const message = buildCommentAddedMessage(payload);
    logger.info('Comment added message built', {
      requestId: payload.requestId,
      message,
    });
    // email service comming
    // mongodb log coming

  } else {
    logger.warn('Unknown notification type received', {
      requestId: payload.requestId,
      type: payload.type,
    });
  }
};