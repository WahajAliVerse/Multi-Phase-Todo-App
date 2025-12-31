import json
from dataclasses import dataclass, asdict
from typing import Optional


@dataclass
class Task:
    id: int
    title: str
    description: str = ""
    completed: bool = False

    def mark_complete(self) -> None:
        """Mark the task as complete"""
        self.completed = True

    def mark_incomplete(self) -> None:
        """Mark the task as incomplete"""
        self.completed = False

    def update_details(self, title: Optional[str] = None, description: Optional[str] = None) -> None:
        """Update task details"""
        if title is not None:
            self.title = title
        if description is not None:
            self.description = description

    def to_dict(self) -> dict:
        """Convert task to dictionary representation"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "completed": self.completed
        }

    def to_json(self) -> str:
        """Convert task to JSON string representation for web integration"""
        return json.dumps(self.to_dict())

    @classmethod
    def from_dict(cls, data: dict):
        """Create a Task instance from a dictionary"""
        return cls(
            id=data['id'],
            title=data['title'],
            description=data.get('description', ''),
            completed=data.get('completed', False)
        )

    @classmethod
    def from_json(cls, json_str: str):
        """Create a Task instance from a JSON string"""
        data = json.loads(json_str)
        return cls.from_dict(data)