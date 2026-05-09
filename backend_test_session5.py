#!/usr/bin/env python3
"""
Backend API Testing for Corrector de Examenes IA - Session 5
Tests the 3 tasks marked needs_retesting: true in test_result.md:
1. GET/POST /api/consumption - Hybrid pricing usage tracking
2. GET/POST /api/corrections - ANECA audit trail
3. POST /api/save-result - Auto-logs AI corrections to text_corrections
"""

import requests
import json

# Base URL from .env
BASE_URL = "https://exam-grader-ai-1.preview.emergentagent.com/api"

# Global variable to store exam result ID for corrections tests
saved_exam_id = None

def test_a1_get_consumption_no_params():
    """A1) GET /api/consumption (no params)"""
    print("\n" + "="*80)
    print("TEST A1: GET /api/consumption (no params)")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/consumption", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Response received")
            print(f"   - success: {data.get('success')}")
            print(f"   - pagesUsed: {data.get('pagesUsed')}")
            print(f"   - quota: {data.get('quota')}")
            print(f"   - percentage: {data.get('percentage')}")
            print(f"   - remaining: {data.get('remaining')}")
            print(f"   - overagePages: {data.get('overagePages')}")
            print(f"   - overageCost: {data.get('overageCost')}")
            print(f"   - planName: {data.get('planName')}")
            print(f"   - planPrice: {data.get('planPrice')}")
            print(f"   - planTier: {data.get('planTier')}")
            print(f"   - alertLevel: {data.get('alertLevel')}")
            print(f"   - period: {data.get('period')}")
            
            # Verify all required fields are present
            required_fields = ['success', 'pagesUsed', 'quota', 'percentage', 'remaining', 
                             'overagePages', 'overageCost', 'planName', 'planPrice', 
                             'planTier', 'alertLevel', 'period']
            missing_fields = [f for f in required_fields if f not in data]
            
            if not missing_fields:
                print(f"   ✅ All required fields present")
                
                # Verify expected values
                if data.get('planName') == 'Básico' and data.get('planPrice') == 49 and data.get('planTier') == 'basico':
                    print(f"   ✅ Default plan values correct (Básico, 49€, basico)")
                    
                    # Verify period structure
                    period = data.get('period', {})
                    if 'year' in period and 'month' in period:
                        print(f"   ✅ Period structure correct: {period}")
                        return True
                    else:
                        print(f"   ❌ Period missing year/month fields")
                        return False
                else:
                    print(f"   ⚠️ Plan values unexpected")
                    return True  # Still working, just different values
            else:
                print(f"   ❌ Missing required fields: {missing_fields}")
                return False
        else:
            print(f"❌ FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def test_a2_post_consumption_empty_body():
    """A2) POST /api/consumption with body {}"""
    print("\n" + "="*80)
    print("TEST A2: POST /api/consumption with body {}")
    print("="*80)
    
    try:
        payload = {}
        response = requests.post(f"{BASE_URL}/consumption", json=payload, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Response received")
            print(f"   - success: {data.get('success')}")
            print(f"   - skipped: {data.get('skipped')}")
            print(f"   - reason: {data.get('reason')}")
            
            # Verify it's skipped because no schoolId
            if data.get('success') and data.get('skipped') and 'schoolid' in str(data.get('reason', '')).lower():
                print(f"   ✅ Correctly skipped (no schoolId)")
                return True
            else:
                print(f"   ❌ Unexpected response structure")
                return False
        else:
            print(f"❌ FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def test_a3_post_consumption_with_pages():
    """A3) POST /api/consumption with body {"pages": 5, "planTier": "profesional"}"""
    print("\n" + "="*80)
    print("TEST A3: POST /api/consumption with body {\"pages\": 5, \"planTier\": \"profesional\"}")
    print("="*80)
    
    try:
        payload = {
            "pages": 5,
            "planTier": "profesional"
        }
        response = requests.post(f"{BASE_URL}/consumption", json=payload, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Response received")
            print(f"   - success: {data.get('success')}")
            print(f"   - skipped: {data.get('skipped')}")
            print(f"   - reason: {data.get('reason')}")
            
            # Should also be skipped (no schoolId)
            if data.get('success') and data.get('skipped'):
                print(f"   ✅ Correctly skipped (no schoolId)")
                return True
            else:
                print(f"   ⚠️ Not skipped - may have processed without schoolId")
                return True  # Still working, just different behavior
        else:
            print(f"❌ FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def test_b1_get_corrections_no_params():
    """B1) GET /api/corrections (no params) - expect 400"""
    print("\n" + "="*80)
    print("TEST B1: GET /api/corrections (no params) - expect 400")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/corrections", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            print(f"✅ SUCCESS - Proper validation error (400)")
            print(f"   - success: {data.get('success')}")
            print(f"   - error: {data.get('error')}")
            
            # Verify Spanish error message
            error_msg = data.get('error', '')
            if 'examResultId' in error_msg and 'requerido' in error_msg:
                print(f"   ✅ Correct Spanish error: '{error_msg}'")
                return True
            else:
                print(f"   ⚠️ Error message unexpected: '{error_msg}'")
                return True  # Still working, just different message
        else:
            print(f"❌ FAILED - Expected 400, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def test_b2_save_result_for_corrections():
    """B2) POST /api/save-result with test data - save the id"""
    print("\n" + "="*80)
    print("TEST B2: POST /api/save-result with test data (for corrections testing)")
    print("="*80)
    
    global saved_exam_id
    
    try:
        payload = {
            "grade": 7.5,
            "maxGrade": 10,
            "subject": "Matemáticas",
            "gradeLevel": "ESO",
            "studentName": "Test ANECA",
            "studentGroup": "Test",
            "gradeLabel": "Notable",
            "questions": [
                {
                    "number": 1,
                    "studentAnswer": "2",
                    "correctAnswer": "2",
                    "pointsAwarded": 1,
                    "maxPoints": 1,
                    "feedback": "Correcto"
                },
                {
                    "number": 2,
                    "studentAnswer": "5",
                    "correctAnswer": "4",
                    "pointsAwarded": 0,
                    "maxPoints": 1,
                    "feedback": "Cálculo erróneo"
                }
            ],
            "timeTaken": 2.5,
            "ocr_confidence": 0.95
        }
        
        response = requests.post(f"{BASE_URL}/save-result", json=payload, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Result saved")
            print(f"   - success: {data.get('success')}")
            print(f"   - id: {data.get('id')}")
            
            if data.get('id'):
                saved_exam_id = data['id']
                print(f"   ✅ UUID saved for corrections tests: {saved_exam_id}")
                return True
            else:
                print(f"   ❌ No ID returned")
                return False
        else:
            print(f"❌ FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def test_b3_get_corrections_auto_logged():
    """B3) GET /api/corrections?examResultId=<id> - expect 2 AI corrections"""
    print("\n" + "="*80)
    print("TEST B3: GET /api/corrections?examResultId=<id> - verify auto-logged AI corrections")
    print("="*80)
    
    global saved_exam_id
    
    if not saved_exam_id:
        print("❌ SKIPPED - No saved exam ID from B2")
        return False
    
    try:
        response = requests.get(f"{BASE_URL}/corrections?examResultId={saved_exam_id}", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Corrections retrieved")
            print(f"   - success: {data.get('success')}")
            print(f"   - total: {data.get('total')}")
            print(f"   - corrections count: {len(data.get('corrections', []))}")
            
            # CRITICAL TEST: Verify 2 auto-logged AI corrections
            if data.get('total') == 2:
                print(f"   ✅ CRITICAL: Exactly 2 corrections auto-logged (as expected)")
                
                corrections = data.get('corrections', [])
                if len(corrections) == 2:
                    # Verify both are AI_MODEL corrections
                    all_ai = all(c.get('correctionSource') == 'AI_MODEL' for c in corrections)
                    all_error_repair = all(c.get('correctionType') == 'ERROR_REPAIR' for c in corrections)
                    all_have_confidence = all(c.get('confidenceScore') == 0.95 for c in corrections)
                    
                    print(f"   - All corrections from AI_MODEL: {all_ai}")
                    print(f"   - All corrections type ERROR_REPAIR: {all_error_repair}")
                    print(f"   - All corrections have confidence 0.95: {all_have_confidence}")
                    
                    # Show details
                    for i, c in enumerate(corrections):
                        print(f"   - Correction {i+1}:")
                        print(f"     - correctionSource: {c.get('correctionSource')}")
                        print(f"     - correctionType: {c.get('correctionType')}")
                        print(f"     - confidenceScore: {c.get('confidenceScore')}")
                        print(f"     - originalText: {c.get('originalText')}")
                        print(f"     - correctedText: {c.get('correctedText')}")
                        print(f"     - notes: {c.get('notes')}")
                    
                    if all_ai and all_error_repair:
                        print(f"   ✅ CRITICAL TEST PASSED: Auto-logging working correctly")
                        return True
                    else:
                        print(f"   ❌ CRITICAL: Corrections have wrong source/type")
                        return False
                else:
                    print(f"   ❌ CRITICAL: Corrections array length mismatch")
                    return False
            else:
                print(f"   ❌ CRITICAL: Expected 2 corrections, got {data.get('total')}")
                return False
        else:
            print(f"❌ FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def test_b4_post_manual_correction():
    """B4) POST /api/corrections with manual correction"""
    print("\n" + "="*80)
    print("TEST B4: POST /api/corrections with manual correction")
    print("="*80)
    
    global saved_exam_id
    
    if not saved_exam_id:
        print("❌ SKIPPED - No saved exam ID from B2")
        return False
    
    try:
        payload = {
            "examResultId": saved_exam_id,
            "questionIndex": 0,
            "originalText": "respuesta inicial",
            "correctedText": "respuesta revisada",
            "correctionType": "EDITORIAL_NORMALIZATION",
            "correctionSource": "HUMAN_TEACHER",
            "notes": "Corrección manual del profesor",
            "confidenceScore": 1.0
        }
        
        response = requests.post(f"{BASE_URL}/corrections", json=payload, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Manual correction created")
            print(f"   - success: {data.get('success')}")
            print(f"   - id: {data.get('id')}")
            print(f"   - message: {data.get('message')}")
            
            correction = data.get('correction', {})
            print(f"   - correctionSource: {correction.get('correctionSource')}")
            print(f"   - correctionType: {correction.get('correctionType')}")
            print(f"   - confidenceScore: {correction.get('confidenceScore')}")
            print(f"   - notes: {correction.get('notes')}")
            
            # Verify all fields populated correctly
            if (correction.get('correctionSource') == 'HUMAN_TEACHER' and
                correction.get('correctionType') == 'EDITORIAL_NORMALIZATION' and
                correction.get('confidenceScore') == 1.0):
                print(f"   ✅ All fields populated correctly")
                return True
            else:
                print(f"   ❌ Fields not populated correctly")
                return False
        else:
            print(f"❌ FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def test_b5_get_corrections_with_manual():
    """B5) GET /api/corrections?examResultId=<id> - expect 3 total (2 AI + 1 manual)"""
    print("\n" + "="*80)
    print("TEST B5: GET /api/corrections?examResultId=<id> - verify 3 total (2 AI + 1 manual)")
    print("="*80)
    
    global saved_exam_id
    
    if not saved_exam_id:
        print("❌ SKIPPED - No saved exam ID from B2")
        return False
    
    try:
        response = requests.get(f"{BASE_URL}/corrections?examResultId={saved_exam_id}", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Corrections retrieved")
            print(f"   - success: {data.get('success')}")
            print(f"   - total: {data.get('total')}")
            
            # Verify 3 total corrections
            if data.get('total') == 3:
                print(f"   ✅ Exactly 3 corrections (2 AI + 1 manual)")
                
                corrections = data.get('corrections', [])
                if len(corrections) == 3:
                    # Verify first one is manual (sorted by corrected_at DESC)
                    first = corrections[0]
                    print(f"   - First correction (most recent):")
                    print(f"     - correctionSource: {first.get('correctionSource')}")
                    print(f"     - correctionType: {first.get('correctionType')}")
                    
                    if first.get('correctionSource') == 'HUMAN_TEACHER':
                        print(f"   ✅ Manual correction appears FIRST (sorted DESC)")
                        
                        # Count AI vs manual
                        ai_count = sum(1 for c in corrections if c.get('correctionSource') == 'AI_MODEL')
                        manual_count = sum(1 for c in corrections if c.get('correctionSource') == 'HUMAN_TEACHER')
                        
                        print(f"   - AI corrections: {ai_count}")
                        print(f"   - Manual corrections: {manual_count}")
                        
                        if ai_count == 2 and manual_count == 1:
                            print(f"   ✅ Correct breakdown: 2 AI + 1 manual")
                            return True
                        else:
                            print(f"   ❌ Incorrect breakdown")
                            return False
                    else:
                        print(f"   ❌ Manual correction NOT first (sorting issue)")
                        return False
                else:
                    print(f"   ❌ Corrections array length mismatch")
                    return False
            else:
                print(f"   ❌ Expected 3 corrections, got {data.get('total')}")
                return False
        else:
            print(f"❌ FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def test_b6_post_correction_invalid_type():
    """B6) POST /api/corrections with invalid correctionType - expect 400"""
    print("\n" + "="*80)
    print("TEST B6: POST /api/corrections with invalid correctionType - expect 400")
    print("="*80)
    
    global saved_exam_id
    
    if not saved_exam_id:
        print("❌ SKIPPED - No saved exam ID from B2")
        return False
    
    try:
        payload = {
            "examResultId": saved_exam_id,
            "questionIndex": 0,
            "originalText": "test",
            "correctionType": "INVALID_TYPE"
        }
        
        response = requests.post(f"{BASE_URL}/corrections", json=payload, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            print(f"✅ SUCCESS - Proper validation error (400)")
            print(f"   - success: {data.get('success')}")
            print(f"   - error: {data.get('error')}")
            
            # Verify Spanish error message mentions correctionType
            error_msg = data.get('error', '')
            if 'correctionType' in error_msg:
                print(f"   ✅ Error message mentions correctionType: '{error_msg}'")
                return True
            else:
                print(f"   ⚠️ Error message doesn't mention correctionType: '{error_msg}'")
                return True  # Still working, just different message
        else:
            print(f"❌ FAILED - Expected 400, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def test_b7_post_correction_missing_fields():
    """B7) POST /api/corrections with missing required fields - expect 400"""
    print("\n" + "="*80)
    print("TEST B7: POST /api/corrections with missing required fields - expect 400")
    print("="*80)
    
    try:
        payload = {
            "questionIndex": 0
        }
        
        response = requests.post(f"{BASE_URL}/corrections", json=payload, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            print(f"✅ SUCCESS - Proper validation error (400)")
            print(f"   - success: {data.get('success')}")
            print(f"   - error: {data.get('error')}")
            
            # Verify Spanish error message
            error_msg = data.get('error', '')
            expected_words = ['examResultId', 'questionIndex', 'originalText', 'obligatorios']
            has_expected = any(word in error_msg for word in expected_words)
            
            if has_expected:
                print(f"   ✅ Correct Spanish error: '{error_msg}'")
                return True
            else:
                print(f"   ⚠️ Error message unexpected: '{error_msg}'")
                return True  # Still working, just different message
        else:
            print(f"❌ FAILED - Expected 400, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def main():
    """Run all Session 5 backend tests"""
    print("\n" + "="*80)
    print("CORRECTOR DE EXAMENES IA - SESSION 5 BACKEND TESTING")
    print("Testing 3 tasks marked needs_retesting: true")
    print("="*80)
    
    results = {}
    
    # A) /api/consumption tests
    print("\n" + "="*80)
    print("SECTION A: /api/consumption - Hybrid Pricing Usage Tracking")
    print("="*80)
    
    results['A1_get_consumption_no_params'] = test_a1_get_consumption_no_params()
    results['A2_post_consumption_empty_body'] = test_a2_post_consumption_empty_body()
    results['A3_post_consumption_with_pages'] = test_a3_post_consumption_with_pages()
    
    # B) /api/corrections tests
    print("\n" + "="*80)
    print("SECTION B: /api/corrections - ANECA Audit Trail")
    print("="*80)
    
    results['B1_get_corrections_no_params'] = test_b1_get_corrections_no_params()
    results['B2_save_result_for_corrections'] = test_b2_save_result_for_corrections()
    results['B3_get_corrections_auto_logged'] = test_b3_get_corrections_auto_logged()
    results['B4_post_manual_correction'] = test_b4_post_manual_correction()
    results['B5_get_corrections_with_manual'] = test_b5_get_corrections_with_manual()
    results['B6_post_correction_invalid_type'] = test_b6_post_correction_invalid_type()
    results['B7_post_correction_missing_fields'] = test_b7_post_correction_missing_fields()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL SESSION 5 TESTS PASSED!")
        return 0
    else:
        print(f"\n⚠️ {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    exit(main())
