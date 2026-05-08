-- ============================================================================
-- CORRECTOR DE EXAMENES IA — COMPLETE BOOTSTRAP SCRIPT
-- ============================================================================
-- Ejecutar TODO de una sola vez en Supabase Dashboard > SQL Editor > New query
-- Idempotente: puede ejecutarse multiples veces sin error.
--
-- INCLUYE:
--   1. Tablas base (schools, teachers, exam_results, rubrics, audit_log, consents)
--   2. Columnas extra (audit_log.metadata, exam_results.updated_at)
--   3. Indices y RLS para tablas base
--   4. Asistente de configuracion (wizard) en rubrics
--   5. Metricas de Precision OCR (ocr_confidence) en exam_results
--   6. Importacion PDF (exam_documents, exam_document_pages)
--   7. Vista de estadisticas de precision
--   8. Storage bucket (exam-images)
--   9. Verificacion final
-- ============================================================================


-- ============================================================================
-- 1. TABLAS BASE
-- ============================================================================

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


-- ============================================================================
-- 2. COLUMNAS EXTRA (idempotente)
-- ============================================================================

-- audit_log: metadata JSONB (usado por auditLog.js)
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- exam_results: updated_at (usado por retention y por triggers)
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();


-- ============================================================================
-- 3. INDICES BASE
-- ============================================================================

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


-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE schools      ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubrics      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents     ENABLE ROW LEVEL SECURITY;

-- schools
DROP POLICY IF EXISTS "schools_admin_all" ON schools;
CREATE POLICY "schools_admin_all" ON schools FOR ALL USING (
  EXISTS (SELECT 1 FROM teachers t WHERE t.id = auth.uid() AND t.school_id = schools.id AND t.role IN ('school_admin','super_admin'))
);
DROP POLICY IF EXISTS "schools_teacher_read" ON schools;
CREATE POLICY "schools_teacher_read" ON schools FOR SELECT USING (
  EXISTS (SELECT 1 FROM teachers t WHERE t.id = auth.uid() AND t.school_id = schools.id)
);

-- teachers
DROP POLICY IF EXISTS "teachers_select" ON teachers;
CREATE POLICY "teachers_select" ON teachers FOR SELECT USING (
  auth.uid() = id
  OR EXISTS (SELECT 1 FROM teachers t2 WHERE t2.id = auth.uid() AND t2.school_id = teachers.school_id AND t2.role IN ('school_admin','super_admin'))
);
DROP POLICY IF EXISTS "teachers_insert_own" ON teachers;
CREATE POLICY "teachers_insert_own" ON teachers FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "teachers_update_own" ON teachers;
CREATE POLICY "teachers_update_own" ON teachers FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- exam_results
DROP POLICY IF EXISTS "exam_results_teacher_all" ON exam_results;
CREATE POLICY "exam_results_teacher_all" ON exam_results FOR ALL USING (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "exam_results_school_admin_read" ON exam_results;
CREATE POLICY "exam_results_school_admin_read" ON exam_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM teachers t WHERE t.id = auth.uid() AND t.school_id = exam_results.school_id AND t.role IN ('school_admin','super_admin'))
);

-- rubrics
DROP POLICY IF EXISTS "rubrics_teacher_all" ON rubrics;
CREATE POLICY "rubrics_teacher_all" ON rubrics FOR ALL USING (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "rubrics_school_read" ON rubrics;
CREATE POLICY "rubrics_school_read" ON rubrics FOR SELECT USING (
  EXISTS (SELECT 1 FROM teachers t WHERE t.id = auth.uid() AND t.school_id = rubrics.school_id)
);

-- audit_log
DROP POLICY IF EXISTS "audit_log_insert_only" ON audit_log;
CREATE POLICY "audit_log_insert_only" ON audit_log FOR INSERT WITH CHECK (true);

-- consents
DROP POLICY IF EXISTS "consents_own_all" ON consents;
CREATE POLICY "consents_own_all" ON consents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ============================================================================
-- 5. EXAM CONFIGURATION WIZARD (Feature #1)
-- ============================================================================

ALTER TABLE rubrics ADD COLUMN IF NOT EXISTS wizard_config JSONB DEFAULT '{}';
ALTER TABLE rubrics ADD COLUMN IF NOT EXISTS exam_type TEXT;
ALTER TABLE rubrics ADD COLUMN IF NOT EXISTS segment TEXT;
ALTER TABLE rubrics ADD COLUMN IF NOT EXISTS department TEXT;

DO $$ BEGIN
  ALTER TABLE rubrics DROP CONSTRAINT IF EXISTS rubrics_exam_type_check;
  ALTER TABLE rubrics DROP CONSTRAINT IF EXISTS rubrics_segment_check;
  ALTER TABLE rubrics DROP CONSTRAINT IF EXISTS rubrics_department_check;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE rubrics ADD CONSTRAINT rubrics_exam_type_check
  CHECK (exam_type IS NULL OR exam_type IN ('tipo_test','preguntas_cortas','redaccion','problemas','mixto'));

ALTER TABLE rubrics ADD CONSTRAINT rubrics_segment_check
  CHECK (segment IS NULL OR segment IN ('oposiciones','academia'));

ALTER TABLE rubrics ADD CONSTRAINT rubrics_department_check
  CHECK (department IS NULL OR department IN ('sanidad','educacion','administracion','seguridad','otros','ingles','matematicas','ciencias','historia','general'));

CREATE INDEX IF NOT EXISTS idx_rubrics_segment ON rubrics(segment);
CREATE INDEX IF NOT EXISTS idx_rubrics_department ON rubrics(department);
CREATE INDEX IF NOT EXISTS idx_rubrics_exam_type ON rubrics(exam_type);


-- ============================================================================
-- 6. PRECISION METRICS (CER) - Feature #3
-- ============================================================================

ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS ocr_confidence DECIMAL(5,4);
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS wizard_config JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_exam_results_ocr_confidence
  ON exam_results(ocr_confidence) WHERE ocr_confidence IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_exam_results_school_created
  ON exam_results(school_id, created_at DESC) WHERE deleted_at IS NULL;


-- ============================================================================
-- 7. PDF MULTI-PAGE IMPORT (Feature #2)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS exam_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  original_filename TEXT NOT NULL,
  total_pages INT NOT NULL CHECK (total_pages > 0),
  pages_per_exam INT DEFAULT 1 CHECK (pages_per_exam > 0),
  wizard_config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'imported' CHECK (status IN ('imported','processing','complete','error')),
  error_message TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_document_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES exam_documents(id) ON DELETE CASCADE NOT NULL,
  page_number INT NOT NULL CHECK (page_number > 0),
  image_url TEXT,
  storage_path TEXT,
  exam_result_id UUID REFERENCES exam_results(id) ON DELETE SET NULL,
  ocr_confidence DECIMAL(5,4),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','complete','error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  UNIQUE(document_id, page_number)
);

CREATE INDEX IF NOT EXISTS idx_exam_documents_school     ON exam_documents(school_id);
CREATE INDEX IF NOT EXISTS idx_exam_documents_teacher    ON exam_documents(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exam_documents_status     ON exam_documents(status);
CREATE INDEX IF NOT EXISTS idx_exam_documents_uploaded   ON exam_documents(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_doc_pages_document        ON exam_document_pages(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_pages_status          ON exam_document_pages(status);
CREATE INDEX IF NOT EXISTS idx_doc_pages_exam_result     ON exam_document_pages(exam_result_id);

-- Trigger: updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_exam_documents_updated_at ON exam_documents;
CREATE TRIGGER update_exam_documents_updated_at
  BEFORE UPDATE ON exam_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE exam_documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_document_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school_isolation_documents" ON exam_documents;
CREATE POLICY "school_isolation_documents" ON exam_documents FOR ALL USING (
  school_id = (SELECT school_id FROM teachers WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "school_isolation_pages" ON exam_document_pages;
CREATE POLICY "school_isolation_pages" ON exam_document_pages FOR ALL USING (
  document_id IN (SELECT id FROM exam_documents WHERE school_id = (SELECT school_id FROM teachers WHERE id = auth.uid()))
);


-- ============================================================================
-- 8. VISTA: Estadisticas de Precision por Colegio
-- ============================================================================

CREATE OR REPLACE VIEW v_precision_stats AS
SELECT
  school_id,
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS total_exams,
  ROUND(AVG(ocr_confidence)::numeric, 4) AS avg_confidence,
  ROUND(MIN(ocr_confidence)::numeric, 4) AS min_confidence,
  ROUND(MAX(ocr_confidence)::numeric, 4) AS max_confidence,
  COUNT(*) FILTER (WHERE ocr_confidence >= 0.99) AS exams_above_99,
  COUNT(*) FILTER (WHERE ocr_confidence < 0.90) AS exams_below_90
FROM exam_results
WHERE deleted_at IS NULL AND ocr_confidence IS NOT NULL
GROUP BY school_id, DATE_TRUNC('month', created_at);


-- ============================================================================
-- 9. STORAGE BUCKET (puede fallar si no hay permisos; crear manual si falla)
-- ============================================================================

DO $$ BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('exam-images', 'exam-images', false)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Bucket exam-images no creado (revisa permisos o crea desde Dashboard > Storage)';
END $$;


-- ============================================================================
-- 10. VERIFICACION FINAL
-- ============================================================================

SELECT 'base tables' AS section, table_name AS item FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('schools','teachers','exam_results','rubrics','audit_log','consents')
UNION ALL
SELECT 'rubrics columns' AS section, column_name AS item FROM information_schema.columns
WHERE table_name = 'rubrics' AND column_name IN ('wizard_config','segment','department','exam_type')
UNION ALL
SELECT 'exam_results columns' AS section, column_name AS item FROM information_schema.columns
WHERE table_name = 'exam_results' AND column_name IN ('ocr_confidence','wizard_config','updated_at')
UNION ALL
SELECT 'audit_log columns' AS section, column_name AS item FROM information_schema.columns
WHERE table_name = 'audit_log' AND column_name = 'metadata'
UNION ALL
SELECT 'pdf tables' AS section, table_name AS item FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('exam_documents','exam_document_pages')
UNION ALL
SELECT 'view' AS section, table_name AS item FROM information_schema.views
WHERE table_schema = 'public' AND table_name = 'v_precision_stats'
ORDER BY section, item;

-- ============================================================================
-- FIN DEL SCRIPT
-- Esperado en la verificacion final: 16 filas
--   6  base tables (schools, teachers, exam_results, rubrics, audit_log, consents)
--   4  rubrics columns (wizard_config, segment, department, exam_type)
--   3  exam_results columns (ocr_confidence, wizard_config, updated_at)
--   1  audit_log columns (metadata)
--   2  pdf tables (exam_documents, exam_document_pages)
--   1  view (v_precision_stats) -- 17 filas TOTAL si todo OK
-- ============================================================================
