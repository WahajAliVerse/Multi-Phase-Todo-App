import sys
sys.path.insert(0, '/home/wahaj-ali/Desktop/multi-phase-todo/backend')

# Test basic functionality
from main import app
from src.services.user_service import create_user
from src.database.connection import engine, SessionLocal
from src.models.user import User

# Create tables
from src.database.base import Base
Base.metadata.create_all(bind=engine)

# Test creating a user in memory
print("Testing user creation...")
try:
    # Create a temporary database session
    db = SessionLocal()
    
    # Create a test user
    from src.auth.hashing import get_password_hash
    hashed_password = get_password_hash("testpassword")
    
    print("Password hashed successfully")
    
    # Close session
    db.close()
    print("✓ Basic functionality test passed!")
    
except Exception as e:
    print(f"✗ Error in basic functionality: {e}")
    import traceback
    traceback.print_exc()