#!/usr/bin/env python
"""
Quick test for Qwen3-14B model on OpenRouter
"""

import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment
load_dotenv(Path('.env'))

from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel, set_tracing_disabled

# Disable tracing
set_tracing_disabled(True)

async def test_qwen():
    print("=" * 70)
    print("TESTING QWEN3-14B ON OPENROUTER")
    print("=" * 70)
    
    # Configuration
    api_key = os.getenv('OPENROUTER_API_KEY')
    base_url = os.getenv('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')
    model_name = os.getenv('MODEL_NAME', 'qwen/qwen3-14b')
    
    print(f"\n✓ Configuration:")
    print(f"  Model: {model_name}")
    print(f"  Base URL: {base_url}")
    print(f"  API Key: {'Set ✓' if api_key else 'Not Set ✗'}")
    
    if not api_key:
        print("\n❌ ERROR: OPENROUTER_API_KEY not set!")
        return False
    
    try:
        # Create client
        print("\n✓ Creating OpenAI client...")
        client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
        )
        
        # Test 1: Simple completion
        print("✓ Test 1: Simple completion...")
        response = await client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "user", "content": "Say 'Hello from Qwen3-14B!'"}
            ],
            max_tokens=30,
        )
        
        print(f"  ✓ Response: {response.choices[0].message.content}")
        print(f"  ✓ Model: {response.model}")
        print(f"  ✓ Tokens: {response.usage.total_tokens}")
        
        # Test 2: With Agent SDK
        print("\n✓ Test 2: Testing with Agent SDK...")
        agent = Agent(
            name="Qwen Test",
            instructions="You are a helpful assistant powered by Qwen3-14B.",
            model=OpenAIChatCompletionsModel(
                model=model_name,
                openai_client=client,
            )
        )
        
        result = await Runner.run(agent, "What is 2 + 2?")
        print(f"  ✓ Agent Response: {result.final_output}")
        
        # Test 3: Task creation simulation
        print("\n✓ Test 3: Simulating task creation...")
        result2 = await Runner.run(
            agent, 
            "I need to create a task to buy groceries tomorrow. Can you help?"
        )
        print(f"  ✓ Response: {result2.final_output[:200]}...")
        
        print("\n" + "=" * 70)
        print("ALL TESTS PASSED! ✅")
        print("=" * 70)
        print(f"\nQwen3-14B is working correctly with OpenRouter!")
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(test_qwen())
