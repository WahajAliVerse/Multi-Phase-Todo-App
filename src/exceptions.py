class TaskNotFoundError(Exception):
    """Raised when a task with the given ID is not found"""
    pass


class InvalidTaskError(Exception):
    """Raised when task validation fails"""
    pass


class StorageError(Exception):
    """Raised when storage operations fail"""
    pass