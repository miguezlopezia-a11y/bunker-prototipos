CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS monthly_consumption (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  period_year INT NOT NULL,
  period_month INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  pages_processed INT DEFAULT 0,
  quota_limit INT NOT NULL,
  plan_tier TEXT DEFAULT 'basico' CHECK (plan_tier IN ('basico','profesional','institucional')),
  alert_80_sent BOOLEAN DEFAULT FALSE,
  alert_95_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, period_year, period_month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_consumption_school ON monthly_consumption(school_id);
CREATE INDEX IF NOT EXISTS idx_monthly_consumption_period ON monthly_consumption(period_year, period_month);

ALTER TABLE monthly_consumption ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school_isolation_consumption" ON monthly_consumption;
CREATE POLICY "school_isolation_consumption" ON monthly_consumption FOR ALL USING (
  school_id = (SELECT school_id FROM teachers WHERE id = auth.uid())
);

CREATE TABLE IF NOT EXISTS text_corrections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_result_id UUID REFERENCES exam_results(id) ON DELETE CASCADE,
  question_index INT NOT NULL,
  original_text TEXT NOT NULL,
  corrected_text TEXT,
  correction_type TEXT CHECK (correction_type IN (
    'ERROR_REPAIR',
    'EDITORIAL_NORMALIZATION',
    'FORMATTING_STANDARDIZATION',
    'AMBIGUITY_RESOLUTION'
  )),
  correction_source TEXT CHECK (correction_source IN (
    'AI_MODEL',
    'HUMAN_TEACHER',
    'RULE_AUTOMATIC'
  )),
  confidence_score DECIMAL(4,3),
  notes TEXT,
  corrected_by UUID REFERENCES teachers(id),
  corrected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_text_corrections_exam ON text_corrections(exam_result_id);
CREATE INDEX IF NOT EXISTS idx_text_corrections_source ON text_corrections(correction_source);
CREATE INDEX IF NOT EXISTS idx_text_corrections_corrected_at ON text_corrections(corrected_at DESC);

ALTER TABLE text_corrections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school_isolation_corrections" ON text_corrections;
CREATE POLICY "school_isolation_corrections" ON text_corrections FOR ALL USING (
  exam_result_id IN (
    SELECT id FROM exam_results
    WHERE school_id = (SELECT school_id FROM teachers WHERE id = auth.uid())
  )
);

DROP TRIGGER IF EXISTS update_monthly_consumption_updated_at ON monthly_consumption;
CREATE TRIGGER update_monthly_consumption_updated_at
  BEFORE UPDATE ON monthly_consumption
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'consumption table' AS section, table_name AS item FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'monthly_consumption'
UNION ALL
SELECT 'corrections table' AS section, table_name AS item FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'text_corrections'
ORDER BY section;
