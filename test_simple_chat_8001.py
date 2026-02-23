#!/usr/bin/env python
"""Simple chat test to see actual errors"""

import requests
import json

# Login
login_response = requests.post("http://localhost:8001/api/auth/login", json={
    "email": "testuser@example.com",
    "password": "testpass123"
})

if login_response.status_code != 200:
    print(f"Login failed: {login_response.text}")
    exit(1)

token = login_response.json().get('access_token')
print(f"✓ Logged in, token: {token[:50]}...")

# Test chat
cookies = {"access_token": token}
headers = {"Content-Type": "application/json"}

test_messages = [
    "Create a task to buy groceries",
    "What tasks do I have?",
]

for message in test_messages:
    print(f"\n{'='*80}")
    print(f"Testing: {message}")
    print('='*80)
    
    response = requests.post(
        "http://localhost:8001/api/chat/",
        json={"message": message},
        cookies=cookies,
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    result = response.json()
    
    print(f"\nResponse:")
    print(json.dumps(result, indent=2))
    
    if result.get('action', {}).get('type') == 'clarification':
        print("\n⚠️  Got clarification request - intent parsing may have failed!")
    elif result.get('action', {}).get('tool_name'):
        print(f"\n✓ Tool executed: {result['action']['tool_name']}")
