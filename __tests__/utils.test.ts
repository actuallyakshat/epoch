import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatTime,
  getDateString,
  parseDateString,
  generateMonthCalendar,
  isToday,
  isSameDay,
} from '../src/utils/date';
import {
  findTaskById,
  updateTaskInTree,
  deleteTaskFromTree,
  addSubtaskToTree,
  flattenTasks,
  getTaskStats,
} from '../src/utils/tree';
import { validateTaskTimes, validateTaskTitle } from '../src/utils/validation';
import type { Task } from '../src/types/task';

describe('Date Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    it('formats dates correctly with default format', () => {
      const date = new Date(2024, 0, 15);
      expect(formatDate(date)).toBe('Jan 15, 2024');
    });

    it('formats dates correctly with custom format', () => {
      const date = new Date(2024, 0, 15);
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15');
      expect(formatDate(date, 'MM/dd/yyyy')).toBe('01/15/2024');
    });

    it('handles different months correctly', () => {
      expect(formatDate(new Date(2024, 11, 25))).toBe('Dec 25, 2024');
      expect(formatDate(new Date(2024, 5, 10))).toBe('Jun 10, 2024');
    });
  });

  describe('formatTime', () => {
    it('formats time in 12-hour format by default', () => {
      const date = new Date(2024, 0, 15, 14, 30);
      expect(formatTime(date)).toBe('2:30 PM');
    });

    it('formats time in 24-hour format when requested', () => {
      const date = new Date(2024, 0, 15, 14, 30);
      expect(formatTime(date, false)).toBe('14:30');
    });

    it('handles midnight correctly', () => {
      const date = new Date(2024, 0, 15, 0, 0);
      expect(formatTime(date)).toBe('12:00 AM');
      expect(formatTime(date, false)).toBe('00:00');
    });

    it('handles noon correctly', () => {
      const date = new Date(2024, 0, 15, 12, 0);
      expect(formatTime(date)).toBe('12:00 PM');
      expect(formatTime(date, false)).toBe('12:00');
    });

    it('handles single-digit minutes', () => {
      const date = new Date(2024, 0, 15, 9, 5);
      expect(formatTime(date)).toBe('9:05 AM');
      expect(formatTime(date, false)).toBe('09:05');
    });
  });

  describe('getDateString', () => {
    it('returns date in YYYY-MM-DD format', () => {
      const date = new Date(2024, 0, 15);
      expect(getDateString(date)).toBe('2024-01-15');
    });

    it('handles single-digit months and days', () => {
      const date = new Date(2024, 0, 5);
      expect(getDateString(date)).toBe('2024-01-05');
    });

    it('handles double-digit months and days', () => {
      const date = new Date(2024, 11, 31);
      expect(getDateString(date)).toBe('2024-12-31');
    });
  });

  describe('parseDateString', () => {
    it('parses date string correctly', () => {
      const date = parseDateString('2024-01-15');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
    });

    it('handles edge cases: last day of month', () => {
      const date = parseDateString('2024-12-31');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(11);
      expect(date.getDate()).toBe(31);
    });

    it('handles edge cases: first day of year', () => {
      const date = parseDateString('2024-01-01');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(1);
    });

    it('handles leap year dates', () => {
      const date = parseDateString('2024-02-29');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(1);
      expect(date.getDate()).toBe(29);
    });

    it('sets time to midnight (00:00:00)', () => {
      const date = parseDateString('2024-01-15');
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
    });
  });

  describe('generateMonthCalendar', () => {
    it('generates correct week structure for a month starting on Monday', () => {
      const weeks = generateMonthCalendar(2024, 0);
      expect(weeks.length).toBeGreaterThan(0);
      expect(weeks[0]).toHaveLength(7);
      expect(weeks[weeks.length - 1]).toHaveLength(7);
    });

    it('generates correct week structure for a month with 31 days', () => {
      const weeks = generateMonthCalendar(2024, 0);
      const flatDates = weeks.flat();
      const januaryDates = flatDates.filter(
        (d) => d.getFullYear() === 2024 && d.getMonth() === 0
      );
      expect(januaryDates).toHaveLength(31);
    });

    it('generates correct week structure for February in leap year', () => {
      const weeks = generateMonthCalendar(2024, 1);
      const flatDates = weeks.flat();
      const februaryDates = flatDates.filter(
        (d) => d.getFullYear() === 2024 && d.getMonth() === 1
      );
      expect(februaryDates).toHaveLength(29);
    });

    it('generates correct week structure for February in non-leap year', () => {
      const weeks = generateMonthCalendar(2023, 1);
      const flatDates = weeks.flat();
      const februaryDates = flatDates.filter(
        (d) => d.getFullYear() === 2023 && d.getMonth() === 1
      );
      expect(februaryDates).toHaveLength(28);
    });

    it('includes dates from previous and next months to complete weeks', () => {
      const weeks = generateMonthCalendar(2024, 0);
      const firstWeek = weeks[0];
      const lastWeek = weeks[weeks.length - 1];

      const firstWeekContainsJanuaryDates = firstWeek.some(
        (d) => d.getMonth() === 0
      );
      const lastWeekContainsJanuaryDates = lastWeek.some(
        (d) => d.getMonth() === 0
      );

      expect(firstWeekContainsJanuaryDates).toBe(true);
      expect(lastWeekContainsJanuaryDates).toBe(true);
    });
  });

  describe('isToday', () => {
    it('correctly identifies today\'s date', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('returns false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('returns false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });

    it('returns false for different month same day', () => {
      const date = new Date();
      date.setMonth(date.getMonth() === 11 ? 0 : date.getMonth() + 1);
      expect(isToday(date)).toBe(false);
    });
  });

  describe('isSameDay', () => {
    it('returns true for same date', () => {
      const date1 = new Date(2024, 0, 15, 10, 30);
      const date2 = new Date(2024, 0, 15, 14, 45);
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('returns false for different days', () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2024, 0, 16);
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('returns false for different months', () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2024, 1, 15);
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('returns false for different years', () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2023, 0, 15);
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });
});

describe('Tree Utilities', () => {
  let mockTasks: Task[];
  let mockNestedTasks: Task[];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15'));

    mockTasks = [
      {
        id: '1',
        title: 'Task 1',
        state: 'todo',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        date: '2024-01-15',
        children: [],
      },
      {
        id: '2',
        title: 'Task 2',
        state: 'completed',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        date: '2024-01-15',
        children: [],
      },
    ];

    mockNestedTasks = [
      {
        id: '1',
        title: 'Parent Task',
        state: 'todo',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        date: '2024-01-15',
        children: [
          {
            id: '1-1',
            title: 'Subtask 1',
            state: 'completed',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
            date: '2024-01-15',
            children: [],
          },
          {
            id: '1-2',
            title: 'Subtask 2',
            state: 'todo',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
            date: '2024-01-15',
            children: [
              {
                id: '1-2-1',
                title: 'Nested Subtask',
                state: 'todo',
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-15'),
                date: '2024-01-15',
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: '2',
        title: 'Another Parent',
        state: 'completed',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        date: '2024-01-15',
        children: [],
      },
    ];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('findTaskById', () => {
    it('finds task at root level', () => {
      const found = findTaskById(mockTasks, '1');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('1');
      expect(found?.title).toBe('Task 1');
    });

    it('finds task nested in children', () => {
      const found = findTaskById(mockNestedTasks, '1-2-1');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('1-2-1');
      expect(found?.title).toBe('Nested Subtask');
    });

    it('finds task at first level of children', () => {
      const found = findTaskById(mockNestedTasks, '1-1');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('1-1');
      expect(found?.title).toBe('Subtask 1');
    });

    it('returns null when task not found', () => {
      const found = findTaskById(mockTasks, '999');
      expect(found).toBeNull();
    });

    it('returns null for empty task array', () => {
      const found = findTaskById([], '1');
      expect(found).toBeNull();
    });
  });

  describe('updateTaskInTree', () => {
    it('updates task at root level', () => {
      const updated = updateTaskInTree(mockTasks, '1', { title: 'Updated Task 1' });
      const found = findTaskById(updated, '1');
      expect(found?.title).toBe('Updated Task 1');
      expect(found?.updatedAt).toEqual(new Date('2024-01-15'));
    });

    it('updates task nested in children', () => {
      const updated = updateTaskInTree(mockNestedTasks, '1-2-1', {
        state: 'completed',
      });
      const found = findTaskById(updated, '1-2-1');
      expect(found?.state).toBe('completed');
    });

    it('updates updatedAt timestamp', () => {
      const initialDate = new Date('2024-01-15');
      vi.setSystemTime(initialDate);
      const tasks = [...mockTasks];
      vi.setSystemTime(new Date('2024-01-20'));

      const updated = updateTaskInTree(tasks, '1', { title: 'New Title' });
      const found = findTaskById(updated, '1');
      expect(found?.updatedAt).toEqual(new Date('2024-01-20'));
    });

    it('preserves other properties when updating', () => {
      const updated = updateTaskInTree(mockTasks, '1', { state: 'completed' });
      const found = findTaskById(updated, '1');
      expect(found?.title).toBe('Task 1');
      expect(found?.state).toBe('completed');
      expect(found?.id).toBe('1');
    });

    it('returns new array without modifying original', () => {
      const originalTitle = mockTasks[0].title;
      const updated = updateTaskInTree(mockTasks, '1', { title: 'Updated' });
      expect(mockTasks[0].title).toBe(originalTitle);
      expect(findTaskById(updated, '1')?.title).toBe('Updated');
    });
  });

  describe('deleteTaskFromTree', () => {
    it('removes task at root level', () => {
      const updated = deleteTaskFromTree(mockTasks, '1');
      expect(updated).toHaveLength(1);
      expect(findTaskById(updated, '1')).toBeNull();
    });

    it('removes task and its subtasks', () => {
      const updated = deleteTaskFromTree(mockNestedTasks, '1-2');
      expect(findTaskById(updated, '1-2')).toBeNull();
      expect(findTaskById(updated, '1-2-1')).toBeNull();
    });

    it('preserves siblings when deleting task', () => {
      const updated = deleteTaskFromTree(mockNestedTasks, '1-1');
      const parent = findTaskById(updated, '1');
      expect(parent?.children).toHaveLength(1);
      expect(parent?.children[0].id).toBe('1-2');
    });

    it('handles deleting from empty array', () => {
      const updated = deleteTaskFromTree([], '1');
      expect(updated).toHaveLength(0);
    });

    it('handles deleting non-existent task', () => {
      const updated = deleteTaskFromTree(mockTasks, '999');
      expect(updated).toHaveLength(mockTasks.length);
    });
  });

  describe('addSubtaskToTree', () => {
    it('adds subtask to correct parent', () => {
      const newSubtask: Task = {
        id: 'new-subtask',
        title: 'New Subtask',
        state: 'todo',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        date: '2024-01-15',
        children: [],
      };
      const updated = addSubtaskToTree(mockTasks, '1', newSubtask);
      const parent = findTaskById(updated, '1');
      expect(parent?.children).toHaveLength(1);
      expect(parent?.children[0].id).toBe('new-subtask');
    });

    it('adds subtask to nested parent', () => {
      const newSubtask: Task = {
        id: 'new-subtask',
        title: 'New Subtask',
        state: 'todo',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        date: '2024-01-15',
        children: [],
      };
      const updated = addSubtaskToTree(mockNestedTasks, '1-2', newSubtask);
      const parent = findTaskById(updated, '1-2');
      expect(parent?.children).toHaveLength(2);
      expect(parent?.children[1].id).toBe('new-subtask');
    });

    it('preserves tree structure', () => {
      const newSubtask: Task = {
        id: 'new-subtask',
        title: 'New Subtask',
        state: 'todo',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        date: '2024-01-15',
        children: [],
      };
      const updated = addSubtaskToTree(mockNestedTasks, '1', newSubtask);
      expect(findTaskById(updated, '1')?.children).toHaveLength(3);
      expect(findTaskById(updated, '1-1')?.id).toBe('1-1');
      expect(findTaskById(updated, '1-2')?.id).toBe('1-2');
    });

    it('returns new array without modifying original', () => {
      const newSubtask: Task = {
        id: 'new-subtask',
        title: 'New Subtask',
        state: 'todo',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        date: '2024-01-15',
        children: [],
      };
      const originalChildrenCount = mockNestedTasks[0].children.length;
      addSubtaskToTree(mockNestedTasks, '1', newSubtask);
      expect(mockNestedTasks[0].children).toHaveLength(originalChildrenCount);
    });
  });

  describe('flattenTasks', () => {
    it('flattens simple task list', () => {
      const flat = flattenTasks(mockTasks);
      expect(flat).toHaveLength(2);
    });

    it('flattens nested structure correctly', () => {
      const flat = flattenTasks(mockNestedTasks);
      expect(flat.length).toBeGreaterThan(2);
      expect(flat).toHaveLength(5);
    });

    it('includes all tasks in correct order', () => {
      const flat = flattenTasks(mockNestedTasks);
      expect(flat.map((t) => t.id)).toEqual([
        '1',
        '1-1',
        '1-2',
        '1-2-1',
        '2',
      ]);
    });

    it('handles empty task list', () => {
      const flat = flattenTasks([]);
      expect(flat).toHaveLength(0);
    });

    it('handles tasks with no children', () => {
      const flat = flattenTasks(mockTasks);
      expect(flat.every((t) => t.id)).toBe(true);
    });
  });

  describe('getTaskStats', () => {
    it('calculates total tasks correctly', () => {
      const stats = getTaskStats(mockTasks);
      expect(stats.total).toBe(2);
    });

    it('calculates completed tasks correctly', () => {
      const stats = getTaskStats(mockTasks);
      expect(stats.completed).toBe(1);
    });

    it('calculates percentage correctly', () => {
      const stats = getTaskStats(mockTasks);
      expect(stats.percentage).toBe(50);
    });

    it('calculates stats for nested tasks', () => {
      const stats = getTaskStats(mockNestedTasks);
      expect(stats.total).toBe(5);
      expect(stats.completed).toBe(2);
      expect(stats.percentage).toBe(40);
    });

    it('returns zero percentage for empty task list', () => {
      const stats = getTaskStats([]);
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.percentage).toBe(0);
    });

    it('rounds percentage correctly', () => {
      const threeTasks = [
        { ...mockTasks[0] },
        { ...mockTasks[1] },
        { ...mockTasks[0] },
      ];
      const stats = getTaskStats(threeTasks);
      expect(stats.percentage).toBe(33);
    });

    it('returns 100% when all tasks completed', () => {
      const allCompleted = mockTasks.map((t) => ({ ...t, state: 'completed' as const }));
      const stats = getTaskStats(allCompleted);
      expect(stats.percentage).toBe(100);
    });

    it('returns 0% when no tasks completed', () => {
      const allTodo = mockTasks.map((t) => ({ ...t, state: 'todo' as const }));
      const stats = getTaskStats(allTodo);
      expect(stats.percentage).toBe(0);
    });
  });
});

describe('Validation Utilities', () => {
  let mockTask: Task;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:00:00'));

    mockTask = {
      id: '1',
      title: 'Test Task',
      state: 'todo',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      date: '2024-01-15',
      children: [],
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('validateTaskTitle', () => {
    it('accepts valid title', () => {
      const result = validateTaskTitle('Valid Task Title');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects empty string', () => {
      const result = validateTaskTitle('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Task title cannot be empty');
    });

    it('rejects whitespace-only string', () => {
      const result = validateTaskTitle('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Task title cannot be empty');
    });

    it('rejects title longer than 255 characters', () => {
      const longTitle = 'a'.repeat(256);
      const result = validateTaskTitle(longTitle);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Task title is too long (max 255 characters)');
    });

    it('accepts title with exactly 255 characters', () => {
      const title = 'a'.repeat(255);
      const result = validateTaskTitle(title);
      expect(result.valid).toBe(true);
    });

    it('rejects title with tab characters only', () => {
      const result = validateTaskTitle('\t\t\t');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Task title cannot be empty');
    });

    it('accepts title with leading/trailing whitespace', () => {
      const result = validateTaskTitle('  Valid Title  ');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateTaskTimes', () => {
    it('passes validation when no times set', () => {
      const result = validateTaskTimes(mockTask);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('passes validation with only start time in past', () => {
      const taskWithStart = {
        ...mockTask,
        startTime: new Date('2024-01-15T09:00:00'),
      };
      const result = validateTaskTimes(taskWithStart);
      expect(result.valid).toBe(true);
    });

    it('passes validation with valid start and end times', () => {
      const taskWithTimes = {
        ...mockTask,
        startTime: new Date('2024-01-15T09:00:00'),
        endTime: new Date('2024-01-15T10:00:00'),
      };
      const result = validateTaskTimes(taskWithTimes);
      expect(result.valid).toBe(true);
    });

    it('rejects start time equal to end time', () => {
      const taskWithSameTimes = {
        ...mockTask,
        startTime: new Date('2024-01-15T10:00:00'),
        endTime: new Date('2024-01-15T10:00:00'),
      };
      const result = validateTaskTimes(taskWithSameTimes);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Start time must be before end time');
    });

    it('rejects start time after end time', () => {
      const taskWithInvalidOrder = {
        ...mockTask,
        startTime: new Date('2024-01-15T11:00:00'),
        endTime: new Date('2024-01-15T10:00:00'),
      };
      const result = validateTaskTimes(taskWithInvalidOrder);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Start time must be before end time');
    });

    it('rejects start time in the future', () => {
      const taskWithFutureStart = {
        ...mockTask,
        startTime: new Date('2024-01-15T11:00:00'),
      };
      const result = validateTaskTimes(taskWithFutureStart);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Start time cannot be in the future');
    });

    it('passes validation when end time is in future but start time is in past', () => {
      const taskWithFutureEnd = {
        ...mockTask,
        startTime: new Date('2024-01-15T09:00:00'),
        endTime: new Date('2024-01-15T11:00:00'),
      };
      const result = validateTaskTimes(taskWithFutureEnd);
      expect(result.valid).toBe(true);
    });

    it('handles start time exactly at current time', () => {
      const taskWithNowStart = {
        ...mockTask,
        startTime: new Date('2024-01-15T10:00:00'),
      };
      const result = validateTaskTimes(taskWithNowStart);
      expect(result.valid).toBe(true);
    });

    it('handles millisecond precision differences', () => {
      const taskWithPreciseTimes = {
        ...mockTask,
        startTime: new Date('2024-01-15T09:00:00.000'),
        endTime: new Date('2024-01-15T09:00:00.001'),
      };
      const result = validateTaskTimes(taskWithPreciseTimes);
      expect(result.valid).toBe(true);
    });
  });
});
