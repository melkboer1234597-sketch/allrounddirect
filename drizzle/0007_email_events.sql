ALTER TABLE email_logs ADD COLUMN event_key TEXT;
CREATE INDEX IF NOT EXISTS email_logs_event_key_idx ON email_logs (event_key);

CREATE TABLE IF NOT EXISTS email_events (
  id TEXT PRIMARY KEY NOT NULL,
  event_key TEXT NOT NULL,
  template TEXT NOT NULL,
  order_id TEXT,
  recipient TEXT NOT NULL,
  status TEXT NOT NULL,
  provider_message_id TEXT,
  error_code TEXT,
  created_at INTEGER NOT NULL,
  sent_at INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS email_events_event_key_uidx ON email_events (event_key);
CREATE INDEX IF NOT EXISTS email_events_order_idx ON email_events (order_id);
CREATE INDEX IF NOT EXISTS email_events_created_idx ON email_events (created_at);
