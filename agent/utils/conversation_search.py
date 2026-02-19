"""
Conversation Search Utility

Provides advanced search capabilities for chat conversations.
Supports fuzzy matching, keyword extraction, and relevance scoring.

Features:
    - Full-text search in conversation titles
    - Fuzzy matching for partial queries
    - Message content search
    - Relevance scoring and ranking
    - Date-based filtering
"""

import difflib
import re
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from collections import Counter

from ..logger import agent_logger
from .. import conversation_store


def extract_search_keywords(query: str) -> List[str]:
    """
    Extract meaningful keywords from a search query.
    Removes stop words and normalizes text.
    
    Args:
        query: User's search query
    
    Returns:
        List of keywords for searching
    """
    # Common stop words to ignore
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
        'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
        'about', 'into', 'through', 'during', 'before', 'after', 'above',
        'below', 'between', 'under', 'again', 'further', 'then', 'once',
        'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
        'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
        'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also',
        'now', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'what',
        'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'i', 'me',
        'you', 'he', 'she', 'it', 'we', 'they', 'find', 'search', 'show',
        'look', 'get', 'chat', 'conversation', 'conversations', 'history'
    }
    
    # Normalize and tokenize
    query_lower = query.lower().strip()
    
    # Remove punctuation
    query_clean = re.sub(r'[^\w\s]', ' ', query_lower)
    
    # Tokenize and filter
    keywords = [
        word for word in query_clean.split()
        if word not in stop_words and len(word) > 1
    ]
    
    return keywords


def calculate_relevance_score(
    query: str,
    conversation: Dict[str, Any],
    messages: Optional[List[Dict[str, Any]]] = None
) -> float:
    """
    Calculate relevance score for a conversation based on search query.
    
    Args:
        query: Search query
        conversation: Conversation dictionary
        messages: Optional messages for content search
    
    Returns:
        Relevance score (0.0 to 1.0)
    """
    query_lower = query.lower()
    title = conversation.get("title", "").lower()
    
    score = 0.0
    
    # Exact title match (highest priority)
    if query_lower in title:
        score += 0.5
    
    # Fuzzy title match
    title_similarity = difflib.SequenceMatcher(None, query_lower, title).ratio()
    score += title_similarity * 0.3
    
    # Keyword matching in title
    keywords = extract_search_keywords(query)
    if keywords:
        keyword_matches = sum(1 for kw in keywords if kw in title)
        score += (keyword_matches / len(keywords)) * 0.2
    
    # Search in messages if provided
    if messages:
        message_content = " ".join(
            msg.get("content", "").lower() for msg in messages
        )
        
        # Check if query appears in messages
        if query_lower in message_content:
            score += 0.15
        
        # Check keyword matches in messages
        if keywords:
            keyword_matches = sum(1 for kw in keywords if kw in message_content)
            score += (keyword_matches / len(keywords)) * 0.1
    
    # Recency boost (more recent conversations get slight boost)
    try:
        updated_at = datetime.fromisoformat(conversation.get("updated_at", ""))
        days_old = (datetime.utcnow() - updated_at).days
        recency_boost = max(0, 0.1 - (days_old * 0.001))  # Decay over 100 days
        score += recency_boost
    except (ValueError, TypeError):
        pass
    
    return min(1.0, score)


def search_conversations(
    user_id: str,
    query: str,
    limit: int = 20,
    include_messages: bool = False
) -> List[Dict[str, Any]]:
    """
    Search conversations by title and content.
    
    Args:
        user_id: User identifier
        query: Search query
        limit: Maximum number of results
        include_messages: Whether to include matching messages
    
    Returns:
        List of matching conversations with relevance scores
    """
    agent_logger.info(f"Searching conversations for user {user_id} with query: '{query}'")
    
    # Get all non-deleted conversations
    conversations = conversation_store.get_conversations_for_user(
        user_id=user_id,
        limit=1000,  # Get more for better search
        include_deleted=False
    )
    
    if not conversations:
        return []
    
    # Calculate relevance scores
    scored_conversations = []
    
    for conv in conversations:
        messages = None
        if include_messages:
            messages = conversation_store.get_messages_for_conversation(
                conv["id"],
                limit=100
            )
        
        score = calculate_relevance_score(query, conv, messages)
        
        if score > 0.2:  # Minimum threshold
            result = {
                **conv,
                "relevance_score": score,
                "userId": conv["user_id"],  # Frontend format
            }
            
            if include_messages and messages:
                # Include snippet from first matching message
                query_lower = query.lower()
                for msg in messages:
                    if query_lower in msg.get("content", "").lower():
                        result["message_snippet"] = msg["content"][:200]
                        result["snippet_role"] = msg["role"]
                        break
            
            scored_conversations.append(result)
    
    # Sort by relevance score
    scored_conversations.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    # Return top results
    results = scored_conversations[:limit]
    
    agent_logger.info(f"Found {len(results)} matching conversations")
    
    return results


def find_conversation_by_topic(
    user_id: str,
    topic: str,
    max_results: int = 5
) -> Optional[Dict[str, Any]]:
    """
    Find the best matching conversation for a given topic.
    
    Args:
        user_id: User identifier
        topic: Topic to search for
        max_results: Maximum results to consider
    
    Returns:
        Best matching conversation or None
    """
    results = search_conversations(user_id, topic, limit=max_results)
    
    if results:
        return results[0]
    return None


def search_messages_in_conversation(
    conversation_id: str,
    query: str,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Search for specific messages within a conversation.
    
    Args:
        conversation_id: Conversation identifier
        query: Search query
        limit: Maximum number of results
    
    Returns:
        List of matching messages with context
    """
    agent_logger.info(f"Searching messages in conversation {conversation_id} for: '{query}'")
    
    messages = conversation_store.get_messages_for_conversation(
        conversation_id,
        limit=500  # Get more messages for search
    )
    
    if not messages:
        return []
    
    query_lower = query.lower()
    keywords = extract_search_keywords(query)
    
    matching_messages = []
    
    for msg in messages:
        content = msg.get("content", "").lower()
        score = 0.0
        
        # Exact match
        if query_lower in content:
            score += 0.5
        
        # Keyword matches
        if keywords:
            keyword_matches = sum(1 for kw in keywords if kw in content)
            score += (keyword_matches / len(keywords)) * 0.4
        
        # Fuzzy match
        content_similarity = difflib.SequenceMatcher(None, query_lower, content).ratio()
        score += content_similarity * 0.1
        
        if score > 0.3:  # Minimum threshold
            matching_messages.append({
                **msg,
                "relevance_score": score,
                "conversationId": msg["conversation_id"],
            })
    
    # Sort by score and limit results
    matching_messages.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    return matching_messages[:limit]


def get_conversation_summary(conversation_id: str) -> Dict[str, Any]:
    """
    Generate a summary of a conversation.
    
    Args:
        conversation_id: Conversation identifier
    
    Returns:
        Conversation summary with key information
    """
    conversation = conversation_store.get_conversation(conversation_id)
    
    if not conversation:
        return {"error": "Conversation not found"}
    
    messages = conversation_store.get_messages_for_conversation(
        conversation_id,
        limit=50
    )
    
    # Extract key information
    user_messages = [m for m in messages if m["role"] == "user"]
    assistant_messages = [m for m in messages if m["role"] == "assistant"]
    
    # Get first user message as potential topic indicator
    first_user_message = user_messages[0]["content"] if user_messages else ""
    
    # Get last message timestamp
    last_message_time = messages[-1]["timestamp"] if messages else conversation["created_at"]
    
    return {
        "id": conversation["id"],
        "title": conversation["title"],
        "message_count": len(messages),
        "user_message_count": len(user_messages),
        "assistant_message_count": len(assistant_messages),
        "created_at": conversation["created_at"],
        "updated_at": last_message_time,
        "first_message_preview": first_user_message[:100] if first_user_message else "",
    }


def get_search_suggestions(
    user_id: str,
    partial_query: str,
    limit: int = 5
) -> List[str]:
    """
    Get search suggestions based on conversation history.
    
    Args:
        user_id: User identifier
        partial_query: Partial search query
        limit: Maximum number of suggestions
    
    Returns:
        List of suggested search terms
    """
    conversations = conversation_store.get_conversations_for_user(
        user_id=user_id,
        limit=100,
        include_deleted=False
    )
    
    if not conversations or not partial_query:
        return []
    
    query_lower = partial_query.lower()
    
    # Extract titles that match the partial query
    suggestions = []
    for conv in conversations:
        title = conv.get("title", "")
        if title.lower().startswith(query_lower) and title not in suggestions:
            suggestions.append(title)
            if len(suggestions) >= limit:
                break
    
    # If not enough suggestions, try fuzzy matching
    if len(suggestions) < limit:
        for conv in conversations:
            title = conv.get("title", "")
            if (title.lower() not in [s.lower() for s in suggestions] and
                difflib.SequenceMatcher(None, query_lower, title.lower()).ratio() > 0.5):
                suggestions.append(title)
                if len(suggestions) >= limit:
                    break
    
    return suggestions[:limit]
