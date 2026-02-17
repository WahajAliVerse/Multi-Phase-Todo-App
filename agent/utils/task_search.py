"""
Task Search Utility

Helps find tasks by title, description, or other criteria.
"""

from typing import List, Dict, Any, Optional
import difflib

from ..logger import agent_logger


def find_best_match(
    search_term: str,
    tasks: List[Dict[str, Any]],
    threshold: float = 0.6
) -> Optional[Dict[str, Any]]:
    """
    Find the best matching task by title/description.
    
    Args:
        search_term: User's search query
        tasks: List of task dictionaries
        threshold: Minimum similarity score (0.0 to 1.0)
    
    Returns:
        Best matching task or None
    """
    if not tasks:
        return None
    
    search_lower = search_term.lower()
    best_match = None
    best_score = 0.0
    
    for task in tasks:
        # Check title
        title = task.get("title", "").lower()
        title_score = difflib.SequenceMatcher(None, search_lower, title).ratio()
        
        # Check description
        description = task.get("description", "").lower()
        desc_score = difflib.SequenceMatcher(None, search_lower, description).ratio()
        
        # Use higher score
        score = max(title_score, desc_score)
        
        # Check for exact substring match (boost score)
        if search_lower in title or search_lower in description:
            score = min(1.0, score + 0.3)
        
        if score > best_score and score >= threshold:
            best_score = score
            best_match = task
    
    if best_match:
        agent_logger.info(f"Found task match: '{search_term}' -> '{best_match.get('title')}' (score: {best_score:.2f})")
    
    return best_match


def find_multiple_matches(
    search_term: str,
    tasks: List[Dict[str, Any]],
    max_results: int = 5,
    threshold: float = 0.5
) -> List[Dict[str, Any]]:
    """
    Find multiple matching tasks.
    
    Args:
        search_term: User's search query
        tasks: List of task dictionaries
        max_results: Maximum number of results
        threshold: Minimum similarity score
    
    Returns:
        List of matching tasks, sorted by relevance
    """
    if not tasks:
        return []
    
    search_lower = search_term.lower()
    matches = []
    
    for task in tasks:
        title = task.get("title", "").lower()
        description = task.get("description", "").lower()
        
        # Calculate similarity
        title_score = difflib.SequenceMatcher(None, search_lower, title).ratio()
        desc_score = difflib.SequenceMatcher(None, search_lower, description).ratio()
        score = max(title_score, desc_score)
        
        # Boost for substring match
        if search_lower in title or search_lower in description:
            score = min(1.0, score + 0.3)
        
        if score >= threshold:
            matches.append((score, task))
    
    # Sort by score and return top results
    matches.sort(key=lambda x: x[0], reverse=True)
    result = [task for score, task in matches[:max_results]]
    
    agent_logger.info(f"Found {len(result)} task matches for '{search_term}'")
    return result


def filter_tasks_by_criteria(
    tasks: List[Dict[str, Any]],
    filters: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Filter tasks by various criteria.
    
    Args:
        tasks: List of task dictionaries
        filters: Filter criteria (status, priority, tag_ids, etc.)
    
    Returns:
        Filtered list of tasks
    """
    result = tasks
    
    # Filter by status
    if "status" in filters and filters["status"] != "all":
        status = filters["status"]
        if status == "active":
            result = [t for t in result if t.get("status") != "completed"]
        else:
            result = [t for t in result if t.get("status") == status]
    
    # Filter by priority
    if "priority" in filters and filters["priority"] != "all":
        priority = filters["priority"]
        result = [t for t in result if t.get("priority") == priority]
    
    # Filter by tag
    if "tag_ids" in filters and filters["tag_ids"]:
        tag_ids = set(filters["tag_ids"])
        result = [t for t in result if set(t.get("tags", [])) & tag_ids]
    
    # Filter by search term
    if "search" in filters and filters["search"]:
        search_term = filters["search"]
        result = find_multiple_matches(search_term, result)
    
    return result
