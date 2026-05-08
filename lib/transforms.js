// Transform Supabase row to frontend camelCase format
export function transformResult(row) {
  const fb = row.feedback || {}
  return {
    id:             row.id,
    studentName:    row.student_name  || '',
    studentGroup:   row.student_group || '',
    subject:        row.subject       || '',
    gradeLevel:     row.level         || '',
    grade:          parseFloat(row.grade)     || 0,
    maxGrade:       parseFloat(row.max_grade) || 10,
    gradeLabel:     fb.gradeLabel  || '',
    questions:      fb.questions   || [],
    timeTaken:      fb.timeTaken   || 0,
    totalQuestions: fb.totalQuestions ?? (fb.questions || []).length,
    createdAt:      row.created_at,
    processedAnonymous: row.processed_anonymous || false,
    ocrConfidence:  row.ocr_confidence !== null && row.ocr_confidence !== undefined
                      ? parseFloat(row.ocr_confidence)
                      : null,
    wizardConfig:   row.wizard_config || {},
  }
}
