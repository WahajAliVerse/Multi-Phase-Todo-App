#!/usr/bin/env python
"""
OpenRouter Quick Configuration Script

This script helps you configure your agent system to use OpenRouter.
"""

import os
import sys
from pathlib import Path

def main():
    print("=" * 70)
    print("OPENROUTER CONFIGURATION SCRIPT")
    print("=" * 70)
    
    # Find .env file
    env_path = Path(__file__).parent / '.env'
    env_example_path = Path(__file__).parent / '.env.example'
    
    print(f"\n✓ Checking for .env file...")
    
    if not env_path.exists():
        print(f"  ⚠️  .env file not found at {env_path}")
        
        if env_example_path.exists():
            print(f"  ℹ️  Found .env.example, copying to .env...")
            import shutil
            shutil.copy(env_example_path, env_path)
            print(f"  ✅ Created .env from .env.example")
        else:
            print(f"  ❌ No .env.example found. Please create .env manually.")
            return False
    
    # Read current .env
    print(f"\n✓ Reading current configuration...")
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    # Check current provider
    current_provider = None
    for line in lines:
        if line.startswith('MODEL_PROVIDER='):
            current_provider = line.strip().split('=')[1]
            break
    
    print(f"  Current provider: {current_provider or 'not set'}")
    
    # Show configuration options
    print("\n" + "=" * 70)
    print("CONFIGURATION OPTIONS FOR OPENROUTER")
    print("=" * 70)
    print("""
To configure OpenRouter, update your .env file with:

# Provider
MODEL_PROVIDER=custom
USE_LITELLM=false

# Model (choose one)
MODEL_NAME=openai/gpt-4.1-mini          # Fast, affordable (recommended)
# MODEL_NAME=openai/gpt-4.1             # Most powerful
# MODEL_NAME=anthropic/claude-3.5-sonnet  # Best for long docs
# MODEL_NAME=google/gemini-2.0-flash    # Best multi-modal
# MODEL_NAME=deepseek/deepseek-v3       # Best value

# OpenRouter API
CUSTOM_BASE_URL=https://openrouter.ai/api/v1
CUSTOM_API_KEY=sk-or-v1-your-actual-api-key-here

# Optional: App attribution
OPENROUTER_REFERER=https://your-app.com
OPENROUTER_TITLE=Your App Name

# Model parameters
MODEL_TEMPERATURE=0.4
MODEL_MAX_TOKENS=700
MODEL_TOP_P=0.9
""")
    
    print("=" * 70)
    print("NEXT STEPS")
    print("=" * 70)
    print("""
1. Get your OpenRouter API key:
   → Visit: https://openrouter.ai/keys
   → Click "Create Key"
   → Copy the key

2. Edit your .env file:
   → Open: {env_path}
   → Replace CUSTOM_API_KEY with your actual key
   → Choose your model (uncomment one)

3. Test the configuration:
   → Run: uv run python test_openrouter.py

4. Monitor usage:
   → Visit: https://openrouter.ai/activity
""")
    
    print("=" * 70)
    print("QUICK START COMMANDS")
    print("=" * 70)
    print(f"""
# Edit .env file
nano {env_path}

# Or use echo to append
echo "CUSTOM_API_KEY=sk-or-v1-your-key-here" >> {env_path}

# Test configuration
uv run python -c "from config import get_model_config; c = get_model_config(); print(f'Provider: {{c.provider}}, Model: {{c.model}}')"

# Run full test
uv run python test_openrouter.py
""")
    
    print("=" * 70)
    print("RESOURCES")
    print("=" * 70)
    print("""
- OpenRouter Dashboard: https://openrouter.ai
- API Keys: https://openrouter.ai/keys
- Usage Stats: https://openrouter.ai/activity
- Model List: https://openrouter.ai/docs/models
- Pricing: https://openrouter.ai/pricing
- Documentation: https://openrouter.ai/docs
""")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
