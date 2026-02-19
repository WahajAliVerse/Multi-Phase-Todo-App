"""
Conversation Management Tools

Wrappers for conversation CRUD operations using OpenAI Agents SDK function tools.
Implements soft-delete pattern for conversation history management.

Tools:
    - get_conversations: List user's conversations
    - get_conversation: Get specific conversation with messages
    - delete_conversation: Soft-delete a conversation
    - restore_conversation: Restore a soft-deleted conversation
    - clear_all_conversations: Soft-delete all conversations for a user
"""

import time
from typing import Optional, List, Dict, Any
from agents import function_tool
from pydantic import BaseModel, Field

from ..config import logger
from ..logger import agent_logger, log_tool_execution
from ..error_handler import ToolExecutionError, handle_llm_errors
from .. import conversation_store


@function_tool
async def get_conversations(
    user_id: str = Field(description="User identifier"),
    limit: int = Field(default=50, description="Maximum number of conversations to return"),
    include_deleted: bool = Field(default=False, description="Include soft-deleted conversations")
) -> Dict[str, Any]:
    """
    Retrieve conversation history for a user.
    
    Use this tool when the user asks to:
    - "Show my conversations"
    - "View chat history"
    - "List my previous chats"
    - "What conversations have I had?"
    
    Args:
        user_id: User identifier
        limit: Maximum number of conversations to return
        include_deleted: Whether to include soft-deleted conversations
    
    Returns:
        Dictionary with success status, conversations list, and count
    """
    start_time = time.time()
    
    try:
        agent_logger.info(f"Fetching conversations for user: {user_id}")
        
        conversations = conversation_store.get_conversations_for_user(
            user_id=user_id,
            limit=limit,
            include_deleted=include_deleted
        )
        
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("get_conversations", "success", duration_ms, {"count": len(conversations)})
        
        # Format for frontend compatibility
        formatted_conversations = []
        for conv in conversations:
            formatted_conversations.append({
                "id": conv["id"],
                "userId": conv["user_id"],
                "title": conv["title"],
                "createdAt": conv["created_at"],
                "updatedAt": conv["updated_at"],
                "isActive": not conv["is_deleted"],
            })
        
        return {
            "success": True,
            "conversations": formatted_conversations,
            "count": len(formatted_conversations),
        }
        
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("get_conversations", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("get_conversations", f"Failed to fetch conversations: {str(e)}")


@function_tool
async def get_conversation(
    conversation_id: str = Field(description="Conversation identifier"),
    include_messages: bool = Field(default=True, description="Include messages in the response")
) -> Dict[str, Any]:
    """
    Retrieve a specific conversation with its messages.
    
    Use this tool when the user asks to:
    - "Show me that conversation about groceries"
    - "Open my last chat"
    - "View conversation [ID]"
    
    Args:
        conversation_id: Conversation identifier
        include_messages: Whether to include messages
    
    Returns:
        Dictionary with conversation details and optional messages
    """
    start_time = time.time()
    
    try:
        agent_logger.info(f"Fetching conversation: {conversation_id}")
        
        conversation = conversation_store.get_conversation(conversation_id)
        
        if not conversation:
            return {
                "success": False,
                "error": "Conversation not found",
            }
        
        result = {
            "success": True,
            "conversation": {
                "id": conversation["id"],
                "userId": conversation["user_id"],
                "title": conversation["title"],
                "createdAt": conversation["created_at"],
                "updatedAt": conversation["updated_at"],
                "isActive": not conversation["is_deleted"],
            }
        }
        
        if include_messages:
            messages = conversation_store.get_messages_for_conversation(conversation_id)
            
            # Format messages for frontend compatibility
            formatted_messages = []
            for msg in messages:
                formatted_messages.append({
                    "id": msg["id"],
                    "conversationId": msg["conversation_id"],
                    "role": msg["role"],
                    "content": msg["content"],
                    "timestamp": msg["timestamp"],
                })
            
            result["messages"] = formatted_messages
        
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("get_conversation", "success", duration_ms)
        
        return result
        
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("get_conversation", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("get_conversation", f"Failed to fetch conversation: {str(e)}")


@function_tool
async def delete_conversation(
    conversation_id: str = Field(description="Conversation identifier to delete"),
    user_id: Optional[str] = Field(default=None, description="User identifier for verification")
) -> Dict[str, Any]:
    """
    Soft-delete a conversation (mark as deleted without permanent removal).
    
    Use this tool when the user asks to:
    - "Delete this conversation"
    - "Remove last chat"
    - "Delete conversation about [topic]"
    - "Clear this chat"
    
    Args:
        conversation_id: Conversation identifier
        user_id: Optional user ID for verification
    
    Returns:
        Dictionary with success status and message
    """
    start_time = time.time()
    
    try:
        agent_logger.info(f"Soft-deleting conversation: {conversation_id}")
        
        # Verify conversation exists and belongs to user if user_id provided
        conversation = conversation_store.get_conversation(conversation_id)
        
        if not conversation:
            return {
                "success": False,
                "error": "Conversation not found",
            }
        
        if user_id and conversation["user_id"] != user_id:
            return {
                "success": False,
                "error": "Unauthorized: Conversation does not belong to this user",
            }
        
        # Perform soft delete
        success = conversation_store.soft_delete_conversation(conversation_id)
        
        if not success:
            return {
                "success": False,
                "error": "Conversation already deleted or not found",
            }
        
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("delete_conversation", "success", duration_ms, {"conversation_id": conversation_id})
        
        return {
            "success": True,
            "message": f"Conversation '{conversation['title']}' deleted successfully",
            "conversation_id": conversation_id,
        }
        
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("delete_conversation", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("delete_conversation", f"Failed to delete conversation: {str(e)}")


@function_tool
async def restore_conversation(
    conversation_id: str = Field(description="Conversation identifier to restore")
) -> Dict[str, Any]:
    """
    Restore a soft-deleted conversation.
    
    Use this tool when the user asks to:
    - "Restore deleted conversation"
    - "Undo delete"
    - "Bring back my last chat"
    
    Args:
        conversation_id: Conversation identifier
    
    Returns:
        Dictionary with success status and restored conversation
    """
    start_time = time.time()
    
    try:
        agent_logger.info(f"Restoring conversation: {conversation_id}")
        
        restored = conversation_store.restore_conversation(conversation_id)
        
        if not restored:
            return {
                "success": False,
                "error": "Conversation not found or not deleted",
            }
        
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("restore_conversation", "success", duration_ms)
        
        return {
            "success": True,
            "message": "Conversation restored successfully",
            "conversation": {
                "id": restored["id"],
                "userId": restored["user_id"],
                "title": restored["title"],
                "isActive": True,
            }
        }
        
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("restore_conversation", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("restore_conversation", f"Failed to restore conversation: {str(e)}")


@function_tool
async def clear_all_conversations(
    user_id: str = Field(description="User identifier"),
    confirm: bool = Field(default=False, description="Confirmation flag - must be True to proceed")
) -> Dict[str, Any]:
    """
    Soft-delete all conversations for a user.
    Requires explicit confirmation to prevent accidental data loss.
    
    Use this tool when the user asks to:
    - "Clear all history"
    - "Delete all conversations"
    - "Remove all my chats"
    - "Reset conversation history"
    
    Args:
        user_id: User identifier
        confirm: Must be True to proceed with deletion
    
    Returns:
        Dictionary with success status and count of deleted conversations
    """
    start_time = time.time()
    
    try:
        if not confirm:
            return {
                "success": False,
                "error": "Confirmation required. Set confirm=True to proceed.",
                "requires_confirmation": True,
            }
        
        agent_logger.info(f"Clearing all conversations for user: {user_id}")
        
        # Get all conversations for user
        conversations = conversation_store.get_conversations_for_user(
            user_id=user_id,
            include_deleted=False
        )
        
        deleted_count = 0
        for conv in conversations:
            if conversation_store.soft_delete_conversation(conv["id"]):
                deleted_count += 1
        
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("clear_all_conversations", "success", duration_ms, {"deleted_count": deleted_count})
        
        return {
            "success": True,
            "message": f"Successfully deleted {deleted_count} conversation(s)",
            "deleted_count": deleted_count,
        }
        
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("clear_all_conversations", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("clear_all_conversations", f"Failed to clear conversations: {str(e)}")


@function_tool
async def create_conversation(
    user_id: str = Field(description="User identifier"),
    title: str = Field(default="New Conversation", description="Conversation title")
) -> Dict[str, Any]:
    """
    Create a new conversation.
    
    Use this tool when the user asks to:
    - "Start a new chat"
    - "New conversation"
    - "Create new chat"
    
    Args:
        user_id: User identifier
        title: Conversation title
    
    Returns:
        Dictionary with success status and new conversation details
    """
    start_time = time.time()
    
    try:
        agent_logger.info(f"Creating new conversation for user: {user_id}")
        
        conversation = conversation_store.create_conversation(
            user_id=user_id,
            title=title
        )
        
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("create_conversation", "success", duration_ms)
        
        return {
            "success": True,
            "conversation": {
                "id": conversation["id"],
                "userId": conversation["user_id"],
                "title": conversation["title"],
                "createdAt": conversation["created_at"],
                "isActive": True,
            }
        }
        
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("create_conversation", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("create_conversation", f"Failed to create conversation: {str(e)}")


@function_tool
async def add_message_to_conversation(
    conversation_id: str = Field(description="Conversation identifier"),
    role: str = Field(description="Message role: user, assistant, or system"),
    content: str = Field(description="Message content")
) -> Dict[str, Any]:
    """
    Add a message to a conversation.
    
    Internal tool for persisting chat messages.
    
    Args:
        conversation_id: Conversation identifier
        role: Message role (user, assistant, system)
        content: Message content
    
    Returns:
        Dictionary with success status and message details
    """
    start_time = time.time()
    
    try:
        message = conversation_store.add_message(
            conversation_id=conversation_id,
            role=role,
            content=content
        )
        
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("add_message", "success", duration_ms)
        
        return {
            "success": True,
            "message": {
                "id": message["id"],
                "conversationId": message["conversation_id"],
                "role": message["role"],
                "content": message["content"],
                "timestamp": message["timestamp"],
            }
        }
        
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("add_message", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("add_message", f"Failed to add message: {str(e)}")
