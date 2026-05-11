import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { NotificationPayload } from '../types/notification';
import { buildStatusChangedMessage, buildCommentAddedMessage } from './notificationService';
import { logger } from '../utils/logger';

const ses = new SESClient({ region: process.env.AWS_REGION });

const FROM_EMAIL = process.env.FROM_EMAIL;

const buildSubject = (payload: NotificationPayload): string => {
  if (payload.type === 'STATUS_CHANGED') {
    return `Your ${payload.service} request has been updated - FacilityCare`;
  }
  return `New comment on your ${payload.service} request - FacilityCare`;
};

const buildBody = (payload: NotificationPayload): string => {
  const message =
    payload.type === 'STATUS_CHANGED'
      ? buildStatusChangedMessage(payload)
      : buildCommentAddedMessage(payload);

  return `
    Hi ${payload.recipientName},

    ${message}

    Request Details:
    - Request ID: ${payload.requestId}
    - Service: ${payload.service}
    - Building: ${payload.building}
    - Priority: ${payload.priority}
    - SLA Date: ${new Date(payload.slaDate).toLocaleDateString('en-GB', { dateStyle: 'long' })}

    You can view your request by logging into FacilityCare.

    Thanks,
    The FacilityCare Team
  `.trim();
};

export const sendEmail = async (payload: NotificationPayload): Promise<void> => {
  if (!FROM_EMAIL) {
    throw new Error('FROM_EMAIL environment variable is not set');
  }

  const subject = buildSubject(payload);
  const body = buildBody(payload);

  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: {
      ToAddresses: [payload.recipientEmail],
    },
    Message: {
      Subject: { Data: subject },
      Body: {
        Text: { Data: body },
      },
    },
  });

  try {
    await ses.send(command);
    logger.info('Email sent successfully', {
      requestId: payload.requestId,
      recipientEmail: payload.recipientEmail,
      subject,
    });
  } catch (error) {
    logger.error('Failed to send email', {
      requestId: payload.requestId,
      recipientEmail: payload.recipientEmail,
      error: (error as Error).message,
    });
    throw error;
  }
};