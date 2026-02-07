from typing import Optional
import uuid
from sqlmodel import Session, select
from src.models.recurrence_pattern import RecurrencePattern, RecurrencePatternCreate, RecurrencePatternUpdate


class RecurrenceRepository:
    def create_recurrence_pattern(self, session: Session, recurrence_create: RecurrencePatternCreate) -> RecurrencePattern:
        """
        Create a new recurrence pattern in the database
        """
        db_recurrence = RecurrencePattern(
            frequency=recurrence_create.frequency,
            interval=recurrence_create.interval,
            days_of_week=recurrence_create.days_of_week,
            day_of_month=recurrence_create.day_of_month,
            end_condition=recurrence_create.end_condition,
            end_after_occurrences=recurrence_create.end_after_occurrences,
            end_date=recurrence_create.end_date
        )
        session.add(db_recurrence)
        session.commit()
        session.refresh(db_recurrence)
        return db_recurrence

    def get_recurrence_pattern_by_id(self, session: Session, recurrence_id: uuid.UUID) -> Optional[RecurrencePattern]:
        """
        Retrieve a recurrence pattern by ID
        """
        statement = select(RecurrencePattern).where(RecurrencePattern.id == recurrence_id)
        recurrence = session.exec(statement).first()
        return recurrence

    def update_recurrence_pattern(
        self, 
        session: Session, 
        recurrence_id: uuid.UUID, 
        recurrence_update: RecurrencePatternUpdate
    ) -> Optional[RecurrencePattern]:
        """
        Update a recurrence pattern's information
        """
        statement = select(RecurrencePattern).where(RecurrencePattern.id == recurrence_id)
        db_recurrence = session.exec(statement).first()

        if not db_recurrence:
            return None

        # Update fields that are provided
        update_data = recurrence_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_recurrence, field, value)

        session.add(db_recurrence)
        session.commit()
        session.refresh(db_recurrence)
        return db_recurrence

    def delete_recurrence_pattern(self, session: Session, recurrence_id: uuid.UUID) -> bool:
        """
        Delete a recurrence pattern by ID
        """
        statement = select(RecurrencePattern).where(RecurrencePattern.id == recurrence_id)
        db_recurrence = session.exec(statement).first()

        if not db_recurrence:
            return False

        session.delete(db_recurrence)
        session.commit()
        return True