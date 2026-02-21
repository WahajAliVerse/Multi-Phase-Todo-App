"""Utilities for AI Task Assistant."""

from .date_parser import (
    parse_relative_date,
    parse_time_expression,
    parse_natural_date,
    parse_date_with_time,
    get_date_range_for_expression,
    parse_query_date_filters,
)
from .task_search import find_best_match, find_multiple_matches, filter_tasks_by_criteria
from .recurrence_parser import parse_recurrence_pattern, format_recurrence_summary, validate_recurrence_pattern
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
    "parse_relative_date",
    "parse_time_expression",
    "parse_natural_date",
    "parse_date_with_time",
    "get_date_range_for_expression",
    "parse_query_date_filters",
    # Task search
    "find_best_match",
    "find_multiple_matches",
    "filter_tasks_by_criteria",
    # Recurrence parsing
    "parse_recurrence_pattern",
    "format_recurrence_summary",
    "validate_recurrence_pattern",
    # Conversation search
    "search_conversations",
    "find_conversation_by_topic",
    "search_messages_in_conversation",
    "get_conversation_summary",
    "get_search_suggestions",
    "extract_search_keywords",
    "calculate_relevance_score",
]
