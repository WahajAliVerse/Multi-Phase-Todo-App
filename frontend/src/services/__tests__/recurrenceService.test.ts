import { RecurrenceService } from '../services/recurrenceService';
import { RecurrencePattern } from '../models/recurrence';

describe('RecurrenceService', () => {
  describe('generateFutureInstances', () => {
    it('should generate future instances for daily pattern', () => {
      const pattern: RecurrencePattern = {
        id: '1',
        patternType: 'daily',
        interval: 1,
        endCondition: 'never',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const startDate = new Date('2023-01-01T00:00:00Z');
      const instances = RecurrenceService.generateFutureInstances(pattern, startDate, undefined, 5);

      expect(instances).toHaveLength(5);
      expect(instances[0]).toEqual(new Date('2023-01-01T00:00:00Z'));
      expect(instances[1]).toEqual(new Date('2023-01-02T00:00:00Z'));
      expect(instances[2]).toEqual(new Date('2023-01-03T00:00:00Z'));
    });

    it('should generate future instances for weekly pattern', () => {
      const pattern: RecurrencePattern = {
        id: '2',
        patternType: 'weekly',
        interval: 1,
        endCondition: 'never',
        daysOfWeek: ['mon', 'wed', 'fri'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const startDate = new Date('2023-01-02T00:00:00Z'); // Monday
      const instances = RecurrenceService.generateFutureInstances(pattern, startDate, undefined, 6);

      expect(instances).toHaveLength(6);
      // Should generate Mon, Wed, Fri for the first week
      expect(instances[0]).toEqual(new Date('2023-01-02T00:00:00Z')); // Mon
      expect(instances[1]).toEqual(new Date('2023-01-04T00:00:00Z')); // Wed
      expect(instances[2]).toEqual(new Date('2023-01-06T00:00:00Z')); // Fri
      // Next week
      expect(instances[3]).toEqual(new Date('2023-01-09T00:00:00Z')); // Mon
      expect(instances[4]).toEqual(new Date('2023-01-11T00:00:00Z')); // Wed
      expect(instances[5]).toEqual(new Date('2023-01-13T00:00:00Z')); // Fri
    });

    it('should respect end date', () => {
      const pattern: RecurrencePattern = {
        id: '3',
        patternType: 'daily',
        interval: 1,
        endCondition: 'never',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-03T00:00:00Z');
      const instances = RecurrenceService.generateFutureInstances(pattern, startDate, endDate, 10);

      expect(instances).toHaveLength(3); // Jan 1, 2, 3
      expect(instances[0]).toEqual(new Date('2023-01-01T00:00:00Z'));
      expect(instances[1]).toEqual(new Date('2023-01-02T00:00:00Z'));
      expect(instances[2]).toEqual(new Date('2023-01-03T00:00:00Z'));
    });

    it('should respect occurrence count end condition', () => {
      const pattern: RecurrencePattern = {
        id: '4',
        patternType: 'daily',
        interval: 1,
        endCondition: 'after_occurrences',
        occurrenceCount: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const startDate = new Date('2023-01-01T00:00:00Z');
      const instances = RecurrenceService.generateFutureInstances(pattern, startDate, undefined, 10);

      expect(instances).toHaveLength(3);
      expect(instances[0]).toEqual(new Date('2023-01-01T00:00:00Z'));
      expect(instances[1]).toEqual(new Date('2023-01-02T00:00:00Z'));
      expect(instances[2]).toEqual(new Date('2023-01-03T00:00:00Z'));
    });
  });

  describe('checkForConflicts', () => {
    it('should detect conflicts when recurrence pattern overlaps with existing tasks', () => {
      const pattern: RecurrencePattern = {
        id: '5',
        patternType: 'daily',
        interval: 1,
        endCondition: 'after_occurrences',
        occurrenceCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingTaskDates = [
        new Date('2023-01-02T00:00:00Z'),
        new Date('2023-01-04T00:00:00Z'),
      ];

      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-05T00:00:00Z');

      const hasConflict = RecurrenceService.checkForConflicts(pattern, existingTaskDates, startDate, endDate);

      expect(hasConflict).toBe(true);
    });

    it('should not detect conflicts when recurrence pattern does not overlap with existing tasks', () => {
      const pattern: RecurrencePattern = {
        id: '6',
        patternType: 'daily',
        interval: 2,
        endCondition: 'after_occurrences',
        occurrenceCount: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingTaskDates = [
        new Date('2023-01-02T00:00:00Z'),
        new Date('2023-01-04T00:00:00Z'),
      ];

      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-05T00:00:00Z');

      const hasConflict = RecurrenceService.checkForConflicts(pattern, existingTaskDates, startDate, endDate);

      expect(hasConflict).toBe(false);
    });
  });
});