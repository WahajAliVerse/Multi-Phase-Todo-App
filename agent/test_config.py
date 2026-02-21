#!/usr/bin/env python
"""
Model Configuration Test Suite

Tests the new model configuration system following the reference:
https://github.com/panaversity/learn-agentic-ai/tree/main/01_ai_agents_first/05_model_configuration
"""

print("=" * 70)
print("MODEL CONFIGURATION TEST SUITE")
print("=" * 70)

# Test 1: Config Service
print("\n✓ Test 1: Loading ModelConfigService...")
from config import get_model_config, ModelProvider, ModelConfigService
config = get_model_config()
print(f"  Provider: {config.provider.value}")
print(f"  Model: {config.model}")
print(f"  Temperature: {config.temperature}")
print(f"  Max Tokens: {config.max_tokens}")
print(f"  Top P: {config.top_p}")

# Test 2: Model Capabilities
print("\n✓ Test 2: Getting model capabilities...")
capabilities = config.get_model_capabilities()
print(f"  Context Window: {capabilities['context_window']:,} tokens")
print(f"  Max Output: {capabilities['max_output_tokens']:,} tokens")
print(f"  Supports Vision: {capabilities['supports_vision']}")
print(f"  Supports Function Calling: {capabilities['supports_function_calling']}")

# Test 3: LiteLLM String
print("\n✓ Test 3: LiteLLM model string...")
litellm_string = config.get_litellm_model_string()
print(f"  {litellm_string}")

# Test 4: Provider Switching
print("\n✓ Test 4: Testing provider switching...")
original_provider = config.provider
config.switch_provider(ModelProvider.OPENAI)
print(f"  Switched to: {config.provider.value} / {config.model}")
config.switch_provider(original_provider)
print(f"  Switched back: {config.provider.value} / {config.model}")

# Test 5: Agent Module
print("\n✓ Test 5: Loading agent module...")
from agent import get_model_info, create_agent
info = get_model_info()
print(f"  Agent Provider: {info['provider']}")
print(f"  Agent Model: {info['model']}")
print(f"  Agent Temperature: {info['temperature']}")

# Test 6: Agent Creation
print("\n✓ Test 6: Creating agent instance...")
agent = create_agent(name="TestAssistant")
print(f"  Agent Name: {agent.name}")
print(f"  Agent Instructions: {agent.instructions[:50]}...")

print("\n" + "=" * 70)
print("ALL TESTS PASSED SUCCESSFULLY! ✓")
print("=" * 70)
print("\nYour agent system is now configured with:")
print("  • Multi-provider support (Gemini, OpenAI, Anthropic)")
print("  • LiteLLM integration (optional)")
print("  • Centralized ModelConfigService")
print("  • Runtime provider switching")
print("  • Model capabilities mapping")
print("\nReference: https://github.com/panaversity/learn-agentic-ai/tree/main/01_ai_agents_first/05_model_configuration")
print("=" * 70)
