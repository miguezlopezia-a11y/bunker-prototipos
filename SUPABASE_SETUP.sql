-- ============================================================
-- CORRECTOR DE EXAMENES IA — Supabase Setup SQL
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- Ejecutar TODO el script de una sola vez
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. TABLAS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS schools (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT         NOT NULL,
  cif_nif     TEXT,
  address     TEXT,
  logo_url    TEXT,
  dpo_email   TEXT,
  created_at  TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teachers (
  id          UUID  REFERENCES auth.users PRIMARY KEY,
  school_id   UUID  REFERENCES schools(id),
  name        TEXT  NOT NULL,
  email       TEXT  NOT NULL,
  role        TEXT  CHECK (role IN ('teacher','school_admin','super_admin')) DEFAULT 'teacher',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exam_results (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id           UUID         REFERENCES teachers(id),
  school_id            UUID         REFERENCES schools(id),
  student_name         TEXT,
  student_group        TEXT,
  subject              TEXT         NOT NULL,
  level                TEXT         NOT NULL,
  grade                NUMERIC(4,2),
  max_grade            NUMERIC(4,2) DEFAULT 10,
  feedback             JSONB,
  rubric_used          TEXT,
  processed_anonymous  BOOLEAN      DEFAULT false,
  deleted_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rubrics (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id  UUID         REFERENCES teachers(id),
  school_id   UUID         REFERENCES schools(id),
  name        TEXT         NOT NULL,
  subject     TEXT,
  level       TEXT,
  content     TEXT         NOT NULL,
  created_at  TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id                  UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID,
  school_id           UUID,
  action              TEXT         NOT NULL,
  affected_table      TEXT,
  affected_record_id  UUID,
  ip_address          TEXT,
  created_at          TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consents (
  id            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID         REFERENCES auth.users,
  consent_type  TEXT         NOT NULL,
  given_at      TIMESTAMPTZ  DEFAULT now(),
  ip_address    TEXT
);


-- ────────────────────────────────────────────────────────────
-- 2. INDICES DE RENDIMIENTO
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_exam_results_teacher_id    ON exam_results(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_school_id     ON exam_results(school_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_subject       ON exam_results(subject);
CREATE INDEX IF NOT EXISTS idx_exam_results_created_at    ON exam_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_results_not_deleted   ON exam_results(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exam_results_student_name  ON exam_results(student_name);

CREATE INDEX IF NOT EXISTS idx_rubrics_teacher_id         ON rubrics(teacher_id);
CREATE INDEX IF NOT EXISTS idx_rubrics_school_id          ON rubrics(school_id);
CREATE INDEX IF NOT EXISTS idx_rubrics_subject            ON rubrics(subject);

CREATE INDEX IF NOT EXISTS idx_teachers_school_id         ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_email             ON teachers(email);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id          ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_school_id        ON audit_log(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at       ON audit_log(created_at DESC);


-- ────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY — Habilitar en todas las tablas
-- ────────────────────────────────────────────────────────────

ALTER TABLE schools      ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubrics      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents     ENABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────────────────────
-- 4. POLITICAS RLS
-- ────────────────────────────────────────────────────────────

-- ── schools ──────────────────────────────────────────────────
-- school_admin puede gestionar su propio centro
CREATE POLICY "schools_admin_all" ON schools
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = auth.uid()
        AND t.school_id = schools.id
        AND t.role IN ('school_admin', 'super_admin')
    )
  );

-- profesores pueden leer su centro
CREATE POLICY "schools_teacher_read" ON schools
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = auth.uid()
        AND t.school_id = schools.id
    )
  );


-- ── teachers ─────────────────────────────────────────────────
-- cada profesor lee/edita su propio registro;
-- school_admin lee a todos los del centro
CREATE POLICY "teachers_select" ON teachers
  FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM teachers t2
      WHERE t2.id = auth.uid()
        AND t2.school_id = teachers.school_id
        AND t2.role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "teachers_insert_own" ON teachers
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "teachers_update_own" ON teachers
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ── exam_results ─────────────────────────────────────────────
-- profesores: CRUD solo en sus propios examenes
CREATE POLICY "exam_results_teacher_all" ON exam_results
  FOR ALL
  USING (auth.uid() = teacher_id);

-- school_admin: lectura de todos los del centro (solo lectura)
CREATE POLICY "exam_results_school_admin_read" ON exam_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = auth.uid()
        AND t.school_id = exam_results.school_id
        AND t.role IN ('school_admin', 'super_admin')
    )
  );


-- ── rubrics ──────────────────────────────────────────────────
-- profesores: CRUD en sus propias rubricas
CREATE POLICY "rubrics_teacher_all" ON rubrics
  FOR ALL
  USING (auth.uid() = teacher_id);

-- profesores pueden leer rubricas del mismo centro (compartidas)
CREATE POLICY "rubrics_school_read" ON rubrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = auth.uid()
        AND t.school_id = rubrics.school_id
    )
  );


-- ── audit_log ────────────────────────────────────────────────
-- solo INSERT permitido; nadie puede leer/borrar via cliente
CREATE POLICY "audit_log_insert_only" ON audit_log
  FOR INSERT
  WITH CHECK (true);
-- NOTA: Sin politica SELECT/DELETE = bloqueado para todos via anon/user key
--       Solo el service_role key (backend) puede leer el audit_log


-- ── consents ─────────────────────────────────────────────────
-- usuarios gestionan solo su propio consentimiento
CREATE POLICY "consents_own_all" ON consents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- NOTAS IMPORTANTES
-- ============================================================
--
-- 1. El backend usa SUPABASE_SERVICE_ROLE_KEY que bypasea RLS.
--    Las politicas RLS aplican al anon key y a usuarios autenticados.
--
-- 2. exam_results.teacher_id y school_id pueden ser NULL mientras
--    no se implemente autenticacion (fase actual).
--
-- 3. Para insertar exam_results sin autenticacion, el backend
--    usa service_role y omite teacher_id/school_id.
--
-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
