#!/usr/bin/env python3
"""
Backend test for Corrector de Examenes - Supabase Migration Verification
Tests MongoDB to Supabase migration with placeholder credentials
"""

import requests
import json
import sys

# Base URL from environment
BASE_URL = "https://79e8dac9-53c4-4ffa-8246-8b54e78e514a.preview.emergentagent.com"

def test_health_endpoint():
    """Test 1: GET /api/health - Should return 200 with Supabase PostgreSQL"""
    print("\n" + "="*70)
    print("TEST 1: GET /api/health")
    print("="*70)
    
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 200:
            print("❌ FAILED: Expected status 200")
            return False
        
        data = response.json()
        
        if data.get('status') != 'ok':
            print("❌ FAILED: Expected status='ok'")
            return False
        
        if data.get('service') != 'Corrector de Examenes':
            print("❌ FAILED: Expected service='Corrector de Examenes'")
            return False
        
        if data.get('database') != 'Supabase PostgreSQL':
            print(f"❌ FAILED: Expected database='Supabase PostgreSQL', got '{data.get('database')}'")
            return False
        
        print("✅ PASSED: Health endpoint returns correct Supabase PostgreSQL status")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        return False


def test_get_results_graceful_failure():
    """Test 2: GET /api/results - Should fail gracefully with 500 (not crash)"""
    print("\n" + "="*70)
    print("TEST 2: GET /api/results (with placeholder credentials)")
    print("="*70)
    
    try:
        response = requests.get(f"{BASE_URL}/api/results", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # With placeholder credentials, we expect a 500 error with JSON error message
        if response.status_code != 500:
            print(f"⚠️  WARNING: Expected status 500 (graceful failure), got {response.status_code}")
            # Check if it's a valid JSON error response
            try:
                data = response.json()
                if 'error' in data:
                    print("✅ PASSED: Returns JSON error response (graceful failure)")
                    return True
                else:
                    print("❌ FAILED: Response is JSON but missing 'error' field")
                    return False
            except:
                print("❌ FAILED: Response is not valid JSON")
                return False
        
        # Verify it's a JSON error response, not a crash
        try:
            data = response.json()
            if 'error' not in data:
                print("❌ FAILED: Response missing 'error' field")
                return False
            
            print(f"✅ PASSED: Fails gracefully with JSON error: {data.get('error')}")
            return True
            
        except json.JSONDecodeError:
            print("❌ FAILED: Response is not valid JSON (unhandled crash)")
            return False
        
    except requests.exceptions.Timeout:
        print("❌ FAILED: Request timed out")
        return False
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        return False


def test_get_results_with_filter():
    """Test 3: GET /api/results?subject=Matemáticas - Should fail gracefully"""
    print("\n" + "="*70)
    print("TEST 3: GET /api/results?subject=Matemáticas (with placeholder credentials)")
    print("="*70)
    
    try:
        response = requests.get(f"{BASE_URL}/api/results?subject=Matemáticas", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Should fail gracefully with 500
        if response.status_code != 500:
            print(f"⚠️  WARNING: Expected status 500 (graceful failure), got {response.status_code}")
            # Check if it's a valid JSON error response
            try:
                data = response.json()
                if 'error' in data:
                    print("✅ PASSED: Returns JSON error response (graceful failure)")
                    return True
            except:
                pass
        
        # Verify it's a JSON error response
        try:
            data = response.json()
            if 'error' not in data:
                print("❌ FAILED: Response missing 'error' field")
                return False
            
            print(f"✅ PASSED: Fails gracefully with JSON error: {data.get('error')}")
            return True
            
        except json.JSONDecodeError:
            print("❌ FAILED: Response is not valid JSON (unhandled crash)")
            return False
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        return False


def test_post_save_result_graceful_failure():
    """Test 4: POST /api/save-result - Should fail gracefully with 500"""
    print("\n" + "="*70)
    print("TEST 4: POST /api/save-result (with placeholder credentials)")
    print("="*70)
    
    payload = {
        "grade": 7.5,
        "maxGrade": 10,
        "subject": "Matemáticas",
        "gradeLevel": "ESO",
        "gradeLabel": "Notable",
        "studentName": "María González",
        "studentGroup": "3º ESO",
        "questions": [
            {
                "number": 1,
                "studentAnswer": "x=5",
                "correctAnswer": "x=5",
                "pointsAwarded": 2,
                "maxPoints": 2,
                "feedback": "Correcto"
            }
        ],
        "timeTaken": 4.2
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/save-result",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # With placeholder credentials, we expect a 500 error
        if response.status_code != 500:
            print(f"⚠️  WARNING: Expected status 500 (graceful failure), got {response.status_code}")
            # Check if it's a valid JSON error response
            try:
                data = response.json()
                if 'error' in data:
                    print("✅ PASSED: Returns JSON error response (graceful failure)")
                    return True
            except:
                pass
        
        # Verify it's a JSON error response, not a crash
        try:
            data = response.json()
            if 'error' not in data:
                print("❌ FAILED: Response missing 'error' field")
                return False
            
            print(f"✅ PASSED: Fails gracefully with JSON error: {data.get('error')}")
            return True
            
        except json.JSONDecodeError:
            print("❌ FAILED: Response is not valid JSON (unhandled crash)")
            return False
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        return False


def verify_no_mongodb_code():
    """Test 5: Verify NO MongoDB code exists in route.js"""
    print("\n" + "="*70)
    print("TEST 5: Verify NO MongoDB code in route.js")
    print("="*70)
    
    try:
        with open('/app/app/api/[[...path]]/route.js', 'r') as f:
            content = f.read()
        
        # Check for MongoDB references
        mongodb_keywords = ['MongoClient', 'mongodb', 'MONGO_URL', 'mongo.connect']
        found_mongodb = []
        
        for keyword in mongodb_keywords:
            if keyword in content:
                found_mongodb.append(keyword)
        
        if found_mongodb:
            print(f"❌ FAILED: Found MongoDB references: {', '.join(found_mongodb)}")
            return False
        
        # Check for Supabase
        if '@supabase/supabase-js' not in content:
            print("❌ FAILED: Missing @supabase/supabase-js import")
            return False
        
        if 'createClient' not in content:
            print("❌ FAILED: Missing Supabase createClient")
            return False
        
        print("✅ PASSED: No MongoDB code found, Supabase imports present")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        return False


def verify_package_json():
    """Test 6: Verify package.json has Supabase, no MongoDB"""
    print("\n" + "="*70)
    print("TEST 6: Verify package.json dependencies")
    print("="*70)
    
    try:
        with open('/app/package.json', 'r') as f:
            package_data = json.load(f)
        
        dependencies = package_data.get('dependencies', {})
        
        # Check for mongodb
        if 'mongodb' in dependencies:
            print("❌ FAILED: Found mongodb dependency in package.json")
            return False
        
        # Check for Supabase
        if '@supabase/supabase-js' not in dependencies:
            print("❌ FAILED: Missing @supabase/supabase-js dependency")
            return False
        
        supabase_version = dependencies.get('@supabase/supabase-js')
        print(f"✅ PASSED: @supabase/supabase-js@{supabase_version} installed, no mongodb dependency")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        return False


def verify_env_file():
    """Test 7: Verify .env has Supabase credentials"""
    print("\n" + "="*70)
    print("TEST 7: Verify .env has Supabase credentials")
    print("="*70)
    
    try:
        with open('/app/.env', 'r') as f:
            env_content = f.read()
        
        required_vars = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY'
        ]
        
        missing_vars = []
        for var in required_vars:
            if var not in env_content:
                missing_vars.append(var)
        
        if missing_vars:
            print(f"❌ FAILED: Missing environment variables: {', '.join(missing_vars)}")
            return False
        
        # Check for placeholder URL
        if 'https://placeholder.supabase.co' in env_content:
            print("✅ PASSED: All Supabase env vars present (placeholder credentials as expected)")
        else:
            print("✅ PASSED: All Supabase env vars present")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        return False


def verify_sql_file():
    """Test 8: Verify SUPABASE_SETUP.sql contains all 6 tables"""
    print("\n" + "="*70)
    print("TEST 8: Verify SUPABASE_SETUP.sql contains all required tables")
    print("="*70)
    
    try:
        with open('/app/SUPABASE_SETUP.sql', 'r') as f:
            sql_content = f.read()
        
        required_tables = [
            'schools',
            'teachers',
            'exam_results',
            'rubrics',
            'audit_log',
            'consents'
        ]
        
        missing_tables = []
        for table in required_tables:
            # Look for CREATE TABLE statements
            if f'CREATE TABLE IF NOT EXISTS {table}' not in sql_content:
                missing_tables.append(table)
        
        if missing_tables:
            print(f"❌ FAILED: Missing table definitions: {', '.join(missing_tables)}")
            return False
        
        print(f"✅ PASSED: All 6 required tables found in SUPABASE_SETUP.sql")
        return True
        
    except FileNotFoundError:
        print("❌ FAILED: SUPABASE_SETUP.sql file not found")
        return False
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {str(e)}")
        return False


def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("CORRECTOR DE EXAMENES - SUPABASE MIGRATION VERIFICATION")
    print("="*70)
    print(f"Base URL: {BASE_URL}")
    print("Testing with placeholder Supabase credentials")
    
    results = []
    
    # Code verification tests (no API calls)
    results.append(("Verify NO MongoDB code", verify_no_mongodb_code()))
    results.append(("Verify package.json", verify_package_json()))
    results.append(("Verify .env file", verify_env_file()))
    results.append(("Verify SUPABASE_SETUP.sql", verify_sql_file()))
    
    # API endpoint tests
    results.append(("GET /api/health", test_health_endpoint()))
    results.append(("GET /api/results", test_get_results_graceful_failure()))
    results.append(("GET /api/results?subject=Matemáticas", test_get_results_with_filter()))
    results.append(("POST /api/save-result", test_post_save_result_graceful_failure()))
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - Supabase migration verified successfully!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
