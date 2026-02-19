"""Utilities for AI Task Assistant."""

from .date_parser import parse_date, parse_relative_date, parse_natural_language_date
from .task_search import find_best_match, find_multiple_matches, filter_tasks_by_criteria
from .recurrence_parser import parse_recurrence_pattern, parse_natural_language_recurrence
from .conversation_search import (
    search_conversations,
    find_conversation_by_topic,
    search_messages_in_conversation,
    get_conversation_summary,
    get_search_suggestions,
    extract_search_keywords,
    calculate_relevance_score,
)

__all__ = [
    # Date parsing
    "parse_date",
    "parse_relative_date",
    "parse_natural_language_date",
    # Task search
    "find_best_match",
    "find_multiple_matches",
    "filter_tasks_by_criteria",
    # Recurrence parsing
    "parse_recurrence_pattern",
    "parse_natural_language_recurrence",
    # Conversation search
    "search_conversations",
    "find_conversation_by_topic",
    "search_messages_in_conversation",
    "get_conversation_summary",
    "get_search_suggestions",
    "extract_search_keywords",
    "calculate_relevance_score",
]
