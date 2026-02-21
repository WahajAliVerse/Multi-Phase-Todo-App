#!/usr/bin/env python
"""
Test Intent Parsing with OpenRouter + Qwen3-14B
"""

import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment
load_dotenv(Path(__file__).parent / '.env')

# Disable tracing
os.environ['OPENAI_AGENTS_DISABLE_TRACING'] = '1'

async def test_intent_parsing():
    print("=" * 70)
    print("TESTING INTENT PARSING - OpenRouter + Qwen3-14B")
    print("=" * 70)
    
    from mcp.reasoning import parse_intent
    
    test_cases = [
        "Schedule a meeting next Monday at 3pm",
        "Create a task to buy groceries",
        "What tasks do I have?",
        "Mark the meeting task as complete",
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n[Test {i}] {test}")
        print("-" * 70)
        try:
            result = await parse_intent(test)
            print(f"  ✓ Intent: {result.intent_type}")
            print(f"  ✓ Confidence: {result.confidence}")
            if result.entities:
                print(f"  ✓ Entities: {list(result.entities.keys())}")
        except Exception as e:
            print(f"  ✗ Error: {e}")
    
    print("\n" + "=" * 70)
    print("INTENT PARSING TEST COMPLETE!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test_intent_parsing())
