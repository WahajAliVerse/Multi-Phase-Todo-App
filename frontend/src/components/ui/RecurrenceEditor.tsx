import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  dayOfMonth?: number;
  endDate?: string;
  occurrenceCount?: number;
  ends: 'never' | 'after' | 'on_date';
}

interface RecurrenceEditorProps {
  recurrencePattern?: RecurrencePattern;
  onChange: (pattern: RecurrencePattern) => void;
  className?: string;
}

const RecurrenceEditor: React.FC<RecurrenceEditorProps> = ({ 
  recurrencePattern, 
  onChange, 
  className = '' 
}) => {
  const [pattern, setPattern] = useState<RecurrencePattern>(
    recurrencePattern || {
      frequency: 'daily',
      interval: 1,
      daysOfWeek: [],
      dayOfMonth: 1,
      endDate: '',
      occurrenceCount: 1,
      ends: 'never'
    }
  );

  const handleFrequencyChange = (value: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    const updatedPattern = { ...pattern, frequency: value };
    
    // Reset dependent fields based on frequency
    if (value === 'weekly') {
      updatedPattern.daysOfWeek = updatedPattern.daysOfWeek || ['mon'];
    } else if (value === 'monthly') {
      updatedPattern.dayOfMonth = updatedPattern.dayOfMonth || 1;
    }
    
    setPattern(updatedPattern);
    onChange(updatedPattern);
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    const updatedPattern = { ...pattern, interval: value };
    setPattern(updatedPattern);
    onChange(updatedPattern);
  };

  const handleDayOfWeekToggle = (day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun') => {
    const updatedDays = pattern.daysOfWeek?.includes(day)
      ? pattern.daysOfWeek.filter(d => d !== day)
      : [...(pattern.daysOfWeek || []), day];
    
    const updatedPattern = { ...pattern, daysOfWeek: updatedDays };
    setPattern(updatedPattern);
    onChange(updatedPattern);
  };

  const handleDayOfMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    // Ensure day is between 1 and 31
    const day = Math.min(31, Math.max(1, value));
    const updatedPattern = { ...pattern, dayOfMonth: day };
    setPattern(updatedPattern);
    onChange(updatedPattern);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedPattern = { ...pattern, endDate: e.target.value };
    setPattern(updatedPattern);
    onChange(updatedPattern);
  };

  const handleOccurrenceCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    const updatedPattern = { ...pattern, occurrenceCount: value };
    setPattern(updatedPattern);
    onChange(updatedPattern);
  };

  const handleEndsChange = (value: 'never' | 'after' | 'on_date') => {
    const updatedPattern = { ...pattern, ends: value };
    setPattern(updatedPattern);
    onChange(updatedPattern);
  };

  // Days of week for weekly recurrence
  const daysOfWeek = [
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Recurrence Pattern</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Frequency</Label>
            <Select value={pattern.frequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Repeat every</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="1"
                value={pattern.interval}
                onChange={handleIntervalChange}
                className="w-20"
              />
              <span>
                {pattern.frequency === 'daily' && 'day(s)'}
                {pattern.frequency === 'weekly' && 'week(s)'}
                {pattern.frequency === 'monthly' && 'month(s)'}
                {pattern.frequency === 'yearly' && 'year(s)'}
              </span>
            </div>
          </div>
        </div>
        
        {pattern.frequency === 'weekly' && (
          <div>
            <Label>On</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="flex items-center space-x-1">
                  <Checkbox
                    id={`day-${day.key}`}
                    checked={pattern.daysOfWeek?.includes(day.key) || false}
                    onCheckedChange={() => handleDayOfWeekToggle(day.key as any)}
                  />
                  <Label htmlFor={`day-${day.key}`} className="text-sm">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {pattern.frequency === 'monthly' && (
          <div>
            <Label>Day of Month</Label>
            <Input
              type="number"
              min="1"
              max="31"
              value={pattern.dayOfMonth}
              onChange={handleDayOfMonthChange}
              className="w-20"
            />
          </div>
        )}
        
        <div>
          <Label>Ends</Label>
          <Select value={pattern.ends} onValueChange={handleEndsChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="after">After</SelectItem>
              <SelectItem value="on_date">On Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {pattern.ends === 'after' && (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min="1"
              value={pattern.occurrenceCount}
              onChange={handleOccurrenceCountChange}
              className="w-20"
            />
            <Label>occurrence(s)</Label>
          </div>
        )}
        
        {pattern.ends === 'on_date' && (
          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              value={pattern.endDate}
              onChange={handleEndDateChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecurrenceEditor;