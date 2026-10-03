-- Legacy last_activity_at may be a copy of created_at, not observed activity.
-- Keep it for compatibility, but do not use it for automatic account deletion.
ALTER TABLE users ADD COLUMN last_activity_verified INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_verified_activity
  ON users(last_activity_verified, last_activity_at);
