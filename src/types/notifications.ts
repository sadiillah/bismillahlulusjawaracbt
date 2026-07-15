// Notification System Types

// Core Notification Types
export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  channel: NotificationChannel;
  priority: NotificationPriority;
  
  // Content
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  metadata: Record<string, unknown>;
  
  // Status
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  error_message?: string;
  
  // Scheduling
  scheduled_for?: string;
  expires_at?: string;
  
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  // Exam Related
  | 'exam_scheduled'
  | 'exam_reminder'
  | 'exam_started'
  | 'exam_completed'
  | 'exam_graded'
  | 'exam_results_available'
  | 'exam_deadline_approaching'
  | 'exam_cancelled'
  | 'exam_rescheduled'
  
  // Assignment Related
  | 'assignment_created'
  | 'assignment_submitted'
  | 'assignment_graded'
  | 'assignment_deadline_reminder'
  
  // Class Related
  | 'class_announcement'
  | 'class_schedule_change'
  | 'student_enrolled'
  | 'student_unenrolled'
  
  // System Related
  | 'account_created'
  | 'password_changed'
  | 'login_alert'
  | 'security_alert'
  | 'system_maintenance'
  | 'feature_update'
  
  // Social/Communication
  | 'message_received'
  | 'mention_received'
  | 'comment_added'
  | 'discussion_reply';

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push' | 'webhook';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// Notification Templates
export interface NotificationTemplate {
  id: number;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  
  // Template Content
  subject_template: string;
  body_template: string;
  html_template?: string;
  
  // Variables
  supported_variables: string[];
  sample_data: Record<string, unknown>;
  
  // Settings
  is_active: boolean;
  default_priority: NotificationPriority;
  can_be_disabled_by_user: boolean;
  
  // Usage
  usage_count: number;
  last_used: string;
  
  created_by: number;
  created_at: string;
  updated_at: string;
}

// Notification Preferences
export interface NotificationPreferences {
  user_id: number;
  
  // Channel Preferences
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  
  // Type Preferences
  preferences: Array<{
    notification_type: NotificationType;
    channels: NotificationChannel[];
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly' | 'disabled';
  }>;
  
  // Quiet Hours
  quiet_hours_enabled: boolean;
  quiet_start_time?: string;
  quiet_end_time?: string;
  quiet_timezone?: string;
  
  // Digest Settings
  daily_digest_enabled: boolean;
  weekly_digest_enabled: boolean;
  digest_delivery_time: string;
  
  updated_at: string;
}

// Bulk Notifications
export interface BulkNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  
  // Recipients
  recipient_type: 'all_users' | 'role_based' | 'class_based' | 'custom_list';
  roles?: string[];
  class_ids?: number[];
  user_ids?: number[];
  
  // Delivery Options
  channels: NotificationChannel[];
  schedule_for?: string;
  expires_at?: string;
  
  // Content Customization
  personalize_content: boolean;
  template_variables?: Record<string, unknown>;
}

export interface BulkNotificationJob {
  id: number;
  request: BulkNotificationRequest;
  
  // Progress Tracking
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  total_recipients: number;
  processed_count: number;
  success_count: number;
  failure_count: number;
  
  // Results
  failed_recipients: Array<{
    user_id: number;
    email?: string;
    error: string;
  }>;
  
  started_at?: string;
  completed_at?: string;
  estimated_completion?: string;
  created_by: number;
}

// Real-time Notifications
export interface RealTimeNotification {
  id: string;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  ttl: number; // Time to live in seconds
}

export interface WebSocketConnection {
  user_id: number;
  connection_id: string;
  socket_id: string;
  connected_at: string;
  last_ping: string;
  user_agent: string;
  ip_address: string;
  is_active: boolean;
}

// Push Notifications
export interface PushSubscription {
  id: number;
  user_id: number;
  endpoint: string;
  public_key: string;
  auth_key: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  is_active: boolean;
  subscribed_at: string;
  last_used: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: Record<string, unknown>;
}

// Email Notifications
export interface EmailNotification {
  id: number;
  notification_id: number;
  recipient_email: string;
  sender_email: string;
  
  // Email Content
  subject: string;
  html_body: string;
  text_body: string;
  attachments?: Array<{
    filename: string;
    content_type: string;
    content: string; // base64 encoded
  }>;
  
  // Delivery Status
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'bounced' | 'failed';
  provider_message_id?: string;
  bounce_reason?: string;
  
  // Tracking
  opened: boolean;
  clicked: boolean;
  unsubscribed: boolean;
  open_count: number;
  click_count: number;
  
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  first_clicked_at?: string;
}

// SMS Notifications
export interface SMSNotification {
  id: number;
  notification_id: number;
  recipient_phone: string;
  
  // SMS Content
  message: string;
  character_count: number;
  sms_parts: number;
  
  // Delivery Status
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'failed';
  provider_message_id?: string;
  error_message?: string;
  
  // Cost Tracking
  cost_cents: number;
  provider: string;
  
  sent_at?: string;
  delivered_at?: string;
}

// Notification Analytics
export interface NotificationAnalytics {
  period: {
    start_date: string;
    end_date: string;
  };
  
  // Overall Statistics
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  
  // Channel Performance
  channel_performance: Array<{
    channel: NotificationChannel;
    sent: number;
    delivered: number;
    delivery_rate: number;
    open_rate?: number;
    click_rate?: number;
  }>;
  
  // Type Performance
  type_performance: Array<{
    type: NotificationType;
    sent: number;
    engagement_rate: number;
    conversion_rate: number;
  }>;
  
  // User Engagement
  user_engagement: {
    active_subscribers: number;
    opt_out_rate: number;
    bounce_rate: number;
    complaint_rate: number;
  };
  
  // Trends
  daily_trends: Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }>;
}

// Notification Automation
export interface NotificationRule {
  id: number;
  name: string;
  description: string;
  
  // Trigger Conditions
  trigger_event: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: unknown;
  }>;
  
  // Action
  notification_template_id: number;
  recipient_rules: {
    type: 'event_user' | 'role_based' | 'custom';
    roles?: string[];
    user_ids?: number[];
  };
  
  // Settings
  is_active: boolean;
  max_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  cooldown_minutes?: number;
  
  // Usage Statistics
  trigger_count: number;
  last_triggered: string;
  success_rate: number;
  
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationQueue {
  id: number;
  priority: number;
  notification_data: Notification;
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  processing_started_at?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  error_log?: string[];
  created_at: string;
}