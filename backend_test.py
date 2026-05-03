#!/usr/bin/env python3
"""
Backend API Test Suite for Corrector de Examenes
Tests all backend endpoints with real exam image data
"""

import requests
import json
import base64
import time
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

# Backend URL from .env
BASE_URL = "https://exam-grader-ai-1.preview.emergentagent.com/api"

def create_exam_image():
    """
    Create a realistic exam image with handwritten-style text
    Returns base64 encoded JPEG image
    """
    # Create a white canvas (A4-like proportions)
    width, height = 800, 1100
    img = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(img)
    
    # Try to use a default font, fallback to basic if not available
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
        font_text = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
    except:
        font_title = ImageFont.load_default()
        font_text = ImageFont.load_default()
    
    # Draw exam header
    draw.text((50, 30), "EXAMEN DE MATEMÁTICAS", fill='black', font=font_title)
    draw.text((50, 70), "Nombre: Juan Pérez", fill='black', font=font_text)
    draw.text((50, 100), "Curso: 3º ESO", fill='black', font=font_text)
    draw.line([(50, 130), (750, 130)], fill='black', width=2)
    
    # Draw exam questions and answers
    y_pos = 160
    questions = [
        ("1. ¿Cuánto es 15 + 27?", "Respuesta: 42"),
        ("2. Resuelve: 3x + 5 = 20", "Respuesta: x = 5"),
        ("3. Calcula el área de un círculo con radio 4cm", "Respuesta: A = 50.24 cm²"),
        ("4. ¿Cuál es el resultado de 144 ÷ 12?", "Respuesta: 12"),
        ("5. Simplifica la fracción 18/24", "Respuesta: 3/4")
    ]
    
    for question, answer in questions:
        draw.text((50, y_pos), question, fill='black', font=font_text)
        draw.text((70, y_pos + 30), answer, fill='blue', font=font_text)
        y_pos += 100
    
    # Add some visual noise to make it more realistic
    for i in range(20):
        x = 50 + (i * 35)
        y = height - 100
        draw.ellipse([(x, y), (x+2, y+2)], fill='gray')
    
    # Convert to base64 JPEG
    buffer = BytesIO()
    img.save(buffer, format='JPEG', quality=85)
    img_bytes = buffer.getvalue()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')
    
    return img_base64, 'image/jpeg'

def test_health_endpoint():
    """Test GET /api/health"""
    print("\n" + "="*60)
    print("TEST 1: GET /api/health")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'ok' and data.get('service') == 'Corrector de Exámenes':
                print("✅ PASS: Health endpoint working correctly")
                return True
            else:
                print("❌ FAIL: Health endpoint returned unexpected data")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL: Exception occurred - {str(e)}")
        return False

def test_grade_endpoint():
    """Test POST /api/grade with real exam image"""
    print("\n" + "="*60)
    print("TEST 2: POST /api/grade (AI Exam Grading)")
    print("="*60)
    
    try:
        # Create real exam image
        print("Creating realistic exam image with text content...")
        image_base64, mime_type = create_exam_image()
        print(f"Image created: {len(image_base64)} characters, MIME: {mime_type}")
        
        # Prepare request payload
        payload = {
            "imageBase64": image_base64,
            "mimeType": mime_type,
            "subject": "Matemáticas",
            "gradeLevel": "3º ESO",
            "rubric": """
            1. 15 + 27 = 42 (2 puntos)
            2. 3x + 5 = 20, entonces x = 5 (2 puntos)
            3. Área círculo = π × r² = π × 16 ≈ 50.27 cm² (2 puntos)
            4. 144 ÷ 12 = 12 (2 puntos)
            5. 18/24 simplificado = 3/4 (2 puntos)
            """
        }
        
        print("Sending request to AI grading endpoint...")
        print(f"Subject: {payload['subject']}, Grade Level: {payload['gradeLevel']}")
        
        response = requests.post(
            f"{BASE_URL}/grade",
            json=payload,
            timeout=60  # AI calls can take time
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Keys: {list(data.keys())}")
            print(f"Success: {data.get('success')}")
            print(f"Grade: {data.get('grade')}/{data.get('maxGrade')}")
            print(f"Grade Label: {data.get('gradeLabel')}")
            print(f"Total Questions: {data.get('totalQuestions')}")
            print(f"Time Taken: {data.get('timeTaken')}s")
            
            if data.get('questions'):
                print(f"Questions Array Length: {len(data['questions'])}")
                print(f"First Question Sample: {data['questions'][0]}")
            
            # Validation
            if (data.get('success') and 
                isinstance(data.get('grade'), (int, float)) and
                data.get('grade') >= 0 and data.get('grade') <= 10 and
                isinstance(data.get('questions'), list) and
                len(data.get('questions', [])) > 0):
                print("✅ PASS: Grade endpoint working correctly with AI response")
                return True, data
            else:
                print("❌ FAIL: Grade endpoint returned incomplete or invalid data")
                print(f"Full response: {json.dumps(data, indent=2)}")
                return False, None
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred - {str(e)}")
        import traceback
        traceback.print_exc()
        return False, None

def test_save_result_endpoint(grade_data=None):
    """Test POST /api/save-result"""
    print("\n" + "="*60)
    print("TEST 3: POST /api/save-result")
    print("="*60)
    
    try:
        # Use data from grade test if available, otherwise use mock data
        if grade_data:
            payload = {
                "grade": grade_data.get('grade'),
                "maxGrade": grade_data.get('maxGrade', 10),
                "gradeLabel": grade_data.get('gradeLabel', ''),
                "subject": "Matemáticas",
                "gradeLevel": "3º ESO",
                "questions": grade_data.get('questions', []),
                "timeTaken": grade_data.get('timeTaken', 0)
            }
        else:
            payload = {
                "grade": 8.5,
                "maxGrade": 10,
                "gradeLabel": "Notable",
                "subject": "Matemáticas",
                "gradeLevel": "3º ESO",
                "questions": [
                    {
                        "number": 1,
                        "studentAnswer": "42",
                        "correctAnswer": "42",
                        "pointsAwarded": 2.0,
                        "maxPoints": 2.0,
                        "feedback": "Correcto"
                    }
                ],
                "timeTaken": 3.5
            }
        
        print(f"Saving result with grade: {payload['grade']}/{payload['maxGrade']}")
        
        response = requests.post(
            f"{BASE_URL}/save-result",
            json=payload,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('id'):
                print(f"✅ PASS: Save result endpoint working, ID: {data['id']}")
                return True, data['id']
            else:
                print("❌ FAIL: Save result endpoint returned unexpected data")
                return False, None
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False, None
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred - {str(e)}")
        return False, None

def test_get_results_endpoint():
    """Test GET /api/results"""
    print("\n" + "="*60)
    print("TEST 4: GET /api/results")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/results", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Keys: {list(data.keys())}")
            print(f"Success: {data.get('success')}")
            
            if isinstance(data.get('results'), list):
                print(f"Results Count: {len(data['results'])}")
                if len(data['results']) > 0:
                    print(f"First Result Sample: {data['results'][0]}")
                print("✅ PASS: Get results endpoint working correctly")
                return True
            else:
                print("❌ FAIL: Results is not an array")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred - {str(e)}")
        return False

def main():
    """Run all backend tests"""
    print("\n" + "="*60)
    print("CORRECTOR DE EXAMENES - BACKEND API TEST SUITE")
    print("="*60)
    print(f"Testing Backend: {BASE_URL}")
    print(f"Started at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {}
    
    # Test 1: Health check
    results['health'] = test_health_endpoint()
    
    # Test 2: Grade endpoint (AI grading)
    grade_success, grade_data = test_grade_endpoint()
    results['grade'] = grade_success
    
    # Test 3: Save result
    save_success, saved_id = test_save_result_endpoint(grade_data)
    results['save_result'] = save_success
    
    # Test 4: Get results
    results['get_results'] = test_get_results_endpoint()
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print(f"Completed at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    return all(results.values())

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
