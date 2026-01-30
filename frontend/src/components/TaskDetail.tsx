import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/dateUtils';
import { Task } from '@/types/task';

interface TaskDetailProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  onBack?: () => void;
}

const TaskDetail = ({ task, onEdit, onDelete, onBack }: TaskDetailProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl">{task.title}</CardTitle>
          <div className="flex space-x-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                Edit
              </Button>
            )}
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack}>
                Back
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Badge className={`${getPriorityColor(task.priority)} text-white`}>
            {task.priority}
          </Badge>
          {task.status === 'completed' && <Badge variant="secondary">Completed</Badge>}
          {task.tags && task.tags.length > 0 && (
            <div className="flex space-x-1">
              {task.tags.map((tag: any) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="mt-1">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
              <p className="mt-1">
                {task.dueDate ? formatDate(new Date(task.dueDate)) : 'No due date'}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p className="mt-1">{formatDate(new Date(task.createdAt))}</p>
            </div>

            {task.completedAt && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
                <p className="mt-1">{formatDate(new Date(task.completedAt))}</p>
              </div>
            )}
          </div>

          {task.recurrencePatternId && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Recurrence</h3>
              <p className="mt-1">
                Has recurrence pattern (ID: {task.recurrencePatternId})
              </p>
            </div>
          )}

          {/* Note: Reminders are not part of the current Task interface */}

          <div className="pt-4 flex justify-end space-x-2">
            {onDelete && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onDelete(task.id)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { TaskDetail };