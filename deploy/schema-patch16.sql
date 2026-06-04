-- ============================================================
-- Ascora — PATCH v16 : Photo de profil client (avatar)
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================================
-- ÉTAPES MANUELLES DANS LE DASHBOARD SUPABASE :
--
-- 1. Storage > New bucket
--    Nom    : avatars
--    Public : ON  (cocher "Make bucket public")
--
-- 2. Dans Storage > Policies du bucket "avatars", ajouter :
--    SELECT : TO anon   USING (true)
--    INSERT : TO anon   WITH CHECK (true)
--    UPDATE : TO anon   USING (true)
--    DELETE : TO anon   USING (true)
-- ============================================================
