#!/usr/bin/env python3
"""
Test POST /api/import-pdf validation
"""

import requests
from io import BytesIO

BASE_URL = "https://exam-grader-ai-1.preview.emergentagent.com/api"

def test_import_pdf_no_file():
    """Test with proper multipart/form-data but no file"""
    print("\nTest 1: Empty multipart/form-data (no 'pdf' field)")
    
    # Send multipart with other fields but no 'pdf' file
    data = {
        'wizardConfig': '{}',
        'pagesPerExam': '1'
    }
    
    response = requests.post(f"{BASE_URL}/import-pdf", data=data, timeout=10)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 400:
        print("✅ Returns 400 (proper validation)")
    elif response.status_code == 500:
        print("⚠️ Returns 500 (should be 400)")
    
    return response.status_code, response.text

def test_import_pdf_empty_file():
    """Test with empty file"""
    print("\nTest 2: Empty file upload")
    
    files = {
        'pdf': ('empty.pdf', BytesIO(b''), 'application/pdf')
    }
    
    response = requests.post(f"{BASE_URL}/import-pdf", files=files, timeout=10)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    return response.status_code, response.text

def test_import_pdf_wrong_type():
    """Test with wrong file type"""
    print("\nTest 3: Wrong file type (text file)")
    
    files = {
        'pdf': ('test.txt', BytesIO(b'Hello World'), 'text/plain')
    }
    
    response = requests.post(f"{BASE_URL}/import-pdf", files=files, timeout=10)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    return response.status_code, response.text

if __name__ == "__main__":
    print("="*80)
    print("Testing POST /api/import-pdf validation")
    print("="*80)
    
    test_import_pdf_no_file()
    test_import_pdf_empty_file()
    test_import_pdf_wrong_type()
