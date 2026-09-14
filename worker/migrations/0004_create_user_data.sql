CREATE TABLE IF NOT EXISTS bookmarks (
  user_id TEXT NOT NULL,
  article_slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, article_slug),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);

CREATE TABLE IF NOT EXISTS learning_history (
  user_id TEXT NOT NULL,
  article_slug TEXT NOT NULL,
  opened_date TEXT NOT NULL,
  opened_at TEXT NOT NULL,
  PRIMARY KEY (user_id, article_slug, opened_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_learning_history_user_opened_at
  ON learning_history(user_id, opened_at DESC);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  language TEXT NOT NULL DEFAULT 'Japanese',
  theme TEXT NOT NULL DEFAULT 'light',
  docs_query TEXT NOT NULL DEFAULT '',
  docs_filters_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
