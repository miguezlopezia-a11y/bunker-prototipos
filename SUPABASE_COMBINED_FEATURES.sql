-- ============================================================================
-- COMBINED SCHEMA: Exam Config Wizard + PDF Import + Precision Metrics (CER)
-- ============================================================================
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- Ejecutar TODO el script completo de una sola vez.
-- Es idempotente: puede ejecutarse varias veces sin error.
-- ============================================================================


-- ============================================================================
-- 1. EXAM CONFIGURATION WIZARD
-- ============================================================================

-- Add wizard configuration columns to rubrics table
ALTER TABLE rubrics ADD COLUMN IF NOT EXISTS wizard_config JSONB DEFAULT '{}';
ALTER TABLE rubrics ADD COLUMN IF NOT EXISTS exam_type TEXT;
ALTER TABLE rubrics ADD COLUMN IF NOT EXISTS segment TEXT;
ALTER TABLE rubrics ADD COLUMN IF NOT EXISTS department TEXT;

-- Drop old check constraints if they exist (so we can re-add if needed)
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

COMMENT ON COLUMN rubrics.wizard_config IS 'JSONB con la configuracion completa del asistente: penalty, questionCount, level, criteria, etc.';
COMMENT ON COLUMN rubrics.segment IS 'Segmento de mercado: oposiciones o academia';
COMMENT ON COLUMN rubrics.department IS 'Departamento o area de la asignatura';
COMMENT ON COLUMN rubrics.exam_type IS 'Tipo de examen: tipo_test, preguntas_cortas, redaccion, problemas, mixto';


-- ============================================================================
-- 2. PRECISION METRICS (CER) - OCR Confidence Tracking
-- ============================================================================

-- Add OCR confidence column to exam_results
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS ocr_confidence DECIMAL(5,4);
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS wizard_config JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_exam_results_ocr_confidence
  ON exam_results(ocr_confidence)
  WHERE ocr_confidence IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_exam_results_school_created
  ON exam_results(school_id, created_at DESC)
  WHERE deleted_at IS NULL;

COMMENT ON COLUMN exam_results.ocr_confidence IS 'Confianza OCR de GPT-4o Vision (0.0000 a 1.0000). Equivalente a 1 - CER (Character Error Rate).';
COMMENT ON COLUMN exam_results.wizard_config IS 'Snapshot de la configuracion del asistente usada para corregir este examen';


-- ============================================================================
-- 3. PDF MULTI-PAGE IMPORT
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: exam_documents (metadatos del PDF subido)
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

-- Tabla: exam_document_pages (paginas individuales extraidas)
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

-- Indices
CREATE INDEX IF NOT EXISTS idx_exam_documents_school ON exam_documents(school_id);
CREATE INDEX IF NOT EXISTS idx_exam_documents_teacher ON exam_documents(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exam_documents_status ON exam_documents(status);
CREATE INDEX IF NOT EXISTS idx_exam_documents_uploaded_at ON exam_documents(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_exam_document_pages_document ON exam_document_pages(document_id);
CREATE INDEX IF NOT EXISTS idx_exam_document_pages_status ON exam_document_pages(status);
CREATE INDEX IF NOT EXISTS idx_exam_document_pages_exam_result ON exam_document_pages(exam_result_id);

-- Trigger: updated_at automatico
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_exam_documents_updated_at ON exam_documents;
CREATE TRIGGER update_exam_documents_updated_at
  BEFORE UPDATE ON exam_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS habilitado
ALTER TABLE exam_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_document_pages ENABLE ROW LEVEL SECURITY;

-- Politicas RLS: aislamiento por colegio
DROP POLICY IF EXISTS "school_isolation_documents" ON exam_documents;
CREATE POLICY "school_isolation_documents" ON exam_documents
  FOR ALL
  USING (
    school_id = (SELECT school_id FROM teachers WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "school_isolation_pages" ON exam_document_pages;
CREATE POLICY "school_isolation_pages" ON exam_document_pages
  FOR ALL
  USING (
    document_id IN (
      SELECT id FROM exam_documents
      WHERE school_id = (SELECT school_id FROM teachers WHERE id = auth.uid())
    )
  );

COMMENT ON TABLE exam_documents IS 'Metadatos de los documentos PDF subidos para correccion en lote';
COMMENT ON TABLE exam_document_pages IS 'Paginas individuales extraidas de cada PDF y su estado de procesamiento';


-- ============================================================================
-- 4. STORAGE BUCKET (ejecutar en Supabase Dashboard > Storage)
-- ============================================================================
-- IMPORTANTE: Si no existe ya, crea el bucket 'exam-images' manualmente
-- desde Supabase Dashboard > Storage > New bucket
--   - Name: exam-images
--   - Public: NO (privado)
--
-- O ejecuta este SQL (puede fallar si el bucket ya existe):
DO $$ BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('exam-images', 'exam-images', false)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Bucket exam-images no creado (puede no tener permisos). Crear manualmente.';
END $$;


-- ============================================================================
-- 5. VISTA: ESTADISTICAS DE PRECISION POR COLEGIO
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
WHERE deleted_at IS NULL
  AND ocr_confidence IS NOT NULL
GROUP BY school_id, DATE_TRUNC('month', created_at);

COMMENT ON VIEW v_precision_stats IS 'Estadisticas mensuales de precision OCR por colegio (Feature CER)';


-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Verificacion (ejecuta despues para confirmar):
--
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'rubrics' AND column_name IN ('wizard_config','segment','department','exam_type');
--
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'exam_results' AND column_name IN ('ocr_confidence','wizard_config');
--
-- SELECT table_name FROM information_schema.tables
-- WHERE table_name IN ('exam_documents','exam_document_pages');
-- ============================================================================
