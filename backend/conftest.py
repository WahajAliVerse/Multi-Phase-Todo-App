"""
Test fixtures for the todo application.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..src.database.base import Base
from ..src.database.connection import DATABASE_URL


@pytest.fixture(scope="session")
def test_engine():
    """
    Create a test database engine.
    """
    engine = create_engine(DATABASE_URL.replace("todo_app.db", "test_todo_app.db"))
    Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()


@pytest.fixture(scope="function")
def test_session(test_engine):
    """
    Create a test database session.
    """
    connection = test_engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()

    yield session

    session.close()
    transaction.rollback()
    connection.close()