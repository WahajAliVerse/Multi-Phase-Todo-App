"""
Conversation Store - Database Persistence Layer

Handles SQLite/PostgreSQL persistence for chat conversations and messages.
Implements soft-delete pattern for conversation management.

Database Schema:
    - chat_conversations: Stores conversation metadata with soft-delete support
    - chat_messages: Stores individual messages within conversations
"""

import sqlite3
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pathlib import Path
from contextlib import contextmanager

from .logger import agent_logger, log_conversation_operation


# Database path - stored in agent directory
DB_PATH = Path(__file__).parent.parent / "data" / "conversations.db"


@contextmanager
def get_db_connection():
    """
    Context manager for database connections.
    Ensures proper connection handling and row factory.
    """
    # Ensure data directory exists
    DB_PATH.parent.mkdir(exist_ok=True)
    
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row  # Enable dict-like access
    try:
        yield conn
    finally:
        conn.close()


def init_db():
    """
    Initialize the database schema.
    Creates tables if they don't exist.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Create chat_conversations table with soft-delete support
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_conversations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                is_deleted BOOLEAN DEFAULT FALSE,
                deleted_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create index for efficient filtering
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_conversations_user_deleted 
            ON chat_conversations(user_id, is_deleted)
        """)
        
        # Create chat_messages table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id)
            )
        """)
        
        # Create index for efficient message retrieval
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_messages_conversation 
            ON chat_messages(conversation_id, timestamp)
        """)
        
        conn.commit()
        
    agent_logger.info("Conversation database initialized")


def create_conversation(
    user_id: str,
    title: str = "New Conversation",
    conversation_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a new conversation.
    
    Args:
        user_id: User identifier
        title: Conversation title
        conversation_id: Optional custom ID (generates UUID if not provided)
    
    Returns:
        Dictionary with conversation details
    """
    if conversation_id is None:
        conversation_id = str(uuid.uuid4())
    
    now = datetime.utcnow().isoformat()
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO chat_conversations (id, user_id, title, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        """, (conversation_id, user_id, title, now, now))
        conn.commit()
    
    log_conversation_operation("create", "success", conversation_id, {"user_id": user_id, "title": title})
    
    return {
        "id": conversation_id,
        "user_id": user_id,
        "title": title,
        "is_deleted": False,
        "created_at": now,
        "updated_at": now,
    }


def get_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve a conversation by ID.
    Excludes soft-deleted conversations.
    
    Args:
        conversation_id: Conversation identifier
    
    Returns:
        Conversation dictionary or None if not found
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, user_id, title, is_deleted, deleted_at, created_at, updated_at
            FROM chat_conversations
            WHERE id = ? AND is_deleted = FALSE
        """, (conversation_id,))
        
        row = cursor.fetchone()
        
        if row:
            return dict(row)
        return None


def get_conversations_for_user(
    user_id: str,
    limit: int = 50,
    offset: int = 0,
    include_deleted: bool = False
) -> List[Dict[str, Any]]:
    """
    Retrieve all conversations for a user.
    
    Args:
        user_id: User identifier
        limit: Maximum number of results
        offset: Pagination offset
        include_deleted: Whether to include soft-deleted conversations
    
    Returns:
        List of conversation dictionaries
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        if include_deleted:
            cursor.execute("""
                SELECT id, user_id, title, is_deleted, deleted_at, created_at, updated_at
                FROM chat_conversations
                WHERE user_id = ?
                ORDER BY updated_at DESC
                LIMIT ? OFFSET ?
            """, (user_id, limit, offset))
        else:
            cursor.execute("""
                SELECT id, user_id, title, is_deleted, deleted_at, created_at, updated_at
                FROM chat_conversations
                WHERE user_id = ? AND is_deleted = FALSE
                ORDER BY updated_at DESC
                LIMIT ? OFFSET ?
            """, (user_id, limit, offset))
        
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def update_conversation(
    conversation_id: str,
    title: Optional[str] = None,
    **kwargs
) -> Optional[Dict[str, Any]]:
    """
    Update a conversation.
    
    Args:
        conversation_id: Conversation identifier
        title: New title (optional)
        **kwargs: Additional fields to update
    
    Returns:
        Updated conversation dictionary or None if not found
    """
    now = datetime.utcnow().isoformat()
    updates = []
    values = []
    
    if title is not None:
        updates.append("title = ?")
        values.append(title)
    
    # Always update the updated_at timestamp
    updates.append("updated_at = ?")
    values.append(now)
    
    if not updates:
        return get_conversation(conversation_id)
    
    values.append(conversation_id)
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(f"""
            UPDATE chat_conversations
            SET {', '.join(updates)}
            WHERE id = ?
        """, values)
        conn.commit()
    
    log_conversation_operation("update", "success", conversation_id, {"title": title})
    
    return get_conversation(conversation_id)


def soft_delete_conversation(conversation_id: str) -> bool:
    """
    Soft-delete a conversation (mark as deleted without removing).
    
    Args:
        conversation_id: Conversation identifier
    
    Returns:
        True if successful, False if conversation not found
    """
    now = datetime.utcnow().isoformat()
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Check if conversation exists and is not already deleted
        cursor.execute("""
            SELECT id FROM chat_conversations
            WHERE id = ? AND is_deleted = FALSE
        """, (conversation_id,))
        
        if not cursor.fetchone():
            return False
        
        # Mark as deleted
        cursor.execute("""
            UPDATE chat_conversations
            SET is_deleted = TRUE, deleted_at = ?, updated_at = ?
            WHERE id = ?
        """, (now, now, conversation_id))
        conn.commit()
    
    log_conversation_operation("delete", "success", conversation_id, {"soft_delete": True})
    
    return True


def hard_delete_conversation(conversation_id: str) -> bool:
    """
    Permanently delete a conversation and all its messages.
    Use with caution - this cannot be undone.
    
    Args:
        conversation_id: Conversation identifier
    
    Returns:
        True if successful, False if conversation not found
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # First delete all messages
        cursor.execute("""
            DELETE FROM chat_messages WHERE conversation_id = ?
        """, (conversation_id,))
        
        # Then delete the conversation
        cursor.execute("""
            DELETE FROM chat_conversations WHERE id = ?
        """, (conversation_id,))
        
        deleted = cursor.rowcount > 0
        conn.commit()
    
    if deleted:
        log_conversation_operation("delete", "success", conversation_id, {"hard_delete": True})
    
    return deleted


def add_message(
    conversation_id: str,
    role: str,
    content: str,
    message_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Add a message to a conversation.
    
    Args:
        conversation_id: Conversation identifier
        role: Message role (user, assistant, system)
        content: Message content
        message_id: Optional custom ID (generates UUID if not provided)
    
    Returns:
        Dictionary with message details
    """
    if message_id is None:
        message_id = str(uuid.uuid4())
    
    now = datetime.utcnow().isoformat()
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO chat_messages (id, conversation_id, role, content, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (message_id, conversation_id, role, content, now))
        
        # Update conversation's updated_at timestamp
        cursor.execute("""
            UPDATE chat_conversations
            SET updated_at = ?
            WHERE id = ?
        """, (now, conversation_id))
        
        conn.commit()
    
    return {
        "id": message_id,
        "conversation_id": conversation_id,
        "role": role,
        "content": content,
        "timestamp": now,
    }


def get_messages_for_conversation(
    conversation_id: str,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Retrieve all messages for a conversation.
    
    Args:
        conversation_id: Conversation identifier
        limit: Maximum number of results
        offset: Pagination offset
    
    Returns:
        List of message dictionaries
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, conversation_id, role, content, timestamp
            FROM chat_messages
            WHERE conversation_id = ?
            ORDER BY timestamp ASC
            LIMIT ? OFFSET ?
        """, (conversation_id, limit, offset))
        
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def search_conversations(
    user_id: str,
    query: str,
    limit: int = 20
) -> List[Dict[str, Any]]:
    """
    Search conversations by title using fuzzy matching.
    
    Args:
        user_id: User identifier
        query: Search query
        limit: Maximum number of results
    
    Returns:
        List of matching conversation dictionaries
    """
    query_lower = query.lower()
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Search by title using LIKE for partial matching
        cursor.execute("""
            SELECT id, user_id, title, is_deleted, deleted_at, created_at, updated_at
            FROM chat_conversations
            WHERE user_id = ? 
              AND is_deleted = FALSE
              AND title LIKE ?
            ORDER BY updated_at DESC
            LIMIT ?
        """, (user_id, f"%{query_lower}%", limit))
        
        rows = cursor.fetchall()
        results = [dict(row) for row in rows]
    
    # Apply additional fuzzy matching in Python for better relevance
    if len(results) < limit:
        # Get more results and apply fuzzy matching
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, user_id, title, is_deleted, deleted_at, created_at, updated_at
                FROM chat_conversations
                WHERE user_id = ? AND is_deleted = FALSE
                ORDER BY updated_at DESC
            """, (user_id,))
            
            all_rows = cursor.fetchall()
            
            # Apply fuzzy matching
            import difflib
            for row in all_rows:
                conv = dict(row)
                if conv["id"] not in [r["id"] for r in results]:
                    score = difflib.SequenceMatcher(
                        None, 
                        query_lower, 
                        conv["title"].lower()
                    ).ratio()
                    if score > 0.4:  # Threshold for fuzzy match
                        results.append(conv)
                        if len(results) >= limit:
                            break
    
    log_conversation_operation("search", "success", "N/A", {
        "query": query,
        "result_count": len(results)
    })
    
    return results


def get_conversation_count(user_id: str, include_deleted: bool = False) -> int:
    """
    Get the count of conversations for a user.
    
    Args:
        user_id: User identifier
        include_deleted: Whether to include soft-deleted conversations
    
    Returns:
        Count of conversations
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        if include_deleted:
            cursor.execute("""
                SELECT COUNT(*) as count
                FROM chat_conversations
                WHERE user_id = ?
            """, (user_id,))
        else:
            cursor.execute("""
                SELECT COUNT(*) as count
                FROM chat_conversations
                WHERE user_id = ? AND is_deleted = FALSE
            """, (user_id,))
        
        row = cursor.fetchone()
        return row["count"] if row else 0


def restore_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
    """
    Restore a soft-deleted conversation.
    
    Args:
        conversation_id: Conversation identifier
    
    Returns:
        Restored conversation dictionary or None if not found
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Check if conversation exists and is deleted
        cursor.execute("""
            SELECT id FROM chat_conversations
            WHERE id = ? AND is_deleted = TRUE
        """, (conversation_id,))
        
        if not cursor.fetchone():
            return None
        
        # Restore the conversation
        cursor.execute("""
            UPDATE chat_conversations
            SET is_deleted = FALSE, deleted_at = NULL, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (conversation_id,))
        conn.commit()
    
    log_conversation_operation("restore", "success", conversation_id)
    
    return get_conversation(conversation_id)


# Initialize database on module import
init_db()
