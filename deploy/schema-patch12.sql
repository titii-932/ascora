-- ============================================================
-- Ascora — PATCH v12 : Première connexion coach
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT false;

-- ============================================================
