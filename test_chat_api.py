#!/usr/bin/env python
"""Test chat API to see actual errors"""

import requests
import json

# Login
login_response = requests.post("http://localhost:8000/api/auth/login", json={
    "email": "testuser@example.com",
    "password": "testpass123"
})

if login_response.status_code != 200:
    print(f"Login failed: {login_response.text}")
    exit(1)

token = login_response.json().get('access_token')
print(f"✓ Logged in")

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
        "http://localhost:8000/api/chat/",
        json={"message": message},
        cookies=cookies,
        headers=headers,
        timeout=120
    )

    print(f"Status: {response.status_code}")
    result = response.json()

    print(f"\nResponse:")
    print(json.dumps(result, indent=2))

    if result.get('error'):
        print(f"\n❌ Error: {result['error']}")
    elif result.get('action', {}).get('tool_name'):
        print(f"\n✓ Tool executed: {result['action']['tool_name']}")
    elif result.get('action', {}).get('type') == 'clarification':
        print(f"\n⚠️ Clarification needed")
    else:
        print(f"\n✓ Success")
