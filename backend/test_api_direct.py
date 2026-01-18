#!/usr/bin/env python3
"""
Direct API test to debug the login issue
"""

import requests
import json

# Test the API endpoints directly
BASE_URL = "http://localhost:8000/api/v1"

def test_api_endpoints():
    print("Testing API endpoints directly...")
    
    # Test registration
    print("\n1. Testing registration:")
    reg_response = requests.post(
        f"{BASE_URL}/auth/register",
        headers={"Content": "application/json"},
        json={
            "username": "apitestuser",
            "email": "apitest@example.com", 
            "password": "apitestpassword"
        }
    )
    print(f"Registration status: {reg_response.status_code}")
    print(f"Registration response: {reg_response.text}")
    
    if reg_response.status_code == 200:
        print("\n2. Testing login with registered user:")
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            headers={"Content-Type": "application/json"},
            json={
                "username": "apitestuser",
                "password": "apitestpassword"
            }
        )
        print(f"Login status: {login_response.status_code}")
        print(f"Login response: {login_response.text}")
    else:
        print(f"\nRegistration failed with status {reg_response.status_code}")

if __name__ == "__main__":
    test_api_endpoints()