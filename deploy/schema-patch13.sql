-- ============================================================
-- Ascora — PATCH v13 : Bibliothèque d'exercices
-- ============================================================

-- Bibliothèque globale Ascora (gérée par l'admin)
CREATE TABLE IF NOT EXISTS global_exercises (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  muscles     TEXT DEFAULT '',
  video_url   TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE global_exercises ENABLE ROW LEVEL SECURITY;

-- Lecture publique (coaches et clients)
CREATE POLICY "public_read_global_exercises"
  ON global_exercises FOR SELECT USING (true);

-- L'admin (page admin.html avec clé anon) peut gérer la bibliothèque
CREATE POLICY "anon_manage_global_exercises"
  ON global_exercises FOR ALL TO anon USING (true) WITH CHECK (true);

-- Bibliothèque personnelle de chaque coach
CREATE TABLE IF NOT EXISTS coach_exercises (
  id                 UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id           UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name               TEXT NOT NULL,
  notes              TEXT DEFAULT '',
  muscles            TEXT DEFAULT '',
  badge_color        TEXT DEFAULT '#10b981',
  video_url          TEXT DEFAULT '',
  global_exercise_id UUID REFERENCES global_exercises(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coach_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_manages_own_exercises"
  ON coach_exercises FOR ALL USING (coach_id = auth.uid());

-- ============================================================
-- NOTES MANUELLES (Supabase Dashboard) :
-- Storage > New bucket > Nom : "exercise-videos" > Public : ON
-- Puis dans Policies du bucket, ajouter :
--   SELECT : TO anon USING (true)
--   INSERT : TO anon WITH CHECK (true)
--   UPDATE : TO anon USING (true)
--   DELETE : TO anon USING (true)
-- ============================================================
