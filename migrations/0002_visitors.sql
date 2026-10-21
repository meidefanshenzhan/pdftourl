ALTER TABLE documents ADD COLUMN owner_id TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS documents_owner ON documents(owner_id,created_at);
CREATE TABLE IF NOT EXISTS upload_windows (id TEXT PRIMARY KEY, window_start INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0);
