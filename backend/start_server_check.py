#!/usr/bin/env python3
"""
Simple server startup script to catch any import errors
"""

import sys
import os
import logging

# Add the backend directory to the path
sys.path.insert(0, '/home/wahaj-ali/Desktop/multi-phase-todo/backend')

# Set up basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

try:
    print("Attempting to import the main app...")
    from main import app
    print("✓ Main app imported successfully")
    
    print("Attempting to import FastAPI...")
    from fastapi import FastAPI
    print("✓ FastAPI imported successfully")
    
    print("Attempting to import uvicorn...")
    import uvicorn
    print("✓ Uvicorn imported successfully")
    
    print("All imports successful! Server would start on port 8000.")
    
except ImportError as e:
    print(f"✗ Import error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
except Exception as e:
    print(f"✗ Unexpected error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)