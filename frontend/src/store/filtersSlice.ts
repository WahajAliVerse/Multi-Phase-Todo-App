import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the filter state
interface FiltersState {
  searchQuery: string;
  statusFilter: 'all' | 'active' | 'completed';
  priorityFilter: 'all' | 'low' | 'medium' | 'high';
  dateRangeFilter: 'all' | 'today' | 'week' | 'month' | 'overdue';
  sortBy: 'due_date' | 'priority' | 'alphabetical' | 'created_date';
  sortOrder: 'asc' | 'desc';
}

const initialState: FiltersState = {
  searchQuery: '',
  statusFilter: 'all',
  priorityFilter: 'all',
  dateRangeFilter: 'all',
  sortBy: 'created_date',
  sortOrder: 'desc',
};

// Create the slice
const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<FiltersState['statusFilter']>) => {
      state.statusFilter = action.payload;
    },
    setPriorityFilter: (state, action: PayloadAction<FiltersState['priorityFilter']>) => {
      state.priorityFilter = action.payload;
    },
    setDateRangeFilter: (state, action: PayloadAction<FiltersState['dateRangeFilter']>) => {
      state.dateRangeFilter = action.payload;
    },
    setSortBy: (state, action: PayloadAction<FiltersState['sortBy']>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<FiltersState['sortOrder']>) => {
      state.sortOrder = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.statusFilter = 'all';
      state.priorityFilter = 'all';
      state.dateRangeFilter = 'all';
      state.sortBy = 'created_date';
      state.sortOrder = 'desc';
    },
  },
});

export const {
  setSearchQuery,
  setStatusFilter,
  setPriorityFilter,
  setDateRangeFilter,
  setSortBy,
  setSortOrder,
  resetFilters,
} = filtersSlice.actions;
export default filtersSlice.reducer;