import { Task } from '@/types';
import { useState, memo } from 'react';
import { useAppDispatch } from '@/hooks/redux';
import { updateTask, deleteTask, toggleTaskComplete } from '@/store/slices/taskSlice';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface TaskCardProps {
  task: Task;
}

const TaskCard = memo(({ task }: TaskCardProps) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');

  const handleSave = () => {
    dispatch(updateTask({
      id: task.id,
      title: editedTitle,
      description: editedDescription,
      updatedAt: new Date().toISOString()
    }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    dispatch(deleteTask(task.id));
  };

  const handleToggleComplete = async () => {
    try {
      await dispatch(toggleTaskComplete(task.id)).unwrap();
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      // In a real app, you might want to show an error message to the user
    }
  };

  // Determine priority color
  const priorityColor =
    task.priority === 'high' ? 'bg-destructive text-destructive-foreground' :
    task.priority === 'medium' ? 'bg-yellow-500 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-50' :
    'bg-success text-success-foreground';

  return (
    <Card className={`transition-all duration-200 ${
      task.status === 'completed'
        ? 'bg-accent/50 border-accent opacity-70'
        : 'hover:shadow-md'
    }`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <input
              type="checkbox"
              checked={task.status === 'completed'}
              onChange={handleToggleComplete}
              className="mt-1 h-5 w-5 rounded border-input text-primary focus:ring-primary"
              aria-label={`Mark task "${task.title}" as ${task.status === 'completed' ? 'incomplete' : 'complete'}`}
            />

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full font-medium text-foreground bg-transparent border-b border-input focus:outline-none focus:ring-0"
                  autoFocus
                  aria-label="Edit task title"
                />
              ) : (
                <h3 className={`font-medium truncate ${
                  task.status === 'completed'
                    ? 'text-muted-foreground line-through'
                    : 'text-foreground'
                }`}>
                  {task.title}
                </h3>
              )}

              {isEditing ? (
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full mt-2 text-sm text-muted-foreground bg-transparent border-b border-input focus:outline-none focus:ring-0 resize-none"
                  rows={3}
                  aria-label="Edit task description"
                />
              ) : task.description ? (
                <p className="mt-1 text-sm text-muted-foreground truncate">
                  {task.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColor}`}>
              {task.priority}
            </span>

            {task.dueDate && (
              <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex justify-end space-x-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} size="sm" className="h-8">
                Save
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="h-8"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="h-8"
              >
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                size="sm"
                className="h-8"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;