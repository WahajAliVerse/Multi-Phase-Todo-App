import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from '@/components/TaskForm/TaskForm';
import TaskList from '@/components/TaskList/TaskList';
import { Task } from '@/types/task';

// Mock task data
const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  status: 'active',
  priority: 'medium',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

describe('TaskForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders correctly in create mode', () => {
    render(
      <TaskForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('renders correctly in edit mode', () => {
    render(
      <TaskForm 
        task={mockTask}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockTask.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockTask.description || '')).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', () => {
    render(
      <TaskForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } });
    
    // Select priority
    fireEvent.mouseDown(screen.getByLabelText('Priority'));
    fireEvent.click(screen.getByText('High'));

    // Submit the form
    fireEvent.click(screen.getByText('Create Task'));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New Task',
      description: 'New Description',
      priority: 'high',
      status: 'active',
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <TaskForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});

describe('TaskList Component', () => {
  const mockOnToggleComplete = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const tasks: Task[] = [
    { ...mockTask, id: 1 },
    { ...mockTask, id: 2, title: 'Second Task', priority: 'high' },
  ];

  beforeEach(() => {
    mockOnToggleComplete.mockClear();
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  it('renders correctly with tasks', () => {
    render(
      <TaskList 
        tasks={tasks}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Second Task')).toBeInTheDocument();
  });

  it('renders empty state when no tasks', () => {
    render(
      <TaskList 
        tasks={[]}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('No tasks found. Create a new task to get started!')).toBeInTheDocument();
  });

  it('calls onToggleComplete when task completion is toggled', () => {
    render(
      <TaskList 
        tasks={tasks}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const completeButton = screen.getAllByLabelText('CheckCircleOutlineIcon')[0];
    fireEvent.click(completeButton);
    expect(mockOnToggleComplete).toHaveBeenCalledWith(tasks[0]);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <TaskList 
        tasks={tasks}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(tasks[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <TaskList 
        tasks={tasks}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(tasks[0].id);
  });
});