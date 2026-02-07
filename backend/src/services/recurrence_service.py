from typing import Optional
import uuid
from datetime import datetime
from sqlmodel import Session
from src.models.recurrence_pattern import RecurrencePattern, RecurrencePatternCreate, RecurrencePatternUpdate
from src.repositories.recurrence_repository import RecurrenceRepository


class RecurrenceService:
    def __init__(self):
        self.repository = RecurrenceRepository()

    def create_recurrence_pattern(self, session: Session, recurrence_create: RecurrencePatternCreate) -> RecurrencePattern:
        """
        Create a new recurrence pattern
        """
        return self.repository.create_recurrence_pattern(session, recurrence_create)

    def get_recurrence_pattern_by_id(self, session: Session, recurrence_id: uuid.UUID) -> Optional[RecurrencePattern]:
        """
        Get a recurrence pattern by ID
        """
        return self.repository.get_recurrence_pattern_by_id(session, recurrence_id)

    def update_recurrence_pattern(
        self, 
        session: Session, 
        recurrence_id: uuid.UUID, 
        recurrence_update: RecurrencePatternUpdate
    ) -> Optional[RecurrencePattern]:
        """
        Update a recurrence pattern
        """
        return self.repository.update_recurrence_pattern(session, recurrence_id, recurrence_update)

    def delete_recurrence_pattern(self, session: Session, recurrence_id: uuid.UUID) -> bool:
        """
        Delete a recurrence pattern
        """
        return self.repository.delete_recurrence_pattern(session, recurrence_id)

    def validate_recurrence_pattern(self, recurrence_data: RecurrencePatternCreate) -> bool:
        """
        Validate recurrence pattern data
        """
        # Validate frequency
        if recurrence_data.frequency not in ["daily", "weekly", "monthly", "yearly"]:
            return False
            
        # Validate interval
        if recurrence_data.interval < 1:
            return False
            
        # Validate days of week if frequency is weekly
        if recurrence_data.frequency == "weekly" and recurrence_data.days_of_week:
            valid_days = {"mon", "tue", "wed", "thu", "fri", "sat", "sun"}
            if not all(day in valid_days for day in recurrence_data.days_of_week):
                return False
                
        # Validate day of month if frequency is monthly
        if recurrence_data.frequency == "monthly" and recurrence_data.day_of_month:
            if not (1 <= recurrence_data.day_of_month <= 31):
                return False
                
        # Validate end condition
        if recurrence_data.end_condition not in ["never", "after", "on_date"]:
            return False
            
        # Validate end after occurrences if end condition is "after"
        if recurrence_data.end_condition == "after" and recurrence_data.end_after_occurrences:
            if recurrence_data.end_after_occurrences < 1:
                return False
                
        # Validate end date if end condition is "on_date"
        if recurrence_data.end_condition == "on_date" and recurrence_data.end_date:
            # Check if end date is in the future
            from datetime import datetime
            if recurrence_data.end_date < datetime.now():
                return False
                
        return True

    def generate_next_occurrence_date(self, recurrence_pattern: RecurrencePattern, current_date: datetime) -> Optional[datetime]:
        """
        Calculate the next occurrence date based on the recurrence pattern
        """
        from datetime import timedelta
        
        if recurrence_pattern.frequency == "daily":
            return current_date + timedelta(days=recurrence_pattern.interval)
            
        elif recurrence_pattern.frequency == "weekly":
            # For weekly, we need to find the next occurrence based on days of week
            if recurrence_pattern.days_of_week:
                # This is a simplified implementation - a full implementation would need to handle
                # finding the next matching day of the week
                return current_date + timedelta(weeks=recurrence_pattern.interval)
                
        elif recurrence_pattern.frequency == "monthly":
            # For monthly, add the interval number of months
            # This is a simplified implementation - a full implementation would handle
            # month-end edge cases (e.g., Jan 31 + 1 month)
            import calendar
            year = current_date.year
            month = current_date.month + recurrence_pattern.interval
            
            # Handle year overflow
            while month > 12:
                year += 1
                month -= 12
                
            # Handle day overflow (e.g., Jan 31 -> Feb 31 doesn't exist)
            max_day = calendar.monthrange(year, month)[1]
            day = min(current_date.day, max_day)
            
            return current_date.replace(year=year, month=month, day=day)
            
        elif recurrence_pattern.frequency == "yearly":
            # For yearly, add the interval number of years
            return current_date.replace(year=current_date.year + recurrence_pattern.interval)
            
        return None

    def should_end_recurrence(self, recurrence_pattern: RecurrencePattern, occurrence_count: int, current_date: datetime) -> bool:
        """
        Determine if a recurrence should end based on its end conditions
        """
        if recurrence_pattern.end_condition == "never":
            return False
            
        elif recurrence_pattern.end_condition == "after":
            return occurrence_count >= recurrence_pattern.end_after_occurrences
            
        elif recurrence_pattern.end_condition == "on_date":
            from datetime import datetime
            return current_date > recurrence_pattern.end_date
            
        return False

    def validate_recurrence_pattern(self, recurrence_pattern: RecurrencePattern) -> bool:
        """
        Validate a recurrence pattern
        """
        # Validate frequency
        if recurrence_pattern.frequency not in ["daily", "weekly", "monthly", "yearly"]:
            return False
            
        # Validate interval
        if recurrence_pattern.interval < 1:
            return False
            
        # Validate days of week if frequency is weekly
        if recurrence_pattern.frequency == "weekly" and recurrence_pattern.days_of_week:
            valid_days = {"mon", "tue", "wed", "thu", "fri", "sat", "sun"}
            if not all(day in valid_days for day in recurrence_pattern.days_of_week):
                return False
                
        # Validate day of month if frequency is monthly
        if recurrence_pattern.frequency == "monthly" and recurrence_pattern.day_of_month:
            if not (1 <= recurrence_pattern.day_of_month <= 31):
                return False
                
        # Validate end condition
        if recurrence_pattern.end_condition not in ["never", "after", "on_date"]:
            return False
            
        # Validate end after occurrences if end condition is "after"
        if recurrence_pattern.end_condition == "after" and recurrence_pattern.end_after_occurrences:
            if recurrence_pattern.end_after_occurrences < 1:
                return False
                
        # Validate end date if end condition is "on_date"
        if recurrence_pattern.end_condition == "on_date" and recurrence_pattern.end_date:
            # Check if end date is in the future
            from datetime import datetime
            if recurrence_pattern.end_date < datetime.now():
                return False
                
        return True