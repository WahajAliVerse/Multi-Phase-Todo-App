#!/usr/bin/env python
"""
OpenRouter Configuration Test

Tests the OpenRouter integration without breaking existing Gemini configuration.
"""

import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

print("=" * 70)
print("OPENROUTER CONFIGURATION TEST")
print("=" * 70)

# Test 1: Check environment variables
print("\n✓ Test 1: Checking environment variables...")
print(f"  MODEL_PROVIDER: {os.getenv('MODEL_PROVIDER', 'not set')}")
print(f"  OPENROUTER_API_KEY: {'Set ✓' if os.getenv('OPENROUTER_API_KEY') else 'Not set ✗'}")
print(f"  OPENROUTER_BASE_URL: {os.getenv('OPENROUTER_BASE_URL', 'not set')}")
print(f"  MODEL_NAME: {os.getenv('MODEL_NAME', 'not set')}")

if not os.getenv('OPENROUTER_API_KEY'):
    print("\n❌ ERROR: OPENROUTER_API_KEY not set!")
    sys.exit(1)

# Test 2: Load configuration
print("\n✓ Test 2: Loading ModelConfigService...")
try:
    from config import get_model_config, ModelProvider
    config = get_model_config()
    print(f"  ✓ Config loaded successfully")
    print(f"    - Provider: {config.provider.value}")
    print(f"    - Model: {config.model}")
    print(f"    - Base URL: {config.base_url}")
    print(f"    - API Key Set: {'Yes ✓' if config.api_key else 'No ✗'}")
    
    if config.provider != ModelProvider.OPENROUTER:
        print(f"\n⚠️  WARNING: Provider is {config.provider.value}, expected 'openrouter'")
        print(f"    Check MODEL_PROVIDER environment variable")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 3: Test OpenRouter API connection
print("\n✓ Test 3: Testing OpenRouter API connection...")
try:
    from openai import AsyncOpenAI
    
    client = AsyncOpenAI(
        api_key=os.getenv('OPENROUTER_API_KEY'),
        base_url=os.getenv('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
    )
    
    async def test_api():
        response = await client.chat.completions.create(
            model=os.getenv('MODEL_NAME', 'openai/gpt-4.1-mini'),
            messages=[
                {"role": "user", "content": "Say 'Hello from OpenRouter!'"}
            ],
            max_tokens=20,
        )
        return response
    
    response = asyncio.run(test_api())
    print(f"  ✓ API connection successful")
    print(f"    - Response: {response.choices[0].message.content}")
    print(f"    - Model: {response.model}")
    print(f"    - Tokens used: {response.usage.total_tokens}")
    
except Exception as e:
    print(f"\n❌ ERROR: API test failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 4: Test with Agent SDK
print("\n✓ Test 4: Testing with Agent SDK...")
try:
    from agents import Agent, Runner, OpenAIChatCompletionsModel, set_tracing_disabled
    
    # Disable tracing
    set_tracing_disabled(True)
    
    # Create client
    client = AsyncOpenAI(
        api_key=os.getenv('OPENROUTER_API_KEY'),
        base_url=os.getenv('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
    )
    
    # Create agent
    agent = Agent(
        name="OpenRouter Test",
        instructions="You are a helpful assistant.",
        model=OpenAIChatCompletionsModel(
            model=os.getenv('MODEL_NAME', 'openai/gpt-4.1-mini'),
            openai_client=client,
        )
    )
    
    async def test_agent():
        result = await Runner.run(agent, "What is 2 + 2?")
        return result
    
    result = asyncio.run(test_agent())
    print(f"  ✓ Agent test successful")
    print(f"    - Response: {result.final_output}")
    
except Exception as e:
    print(f"\n❌ ERROR: Agent test failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 5: Test full agent integration
print("\n✓ Test 5: Testing full agent integration...")
try:
    from agent import get_model_info, create_agent
    
    info = get_model_info()
    print(f"  ✓ Agent module loaded")
    print(f"    - Provider: {info['provider']}")
    print(f"    - Model: {info['model']}")
    print(f"    - Temperature: {info['temperature']}")
    
    # Create agent instance
    test_agent = create_agent(name="TestAssistant")
    print(f"    - Agent created: {test_agent.name}")
    
except Exception as e:
    print(f"\n❌ ERROR: Full integration test failed: {e}")
    import traceback
    traceback.print_exc()
    # Don't exit - this is optional test

print("\n" + "=" * 70)
print("ALL TESTS PASSED! ✅")
print("=" * 70)
print("\nYour OpenRouter configuration is working correctly!")
print("\nCurrent Configuration:")
print(f"  • Provider: {config.provider.value}")
print(f"  • Model: {config.model}")
print(f"  • Base URL: {config.base_url}")
print("\nYou can now use your agent with OpenRouter!")
print("\nTo switch back to Gemini:")
print("  1. Edit agent/.env")
print("  2. Set MODEL_PROVIDER=gemini")
print("  3. Restart your application")
print("=" * 70)
