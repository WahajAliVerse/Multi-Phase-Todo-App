from fastapi import HTTPException, status


class TaskNotFoundException(HTTPException):
    def __init__(self, task_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )


class UserNotFoundException(HTTPException):
    def __init__(self, user_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )


class TagNotFoundException(HTTPException):
    def __init__(self, tag_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with id {tag_id} not found"
        )


class InsufficientStorageException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_507_INSUFFICIENT_STORAGE,
            detail="Storage is full. Cannot create new tasks."
        )


class ConcurrentModificationException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="Resource was modified by another user. Please refresh and try again."
        )