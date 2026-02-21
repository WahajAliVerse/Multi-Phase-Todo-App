#!/usr/bin/env python
"""
Comprehensive Chat API Test Based on Specs
Tests ALL features from spec.md User Stories 1-4
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def get_session_token():
    """Login and get session token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "testuser@example.com",
        "password": "testpass123"
    })
    if response.status_code == 200:
        return response.json().get('access_token')
    return None

def test_chat(message, token, test_name, expected_action_type=None):
    """Send chat message and verify response"""
    cookies = {"access_token": token}
    headers = {"Content-Type": "application/json"}
    
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"Input: '{message}'")
    print('-'*80)
    
    response = requests.post(
        f"{BASE_URL}/api/chat/",
        json={"message": message},
        cookies=cookies,
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"❌ FAILED: HTTP {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    result = response.json()
    
    # Check if it's an error response
    if not result.get('success') and result.get('error'):
        print(f"❌ FAILED: {result['error'].get('message', 'Unknown error')}")
        return False
    
    # Extract response details
    message_content = result.get('message', {}).get('content', '')[:200]
    action = result.get('action', {})
    action_type = action.get('type') if action else None
    tool_name = action.get('tool_name') if action else None
    intent_type = action.get('intent_type') if action else None
    clarification = result.get('clarification')
    
    print(f"Intent: {intent_type}")
    print(f"Action: {action_type}")
    print(f"Tool: {tool_name}")
    print(f"Response: {message_content}...")
    
    # Check if clarification was requested
    if clarification:
        questions = clarification.get('questions', [])
        entities = clarification.get('entities', {})
        print(f"Clarification needed: {questions}")
        print(f"Entities extracted: {entities}")
        
        # For some tests, clarification is acceptable
        if expected_action_type == "clarification":
            print(f"✓ PASSED (Clarification expected)")
            return True
    
    # Check if expected action type matches
    if expected_action_type:
        if action_type == expected_action_type or (tool_name and expected_action_type in tool_name):
            print(f"✓ PASSED")
            return True
        else:
            print(f"❌ FAILED: Expected {expected_action_type}, got {action_type}")
            return False
    
    # If no expectation, just check we got a valid response
    if action_type or tool_name:
        print(f"✓ PASSED (Action executed)")
        return True
    elif message_content:
        print(f"✓ PASSED (Response received)")
        return True
    else:
        print(f"❌ FAILED: No valid response")
        return False

def main():
    """Run all spec-based tests"""
    print("="*80)
    print(" "*20 + "CHAT API SPECIFICATION TEST")
    print(" "*25 + "Qwen3-14B + OpenRouter")
    print("="*80)
    
    # Get session token
    print("\n[SETUP] Logging in...")
    token = get_session_token()
    if not token:
        print("❌ FAILED: Could not login")
        sys.exit(1)
    print("✓ Logged in successfully")
    
    tests_passed = 0
    tests_failed = 0
    tests_total = 0
    
    # ========================================================================
    # USER STORY 1: Chat-Based Task Creation
    # ========================================================================
    print("\n" + "="*80)
    print("USER STORY 1: Chat-Based Task Creation")
    print("="*80)
    
    # Test 1.1: Simple task creation
    tests_total += 1
    if test_chat(
        "Create a task to buy groceries tomorrow",
        token,
        "Simple Task Creation",
        expected_action_type="create_task"
    ):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Test 1.2: Task with specific time
    tests_total += 1
    if test_chat(
        "Add task to call mom next Monday at 2pm",
        token,
        "Task with Specific Time",
        expected_action_type="create_task"
    ):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Test 1.3: Incomplete information (should ask clarification)
    tests_total += 1
    if test_chat(
        "Create a meeting",
        token,
        "Incomplete Info - Should Ask Clarification",
        expected_action_type="clarification"
    ):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # ========================================================================
    # USER STORY 2: Natural Language Task Updates
    # ========================================================================
    print("\n" + "="*80)
    print("USER STORY 2: Natural Language Task Updates")
    print("="*80)
    
    # Test 2.1: Reschedule task
    tests_total += 1
    if test_chat(
        "Reschedule dentist appointment to next Friday at 3pm",
        token,
        "Reschedule Task",
        expected_action_type="update_task"
    ):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Test 2.2: Change priority
    tests_total += 1
    if test_chat(
        "Make budget report high priority",
        token,
        "Change Priority",
        expected_action_type="update_task"
    ):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Test 2.3: Mark as complete
    tests_total += 1
    if test_chat(
        "Mark the meeting as complete",
        token,
        "Mark Task Complete",
        expected_action_type="update_task"
    ):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # ========================================================================
    # USER STORY 3: Task Queries
    # ========================================================================
    print("\n" + "="*80)
    print("USER STORY 3: Intelligent Task Queries")
    print("="*80)
    
    # Test 3.1: Query all tasks
    tests_total += 1
    if test_chat(
        "What tasks do I have?",
        token,
        "Query All Tasks",
        expected_action_type="query_tasks"
    ):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Test 3.2: Query today's tasks
    tests_total += 1
    if test_chat(
        "What's due today?",
        token,
        "Query Today's Tasks",
        expected_action_type="query_tasks"
    ):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # ========================================================================
    # USER STORY 4: Tag Management
    # ========================================================================
    print("\n" + "="*80)
    print("USER STORY 4: Tag Management")
    print("="*80)
    
    # Test 4.1: Create tag
    tests_total += 1
    if test_chat(
        "Create a work tag in red",
        token,
        "Create Tag",
        expected_action_type="create_tag"
    ):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Test 4.2: Query tags
    tests_total += 1
    if test_chat(
        "Show me all my tags",
        token,
        "Query Tags",
        expected_action_type="query_tags"
    ):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # ========================================================================
    # SUMMARY
    # ========================================================================
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"Total Tests: {tests_total}")
    print(f"Passed: {tests_passed} ({tests_passed/tests_total*100:.1f}%)")
    print(f"Failed: {tests_failed}")
    print("="*80)
    
    if tests_failed == 0:
        print("\n🎉 ALL TESTS PASSED! Chat API meets specifications!")
        return 0
    else:
        print(f"\n⚠️  {tests_failed} test(s) failed. See details above.")
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except Exception as e:
        print(f"\n❌ Test suite error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
