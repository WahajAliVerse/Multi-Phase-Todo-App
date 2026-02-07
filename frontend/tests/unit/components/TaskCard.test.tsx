import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TaskCard } from '@/components/ui/TaskCard';
import { TaskModal } from '@/components/ui/TaskModal';
import taskReducer from '@/lib/store/slices/taskSlice';
import authReducer from '@/lib/store/slices/authSlice';
import { TaskRead } from '@/lib/types';

// Mock task data
const mockTask: TaskRead = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending',
  priority: 'medium',
  due_date: '2023-12-31T10:00:00Z',
  created_at: '2023-01-01T10:00:00Z',
  updated_at: '2023-01-01T10:00:00Z',
  user_id: '123e4567-e89b-12d3-a456-426614174001',
  tag_ids: [],
};

// Mock store
const mockStore = configureStore({
  reducer: {
    task: taskReducer,
    auth: authReducer,
  },
});

describe('TaskCard Component', () => {
  const defaultProps = {
    task: mockTask,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onCompleteChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task title and description', () => {
    render(
      <Provider store={mockStore}>
        <TaskCard {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('displays priority badge with correct styling', () => {
    render(
      <Provider store={mockStore}>
        <TaskCard {...defaultProps} />
      </Provider>
    );

    const priorityBadge = screen.getByText('medium');
    expect(priorityBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('calls onCompleteChange when checkbox is clicked', () => {
    render(
      <Provider store={mockStore}>
        <TaskCard {...defaultProps} />
      </Provider>
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(defaultProps.onCompleteChange).toHaveBeenCalledWith(
      mockTask.id,
      expect.any(Boolean) // The new completed state
    );
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <Provider store={mockStore}>
        <TaskCard {...defaultProps} />
      </Provider>
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <Provider store={mockStore}>
        <TaskCard {...defaultProps} />
      </Provider>
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockTask.id);
  });
});

describe('TaskModal Component', () => {
  const mockTags = ['work', 'personal', 'urgent'];
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when creating a new task', () => {
    render(
      <Provider store={mockStore}>
        <TaskModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onSave={mockOnSave}
          tags={mockTags}
        />
      </Provider>
    );

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
  });

  it('renders correctly when editing an existing task', () => {
    render(
      <Provider store={mockStore}>
        <TaskModal 
          isOpen={true} 
          onClose={mockOnClose} 
          task={mockTask}
          onSave={mockOnSave}
          tags={mockTags}
        />
      </Provider>
    );

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    render(
      <Provider store={mockStore}>
        <TaskModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onSave={mockOnSave}
          tags={mockTags}
        />
      </Provider>
    );

    // Fill in form fields
    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create Task'));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          description: 'New Description',
          status: 'pending',
          priority: 'medium',
        })
      );
    });
  });

  it('validates required fields', async () => {
    render(
      <Provider store={mockStore}>
        <TaskModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onSave={mockOnSave}
          tags={mockTags}
        />
      </Provider>
    );

    // Submit without filling required fields
    fireEvent.click(screen.getByText('Create Task'));
    
    // Should not call onSave due to validation
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});