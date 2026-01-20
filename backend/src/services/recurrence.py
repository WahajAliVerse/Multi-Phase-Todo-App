from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.recurrence_pattern import RecurrencePattern
from schemas.recurrence_pattern import RecurrencePatternCreate, RecurrencePatternUpdate


def get_recurrence_pattern(db: Session, pattern_id: int):
    return db.query(RecurrencePattern).filter(RecurrencePattern.id == pattern_id).first()


def create_recurrence_pattern(db: Session, pattern: RecurrencePatternCreate, user_id: int):
    db_pattern = RecurrencePattern(
        pattern_type=pattern.pattern_type,
        interval=pattern.interval,
        end_date=pattern.end_date,
        occurrences_count=pattern.occurrences_count,
        user_id=user_id
    )
    db.add(db_pattern)
    db.commit()
    db.refresh(db_pattern)
    return db_pattern


def update_recurrence_pattern(db: Session, pattern_id: int, pattern_update: RecurrencePatternUpdate):
    db_pattern = get_recurrence_pattern(db, pattern_id)
    if not db_pattern:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurrence pattern not found"
        )
    
    # Update fields if provided
    if pattern_update.pattern_type is not None:
        db_pattern.pattern_type = pattern_update.pattern_type
    if pattern_update.interval is not None:
        db_pattern.interval = pattern_update.interval
    if pattern_update.end_date is not None:
        db_pattern.end_date = pattern_update.end_date
    if pattern_update.occurrences_count is not None:
        db_pattern.occurrences_count = pattern_update.occurrences_count
    
    db.commit()
    db.refresh(db_pattern)
    return db_pattern


def delete_recurrence_pattern(db: Session, pattern_id: int):
    db_pattern = get_recurrence_pattern(db, pattern_id)
    if not db_pattern:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurrence pattern not found"
        )
    
    db.delete(db_pattern)
    db.commit()
    return db_pattern


def generate_next_occurrence(db: Session, pattern_id: int):
    """
    Generate the next occurrence based on the recurrence pattern.
    This is a simplified version - in a real application, you'd need more complex logic
    to handle different recurrence types (daily, weekly, monthly, etc.)
    """
    pattern = get_recurrence_pattern(db, pattern_id)
    if not pattern:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurrence pattern not found"
        )
    
    # This is a simplified implementation
    # In a real application, you'd need to handle different recurrence types
    if pattern.pattern_type == "daily":
        next_date = datetime.utcnow() + timedelta(days=pattern.interval)
    elif pattern.pattern_type == "weekly":
        next_date = datetime.utcnow() + timedelta(weeks=pattern.interval)
    elif pattern.pattern_type == "monthly":
        # Simplified - just add the month interval
        next_date = datetime.utcnow() + timedelta(days=30 * pattern.interval)
    elif pattern.pattern_type == "yearly":
        next_date = datetime.utcnow() + timedelta(days=365 * pattern.interval)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pattern type"
        )
    
    # Check if the pattern has ended
    if pattern.end_date and next_date > pattern.end_date:
        return None
    
    # Check if max occurrences reached
    if pattern.occurrences_count is not None:
        # This would require tracking how many occurrences have been created
        # For simplicity, we'll just return the next date
        pass
    
    return next_date