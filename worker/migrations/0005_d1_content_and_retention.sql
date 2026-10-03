ALTER TABLE articles ADD COLUMN headings_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE articles ADD COLUMN duration_seconds INTEGER;
ALTER TABLE articles ADD COLUMN source_modified_at TEXT;

CREATE TABLE IF NOT EXISTS app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_rate_limits (
  action TEXT NOT NULL,
  client_key TEXT NOT NULL,
  window_started_at INTEGER NOT NULL,
  attempt_count INTEGER NOT NULL,
  PRIMARY KEY (action, client_key)
);
