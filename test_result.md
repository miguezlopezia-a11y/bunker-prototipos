#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Mobile-first PWA for AI-powered exam grading with two screens: Screen 1 (Scan & Submit) and Screen 2 (Results). Spanish UI, Next.js 14, Tailwind CSS."

backend:
  - task: "POST /api/grade - AI exam grading with vision"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented AI grading endpoint using GPT-4o via emergent proxy at https://integrations.emergentagent.com/llm/chat/completions. Accepts imageBase64, mimeType, subject, gradeLevel, rubric. Returns grade, maxGrade, questions breakdown, timeTaken."
      - working: true
        agent: "testing"
        comment: "✅ TESTED & WORKING. Fixed .env file formatting issue (missing newline between CORS_ORIGINS and EMERGENT_LLM_KEY). Endpoint now successfully calls GPT-4o with vision, processes exam images, and returns structured grading results with grade (0-10), questions array with feedback, and timing. Tested with realistic exam image containing math questions. Response time: ~2.8s. AI correctly grades answers and provides Spanish feedback."

  - task: "POST /api/save-result - Save grading result to MongoDB"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented save result to MongoDB with UUID. Stores grade, subject, gradeLevel, questions, timeTaken."
      - working: true
        agent: "testing"
        comment: "✅ TESTED & WORKING. Successfully saves grading results to MongoDB with UUID. Returns success response with generated ID. Data persists correctly with all fields (grade, maxGrade, gradeLabel, subject, gradeLevel, questions array, timeTaken, totalQuestions, createdAt timestamp)."

  - task: "GET /api/results - Retrieve saved results"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented GET endpoint to retrieve last 50 results from MongoDB."
      - working: true
        agent: "testing"
        comment: "✅ TESTED & WORKING. Successfully retrieves saved results from MongoDB, sorted by createdAt descending, limited to 50 records. Returns array with all result fields including questions breakdown. Verified data integrity matches saved records."

  - task: "POST /api/save-result - Student ID fields (studentName, studentGroup, gradeLabel)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Added new fields to save-result endpoint: studentName, studentGroup, gradeLabel. These fields are now stored in MongoDB with each result."
      - working: true
        agent: "testing"
        comment: "✅ TESTED & WORKING. Successfully saves results with new student ID fields. Test saved result with studentName='Ana García López', studentGroup='3º ESO B', gradeLabel='Notable'. All fields persisted correctly in MongoDB and returned in subsequent queries. ID generated: 004c0499-1cfd-4c26-ade8-02e1d704833f"

  - task: "GET /api/results - Query filtering and metadata (subject, dateFrom, dateTo, studentName, total, avgGrade)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Enhanced GET /api/results with query parameters: subject, dateFrom, dateTo, studentName. Response now includes total count and avgGrade metadata. Supports filtering by subject (exact match or 'Todas'), date range, and student name (case-insensitive regex)."
      - working: true
        agent: "testing"
        comment: "✅ TESTED & WORKING. All filtering and metadata features working correctly: 1) No filters - returns all results with total=3, avgGrade=8.7, includes studentName/studentGroup fields. 2) subject=Matemáticas filter - returns only Matemáticas results (3 found). 3) dateFrom=2020-01-01 filter - returns results after date (3 found). 4) subject=Lengua filter - correctly returns empty array with total=0, avgGrade=0. All 5 test cases passed."

  - task: "MongoDB to Supabase PostgreSQL migration"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "PRIORITY MIGRATION: Removed all MongoDB code, installed @supabase/supabase-js@2.105.1, rewrote route.js with Supabase client. Placeholder credentials set in .env. Created SUPABASE_SETUP.sql with 6 tables (schools, teachers, exam_results, rubrics, audit_log, consents). Health endpoint updated to return 'Supabase PostgreSQL'. All DB endpoints fail gracefully with placeholder creds."
      - working: true
        agent: "testing"
        comment: "✅ MIGRATION VERIFIED (8/8 tests passed). Code verification: 1) NO MongoDB references in route.js (no MongoClient, mongodb, MONGO_URL). 2) package.json has @supabase/supabase-js@^2.105.1, NO mongodb dependency. 3) .env has all 3 Supabase env vars (NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY). 4) SUPABASE_SETUP.sql contains all 6 required tables. API tests: 5) GET /api/health returns HTTP 200 with database='Supabase PostgreSQL'. 6) GET /api/results fails gracefully with HTTP 500 + JSON error (not crash). 7) GET /api/results?subject=Matemáticas fails gracefully. 8) POST /api/save-result fails gracefully. All endpoints return proper JSON error responses with placeholder creds. Migration complete and ready for real Supabase credentials."

  - task: "POST /api/grade - Wizard config support (Feature #1)"
    implemented: true
    working: "NA"
    file: "app/api/grade/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Updated /api/grade to optionally accept `wizardConfig` JSON. If wizardConfig.segment is 'oposiciones' or 'academia', uses the dynamic Spanish prompt from /lib/promptBuilder.js (Oposiciones: tipo test with penalties; Academia: subject/level/examType-specific). Otherwise uses the legacy default Spanish prompt. ALL prompts now request `ocr_confidence` (0..1) in JSON output for Feature #3 (CER). Sanitises ocr_confidence before returning. Audit log includes wizardSegment + ocrConfidence. Test cases: 1) POST /api/grade WITHOUT wizardConfig - should still work (legacy path) and return ocr_confidence in response. 2) POST /api/grade WITH wizardConfig={segment:'oposiciones',department:'sanidad',questionCount:100,penalty:-0.25} - should use Oposiciones prompt and return ocr_confidence. 3) POST /api/grade WITH wizardConfig={segment:'academia',department:'matematicas',level:'ESO',examType:'mixto'} - should use Academia prompt and return ocr_confidence."

  - task: "POST /api/save-result - Persists ocr_confidence + wizard_config (Feature #3)"
    implemented: true
    working: "NA"
    file: "app/api/save-result/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Updated to accept and persist `ocr_confidence` (DECIMAL 0..1) and `wizardConfig` (JSONB) into exam_results table. Sanitises ocr_confidence to clamp between 0 and 1. Requires DB migration: SUPABASE_COMBINED_FEATURES.sql adds ocr_confidence + wizard_config columns to exam_results. NOTE: Will fail if SQL migration not yet executed. Test: POST /api/save-result with body containing grade, subject, gradeLevel, ocr_confidence:0.987, wizardConfig:{segment:'oposiciones'}."

  - task: "GET /api/results - Returns ocrConfidence + avgConfidence (Feature #3)"
    implemented: true
    working: "NA"
    file: "app/api/results/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Updated transformResult() in /lib/transforms.js to expose `ocrConfidence` and `wizardConfig` fields. /api/results response now includes `avgConfidence` (lifetime average from filtered results) and `precisionExamCount` (how many results have non-null confidence). Test: GET /api/results - response should contain avgConfidence and each result should have ocrConfidence field."

  - task: "GET /api/precision-stats - Monthly OCR precision statistics (Feature #3)"
    implemented: true
    working: "NA"
    file: "app/api/precision-stats/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "NEW endpoint. Returns: { currentMonthAvg, currentMonthCount, globalAvg, monthly: [{month, monthKey, avgConfidence, precision, examCount}], target: 0.99 }. Builds last 12 months data even for months with 0 exams (returns null for those). Used by Dashboard Stats page (precision chart) and DashboardLayout sidebar badge. Test: GET /api/precision-stats - should return success:true with monthly array of 12 entries."

  - task: "POST /api/import-pdf - PDF multi-page import (Feature #2)"
    implemented: true
    working: "NA"
    file: "app/api/import-pdf/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Existing endpoint, untouched in this round. Accepts multipart formData (pdf file, wizardConfig JSON, pagesPerExam). Uses pdf2pic + sharp to extract pages at 300 DPI, uploads each to Supabase Storage 'exam-images' bucket, creates exam_documents + exam_document_pages records. Requires SUPABASE_COMBINED_FEATURES.sql executed AND 'exam-images' storage bucket created. Test: smoke test only — verify endpoint returns proper validation error when no PDF file is sent (400 instead of 500). Full PDF flow requires real PDF and storage bucket."

frontend:
  - task: "Screen 1 - Scan & Submit UI"
    implemented: true
    working: true
    file: "app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "UI renders correctly. Has header, scanner status, camera button, gallery button, subject/level selectors, rubric textarea, submit button. Screenshot confirmed working."

  - task: "Screen 2 - Results display"
    implemented: true
    working: "NA"
    file: "app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Results screen implemented with grade circle, progress bar, question breakdown, PDF export (window.print), save button, next exam button. Not yet tested end-to-end."

  - task: "Image compression and base64 conversion"
    implemented: true
    working: "NA"
    file: "app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Canvas-based image compression to max 1400px, quality 0.85, JPEG format."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 4
  run_ui: false

test_plan:
  current_focus:
    - "POST /api/grade - Wizard config support (Feature #1)"
    - "POST /api/save-result - Persists ocr_confidence + wizard_config (Feature #3)"
    - "GET /api/results - Returns ocrConfidence + avgConfidence (Feature #3)"
    - "GET /api/precision-stats - Monthly OCR precision statistics (Feature #3)"
    - "POST /api/import-pdf - PDF multi-page import (Feature #2)"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "Built full Corrector de Examenes PWA. Backend uses GPT-4o via emergent proxy (https://integrations.emergentagent.com/llm/chat/completions) with EMERGENT_LLM_KEY env var. Frontend has two screens. Need to test backend endpoints. For the /api/grade test, use a real exam image (base64 encoded, JPEG/PNG/WEBP with actual content - handwritten text or printed exam). The AI grading needs an actual image to analyze. IMPORTANT: Read /app/image_testing.md for image handling rules."
  - agent: "testing"
    message: "✅ ALL BACKEND TESTS PASSED (4/4). Fixed critical .env formatting bug - CORS_ORIGINS and EMERGENT_LLM_KEY were on same line causing API key to be undefined. After fix, all endpoints working: 1) GET /api/health returns correct status, 2) POST /api/grade successfully grades exams with GPT-4o vision (~2.8s response), 3) POST /api/save-result saves to MongoDB with UUID, 4) GET /api/results retrieves saved records. Backend is fully functional. Ready for main agent to summarize and finish."
  - agent: "main"
    message: "Added 3 new features: 1) Student ID fields (studentName/studentGroup) on scan screen and in save-result 2) History dashboard - GET /api/results now supports query params: subject, dateFrom, dateTo, studentName + returns total and avgGrade. Frontend has history screen with subject+date filter pills. 3) Custom PDF - PrintDocument component with school logo placeholder, student info, grade circle, questions table, teacher signature. Test: POST /api/save-result with studentName and studentGroup fields, GET /api/results with subject filter, GET /api/results with dateFrom filter."
  - agent: "testing"
    message: "✅ ALL NEW FEATURES TESTED & WORKING (5/5 tests passed). Tested student ID fields and history filtering: 1) POST /api/save-result with studentName='Ana García López', studentGroup='3º ESO B', gradeLabel='Notable' - saves correctly with UUID. 2) GET /api/results (no filters) - returns studentName, studentGroup, total=3, avgGrade=8.7. 3) GET /api/results?subject=Matemáticas - filters correctly, returns 3 Matemáticas results. 4) GET /api/results?dateFrom=2020-01-01 - filters correctly, returns 3 results. 5) GET /api/results?subject=Lengua - correctly returns empty array with total=0. All backend features working perfectly. Ready for main agent to summarize and finish."
  - agent: "main"
    message: "PRIORITY MIGRATION COMPLETE: MongoDB fully removed, @supabase/supabase-js@2.105.1 installed. route.js completely rewritten with Supabase. No MongoDB references remain anywhere. Placeholder credentials set. Health endpoint returns database:Supabase PostgreSQL. DB endpoints fail gracefully with fetch error (expected with placeholder URL). Test: 1) GET /api/health should return {status:ok, database:Supabase PostgreSQL} 2) GET /api/results should return {error: fetch failed} with placeholder creds 3) POST /api/save-result should return {error: fetch failed} with placeholder creds. SQL file created at /app/SUPABASE_SETUP.sql for user to run in Supabase SQL Editor."
  - agent: "testing"
    message: "✅ SUPABASE MIGRATION FULLY VERIFIED (8/8 tests passed). Code verification: NO MongoDB code anywhere (route.js, package.json clean), @supabase/supabase-js@^2.105.1 installed, all 3 Supabase env vars present, SUPABASE_SETUP.sql contains all 6 tables (schools, teachers, exam_results, rubrics, audit_log, consents). API tests: GET /api/health returns HTTP 200 with database='Supabase PostgreSQL', all DB endpoints (GET /api/results, GET /api/results?subject=Matemáticas, POST /api/save-result) fail gracefully with HTTP 500 + JSON error responses (not crashes). Migration complete. App ready for real Supabase credentials after deployment."
  - agent: "main"
    message: "ROUND 3 — Implemented final feature batch (Wizard + PDF Import UI integration + Precision Metrics CER). Five backend changes need testing. IMPORTANT CONTEXT: (a) Real Supabase credentials are now in .env (not placeholders). (b) The user has been asked to manually run /app/SUPABASE_COMBINED_FEATURES.sql in Supabase SQL Editor before /api/save-result + /api/results + /api/precision-stats DB queries can succeed. If schema not yet applied, those endpoints will return DB error (column does not exist). (c) /api/grade does NOT require DB access — should work regardless. Tests requested: 1) POST /api/grade with REAL exam image and NO wizardConfig — verify 200 response includes ocr_confidence field (legacy path still works). 2) POST /api/grade with wizardConfig={segment:'oposiciones',department:'sanidad',questionCount:100,penalty:-0.25} — verify it succeeds and returns ocr_confidence + Oposiciones-style fields if possible. 3) POST /api/grade with wizardConfig={segment:'academia',department:'matematicas',level:'ESO',examType:'mixto'} — verify success. 4) GET /api/precision-stats — verify success:true and monthly array of 12 entries (will return all-null monthlies if no data; that's OK). 5) POST /api/save-result with ocr_confidence:0.987 + wizardConfig:{segment:'oposiciones'} — if schema applied, expect 200 and id; if schema not applied, expect graceful 500 with error message. 6) GET /api/results — verify response includes avgConfidence and precisionExamCount fields. 7) POST /api/import-pdf with no body — verify 400 validation error (not 500 crash). All tests should be against real Supabase. Don't test full PDF flow (no real PDF needed). Use the existing test exam image. Use the testing image from /app/image_testing.md for grading tests."

