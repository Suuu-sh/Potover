CREATE TABLE IF NOT EXISTS sources (slug TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL, language TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS articles (slug TEXT PRIMARY KEY, source_slug TEXT NOT NULL, source TEXT NOT NULL, title TEXT NOT NULL, original_url TEXT NOT NULL UNIQUE, author TEXT, published_at TEXT, summary TEXT NOT NULL, language TEXT NOT NULL, image_url TEXT, content_type TEXT NOT NULL, difficulty TEXT NOT NULL, tags_json TEXT NOT NULL, category TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_source_slug ON articles(source_slug);
