-- ============================================================================
-- PDF MULTI-PAGE IMPORT - Schema for Document Management
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: exam_documents
-- Stores uploaded PDF documents with metadata
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

-- Table: exam_document_pages
-- Stores individual pages extracted from PDFs
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exam_documents_school ON exam_documents(school_id);
CREATE INDEX IF NOT EXISTS idx_exam_documents_teacher ON exam_documents(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exam_documents_status ON exam_documents(status);
CREATE INDEX IF NOT EXISTS idx_exam_documents_uploaded_at ON exam_documents(uploaded_at);

CREATE INDEX IF NOT EXISTS idx_exam_document_pages_document ON exam_document_pages(document_id);
CREATE INDEX IF NOT EXISTS idx_exam_document_pages_status ON exam_document_pages(status);
CREATE INDEX IF NOT EXISTS idx_exam_document_pages_exam_result ON exam_document_pages(exam_result_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exam_documents_updated_at
  BEFORE UPDATE ON exam_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE exam_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_document_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: School Isolation
-- Teachers can only access documents from their school
CREATE POLICY "school_isolation_documents" ON exam_documents
  FOR ALL
  USING (
    school_id = (SELECT school_id FROM teachers WHERE id = auth.uid())
  );

CREATE POLICY "school_isolation_pages" ON exam_document_pages
  FOR ALL
  USING (
    document_id IN (
      SELECT id FROM exam_documents 
      WHERE school_id = (SELECT school_id FROM teachers WHERE id = auth.uid())
    )
  );

-- Comments for documentation
COMMENT ON TABLE exam_documents IS 'Stores metadata for uploaded PDF exam documents';
COMMENT ON TABLE exam_document_pages IS 'Stores individual pages extracted from PDF documents with their processing status';
COMMENT ON COLUMN exam_documents.wizard_config IS 'JSONB storing wizard configuration used for this batch of exams';
COMMENT ON COLUMN exam_documents.pages_per_exam IS 'How many pages constitute one complete exam (default: 1)';
COMMENT ON COLUMN exam_document_pages.ocr_confidence IS 'OCR confidence score from GPT-4o Vision (0.0 to 1.0)';

-- ============================================================================
-- SUPABASE STORAGE BUCKET SETUP
-- ============================================================================
-- Note: Run these commands in Supabase Dashboard > Storage

-- 1. Create storage bucket for exam images
-- INSERT INTO storage.buckets (id, name, public) VALUES ('exam-images', 'exam-images', false);

-- 2. Create storage policy for authenticated uploads
-- CREATE POLICY "Teachers can upload exam images" ON storage.objects FOR INSERT 
--   WITH CHECK (bucket_id = 'exam-images' AND auth.role() = 'authenticated');

-- 3. Create storage policy for authenticated reads
-- CREATE POLICY "Teachers can read exam images" ON storage.objects FOR SELECT 
--   USING (bucket_id = 'exam-images' AND auth.role() = 'authenticated');

-- ============================================================================
-- Query Examples for Testing
-- ============================================================================

-- View all documents for a school
-- SELECT * FROM exam_documents WHERE school_id = 'xxx' ORDER BY uploaded_at DESC;

-- View pages for a document
-- SELECT * FROM exam_document_pages WHERE document_id = 'xxx' ORDER BY page_number;

-- Get processing status summary
-- SELECT 
--   status,
--   COUNT(*) as count,
--   AVG(total_pages) as avg_pages
-- FROM exam_documents
-- GROUP BY status;

-- Get average OCR confidence by document
-- SELECT 
--   d.original_filename,
--   AVG(p.ocr_confidence) as avg_confidence,
--   COUNT(p.id) as total_pages
-- FROM exam_documents d
-- JOIN exam_document_pages p ON p.document_id = d.id
-- WHERE p.ocr_confidence IS NOT NULL
-- GROUP BY d.id, d.original_filename
-- ORDER BY avg_confidence DESC;
