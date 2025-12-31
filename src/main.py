#!/usr/bin/env python3
"""
Main entry point for the Console Todo Application.
"""

from storage.in_memory_storage import InMemoryStorage
from cli.console_ui import ConsoleUI


def main():
    """Initialize and run the application."""
    storage = InMemoryStorage()
    ui = ConsoleUI(storage)
    ui.run()


if __name__ == "__main__":
    main()