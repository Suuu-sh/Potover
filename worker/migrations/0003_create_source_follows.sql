CREATE TABLE IF NOT EXISTS source_follows (
  user_id TEXT NOT NULL,
  source_slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, source_slug),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_source_follows_user_id ON source_follows(user_id);
