import type { Task, RecurrencePattern, RecurrenceFrequency } from '../types/task';
import { getDateString, parseDateString } from '../utils/date';
import { addDays, addWeeks, addMonths, addYears, isWeekend, isBefore, isAfter, isSameDay } from 'date-fns';
import { v4 as uuid } from 'uuid';
import { logger } from '../utils/logger';

/**
 * Service for handling recurring tasks
 */
export class RecurringTaskService {
  /**
   * Check if a date matches the recurrence pattern
   */
  shouldGenerateOnDate(
    pattern: RecurrencePattern,
    baseDate: Date,
    targetDate: Date
  ): boolean {
    const targetDateStr = getDateString(targetDate);

    // Check excluded dates
    if (pattern.excludedDates && pattern.excludedDates.includes(targetDateStr)) {
      return false;
    }

    // Don't generate before base date
    if (isBefore(targetDate, baseDate)) {
      return false;
    }

    // Check end date if specified
    if (pattern.endDate && isAfter(targetDate, pattern.endDate)) {
      return false;
    }

    // Don't generate on the base date itself (original task)
    if (isSameDay(baseDate, targetDate)) {
      return false;
    }

    switch (pattern.frequency) {
      case 'daily':
        return true;

      case 'weekdays':
        return !isWeekend(targetDate);

      case 'weekly': {
        const daysDiff = Math.floor(
          (targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysDiff % 7 === 0;
      }

      case 'monthly': {
        // Same day of month as base date
        return targetDate.getDate() === baseDate.getDate();
      }

      case 'yearly': {
        // Same month and day as base date
        return (
          targetDate.getMonth() === baseDate.getMonth() &&
          targetDate.getDate() === baseDate.getDate()
        );
      }

      case 'custom': {
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          // Custom days of week
          return pattern.daysOfWeek.includes(targetDate.getDay());
        }
        if (pattern.interval) {
          // Custom interval in days
          const daysDiff = Math.floor(
            (targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysDiff % pattern.interval === 0;
        }
        return false;
      }

      default:
        return false;
    }
  }

  /**
   * Clone children tasks recursively for recurring instances
   */
  private cloneChildren(children: Task[], targetDateStr: string): Task[] {
    return children.map(child => ({
      ...child,
      id: uuid(),
      date: targetDateStr,
      state: 'todo',
      createdAt: new Date(),
      updatedAt: new Date(),
      startTime: undefined,
      endTime: undefined,
      // Recursively clone nested children
      children: this.cloneChildren(child.children, targetDateStr),
    }));
  }

  /**
   * Generate recurring task instance for a specific date
   */
  generateRecurringInstance(
    parentTask: Task,
    targetDate: Date
  ): Task {
    const targetDateStr = getDateString(targetDate);
    const parentDateStr = parentTask.date;

    logger.log("Generating recurring instance", {
      parentTaskId: parentTask.id,
      parentTaskTitle: parentTask.title,
      parentDate: parentDateStr,
      targetDate: targetDateStr,
      recurrence: parentTask.recurrence,
      childrenCount: parentTask.children.length
    });

    return {
      ...parentTask,
      id: uuid(),
      date: targetDateStr,
      state: 'todo',
      createdAt: new Date(),
      updatedAt: new Date(),
      startTime: undefined,
      endTime: undefined,
      isRecurringInstance: true,
      recurringParentId: parentTask.id,
      // Clone children for recurring instances
      children: this.cloneChildren(parentTask.children, targetDateStr),
    };
  }

  /**
   * Get the next occurrence date for a recurring task
   */
  getNextOccurrence(
    pattern: RecurrencePattern,
    baseDate: Date
  ): Date | null {
    let nextDate = new Date(baseDate);

    switch (pattern.frequency) {
      case 'daily':
        nextDate = addDays(baseDate, 1);
        break;

      case 'weekdays': {
        nextDate = addDays(baseDate, 1);
        while (isWeekend(nextDate)) {
          nextDate = addDays(nextDate, 1);
        }
        break;
      }

      case 'weekly':
        nextDate = addWeeks(baseDate, 1);
        break;

      case 'monthly':
        nextDate = addMonths(baseDate, 1);
        break;

      case 'yearly':
        nextDate = addYears(baseDate, 1);
        break;

      case 'custom': {
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          // Find next day of week
          nextDate = addDays(baseDate, 1);
          while (!pattern.daysOfWeek.includes(nextDate.getDay())) {
            nextDate = addDays(nextDate, 1);
            // Safety check to prevent infinite loop
            if (nextDate.getTime() - baseDate.getTime() > 7 * 24 * 60 * 60 * 1000) {
              return null;
            }
          }
        } else if (pattern.interval) {
          nextDate = addDays(baseDate, pattern.interval);
        } else {
          return null;
        }
        break;
      }

      default:
        return null;
    }

    // Check end date
    if (pattern.endDate && isAfter(nextDate, pattern.endDate)) {
      return null;
    }

    return nextDate;
  }

  /**
   * Generate frequency description for display
   */
  getFrequencyDescription(pattern: RecurrencePattern): string {
    switch (pattern.frequency) {
      case 'daily':
        return 'Daily';
      case 'weekdays':
        return 'Weekdays (Mon-Fri)';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      case 'custom': {
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const days = pattern.daysOfWeek.map(d => dayNames[d]).join(', ');
          return `Custom (${days})`;
        }
        if (pattern.interval) {
          return `Every ${pattern.interval} days`;
        }
        return 'Custom';
      }
      default:
        return 'Unknown';
    }
  }

  /**
   * Check if a task should generate an instance for a specific date
   */
  shouldTaskGenerateForDate(task: Task, targetDate: Date): boolean {
    if (!task.recurrence) {
      return false;
    }

    const baseDate = parseDateString(task.date);
    const shouldGenerate = this.shouldGenerateOnDate(task.recurrence, baseDate, targetDate);

    logger.log("Checking if task should generate for date", {
      taskId: task.id,
      taskTitle: task.title,
      targetDate: getDateString(targetDate),
      recurrence: task.recurrence,
      shouldGenerate
    });

    return shouldGenerate;
  }
}

export const recurringTaskService = new RecurringTaskService();
