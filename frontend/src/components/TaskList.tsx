import { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { TaskCard } from '../components/TaskCard';
import { Button } from '../components/ui/Button';
import { taskApi } from '../services/api';

interface TaskListProps {
  filterStatus?: 'active' | 'completed';
  filterPriority?: 'low' | 'medium' | 'high';
  searchTerm?: string;
}

export const TaskList = ({ 
  filterStatus, 
  filterPriority, 
  searchTerm 
}: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [filterStatus, filterPriority, searchTerm]);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const params: Record<string, string | number> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (searchTerm) params.search = searchTerm;

      const response = await taskApi.getAll(params);
      setTasks(response.data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Error loading tasks: {error}</p>
        <Button onClick={fetchTasks} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No tasks found. Create your first task to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
          ))}
        </div>
      )}
    </div>
  );
};