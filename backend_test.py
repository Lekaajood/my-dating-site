#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class ManyBotAPITester:
    def __init__(self, base_url="https://chatflow-builder-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.page_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test_name": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, f"Unsupported method: {method}"

            success = response.status_code == expected_status
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {"message": "Success"}
            else:
                return False, f"Status {response.status_code}, Expected {expected_status}. Response: {response.text[:200]}"
                
        except requests.exceptions.RequestException as e:
            return False, f"Request failed: {str(e)}"

    def test_registration(self):
        """Test user registration with email/password"""
        print("\n🔍 Testing User Registration...")
        
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        test_data = {
            "email": test_email,
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        success, response = self.make_request('POST', 'auth/register', test_data, 200)
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            self.log_test("User Registration", True, f"User created with email: {test_email}")
            return True
        else:
            self.log_test("User Registration", False, str(response))
            return False

    def test_login(self):
        """Test user login with email/password"""
        print("\n🔍 Testing User Login...")
        
        # First register a user
        test_email = f"login_test_{datetime.now().strftime('%H%M%S')}@example.com"
        register_data = {
            "email": test_email,
            "password": "TestPass123!",
            "name": "Login Test User"
        }
        
        # Register user
        success, _ = self.make_request('POST', 'auth/register', register_data, 200)
        if not success:
            self.log_test("User Login (Setup)", False, "Failed to create test user")
            return False
        
        # Now test login
        login_data = {
            "email": test_email,
            "password": "TestPass123!"
        }
        
        success, response = self.make_request('POST', 'auth/login', login_data, 200)
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            self.log_test("User Login", True, f"Login successful for: {test_email}")
            return True
        else:
            self.log_test("User Login", False, str(response))
            return False

    def test_get_user_profile(self):
        """Test getting current user profile"""
        print("\n🔍 Testing Get User Profile...")
        
        if not self.token:
            self.log_test("Get User Profile", False, "No authentication token available")
            return False
        
        success, response = self.make_request('GET', 'auth/me', expected_status=200)
        
        if success and 'id' in response:
            self.log_test("Get User Profile", True, f"Profile retrieved for user: {response.get('name', 'Unknown')}")
            return True
        else:
            self.log_test("Get User Profile", False, str(response))
            return False

    def test_facebook_pages(self):
        """Test Facebook pages CRUD operations"""
        print("\n🔍 Testing Facebook Pages Management...")
        
        if not self.token:
            self.log_test("Facebook Pages", False, "No authentication token available")
            return False
        
        # Test creating a page
        page_data = {
            "page_id": f"test_page_{datetime.now().strftime('%H%M%S')}",
            "page_name": "Test Facebook Page",
            "page_avatar": "https://example.com/avatar.jpg"
        }
        
        success, response = self.make_request('POST', 'pages', page_data, 200)
        
        if success and 'id' in response:
            self.page_id = response['id']
            self.log_test("Create Facebook Page", True, f"Page created: {response['page_name']}")
        else:
            self.log_test("Create Facebook Page", False, str(response))
            return False
        
        # Test getting pages
        success, response = self.make_request('GET', 'pages', expected_status=200)
        
        if success and isinstance(response, list):
            self.log_test("Get Facebook Pages", True, f"Retrieved {len(response)} pages")
        else:
            self.log_test("Get Facebook Pages", False, str(response))
            return False
        
        return True

    def test_broadcasts(self):
        """Test broadcast CRUD operations"""
        print("\n🔍 Testing Broadcasts Management...")
        
        if not self.token or not self.page_id:
            self.log_test("Broadcasts", False, "Missing authentication token or page ID")
            return False
        
        # Test creating a broadcast
        broadcast_data = {
            "page_id": self.page_id,
            "name": "Test Broadcast",
            "message": {
                "text": "This is a test broadcast message",
                "buttons": [
                    {"title": "Visit Website", "url": "https://example.com"}
                ]
            },
            "target_audience": "all"
        }
        
        success, response = self.make_request('POST', 'broadcasts', broadcast_data, 200)
        
        if success and 'id' in response:
            broadcast_id = response['id']
            self.log_test("Create Broadcast", True, f"Broadcast created: {response['name']}")
        else:
            self.log_test("Create Broadcast", False, str(response))
            return False
        
        # Test getting broadcasts
        success, response = self.make_request('GET', f'broadcasts?page_id={self.page_id}', expected_status=200)
        
        if success and isinstance(response, list):
            self.log_test("Get Broadcasts", True, f"Retrieved {len(response)} broadcasts")
        else:
            self.log_test("Get Broadcasts", False, str(response))
            return False
        
        # Test sending broadcast
        success, response = self.make_request('POST', f'broadcasts/{broadcast_id}/send', expected_status=200)
        
        if success:
            self.log_test("Send Broadcast", True, "Broadcast sent successfully")
        else:
            self.log_test("Send Broadcast", False, str(response))
        
        return True

    def test_flows(self):
        """Test flow CRUD operations"""
        print("\n🔍 Testing Flows Management...")
        
        if not self.token or not self.page_id:
            self.log_test("Flows", False, "Missing authentication token or page ID")
            return False
        
        # Test creating a flow
        flow_data = {
            "page_id": self.page_id,
            "name": "Test Flow",
            "description": "A test conversation flow",
            "trigger_type": "welcome",
            "trigger_value": ""
        }
        
        success, response = self.make_request('POST', 'flows', flow_data, 200)
        
        if success and 'id' in response:
            flow_id = response['id']
            self.log_test("Create Flow", True, f"Flow created: {response['name']}")
        else:
            self.log_test("Create Flow", False, str(response))
            return False
        
        # Test getting flows
        success, response = self.make_request('GET', f'flows?page_id={self.page_id}', expected_status=200)
        
        if success and isinstance(response, list):
            self.log_test("Get Flows", True, f"Retrieved {len(response)} flows")
        else:
            self.log_test("Get Flows", False, str(response))
            return False
        
        # Test updating flow
        update_data = {
            "name": "Updated Test Flow",
            "is_active": True
        }
        
        success, response = self.make_request('PATCH', f'flows/{flow_id}', update_data, 200)
        
        if success:
            self.log_test("Update Flow", True, "Flow updated successfully")
        else:
            self.log_test("Update Flow", False, str(response))
        
        return True

    def test_stats(self):
        """Test getting statistics"""
        print("\n🔍 Testing Statistics...")
        
        if not self.token:
            self.log_test("Statistics", False, "No authentication token available")
            return False
        
        success, response = self.make_request('GET', 'stats', expected_status=200)
        
        if success and 'total_subscribers' in response:
            self.log_test("Get Statistics", True, f"Stats retrieved: {response}")
            return True
        else:
            self.log_test("Get Statistics", False, str(response))
            return False

    def test_facebook_oauth_endpoint(self):
        """Test Facebook OAuth endpoint (should return demo mode)"""
        print("\n🔍 Testing Facebook OAuth Endpoint...")
        
        success, response = self.make_request('GET', 'auth/facebook/login', expected_status=200)
        
        if success and 'demo_mode' in response:
            self.log_test("Facebook OAuth Endpoint", True, f"Demo mode: {response['demo_mode']}")
            return True
        else:
            self.log_test("Facebook OAuth Endpoint", False, str(response))
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting ManyBot API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)
        
        # Test Facebook OAuth endpoint first (no auth needed)
        self.test_facebook_oauth_endpoint()
        
        # Test authentication
        if not self.test_registration():
            print("❌ Registration failed, skipping remaining tests")
            return self.get_summary()
        
        if not self.test_login():
            print("❌ Login failed, skipping remaining tests")
            return self.get_summary()
        
        # Test authenticated endpoints
        self.test_get_user_profile()
        
        if self.test_facebook_pages():
            self.test_broadcasts()
            self.test_flows()
        
        self.test_stats()
        
        return self.get_summary()

    def get_summary(self):
        """Get test summary"""
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        summary = {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": f"{success_rate:.1f}%",
            "test_results": self.test_results
        }
        
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.tests_run - self.tests_passed > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test_name']}: {result['details']}")
        
        return summary

def main():
    tester = ManyBotAPITester()
    summary = tester.run_all_tests()
    
    # Save results to file
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    # Return appropriate exit code
    return 0 if summary['failed_tests'] == 0 else 1

if __name__ == "__main__":
    sys.exit(main())