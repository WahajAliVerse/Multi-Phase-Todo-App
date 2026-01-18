#!/usr/bin/env python3

"""
Simple test script to check if there are any import errors or database issues
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, '/home/wahaj-ali/Desktop/multi-phase-todo/backend')

def test_imports():
    print("Testing imports...")
    try:
        from src.database.connection import engine, Base
        print("✓ Database connection imported successfully")
        
        from src.models.user import User
        from src.models.task import Task
        from src.models.tag import Tag
        print("✓ Models imported successfully")
        
        from src.services.user_service import create_user, get_user_by_username
        print("✓ User service imported successfully")
        
        from src.auth.jwt import create_access_token
        print("✓ Auth module imported successfully")
        
        from src.schemas.user import UserCreateSchema
        print("✓ Schemas imported successfully")
        
        # Try to create tables
        print("\nCreating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✓ Tables created successfully")
        
        # Try to create a session
        print("\nTesting database session...")
        from src.database.session import get_db
        from sqlalchemy.orm import Session
        
        # Create a test session
        db = Session(bind=engine)
        print("✓ Database session created successfully")
        
        # Test creating a user
        print("\nTesting user creation...")
        from src.auth.hashing import get_password_hash
        hashed_password = get_password_hash("testpassword")
        test_user = User(
            username="testuser",
            email="test@example.com",
            hashed_password=hashed_password
        )

        db.add(test_user)
        db.commit()
        print("✓ Test user created successfully")

        # Clean up
        db.delete(test_user)
        db.commit()
        db.close()
        print("✓ Test completed successfully")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = test_imports()
    if success:
        print("\n🎉 All tests passed!")
    else:
        print("\n❌ Some tests failed!")
        sys.exit(1)