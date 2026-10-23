-- Messages sent through the contact form. The IP is kept for spam control and
-- future reference, as the form's notice tells the sender.
CREATE TABLE IF NOT EXISTS messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT NOT NULL,            -- ISO 8601, UTC
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  message     TEXT NOT NULL,
  ip          TEXT NOT NULL,
  country     TEXT,
  user_agent  TEXT,
  delivered   INTEGER NOT NULL DEFAULT 0, -- 1 once the email to the owner went out
  error       TEXT                        -- why delivery failed, if it did
);

CREATE INDEX IF NOT EXISTS idx_messages_ip_time ON messages (ip, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_time ON messages (created_at);
