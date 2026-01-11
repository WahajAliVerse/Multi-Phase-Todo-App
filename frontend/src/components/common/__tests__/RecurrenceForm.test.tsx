import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecurrenceForm from '@/components/common/RecurrenceForm';

describe('RecurrenceForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders correctly in create mode', () => {
    render(
      <RecurrenceForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByText('Create Recurring Pattern')).toBeInTheDocument();
    expect(screen.getByText('Pattern Type')).toBeInTheDocument();
    expect(screen.getByText('Interval')).toBeInTheDocument();
    expect(screen.getByText('Create Pattern')).toBeInTheDocument();
  });

  it('renders correctly in edit mode', () => {
    const recurrenceData = {
      pattern_type: 'weekly',
      interval: 2,
      days_of_week: 'mon,fri',
      end_date: '2023-12-31',
      occurrence_count: 10
    };

    render(
      <RecurrenceForm 
        recurrence={recurrenceData}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByText('Edit Recurring Pattern')).toBeInTheDocument();
    expect(screen.getByText('Pattern Type')).toBeInTheDocument();
    expect(screen.getByText('Interval')).toBeInTheDocument();
    expect(screen.getByText('Update Pattern')).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', () => {
    render(
      <RecurrenceForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // Select pattern type
    fireEvent.mouseDown(screen.getByText('Pattern Type'));
    fireEvent.click(screen.getByText('Weekly'));

    // Change interval
    fireEvent.change(screen.getByLabelText('Interval'), { target: { value: '2' } });

    // Change days of week
    fireEvent.change(screen.getByLabelText('Days of Week'), { target: { value: 'mon,tue' } });

    // Change end date
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2023-12-31' } });

    // Change occurrence count
    fireEvent.change(screen.getByLabelText('Occurrence Count'), { target: { value: '5' } });

    // Submit the form
    fireEvent.click(screen.getByText('Create Pattern'));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      pattern_type: 'weekly',
      interval: 2,
      days_of_week: 'mon,tue',
      end_date: '2023-12-31',
      occurrence_count: 5,
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <RecurrenceForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('validates interval is a positive number', () => {
    render(
      <RecurrenceForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // Change interval to a negative number
    fireEvent.change(screen.getByLabelText('Interval'), { target: { value: '-1' } });

    // Submit the form
    fireEvent.click(screen.getByText('Create Pattern'));

    // The onSubmit should not be called because of validation
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows weekly-specific fields when weekly pattern is selected', () => {
    render(
      <RecurrenceForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // Select weekly pattern
    fireEvent.mouseDown(screen.getByText('Pattern Type'));
    fireEvent.click(screen.getByText('Weekly'));

    // Check that the days of week field is visible
    expect(screen.getByLabelText('Days of Week')).toBeInTheDocument();
  });

  it('shows monthly-specific fields when monthly pattern is selected', () => {
    render(
      <RecurrenceForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // Select monthly pattern
    fireEvent.mouseDown(screen.getByText('Pattern Type'));
    fireEvent.click(screen.getByText('Monthly'));

    // Check that the days of month field is visible
    expect(screen.getByLabelText('Days of Month')).toBeInTheDocument();
  });
});