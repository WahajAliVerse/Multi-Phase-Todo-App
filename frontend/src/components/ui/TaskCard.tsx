import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskRead } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface TaskCardProps {
  task: TaskRead;
  onEdit: (task: TaskRead) => void;
  onDelete: (taskId: string) => void;
  onCompleteChange: (taskId: string, completed: boolean) => void;
  onTagClick?: (tagName: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onCompleteChange, onTagClick }) => {
  const handleCompleteChange = (checked: boolean) => {
    onCompleteChange(task.id, checked);
  };

  const handleEdit = () => {
    onEdit(task);
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  return (
    <Card className={`transition-all duration-200 ${task.status === 'completed' ? 'opacity-70' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={handleCompleteChange}
              aria-label={`Mark task "${task.title}" as ${task.status === 'completed' ? 'incomplete' : 'complete'}`}
            />
            <div className="flex-1 min-w-0">
              <CardTitle className={`text-lg truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </CardTitle>
              {task.due_date && (
                <div className="text-xs text-muted-foreground mt-1">
                  Due: {formatDate(new Date(task.due_date))}
                </div>
              )}
            </div>
          </div>
          <Badge className={getPriorityColor(task.priority)} variant="secondary" className="self-start">
            {task.priority}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {task.description && (
          <CardDescription className={`break-words ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
            {task.description}
          </CardDescription>
        )}
        
        {task.tag_ids && task.tag_ids.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tag_ids.map((tagId, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="cursor-pointer hover:bg-accent text-xs"
                onClick={() => onTagClick && onTagClick(tagId)}
              >
                #{tagId}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row sm:justify-between pt-2 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full sm:w-auto"
          onClick={handleEdit}
        >
          Edit
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full sm:w-auto"
          onClick={handleDelete}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;