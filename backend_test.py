#!/usr/bin/env python3
"""
Backend Test Suite for Stadtwache Admin Endpoints
Tests the new admin endpoints for vacation management, attendance, and team status.
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import sys
import os

# Configuration
BASE_URL = "https://ladrunter.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class StadtwacheAdminTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.admin_user = None
        self.test_user_id = None
        self.test_vacation_id = None
        self.test_team_id = None
        self.test_district_id = None
        
    def log(self, message, level="INFO"):
        """Log test messages"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def create_admin_user(self):
        """Create or get admin user for testing"""
        try:
            # Try to create first admin user
            admin_data = {
                "email": "admin@example.com",
                "username": "TestAdmin",
                "password": "AdminTest123!",
                "role": "admin"
            }
            
            response = self.session.post(f"{API_BASE}/admin/create-first-user", json=admin_data)
            
            if response.status_code == 200:
                self.log("✅ Admin user created successfully")
                return True
            elif response.status_code == 400 and "Users already exist" in response.text:
                self.log("ℹ️ Admin user already exists, will try to login")
                return True
            else:
                self.log(f"❌ Failed to create admin user: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Error creating admin user: {str(e)}")
            return False
    
    def login_admin(self):
        """Login as admin user"""
        try:
            login_data = {
                "email": "admin@example.com",
                "password": "AdminTest123!"
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data["access_token"]
                self.admin_user = data["user"]
                self.session.headers.update({"Authorization": f"Bearer {self.admin_token}"})
                self.log("✅ Admin login successful")
                return True
            else:
                self.log(f"❌ Admin login failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Error during admin login: {str(e)}")
            return False
    
    def create_test_user(self):
        """Create a test user for vacation requests"""
        try:
            user_data = {
                "email": f"testuser{uuid.uuid4().hex[:8]}@example.com",
                "username": f"TestUser{uuid.uuid4().hex[:6]}",
                "password": "TestUser123!",
                "role": "police",
                "badge_number": "T001",
                "department": "Patrol"
            }
            
            response = self.session.post(f"{API_BASE}/auth/register", json=user_data)
            
            if response.status_code == 200:
                user = response.json()
                self.test_user_id = user["id"]
                self.log(f"✅ Test user created: {user['username']}")
                return True
            else:
                self.log(f"❌ Failed to create test user: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Error creating test user: {str(e)}")
            return False
    
    def create_test_vacation_request(self):
        """Create a vacation request for testing approval"""
        try:
            # First login as the test user to create vacation request
            login_data = {
                "email": f"testuser{uuid.uuid4().hex[:8]}@example.com",
                "password": "TestUser123!"
            }
            
            # Create vacation request data
            vacation_data = {
                "start_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
                "end_date": (datetime.now() + timedelta(days=35)).strftime("%Y-%m-%d"),
                "reason": "Jahresurlaub - Familienzeit"
            }
            
            # Use admin session to create vacation directly in database
            vacation_dict = {
                "id": str(uuid.uuid4()),
                "user_id": self.test_user_id,
                "user_name": "TestUser",
                "start_date": vacation_data["start_date"],
                "end_date": vacation_data["end_date"],
                "reason": vacation_data["reason"],
                "status": "pending",
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Create vacation request via API
            response = self.session.post(f"{API_BASE}/vacations", json=vacation_data)
            
            if response.status_code == 200:
                vacation = response.json()
                self.test_vacation_id = vacation["id"]
                self.log(f"✅ Test vacation request created: {self.test_vacation_id}")
                return True
            else:
                self.log(f"❌ Failed to create vacation request: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Error creating vacation request: {str(e)}")
            return False
    
    def create_test_district_and_team(self):
        """Create test district and team for testing"""
        try:
            # Create district
            district_data = {
                "name": "Test Bezirk Nord",
                "area_description": "Nördlicher Stadtbereich für Tests"
            }
            
            response = self.session.post(f"{API_BASE}/admin/districts", json=district_data)
            
            if response.status_code == 200:
                district = response.json()
                self.test_district_id = district["id"]
                self.log(f"✅ Test district created: {district['name']}")
            else:
                self.log(f"❌ Failed to create test district: {response.status_code} - {response.text}")
                return False
            
            # Create team
            team_data = {
                "name": "Test Team Alpha",
                "district_id": self.test_district_id
            }
            
            response = self.session.post(f"{API_BASE}/admin/teams", json=team_data)
            
            if response.status_code == 200:
                team = response.json()
                self.test_team_id = team["id"]
                self.log(f"✅ Test team created: {team['name']}")
                return True
            else:
                self.log(f"❌ Failed to create test team: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Error creating test district/team: {str(e)}")
            return False
    
    def test_vacation_approval_endpoint(self):
        """Test /api/admin/vacations/{vacation_id}/approve endpoint"""
        self.log("🧪 Testing vacation approval endpoint...")
        
        if not self.test_vacation_id:
            self.log("❌ No test vacation ID available")
            return False
        
        try:
            # Test approval
            approval_data = {
                "action": "approve",
                "reason": "Genehmigt - ausreichend Personal verfügbar"
            }
            
            response = self.session.put(
                f"{API_BASE}/admin/vacations/{self.test_vacation_id}/approve",
                json=approval_data
            )
            
            if response.status_code == 200:
                vacation = response.json()
                if vacation.get("status") == "approved":
                    self.log("✅ Vacation approval test passed")
                    return True
                else:
                    self.log(f"❌ Vacation status not updated correctly: {vacation.get('status')}")
                    return False
            else:
                self.log(f"❌ Vacation approval failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Error testing vacation approval: {str(e)}")
            return False
    
    def test_admin_vacations_endpoint(self):
        """Test /api/admin/vacations endpoint"""
        self.log("🧪 Testing admin vacations list endpoint...")
        
        try:
            response = self.session.get(f"{API_BASE}/admin/vacations")
            
            if response.status_code == 200:
                vacations = response.json()
                if isinstance(vacations, list):
                    self.log(f"✅ Admin vacations list test passed - Found {len(vacations)} vacation requests")
                    return True
                else:
                    self.log(f"❌ Invalid response format: {type(vacations)}")
                    return False
            else:
                self.log(f"❌ Admin vacations list failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Error testing admin vacations list: {str(e)}")
            return False
    
    def test_attendance_endpoint(self):
        """Test /api/admin/attendance endpoint"""
        self.log("🧪 Testing attendance list endpoint...")
        
        try:
            response = self.session.get(f"{API_BASE}/admin/attendance")
            
            if response.status_code == 200:
                attendance = response.json()
                if isinstance(attendance, list):
                    self.log(f"✅ Attendance list test passed - Found {len(attendance)} users")
                    
                    # Check if attendance data has required fields
                    if attendance:
                        first_user = attendance[0]
                        required_fields = ["id", "username", "status", "team", "district"]
                        missing_fields = [field for field in required_fields if field not in first_user]
                        
                        if not missing_fields:
                            self.log("✅ Attendance data structure is correct")
                            return True
                        else:
                            self.log(f"❌ Missing fields in attendance data: {missing_fields}")
                            return False
                    else:
                        self.log("✅ Attendance list is empty but endpoint works")
                        return True
                else:
                    self.log(f"❌ Invalid response format: {type(attendance)}")
                    return False
            else:
                self.log(f"❌ Attendance list failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Error testing attendance list: {str(e)}")
            return False
    
    def test_team_status_endpoint(self):
        """Test /api/admin/team-status endpoint"""
        self.log("🧪 Testing team status endpoint...")
        
        try:
            response = self.session.get(f"{API_BASE}/admin/team-status")
            
            if response.status_code == 200:
                teams = response.json()
                if isinstance(teams, list):
                    self.log(f"✅ Team status test passed - Found {len(teams)} teams")
                    
                    # Check if team data has required fields
                    if teams:
                        first_team = teams[0]
                        required_fields = ["id", "name", "status", "district", "members", "member_count"]
                        missing_fields = [field for field in required_fields if field not in first_team]
                        
                        if not missing_fields:
                            self.log("✅ Team status data structure is correct")
                            return True
                        else:
                            self.log(f"❌ Missing fields in team status data: {missing_fields}")
                            return False
                    else:
                        self.log("✅ Team status list is empty but endpoint works")
                        return True
                else:
                    self.log(f"❌ Invalid response format: {type(teams)}")
                    return False
            else:
                self.log(f"❌ Team status failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Error testing team status: {str(e)}")
            return False
    
    def test_team_status_update_endpoint(self):
        """Test /api/admin/teams/{team_id}/status endpoint"""
        self.log("🧪 Testing team status update endpoint...")
        
        if not self.test_team_id:
            self.log("❌ No test team ID available")
            return False
        
        try:
            # Test status update
            status_data = {
                "status": "Im Einsatz"
            }
            
            response = self.session.put(
                f"{API_BASE}/admin/teams/{self.test_team_id}/status",
                json=status_data
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("status") == "success":
                    self.log("✅ Team status update test passed")
                    return True
                else:
                    self.log(f"❌ Team status update failed: {result}")
                    return False
            else:
                self.log(f"❌ Team status update failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Error testing team status update: {str(e)}")
            return False
    
    def test_admin_authorization(self):
        """Test that admin authorization is working properly"""
        self.log("🧪 Testing admin authorization...")
        
        try:
            # Remove admin token temporarily
            original_token = self.session.headers.get("Authorization")
            self.session.headers.pop("Authorization", None)
            
            # Try to access admin endpoint without token
            response = self.session.get(f"{API_BASE}/admin/vacations")
            
            if response.status_code == 401:
                self.log("✅ Unauthorized access properly blocked")
                
                # Restore admin token
                if original_token:
                    self.session.headers["Authorization"] = original_token
                
                return True
            else:
                self.log(f"❌ Authorization test failed: {response.status_code}")
                
                # Restore admin token
                if original_token:
                    self.session.headers["Authorization"] = original_token
                
                return False
                
        except Exception as e:
            self.log(f"❌ Error testing authorization: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        self.log("🧪 Testing error handling...")
        
        try:
            # Test invalid vacation ID
            response = self.session.put(
                f"{API_BASE}/admin/vacations/invalid-id/approve",
                json={"action": "approve"}
            )
            
            if response.status_code == 404:
                self.log("✅ Invalid vacation ID properly handled")
            else:
                self.log(f"❌ Invalid vacation ID not handled: {response.status_code}")
                return False
            
            # Test invalid team status
            if self.test_team_id:
                response = self.session.put(
                    f"{API_BASE}/admin/teams/{self.test_team_id}/status",
                    json={"status": "InvalidStatus"}
                )
                
                if response.status_code == 400:
                    self.log("✅ Invalid team status properly handled")
                    return True
                else:
                    self.log(f"❌ Invalid team status not handled: {response.status_code}")
                    return False
            
            return True
            
        except Exception as e:
            self.log(f"❌ Error testing error handling: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all admin endpoint tests"""
        self.log("🚀 Starting Stadtwache Admin Endpoints Test Suite")
        self.log(f"📍 Testing against: {BASE_URL}")
        
        test_results = {}
        
        # Setup phase
        self.log("\n📋 SETUP PHASE")
        test_results["admin_user_creation"] = self.create_admin_user()
        test_results["admin_login"] = self.login_admin()
        test_results["test_user_creation"] = self.create_test_user()
        test_results["test_data_creation"] = self.create_test_district_and_team()
        test_results["vacation_request_creation"] = self.create_test_vacation_request()
        
        # Main tests
        self.log("\n🧪 MAIN TESTS")
        test_results["vacation_approval"] = self.test_vacation_approval_endpoint()
        test_results["admin_vacations_list"] = self.test_admin_vacations_endpoint()
        test_results["attendance_list"] = self.test_attendance_endpoint()
        test_results["team_status"] = self.test_team_status_endpoint()
        test_results["team_status_update"] = self.test_team_status_update_endpoint()
        
        # Security tests
        self.log("\n🔒 SECURITY TESTS")
        test_results["admin_authorization"] = self.test_admin_authorization()
        test_results["error_handling"] = self.test_error_handling()
        
        # Results summary
        self.log("\n📊 TEST RESULTS SUMMARY")
        passed = sum(1 for result in test_results.values() if result)
        total = len(test_results)
        
        for test_name, result in test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{status} {test_name}")
        
        self.log(f"\n🎯 OVERALL RESULT: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 All admin endpoints are working correctly!")
            return True
        else:
            self.log("⚠️ Some tests failed - check the logs above for details")
            return False

def main():
    """Main test execution"""
    tester = StadtwacheAdminTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ Backend admin endpoints test completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Backend admin endpoints test failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()