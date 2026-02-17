"""
AI Agent Implementation using OpenAI Agents SDK with Google Gemini

Provides the main agent loop for natural language task management.
"""

from agents import Agent, Runner, OpenAIChatCompletionsModel, ModelSettings
from openai import AsyncOpenAI
from typing import Optional, List, Dict, Any
import asyncio

from .config import (
    GEMINI_API_KEY,
    GEMINI_MODEL,
    OPENAI_BASE_URL,
    RATE_LIMIT_REQUESTS,
    RATE_LIMIT_WINDOW,
    logger
)
from .error_handler import handle_llm_errors, retry_with_backoff, LLMError
from .logger import agent_logger, log_chat_message, log_tool_execution


# Configure Gemini API client
gemini_client = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url=OPENAI_BASE_URL,
) if GEMINI_API_KEY else None


# Configure model
gemini_model = OpenAIChatCompletionsModel(
    model=GEMINI_MODEL,
    openai_client=gemini_client,
) if gemini_client else None


def create_agent(
    name: str = "TodoAssistant",
    instructions: str = None,
    tools: list = None,
    model_settings: ModelSettings = None
) -> Agent:
    """
    Create and configure the AI agent.
    
    Args:
        name: Agent name
        instructions: System instructions for agent behavior
        tools: List of function tools for the agent
        model_settings: Model configuration (temperature, max_tokens, etc.)
    
    Returns:
        Configured Agent instance
    """
    default_instructions = """You are a senior AI assistant for a production Todo app. 
Your role is to help users manage their tasks through natural language conversations.

Guidelines:
- Be helpful, concise, and friendly
- Use available tools to execute user requests
- Ask for clarification when intent is ambiguous
- Confirm important actions before executing
- Provide clear, actionable responses
- Respect user limits and rate constraints
"""
    
    default_model_settings = ModelSettings(
        temperature=0.4,  # Balanced creativity/accuracy
        max_tokens=700,   # Sufficient for most responses
        tool_choice="auto"  # Let model decide when to use tools
    )
    
    agent = Agent(
        name=name,
        instructions=instructions or default_instructions,
        tools=tools or [],
        model_settings=model_settings or default_model_settings,
    )
    
    agent_logger.info(f"Agent created: {name} with model {GEMINI_MODEL}")
    return agent


class AgentRunner:
    """
    Manages agent execution with conversation history and error handling.
    """
    
    def __init__(self, agent: Agent):
        self.agent = agent
        self.conversation_history: List[Dict[str, Any]] = []
    
    @handle_llm_errors
    @retry_with_backoff(max_retries=3)
    async def run_async(
        self,
        user_message: str,
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Run agent asynchronously with user message.
        
        Args:
            user_message: User's natural language input
            conversation_id: Optional conversation identifier
        
        Returns:
            Dictionary with response, action, and metadata
        """
        log_chat_message("user", user_message, conversation_id)
        
        # Build conversation context
        messages = self._build_messages(user_message)
        
        # Run agent
        result = await Runner.run(
            self.agent,
            messages,
        )
        
        # Extract response
        response = {
            "success": True,
            "message": {
                "role": "assistant",
                "content": result.final_output,
            },
            "action": self._extract_action(result),
            "metadata": {
                "conversation_id": conversation_id,
                "model": GEMINI_MODEL,
            }
        }
        
        log_chat_message("assistant", result.final_output, conversation_id)
        return response
    
    @handle_llm_errors
    @retry_with_backoff(max_retries=3)
    def run_sync(
        self,
        user_message: str,
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Run agent synchronously with user message.
        
        Args:
            user_message: User's natural language input
            conversation_id: Optional conversation identifier
        
        Returns:
            Dictionary with response, action, and metadata
        """
        log_chat_message("user", user_message, conversation_id)
        
        # Build conversation context
        messages = self._build_messages(user_message)
        
        # Run agent
        result = Runner.run_sync(
            self.agent,
            messages,
        )
        
        # Extract response
        response = {
            "success": True,
            "message": {
                "role": "assistant",
                "content": result.final_output,
            },
            "action": self._extract_action(result),
            "metadata": {
                "conversation_id": conversation_id,
                "model": GEMINI_MODEL,
            }
        }
        
        log_chat_message("assistant", result.final_output, conversation_id)
        return response
    
    def _build_messages(self, user_message: str) -> List[Dict[str, str]]:
        """
        Build message list with conversation history.
        
        Args:
            user_message: Current user message
        
        Returns:
            List of message dictionaries
        """
        messages = []
        
        # Add system instruction (from agent)
        # Note: Agent handles this internally
        
        # Add conversation history (last 10 messages for context)
        messages.extend(self.conversation_history[-10:])
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        return messages
    
    def _extract_action(self, result) -> Optional[Dict[str, Any]]:
        """
        Extract tool execution results from agent output.
        
        Args:
            result: Agent run result
        
        Returns:
            Action dictionary or None
        """
        # Check for tool calls in result
        if hasattr(result, 'tool_calls') and result.tool_calls:
            tool_call = result.tool_calls[0]
            return {
                "type": "tool_call",
                "tool_name": getattr(tool_call, 'name', 'unknown'),
                "arguments": getattr(tool_call, 'arguments', {}),
            }
        
        return None
    
    def add_to_history(self, role: str, content: str):
        """
        Add message to conversation history.
        
        Args:
            role: Message role (user/assistant)
            content: Message content
        """
        self.conversation_history.append({
            "role": role,
            "content": content,
        })
    
    def clear_history(self):
        """Clear conversation history."""
        self.conversation_history = []
        agent_logger.info("Conversation history cleared")


# Default agent instance
default_agent = create_agent() if gemini_model else None
default_runner = AgentRunner(default_agent) if default_agent else None


def get_default_runner() -> Optional[AgentRunner]:
    """Get the default agent runner."""
    return default_runner
