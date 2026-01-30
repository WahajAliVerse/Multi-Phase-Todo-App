import { Task } from '../types/index';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card, CardContent, CardFooter } from './ui/Card';
import { Checkbox } from './ui/Checkbox';
import api from '../services/api';

interface TaskCardProps {
  task: Task;
  onUpdate?: () => void;
}

export const TaskCard = ({ task, onUpdate }: TaskCardProps) => {
  const toggleTaskStatus = async () => {
    try {
      await api.patch(`/tasks/${task.id}/toggle-complete`);
      if (onUpdate) {
        onUpdate(); // Refresh the task list
      }
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  };

  const deleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await api.delete(`/tasks/${task.id}`);
      if (onUpdate) {
        onUpdate(); // Refresh the task list
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <Card className={`border-l-4 ${
      task.priority === 'high' ? 'border-l-red-500' :
      task.priority === 'medium' ? 'border-l-yellow-500' :
      'border-l-green-500'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={task.status === 'completed'}
            onCheckedChange={toggleTaskStatus}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium truncate ${
              task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant={task.status === 'completed' ? 'secondary' : 'default'}>
                {task.status}
              </Badge>
              <Badge variant="outline">{task.priority}</Badge>
              {task.dueDate && (
                <Badge variant="outline">
                  {new Date(task.dueDate).toLocaleDateString()}
                </Badge>
              )}
              {task.tags?.map((tag, index) => (
                <Badge key={`${task.id}-${index}`} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        <Button variant="outline" size="sm">Edit</Button>
        <Button variant="destructive" size="sm" onClick={deleteTask}>Delete</Button>
      </CardFooter>
    </Card>
  );
};