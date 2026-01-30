'use client';

import { Layout } from '@/components/Layout';
import { TaskList } from '@/components/TaskList';
import { TaskFilters } from '@/components/TaskFilters';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

interface Filters {
  status?: 'active' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  search?: string;
}

const DashboardPage = () => {
  const [filters, setFilters] = useState<Filters>({});

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <Layout>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button>Add Task</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              <TaskFilters onFilterChange={handleFilterChange} />
            </div>
          </div>

          {/* Task list */}
          <div className="lg:col-span-3">
            <div className="bg-card p-4 rounded-lg shadow">
              <TaskList
                filterStatus={filters.status}
                filterPriority={filters.priority}
                searchTerm={filters.search}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;