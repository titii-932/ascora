-- ============================================================
-- Ascora — PATCH v15 : Fonctionnalité Duo
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS duo_partner_id UUID
  REFERENCES profiles(id) ON DELETE SET NULL;
