import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Search from '@/components/Search/Search';
import Filters from '@/components/Filters/Filters';

describe('Search Component', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders correctly', () => {
    render(<Search onSearch={mockOnSearch} />);
    
    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls onSearch when text is entered', () => {
    render(<Search onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('updates when input value changes', () => {
    render(<Search onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByRole('textbox');
    
    // Change input to "first query"
    fireEvent.change(searchInput, { target: { value: 'first query' } });
    expect(mockOnSearch).toHaveBeenCalledWith('first query');
    
    // Change input to "second query"
    fireEvent.change(searchInput, { target: { value: 'second query' } });
    expect(mockOnSearch).toHaveBeenCalledWith('second query');
  });
});

describe('Filters Component', () => {
  const mockOnFilter = jest.fn();

  beforeEach(() => {
    mockOnFilter.mockClear();
  });

  it('renders correctly with all filter options', () => {
    render(<Filters onFilter={mockOnFilter} />);
    
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('allows selecting different status filters', () => {
    render(<Filters onFilter={mockOnFilter} />);
    
    const statusSelect = screen.getByText('All'); // Default value
    fireEvent.mouseDown(statusSelect);
    
    const activeOption = screen.getByText('Active');
    fireEvent.click(activeOption);
    
    // Click Apply button to trigger the filter
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    // Check that onFilter was called with the selected status
    expect(mockOnFilter).toHaveBeenCalledWith({
      status: 'active',
      priority: 'all',
      dateRange: 'all'
    });
  });

  it('allows selecting different priority filters', () => {
    render(<Filters onFilter={mockOnFilter} />);
    
    const prioritySelect = screen.getByText('All'); // Default value
    fireEvent.mouseDown(prioritySelect);
    
    const highOption = screen.getByText('High');
    fireEvent.click(highOption);
    
    // Click Apply button to trigger the filter
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    expect(mockOnFilter).toHaveBeenCalledWith({
      status: 'all',
      priority: 'high',
      dateRange: 'all'
    });
  });

  it('allows selecting different date range filters', () => {
    render(<Filters onFilter={mockOnFilter} />);
    
    const dateRangeSelect = screen.getByText('All Dates'); // Default value
    fireEvent.mouseDown(dateRangeSelect);
    
    const todayOption = screen.getByText('Today');
    fireEvent.click(todayOption);
    
    // Click Apply button to trigger the filter
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    expect(mockOnFilter).toHaveBeenCalledWith({
      status: 'all',
      priority: 'all',
      dateRange: 'today'
    });
  });

  it('resets filters when reset button is clicked', () => {
    render(<Filters onFilter={mockOnFilter} />);
    
    // First, change some filters
    const statusSelect = screen.getByText('All');
    fireEvent.mouseDown(statusSelect);
    const activeOption = screen.getByText('Active');
    fireEvent.click(activeOption);
    
    // Then click Reset button
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // Check that onFilter was called with default values
    expect(mockOnFilter).toHaveBeenCalledWith({
      status: 'all',
      priority: 'all',
      dateRange: 'all'
    });
  });

  it('applies all selected filters together', () => {
    render(<Filters onFilter={mockOnFilter} />);
    
    // Select status
    const statusSelect = screen.getByText('All');
    fireEvent.mouseDown(statusSelect);
    const completedOption = screen.getByText('Completed');
    fireEvent.click(completedOption);
    
    // Select priority
    const prioritySelect = screen.getByText('All');
    fireEvent.mouseDown(prioritySelect);
    const lowOption = screen.getByText('Low');
    fireEvent.click(lowOption);
    
    // Select date range
    const dateRangeSelect = screen.getByText('All Dates');
    fireEvent.mouseDown(dateRangeSelect);
    const weekOption = screen.getByText('This Week');
    fireEvent.click(weekOption);
    
    // Click Apply button
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    expect(mockOnFilter).toHaveBeenCalledWith({
      status: 'completed',
      priority: 'low',
      dateRange: 'week'
    });
  });
});