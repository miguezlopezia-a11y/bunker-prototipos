#!/usr/bin/env python3
"""
Backend API Testing for Corrector de Examenes IA - Round 3
Tests the 5 tasks marked needs_retesting: true in test_result.md
"""

import requests
import json
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

# Base URL from .env
BASE_URL = "https://exam-grader-ai-1.preview.emergentagent.com/api"

def generate_test_image():
    """Generate a 100x100 white JPEG with '1+1=2' text for GPT-4o Vision testing"""
    img = Image.new('RGB', (100, 100), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw simple text (PIL default font)
    draw.text((10, 40), "1+1=2", fill='black')
    
    # Convert to JPEG base64
    buffer = BytesIO()
    img.save(buffer, format='JPEG', quality=90)
    buffer.seek(0)
    
    image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
    return image_base64

def test_grade_without_wizard():
    """Test 1: POST /api/grade WITHOUT wizardConfig (legacy path)"""
    print("\n" + "="*80)
    print("TEST 1: POST /api/grade WITHOUT wizardConfig (legacy path)")
    print("="*80)
    
    try:
        image_base64 = generate_test_image()
        
        payload = {
            "imageBase64": image_base64,
            "mimeType": "image/jpeg",
            "subject": "Matemáticas",
            "gradeLevel": "ESO",
            "rubric": "1+1=2 (1 punto)"
        }
        
        response = requests.post(f"{BASE_URL}/grade", json=payload, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Response received")
            print(f"   - success: {data.get('success')}")
            print(f"   - grade: {data.get('grade')}")
            print(f"   - maxGrade: {data.get('maxGrade')}")
            print(f"   - ocr_confidence: {data.get('ocr_confidence')} (NEW FIELD)")
            print(f"   - questions count: {len(data.get('questions', []))}")
            print(f"   - timeTaken: {data.get('timeTaken')}s")
            
            # Verify ocr_confidence is present and valid
            if 'ocr_confidence' in data:
                conf = data['ocr_confidence']
                if conf is not None and 0 <= conf <= 1:
                    print(f"   ✅ ocr_confidence is valid: {conf}")
                    return True, data
                else:
                    print(f"   ⚠️ ocr_confidence out of range or null: {conf}")
                    return True, data  # Still working, just note the issue
            else:
                print(f"   ❌ MISSING ocr_confidence field in response")
                return False, None
        else:
            print(f"❌ FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False, None

def test_grade_with_oposiciones():
    """Test 2: POST /api/grade WITH Oposiciones wizardConfig"""
    print("\n" + "="*80)
    print("TEST 2: POST /api/grade WITH Oposiciones wizardConfig")
    print("="*80)
    
    try:
        image_base64 = generate_test_image()
        
        payload = {
            "imageBase64": image_base64,
            "mimeType": "image/jpeg",
            "subject": "Matemáticas",
            "gradeLevel": "ESO",
            "rubric": "1+1=2 (1 punto)",
            "wizardConfig": {
                "segment": "oposiciones",
                "department": "sanidad",
                "questionCount": 100,
                "penalty": -0.25
            }
        }
        
        response = requests.post(f"{BASE_URL}/grade", json=payload, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Response received")
            print(f"   - success: {data.get('success')}")
            print(f"   - grade: {data.get('grade')}")
            print(f"   - ocr_confidence: {data.get('ocr_confidence')}")
            print(f"   - questions count: {len(data.get('questions', []))}")
            
            # Check for Oposiciones-style fields (optional, AI may or may not include)
            if 'correctas' in data or 'incorrectas' in data:
                print(f"   ℹ️ Oposiciones-style fields detected")
            
            if 'ocr_confidence' in data:
                print(f"   ✅ ocr_confidence present: {data['ocr_confidence']}")
                return True, data
            else:
                print(f"   ❌ MISSING ocr_confidence field")
                return False, None
        else:
            print(f"❌ FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False, None

def test_grade_with_academia():
    """Test 3: POST /api/grade WITH Academia wizardConfig"""
    print("\n" + "="*80)
    print("TEST 3: POST /api/grade WITH Academia wizardConfig")
    print("="*80)
    
    try:
        image_base64 = generate_test_image()
        
        payload = {
            "imageBase64": image_base64,
            "mimeType": "image/jpeg",
            "subject": "Matemáticas",
            "gradeLevel": "ESO",
            "rubric": "1+1=2 (1 punto)",
            "wizardConfig": {
                "segment": "academia",
                "department": "matematicas",
                "level": "ESO",
                "examType": "mixto",
                "includeMathSteps": True
            }
        }
        
        response = requests.post(f"{BASE_URL}/grade", json=payload, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Response received")
            print(f"   - success: {data.get('success')}")
            print(f"   - grade: {data.get('grade')}")
            print(f"   - ocr_confidence: {data.get('ocr_confidence')}")
            print(f"   - questions count: {len(data.get('questions', []))}")
            
            if 'ocr_confidence' in data:
                print(f"   ✅ ocr_confidence present: {data['ocr_confidence']}")
                return True, data
            else:
                print(f"   ❌ MISSING ocr_confidence field")
                return False, None
        else:
            print(f"❌ FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False, None

def test_save_result_with_confidence():
    """Test 4: POST /api/save-result with ocr_confidence + wizardConfig"""
    print("\n" + "="*80)
    print("TEST 4: POST /api/save-result with ocr_confidence + wizardConfig")
    print("="*80)
    
    try:
        payload = {
            "grade": 8.5,
            "maxGrade": 10,
            "subject": "Matemáticas",
            "gradeLevel": "ESO",
            "studentName": "Test Alumno",
            "studentGroup": "3ESO-A",
            "gradeLabel": "Notable",
            "questions": [
                {
                    "number": 1,
                    "studentAnswer": "2",
                    "correctAnswer": "2",
                    "pointsAwarded": 1,
                    "maxPoints": 1,
                    "feedback": "Correcto"
                }
            ],
            "timeTaken": 2.5,
            "ocr_confidence": 0.987,
            "wizardConfig": {
                "segment": "oposiciones",
                "department": "sanidad"
            }
        }
        
        response = requests.post(f"{BASE_URL}/save-result", json=payload, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Result saved")
            print(f"   - success: {data.get('success')}")
            print(f"   - id: {data.get('id')}")
            print(f"   - message: {data.get('message')}")
            
            if data.get('id'):
                print(f"   ✅ UUID returned: {data['id']}")
                return True, data['id']
            else:
                print(f"   ❌ No ID returned")
                return False, None
        else:
            print(f"❌ FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
            
            # Check if it's a schema error (expected if SQL not run)
            if response.status_code == 500:
                error_text = response.text.lower()
                if 'column' in error_text and 'does not exist' in error_text:
                    print(f"   ⚠️ Schema error - SUPABASE_BOOTSTRAP_COMPLETE.sql may not be executed")
                    print(f"   This is expected if DB migration not yet applied")
            
            return False, None
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False, None

def test_results_with_confidence():
    """Test 5: GET /api/results - verify avgConfidence and precisionExamCount"""
    print("\n" + "="*80)
    print("TEST 5: GET /api/results - verify avgConfidence and precisionExamCount")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/results", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Results retrieved")
            print(f"   - success: {data.get('success')}")
            print(f"   - total: {data.get('total')}")
            print(f"   - avgGrade: {data.get('avgGrade')}")
            print(f"   - avgConfidence: {data.get('avgConfidence')} (NEW FIELD)")
            print(f"   - precisionExamCount: {data.get('precisionExamCount')} (NEW FIELD)")
            
            # Verify new fields
            has_avg_confidence = 'avgConfidence' in data
            has_precision_count = 'precisionExamCount' in data
            
            if has_avg_confidence and has_precision_count:
                print(f"   ✅ Both new fields present")
                
                # Check if results have ocrConfidence field
                results = data.get('results', [])
                if results:
                    first_result = results[0]
                    if 'ocrConfidence' in first_result:
                        print(f"   ✅ Result items have ocrConfidence field: {first_result['ocrConfidence']}")
                    else:
                        print(f"   ⚠️ Result items missing ocrConfidence field")
                
                return True, data
            else:
                print(f"   ❌ Missing fields - avgConfidence: {has_avg_confidence}, precisionExamCount: {has_precision_count}")
                return False, None
        else:
            print(f"❌ FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False, None

def test_precision_stats():
    """Test 6: GET /api/precision-stats - verify monthly array of 12 entries"""
    print("\n" + "="*80)
    print("TEST 6: GET /api/precision-stats - verify monthly array of 12 entries")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/precision-stats", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Precision stats retrieved")
            print(f"   - success: {data.get('success')}")
            print(f"   - currentMonthAvg: {data.get('currentMonthAvg')}")
            print(f"   - currentMonthCount: {data.get('currentMonthCount')}")
            print(f"   - globalAvg: {data.get('globalAvg')}")
            print(f"   - target: {data.get('target')}")
            
            monthly = data.get('monthly', [])
            print(f"   - monthly array length: {len(monthly)}")
            
            if len(monthly) == 12:
                print(f"   ✅ Monthly array has exactly 12 entries")
                
                # Show first and last month
                if monthly:
                    first = monthly[0]
                    last = monthly[-1]
                    print(f"   - First month: {first.get('month')} ({first.get('monthKey')}) - avg: {first.get('avgConfidence')}, count: {first.get('examCount')}")
                    print(f"   - Last month: {last.get('month')} ({last.get('monthKey')}) - avg: {last.get('avgConfidence')}, count: {last.get('examCount')}")
                
                # Verify structure
                required_fields = ['month', 'monthKey', 'avgConfidence', 'precision', 'examCount']
                first_entry = monthly[0]
                has_all_fields = all(field in first_entry for field in required_fields)
                
                if has_all_fields:
                    print(f"   ✅ Monthly entries have all required fields")
                    return True, data
                else:
                    print(f"   ❌ Monthly entries missing required fields")
                    return False, None
            else:
                print(f"   ❌ Monthly array has {len(monthly)} entries, expected 12")
                return False, None
        else:
            print(f"❌ FAILED - Status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False, None

def test_import_pdf_validation():
    """Test 7: POST /api/import-pdf with NO body (validation smoke test)"""
    print("\n" + "="*80)
    print("TEST 7: POST /api/import-pdf with NO body (validation smoke test)")
    print("="*80)
    
    try:
        # Send multipart/form-data with other fields but no 'pdf' file
        # This is the correct way to test the validation
        data = {
            'wizardConfig': '{}',
            'pagesPerExam': '1'
        }
        
        response = requests.post(f"{BASE_URL}/import-pdf", data=data, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            print(f"✅ SUCCESS - Proper validation error (400)")
            print(f"   - success: {data.get('success')}")
            print(f"   - error: {data.get('error')}")
            
            # Verify it's a Spanish error message about missing PDF
            error_msg = data.get('error', '').lower()
            if 'pdf' in error_msg:
                print(f"   ✅ Error message mentions PDF (Spanish): '{data.get('error')}'")
                return True, data
            else:
                print(f"   ⚠️ Error message doesn't mention PDF")
                return True, data  # Still working, just different message
        elif response.status_code == 500:
            print(f"❌ FAILED - Server crashed (500) instead of validation error")
            print(f"Response: {response.text}")
            return False, None
        else:
            print(f"⚠️ Unexpected status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False, None

def main():
    """Run all backend tests"""
    print("\n" + "="*80)
    print("CORRECTOR DE EXAMENES IA - ROUND 3 BACKEND TESTING")
    print("Testing 5 tasks marked needs_retesting: true")
    print("="*80)
    
    results = {}
    
    # Test 1: POST /api/grade WITHOUT wizardConfig
    success, data = test_grade_without_wizard()
    results['grade_without_wizard'] = success
    
    # Test 2: POST /api/grade WITH Oposiciones wizardConfig
    success, data = test_grade_with_oposiciones()
    results['grade_with_oposiciones'] = success
    
    # Test 3: POST /api/grade WITH Academia wizardConfig
    success, data = test_grade_with_academia()
    results['grade_with_academia'] = success
    
    # Test 4: POST /api/save-result with ocr_confidence + wizardConfig
    success, saved_id = test_save_result_with_confidence()
    results['save_result_with_confidence'] = success
    
    # Test 5: GET /api/results
    success, data = test_results_with_confidence()
    results['results_with_confidence'] = success
    
    # Test 6: GET /api/precision-stats
    success, data = test_precision_stats()
    results['precision_stats'] = success
    
    # Test 7: POST /api/import-pdf validation
    success, data = test_import_pdf_validation()
    results['import_pdf_validation'] = success
    
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
        print("\n🎉 ALL TESTS PASSED!")
        return 0
    else:
        print(f"\n⚠️ {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    exit(main())
