#!/usr/bin/env python3
"""
Detailed test to debug the registration/login issue
"""

import sys
import os
sys.path.insert(0, '/home/wahaj-ali/Desktop/multi-phase-todo/backend')

from src.database.connection import engine, Base
from src.models.user import User
from sqlalchemy.orm import Session
from src.auth.hashing import get_password_hash, verify_password
from src.services.user_service import create_user, get_user_by_username

def test_registration_vs_login():
    print("Testing registration vs login process in detail...")
    
    # Create a session
    db = Session(bind=engine)
    
    # Test data
    username = "debugtestuser"
    email = "debugtest@example.com"
    password = "debugtestpassword"
    
    print(f"1. Creating user: {username}")
    
    # Step 1: Hash the password using the same function as registration
    hashed_password_registration = get_password_hash(password)
    print(f"   Password hashed during registration: {hashed_password_registration[:50]}...")
    
    # Step 2: Create the user using the service function (same as registration)
    user = create_user(db, username, email, password)
    print(f"   User created with ID: {user.id}")
    
    # Step 3: Commit the transaction to ensure it's saved to DB
    db.commit()
    
    # Step 4: Query the user from the database (same as login process)
    db_user = get_user_by_username(db, username)
    if db_user:
        print(f"   Retrieved user from DB: {db_user.username}")
        print(f"   DB stored hashed password: {db_user.hashed_password[:50]}...")
        
        # Step 5: Verify the password using the same function as login
        is_valid = verify_password(password, db_user.hashed_password)
        print(f"   Password verification result: {is_valid}")
        
        # Step 6: Try with wrong password
        is_invalid = verify_password("wrongpassword", db_user.hashed_password)
        print(f"   Wrong password verification result: {is_invalid}")
        
        # Step 7: Compare the hashes (they should be different due to bcrypt salting)
        print(f"   Registration hash equals DB hash: {hashed_password_registration == db_user.hashed_password}")
    else:
        print(f"   ERROR: User not found in database!")
        
        # List all users to see what's in the DB
        all_users = db.query(User).all()
        print(f"   All users in DB: {[u.username for u in all_users]}")
    
    # Clean up
    if db_user:
        db.delete(db_user)
        db.commit()
    
    db.close()
    print("Test completed.")

if __name__ == "__main__":
    test_registration_vs_login()