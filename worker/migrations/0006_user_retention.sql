ALTER TABLE users ADD COLUMN last_activity_at TEXT;

UPDATE users
SET last_activity_at = created_at
WHERE last_activity_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_last_activity_at
  ON users(last_activity_at);
