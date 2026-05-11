export type NotificationType = 'STATUS_CHANGED' | 'COMMENT_ADDED';

export type RequestStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export type RequestPriority = 'low' | 'medium' | 'high';

export type RecipientRole = 'customer' | 'admin';

export interface NotificationPayload {
  requestId: number;
  type: NotificationType;
  recipientEmail: string;
  recipientName: string;
  recipientRole: RecipientRole;
  service: string;
  building: string;
  priority: RequestPriority;
  slaDate: string;
  timestamp: string;
  previousStatus?: RequestStatus;
  newStatus?: RequestStatus;
  commentAuthor?: string;
  commentContent?: string;
}

export interface NotificationLog {
  requestId: number;
  type: NotificationType;
  recipientEmail: string;
  recipientRole: RecipientRole;
  service: string;
  building: string;
  priority: RequestPriority;
  sentAt: string;
  success: boolean;
  errorMessage?: string;
}