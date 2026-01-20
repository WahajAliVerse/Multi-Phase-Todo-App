#!/usr/bin/env python3
"""
Debug script to test the login functionality
"""

import sys
import os
sys.path.insert(0, '/home/wahaj-ali/Desktop/multi-phase-todo/backend')

from src.database.connection import engine, Base
from src.models.user import User
from sqlalchemy.orm import Session
from src.auth.hashing import verify_password

def debug_login():
    print("Debugging login functionality...")
    
    # Create a session
    db = Session(bind=engine)
    
    # Try to find a user
    username = "debuguser"
    user = db.query(User).filter(User.username == username).first()
    
    if user:
        print(f"Found user: {user.username}")
        print(f"User email: {user.email}")
        print(f"Hashed password in DB: {user.hashed_password[:50]}...")
        
        # Try to verify the password
        password_attempt = "debugpassword"
        is_valid = verify_password(password_attempt, user.hashed_password)
        print(f"Password verification result for '{password_attempt}': {is_valid}")

        # Try with wrong password
        wrong_password_result = verify_password("wrongpassword", user.hashed_password)
        print(f"Password verification result for 'wrongpassword': {wrong_password_result}")
    else:
        print(f"User '{username}' not found in database")
        # List all users
        all_users = db.query(User).all()
        print("All users in database:")
        for u in all_users:
            print(f"  - {u.username}")
    
    db.close()

if __name__ == "__main__":
    debug_login()