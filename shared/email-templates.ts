export const EMAIL_TEMPLATES = [
  'email_verification',
  'password_reset',
  'deletion_notice',
  'withdrawal_confirmation',
  'contact_ack',
  'order_received',
  'order_confirmation',
  'payment_confirmed',
  'payment_failed',
  'order_processing',
  'shipment_sent',
  'partial_shipment',
  'order_delivered',
  'order_cancelled',
  'return_requested',
  'return_received',
  'refund_processed',
  'business_quote_received',
  'business_quote_ready',
] as const

export type EmailTemplateId = (typeof EMAIL_TEMPLATES)[number]
