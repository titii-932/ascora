-- ============================================================
-- Ascora — PATCH v14 : Statut client
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS client_status TEXT
  DEFAULT 'en_cours'
  CHECK (client_status IN ('en_cours', 'actif', 'termine'));
