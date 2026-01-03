export type TaskState = 'todo' | 'completed' | 'delegated' | 'delayed';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'weekdays' | 'monthly' | 'yearly' | 'custom';

export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval?: number; // For custom: every N days/weeks/months
  daysOfWeek?: number[]; // For custom: [0-6] where 0 is Sunday
  endDate?: Date; // Optional end date for recurrence
  excludedDates?: string[]; // YYYY-MM-DD strings to exclude from recurrence
}

export interface Task {
  id: string;
  title: string;
  state: TaskState;
  createdAt: Date;
  updatedAt: Date;
  startTime?: Date;
  endTime?: Date;
  children: Task[];
  parentId?: string;
  date: string;
  recurrence?: RecurrencePattern;
  isRecurringInstance?: boolean; // If this task was generated from a recurring task
  recurringParentId?: string; // ID of the original recurring task
}

export interface TaskTree {
  [date: string]: Task[];
}

export interface TaskStats {
  total: number;
  completed: number;
  percentage: number;
}
