"""
Model Configuration Service for AI Task Assistant

Supports multiple LLM providers (Gemini, OpenAI, Anthropic) via LiteLLM integration.
Follows OpenAI Agents SDK best practices for model configuration.

Reference: https://github.com/panaversity/learn-agentic-ai/tree/main/01_ai_agents_first/05_model_configuration
"""

import os
from dotenv import load_dotenv
import logging
from pathlib import Path
from typing import Optional, Dict, Any, Literal
from enum import Enum

# Load environment variables from agent/.env file
# This ensures the correct model configuration is loaded regardless of working directory
agent_env_path = Path(__file__).parent.parent / ".env"
load_dotenv(agent_env_path)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ModelProvider(str, Enum):
    """Supported LLM providers."""
    GEMINI = "gemini"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    CUSTOM = "custom"
    OPENROUTER = "openrouter"  # Added OpenRouter support


class ModelConfigService:
    """
    Centralized model configuration service.
    
    Provides deterministic control over model generation, decoupling the
    requested model identifier from the underlying provider implementation.
    
    Supports:
    - Google Gemini via LiteLLM or OpenAI-compatible endpoint
    - OpenAI GPT models
    - Anthropic Claude via LiteLLM
    - Custom OpenAI-compatible endpoints
    """
    
    # Default model mappings
    DEFAULT_MODELS: Dict[ModelProvider, str] = {
        ModelProvider.GEMINI: "gemini-2.0-flash",
        ModelProvider.OPENAI: "gpt-4.1-mini",
        ModelProvider.ANTHROPIC: "claude-3-5-sonnet-20240620",
        ModelProvider.OPENROUTER: "openai/gpt-4.1-mini",  # OpenRouter default
    }
    
    # Model capabilities mapping
    MODEL_CAPABILITIES: Dict[str, Dict[str, Any]] = {
        # Gemini models
        "gemini-2.0-flash": {
            "context_window": 1048576,
            "max_output_tokens": 8192,
            "supports_vision": True,
            "supports_function_calling": True,
            "provider": ModelProvider.GEMINI,
        },
        "gemini-2.5-flash-preview-04-17": {
            "context_window": 1048576,
            "max_output_tokens": 8192,
            "supports_vision": True,
            "supports_function_calling": True,
            "provider": ModelProvider.GEMINI,
        },
        # OpenAI models
        "gpt-4.1-mini": {
            "context_window": 128000,
            "max_output_tokens": 16384,
            "supports_vision": True,
            "supports_function_calling": True,
            "provider": ModelProvider.OPENAI,
        },
        "gpt-5.2": {
            "context_window": 128000,
            "max_output_tokens": 32768,
            "supports_vision": True,
            "supports_function_calling": True,
            "provider": ModelProvider.OPENAI,
        },
        # Anthropic models
        "claude-3-5-sonnet-20240620": {
            "context_window": 200000,
            "max_output_tokens": 8192,
            "supports_vision": True,
            "supports_function_calling": True,
            "provider": ModelProvider.ANTHROPIC,
        },
        # Qwen models (OpenRouter)
        "qwen/qwen3-14b": {
            "context_window": 131072,
            "max_output_tokens": 8192,
            "supports_vision": False,
            "supports_function_calling": True,
            "provider": ModelProvider.OPENROUTER,
        },
        "qwen/qwen-2.5-72b-instruct": {
            "context_window": 131072,
            "max_output_tokens": 8192,
            "supports_vision": False,
            "supports_function_calling": True,
            "provider": ModelProvider.OPENROUTER,
        },
        # DeepSeek models (OpenRouter)
        "deepseek/deepseek-v3": {
            "context_window": 131072,
            "max_output_tokens": 8192,
            "supports_vision": False,
            "supports_function_calling": True,
            "provider": ModelProvider.OPENROUTER,
        },
    }
    
    def __init__(self):
        """Initialize model configuration service."""
        self._provider = self._detect_provider()
        self._model = self._load_model()
        self._api_key = self._load_api_key()
        self._base_url = self._load_base_url()
        self._temperature = self._load_temperature()
        self._max_tokens = self._load_max_tokens()
        self._top_p = self._load_top_p()
        
        logger.info(f"ModelConfigService initialized with provider={self._provider}, model={self._model}")
    
    def _detect_provider(self) -> ModelProvider:
        """Detect which provider to use based on environment variables."""
        provider_env = os.getenv("MODEL_PROVIDER", "").lower()
        
        if provider_env:
            try:
                return ModelProvider(provider_env)
            except ValueError:
                logger.warning(f"Unknown provider '{provider_env}', defaulting to Gemini")
        
        # Auto-detect based on available API keys and configuration
        # Check for OpenRouter first (if explicitly configured)
        if os.getenv("OPENROUTER_API_KEY"):
            return ModelProvider.OPENROUTER
        elif os.getenv("GEMINI_API_KEY"):
            return ModelProvider.GEMINI
        elif os.getenv("OPENAI_API_KEY"):
            return ModelProvider.OPENAI
        elif os.getenv("ANTHROPIC_API_KEY"):
            return ModelProvider.ANTHROPIC
        else:
            logger.warning("No API keys found, defaulting to Gemini")
            return ModelProvider.GEMINI
    
    def _load_model(self) -> str:
        """Load model name from environment or use default."""
        model_env = os.getenv("MODEL_NAME")
        if model_env:
            return model_env
        
        # Use default for detected provider
        return self.DEFAULT_MODELS.get(self._provider, "gemini-2.0-flash")
    
    def _load_api_key(self) -> Optional[str]:
        """Load API key based on provider."""
        key_map = {
            ModelProvider.GEMINI: "GEMINI_API_KEY",
            ModelProvider.OPENAI: "OPENAI_API_KEY",
            ModelProvider.ANTHROPIC: "ANTHROPIC_API_KEY",
            ModelProvider.CUSTOM: "CUSTOM_API_KEY",
            ModelProvider.OPENROUTER: "OPENROUTER_API_KEY",  # OpenRouter key
        }
        
        env_var = key_map.get(self._provider, "GEMINI_API_KEY")
        api_key = os.getenv(env_var)
        
        if not api_key:
            logger.warning(f"{env_var} not set. Model calls may fail.")
        
        return api_key
    
    def _load_base_url(self) -> Optional[str]:
        """Load custom base URL if using custom provider or OpenRouter."""
        if self._provider == ModelProvider.OPENROUTER:
            # Use OpenRouter base URL
            return os.getenv(
                "OPENROUTER_BASE_URL",
                "https://openrouter.ai/api/v1"
            )
        elif self._provider == ModelProvider.CUSTOM:
            return os.getenv("CUSTOM_BASE_URL")
        elif self._provider == ModelProvider.GEMINI:
            # Support both LiteLLM and direct OpenAI-compatible endpoint
            use_litellm = os.getenv("USE_LITELLM", "false").lower() == "true"
            if use_litellm:
                return None  # LiteLLM handles routing
            return os.getenv(
                "GEMINI_BASE_URL",
                "https://generativelanguage.googleapis.com/v1beta/openai/"
            )
        return None
    
    def _load_temperature(self) -> float:
        """Load temperature setting."""
        try:
            return float(os.getenv("MODEL_TEMPERATURE", "0.4"))
        except ValueError:
            return 0.4
    
    def _load_max_tokens(self) -> int:
        """Load max tokens setting."""
        try:
            return int(os.getenv("MODEL_MAX_TOKENS", "700"))
        except ValueError:
            return 700
    
    def _load_top_p(self) -> float:
        """Load top_p setting."""
        try:
            return float(os.getenv("MODEL_TOP_P", "0.9"))
        except ValueError:
            return 0.9
    
    @property
    def provider(self) -> ModelProvider:
        """Get current provider."""
        return self._provider
    
    @property
    def model(self) -> str:
        """Get current model name."""
        return self._model
    
    @property
    def api_key(self) -> Optional[str]:
        """Get API key."""
        return self._api_key
    
    @property
    def base_url(self) -> Optional[str]:
        """Get base URL."""
        return self._base_url
    
    @property
    def temperature(self) -> float:
        """Get temperature setting."""
        return self._temperature
    
    @property
    def max_tokens(self) -> int:
        """Get max tokens setting."""
        return self._max_tokens
    
    @property
    def top_p(self) -> float:
        """Get top_p setting."""
        return self._top_p
    
    def get_litellm_model_string(self) -> str:
        """
        Get LiteLLM-compatible model string.
        
        Returns:
            Model string in format: litellm/<provider>/<model_name>
        """
        # Special handling for OpenRouter - use the model name directly
        if self._provider == ModelProvider.OPENROUTER:
            # OpenRouter models are already in provider/model format
            return self._model
        
        provider_map = {
            ModelProvider.GEMINI: "gemini",
            ModelProvider.OPENAI: "openai",
            ModelProvider.ANTHROPIC: "anthropic",
        }
        
        provider_str = provider_map.get(self._provider, "gemini")
        return f"litellm/{provider_str}/{self._model}"
    
    def get_model_capabilities(self) -> Dict[str, Any]:
        """Get capabilities of current model."""
        return self.MODEL_CAPABILITIES.get(self._model, {
            "context_window": 128000,
            "max_output_tokens": 8192,
            "supports_vision": False,
            "supports_function_calling": True,
            "provider": self._provider,
        })
    
    def get_model_settings_dict(self) -> Dict[str, Any]:
        """Get model settings as dictionary."""
        return {
            "temperature": self._temperature,
            "max_tokens": self._max_tokens,
            "top_p": self._top_p,
        }
    
    def switch_provider(self, provider: ModelProvider, api_key: Optional[str] = None) -> None:
        """
        Switch to a different provider.
        
        Args:
            provider: New provider to use
            api_key: Optional API key (uses env var if not provided)
        """
        self._provider = provider
        self._model = self.DEFAULT_MODELS.get(provider, "gemini-2.0-flash")
        
        if api_key:
            self._api_key = api_key
        else:
            self._api_key = self._load_api_key()
        
        logger.info(f"Switched to provider={provider}, model={self._model}")
    
    def switch_model(self, model_name: str) -> None:
        """
        Switch to a different model.
        
        Args:
            model_name: Name of the new model
        """
        self._model = model_name
        logger.info(f"Switched to model={model_name}")
    
    def validate_configuration(self) -> bool:
        """
        Validate that configuration is complete and valid.
        
        Returns:
            True if configuration is valid, False otherwise
        """
        if not self._api_key:
            logger.error("API key is not configured")
            return False
        
        if not self._model:
            logger.error("Model name is not configured")
            return False
        
        # Check if model is in known capabilities
        if self._model not in self.MODEL_CAPABILITIES:
            logger.warning(f"Model '{self._model}' not in known capabilities list")
        
        return True


# Global configuration instance
_config_service: Optional[ModelConfigService] = None


def get_model_config() -> ModelConfigService:
    """Get or create the global model configuration service."""
    global _config_service
    if _config_service is None:
        _config_service = ModelConfigService()
    return _config_service


def initialize_model_config() -> ModelConfigService:
    """Force re-initialization of model configuration."""
    global _config_service
    _config_service = ModelConfigService()
    return _config_service


# Backward compatibility exports
config = get_model_config()
MODEL_PROVIDER = config.provider
MODEL_NAME = config.model
MODEL_TEMPERATURE = config.temperature
MODEL_MAX_TOKENS = config.max_tokens
MODEL_TOP_P = config.top_p

# Legacy variable names for backward compatibility
GEMINI_API_KEY = config.api_key if config.provider == ModelProvider.GEMINI else os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = config.model if config.provider == ModelProvider.GEMINI else os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_BASE_URL = config.base_url if config.provider == ModelProvider.GEMINI else os.getenv(
    "GEMINI_BASE_URL",
    "https://generativelanguage.googleapis.com/v1beta/openai/"
)

# Rate Limiting Configuration
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "10"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))

# Backend API Configuration
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000/api")

# LiteLLM Configuration
USE_LITELLM = os.getenv("USE_LITELLM", "false").lower() == "true"

logger.info(f"Model: {MODEL_NAME}")
logger.info(f"Provider: {MODEL_PROVIDER.value}")
logger.info(f"Temperature: {MODEL_TEMPERATURE}")
logger.info(f"Max Tokens: {MODEL_MAX_TOKENS}")
logger.info(f"LiteLLM: {USE_LITELLM}")
