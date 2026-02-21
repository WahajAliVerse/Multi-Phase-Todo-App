"""
Model Configuration for AI Task Assistant

Supports multiple LLM providers (Gemini, OpenAI, Anthropic) via LiteLLM integration.
Follows OpenAI Agents SDK best practices for model configuration.

Reference: https://github.com/panaversity/learn-agentic-ai/tree/main/01_ai_agents_first/05_model_configuration
"""

from .model_config import (
    ModelProvider,
    ModelConfigService,
    get_model_config,
    initialize_model_config,
    # Exports for backward compatibility
    GEMINI_API_KEY,
    GEMINI_MODEL,
    GEMINI_BASE_URL,
    RATE_LIMIT_REQUESTS,
    RATE_LIMIT_WINDOW,
    BACKEND_API_URL,
    USE_LITELLM,
    MODEL_PROVIDER,
    MODEL_NAME,
    MODEL_TEMPERATURE,
    MODEL_MAX_TOKENS,
    MODEL_TOP_P,
    logger,
)

__all__ = [
    # Service classes
    'ModelProvider',
    'ModelConfigService',
    'get_model_config',
    'initialize_model_config',
    
    # Backward compatibility exports
    'GEMINI_API_KEY',
    'GEMINI_MODEL',
    'GEMINI_BASE_URL',
    'RATE_LIMIT_REQUESTS',
    'RATE_LIMIT_WINDOW',
    'BACKEND_API_URL',
    'USE_LITELLM',
    'MODEL_PROVIDER',
    'MODEL_NAME',
    'MODEL_TEMPERATURE',
    'MODEL_MAX_TOKENS',
    'MODEL_TOP_P',
    'logger',
]
