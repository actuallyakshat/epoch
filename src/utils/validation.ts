import type { Task } from '../types/task';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateTaskTimes = (task: Task): ValidationResult => {
  if (task.startTime && task.endTime) {
    if (task.startTime >= task.endTime) {
      return {
        valid: false,
        error: 'Start time must be before end time',
      };
    }
  }

  if (task.startTime && !task.endTime) {
    // Task has been started but not completed
    if (task.startTime > new Date()) {
      return {
        valid: false,
        error: 'Start time cannot be in the future',
      };
    }
  }

  return { valid: true };
};

export const validateTaskTitle = (title: string): ValidationResult => {
  if (!title || title.trim().length === 0) {
    return {
      valid: false,
      error: 'Task title cannot be empty',
    };
  }

  if (title.length > 255) {
    return {
      valid: false,
      error: 'Task title is too long (max 255 characters)',
    };
  }

  return { valid: true };
};
