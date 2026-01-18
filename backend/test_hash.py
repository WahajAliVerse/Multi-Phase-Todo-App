#!/usr/bin/env python3

"""
Simple test to check the password hashing functionality
"""

from src.auth.hashing import get_password_hash

def test_password_hash():
    try:
        print("Testing password hash function...")
        password = "testpassword"
        print(f"Original password: {password}")
        
        hashed = get_password_hash(password)
        print(f"Hashed password: {hashed}")
        print("✓ Password hashing works correctly")
        return True
    except Exception as e:
        print(f"✗ Error in password hashing: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_password_hash()