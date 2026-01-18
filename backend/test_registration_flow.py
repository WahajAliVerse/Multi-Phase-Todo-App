#!/usr/bin/env python3
"""
Comprehensive test to debug the registration and login process
"""

import sys
import os
sys.path.insert(0, '/home/wahaj-ali/Desktop/multi-phase-todo/backend')

from src.database.connection import engine, Base
from src.models.user import User
from sqlalchemy.orm import Session
from src.auth.hashing import get_password_hash, verify_password
from src.services.user_service import create_user

def test_registration_and_login():
    print("Testing registration and login process...")
    
    # Create a session
    db = Session(bind=engine)
    
    # Create a test user manually using the same function as registration
    username = "testreglogin"
    email = "testreglogin@example.com"
    password = "testregpassword"
    
    print(f"Creating user: {username} with password: {password}")
    
    # Hash the password the same way the registration does
    hashed_password = get_password_hash(password)
    print(f"Hashed password: {hashed_password[:50]}...")
    
    # Create the user using the service function
    user = create_user(db, username, email, password)
    print(f"User created with ID: {user.id}")
    
    # Now try to verify the password directly from the database
    db_user = db.query(User).filter(User.username == username).first()
    if db_user:
        print(f"Retrieved user from DB: {db_user.username}")
        print(f"DB hashed password: {db_user.hashed_password[:50]}...")
        
        # Verify the password
        is_valid = verify_password(password, db_user.hashed_password)
        print(f"Password verification result: {is_valid}")
        
        # Verify with wrong password
        is_invalid = verify_password("wrongpassword", db_user.hashed_password)
        print(f"Wrong password verification result: {is_invalid}")
    
    # Clean up
    if db_user:
        db.delete(db_user)
        db.commit()
    
    db.close()
    print("Test completed.")

if __name__ == "__main__":
    test_registration_and_login()