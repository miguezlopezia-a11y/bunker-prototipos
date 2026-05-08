-- ============================================================================
-- EXAM CONFIGURATION WIZARD - Schema Updates
-- ============================================================================

-- Add wizard configuration columns to rubrics table
ALTER TABLE rubrics ADD COLUMN IF NOT EXISTS wizard_config JSONB DEFAULT '{}';
ALTER TABLE rubrics ADD COLUMN IF NOT EXISTS exam_type TEXT CHECK (exam_type IN ('tipo_test','preguntas_cortas','redaccion','problemas','mixto'));
ALTER TABLE rubrics ADD COLUMN IF NOT EXISTS segment TEXT CHECK (segment IN ('oposiciones','academia'));
ALTER TABLE rubrics ADD COLUMN IF NOT EXISTS department TEXT CHECK (department IN ('sanidad','educacion','administracion','seguridad','ingles','matematicas','ciencias','historia','general'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_rubrics_segment ON rubrics(segment);
CREATE INDEX IF NOT EXISTS idx_rubrics_department ON rubrics(department);
CREATE INDEX IF NOT EXISTS idx_rubrics_exam_type ON rubrics(exam_type);

-- Comment for documentation
COMMENT ON COLUMN rubrics.wizard_config IS 'JSONB storing complete wizard configuration: { penalty, questionCount, level, criteria, etc. }';
COMMENT ON COLUMN rubrics.segment IS 'Market segment: oposiciones or academia';
COMMENT ON COLUMN rubrics.department IS 'Department/subject area for categorization';
COMMENT ON COLUMN rubrics.exam_type IS 'Type of exam: tipo_test, preguntas_cortas, redaccion, problemas, mixto';
