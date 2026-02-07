import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskRead } from '@/lib/types';

interface CalendarViewProps {
  tasks: TaskRead[];
  onTaskSelect?: (task: TaskRead) => void;
  className?: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskSelect, className = '' }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get tasks for a specific date
  const getTasksForDate = (date: Date): TaskRead[] => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      
      const taskDate = new Date(task.due_date);
      return isSameDay(taskDate, date);
    });
  };

  // Navigate to the next month
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Navigate to the previous month
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Get the days to display in the calendar
  const getCalendarDays = (): Date[] => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    // Start from Sunday of the week that includes the first day of the month
    const startDate = new Date(start);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Adjust to Sunday
    
    // End on Saturday of the week that includes the last day of the month
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // Adjust to Saturday
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  // Render the calendar
  const renderCalendar = () => {
    const days = getCalendarDays();
    const weeks = [];
    
    // Group days into weeks
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return weeks.map((week, weekIndex) => (
      <div key={weekIndex} className="grid grid-cols-7 gap-1">
        {week.map((day, dayIndex) => {
          const dayTasks = getTasksForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          return (
            <div 
              key={dayIndex}
              className={`
                min-h-24 p-2 border rounded-lg
                ${!isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : ''}
                ${isSelected ? 'bg-primary/10 border-primary' : 'border-border'}
                hover:bg-accent cursor-pointer transition-colors
              `}
              onClick={() => {
                setSelectedDate(day);
                if (dayTasks.length > 0 && onTaskSelect) {
                  // If there's only one task, select it directly
                  if (dayTasks.length === 1) {
                    onTaskSelect(dayTasks[0]);
                  }
                }
              }}
            >
              <div className="flex justify-between items-start">
                <span className={`
                  text-sm font-medium
                  ${isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''}
                `}>
                  {format(day, 'd')}
                </span>
                {dayTasks.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {dayTasks.length}
                  </Badge>
                )}
              </div>
              
              <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                {dayTasks.slice(0, 3).map((task) => (
                  <div 
                    key={task.id}
                    className={`
                      text-xs p-1 rounded truncate
                      ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      }
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTaskSelect) onTaskSelect(task);
                    }}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            ← Prev
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            Next →
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        
        {renderCalendar()}
        
        {selectedDate && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">
              Tasks for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            {getTasksForDate(selectedDate).length > 0 ? (
              <ul className="space-y-2">
                {getTasksForDate(selectedDate).map(task => (
                  <li 
                    key={task.id} 
                    className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => onTaskSelect && onTaskSelect(task)}
                  >
                    <div className="flex justify-between items-start">
                      <span className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                        {task.title}
                      </span>
                      <Badge 
                        variant={task.priority === 'high' ? 'destructive' : 
                                task.priority === 'medium' ? 'default' : 'secondary'}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic">No tasks due on this date</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarView;