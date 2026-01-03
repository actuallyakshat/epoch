import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskService } from '../src/services/taskService';
import { CalendarService } from '../src/services/calendarService';
import type { Task, TaskTree, TaskState } from '../src/types/task';
import { getDateString } from '../src/utils/date';

// Mock logger to avoid console noise during tests
vi.mock('../src/utils/logger', () => ({
  logger: {
    log: vi.fn(),
  },
}));

// Mock UUID to return deterministic values or just check format
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

describe('TaskService', () => {
  let taskService: TaskService;
  let date: string;
  let mockTask: Task;
  let mockTree: TaskTree;

  beforeEach(() => {
    taskService = new TaskService();
    date = '2023-01-01';
    
    mockTask = {
      id: 'existing-task-id',
      title: 'Existing Task',
      state: 'todo',
      createdAt: new Date(),
      updatedAt: new Date(),
      children: [],
      date: date,
    };

    mockTree = {
      [date]: [mockTask],
    };
  });

  describe('createTask', () => {
    it('creates task with correct structure, UUID, timestamps', () => {
      const title = 'New Task';
      const task = taskService.createTask(title, date);

      expect(task).toEqual({
        id: 'test-uuid-1234',
        title,
        state: 'todo',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        children: [],
        date,
      });
    });

    it('throws error for invalid title', () => {
      expect(() => taskService.createTask('', date)).toThrow();
      expect(() => taskService.createTask('   ', date)).toThrow();
    });
  });

  describe('excludeRecurringInstance', () => {
    it('excludes a recurring task instance correctly', () => {
      const parentTaskId = 'recurring-parent-id';
      const recurringTask: Task = {
        ...mockTask,
        id: parentTaskId,
        recurrence: {
          frequency: 'daily',
          excludedDates: []
        }
      };
      
      const tree = { [date]: [recurringTask] };
      const excludeDate = '2023-01-02';
      
      const newTree = taskService.excludeRecurringInstance(tree, parentTaskId, excludeDate);
      const updatedTask = newTree[date].find(t => t.id === parentTaskId);
      
      expect(updatedTask?.recurrence?.excludedDates).toContain(excludeDate);
    });

    it('throws error if parent recurring task not found', () => {
      expect(() => 
        taskService.excludeRecurringInstance(mockTree, 'non-existent-id', '2023-01-02')
      ).toThrow('Parent recurring task not found');
    });

    it('does nothing if task has no recurrence', () => {
      const newTree = taskService.excludeRecurringInstance(mockTree, mockTask.id, '2023-01-02');
      const updatedTask = newTree[date].find(t => t.id === mockTask.id);
      expect(updatedTask).toEqual(mockTask);
    });

    it('preserves other tasks in the list', () => {
      const parentTaskId = 'recurring-parent-id';
      const recurringTask: Task = { 
        ...mockTask, 
        id: parentTaskId, 
        recurrence: { frequency: 'daily', excludedDates: [] } 
      };
      const otherTask: Task = { ...mockTask, id: 'other-task' };
      
      const tree = { [date]: [recurringTask, otherTask] };
      const newTree = taskService.excludeRecurringInstance(tree, parentTaskId, '2023-01-02');
      
      expect(newTree[date]).toHaveLength(2);
      expect(newTree[date].find(t => t.id === 'other-task')).toEqual(otherTask);
    });
  });

  describe('updateTask', () => {
    it('throws error if task not found', () => {
      expect(() => 
        taskService.updateTask(mockTree, 'non-existent-id', { title: 'New' })
      ).toThrow('Task not found');
    });

    it('updates task fields correctly', () => {
      const updates = { title: 'Updated Title' };
      const newTree = taskService.updateTask(mockTree, mockTask.id, updates);
      
      const updatedTask = newTree[date].find(t => t.id === mockTask.id);
      expect(updatedTask?.title).toBe('Updated Title');
      expect(updatedTask?.updatedAt.getTime()).toBeGreaterThanOrEqual(mockTask.updatedAt.getTime());
    });

    it('throws error for invalid title', () => {
      expect(() => taskService.updateTask(mockTree, mockTask.id, { title: '' })).toThrow();
    });

    it('validates time constraints', () => {
      const startTime = new Date('2023-01-01T10:00:00');
      const endTime = new Date('2023-01-01T09:00:00'); // End before start

      // Assuming updateTask performs validation internally or calls validation utility
      // If validation fails, it should throw
      expect(() => 
        taskService.updateTask(mockTree, mockTask.id, { startTime, endTime })
      ).toThrow();
    });
  });

  describe('deleteTask', () => {
    it('removes task from tree, returns new tree', () => {
      const newTree = taskService.deleteTask(mockTree, mockTask.id);
      expect(newTree[date]).toHaveLength(0);
    });

    it('handles task not found gracefully (returns original tree)', () => {
      // deleteTask returns same tree if task not found
      const newTree = taskService.deleteTask(mockTree, 'non-existent-id');
      expect(newTree).toBe(mockTree);
    });

    it('returns original tree if task not found (branch coverage)', () => {
       // Just to ensure we hit the line 81-82 in taskService.ts explicitly
       const newTree = taskService.deleteTask(mockTree, 'missing-id');
       expect(newTree).toEqual(mockTree);
    });
  });

  describe('addSubtask', () => {
    it('adds subtask to correct parent', () => {
      const subtaskTitle = 'Subtask';
      const newTree = taskService.addSubtask(mockTree, mockTask.id, subtaskTitle);
      
      const parentTask = newTree[date].find(t => t.id === mockTask.id);
      expect(parentTask?.children).toHaveLength(1);
      expect(parentTask?.children[0].title).toBe(subtaskTitle);
      expect(parentTask?.children[0].parentId).toBe(mockTask.id);
    });

    it('throws error for invalid parent', () => {
      expect(() => 
        taskService.addSubtask(mockTree, 'non-existent-parent', 'Subtask')
      ).toThrow('Parent task not found');
    });
  });

  describe('changeTaskState', () => {
    it('updates state and sets endTime for terminal states', () => {
      const terminalStates: TaskState[] = ['completed', 'delegated', 'delayed'];
      
      terminalStates.forEach(state => {
        const newTree = taskService.changeTaskState(mockTree, mockTask.id, state);
        const task = newTree[date].find(t => t.id === mockTask.id);
        
        expect(task?.state).toBe(state);
        expect(task?.endTime).toBeDefined();
      });
    });

    it('clears endTime for non-terminal states', () => {
      // First set it to completed to have an endTime
      let tree = taskService.changeTaskState(mockTree, mockTask.id, 'completed');
      
      // Then set back to todo
      tree = taskService.changeTaskState(tree, mockTask.id, 'todo');
      const task = tree[date].find(t => t.id === mockTask.id);
      
      expect(task?.state).toBe('todo');
      expect(task?.endTime).toBeUndefined();
    });
  });

  describe('startTask', () => {
    it('sets startTime, clears endTime, resets state to todo', () => {
      // Setup: task completed with endTime
      let tree = taskService.changeTaskState(mockTree, mockTask.id, 'completed');
      
      tree = taskService.startTask(tree, mockTask.id);
      const task = tree[date].find(t => t.id === mockTask.id);
      
      expect(task?.state).toBe('todo');
      expect(task?.startTime).toBeDefined();
      expect(task?.endTime).toBeUndefined();
    });
  });

  describe('getTasksForDate', () => {
    it('returns tasks for specific date', () => {
      const tasks = taskService.getTasksForDate(mockTree, date);
      expect(tasks).toEqual([mockTask]);
    });
    
    it('returns empty array for date with no tasks', () => {
      const tasks = taskService.getTasksForDate(mockTree, '2099-01-01');
      expect(tasks).toEqual([]);
    });
  });

  describe('getAllTasks', () => {
    it('flattens and returns all tasks', () => {
      const otherDate = '2023-01-02';
      const otherTask = { ...mockTask, id: 'other-id', date: otherDate };
      const multiDateTree = { ...mockTree, [otherDate]: [otherTask] };
      
      const allTasks = taskService.getAllTasks(multiDateTree);
      expect(allTasks).toHaveLength(2);
      expect(allTasks.map(t => t.id)).toContain(mockTask.id);
      expect(allTasks.map(t => t.id)).toContain(otherTask.id);
    });
  });

  describe('getTaskStats', () => {
    it('returns stats for specific date', () => {
      // Add a completed task
      const completedTask = { ...mockTask, id: 'completed-task', state: 'completed' as TaskState };
      const treeWithStats = { [date]: [mockTask, completedTask] };
      
      const stats = taskService.getTaskStats(treeWithStats, date);
      expect(stats).toEqual({
        total: 2,
        completed: 1,
        percentage: 50
      });
    });
  });
});

describe('CalendarService', () => {
  let calendarService: CalendarService;
  
  beforeEach(() => {
    calendarService = new CalendarService();
  });

  describe('generateMonthView', () => {
    it('generates correct month structure', () => {
      const year = 2023;
      const month = 0; // January
      const selectedDate = { year, month, day: 1 };
      const tasks = {};

      const view = calendarService.generateMonthView(year, month, selectedDate, tasks);
      
      expect(view.year).toBe(year);
      expect(view.month).toBe(month);
      expect(view.weeks.length).toBeGreaterThanOrEqual(4);
      
      // Jan 1 2023 was a Sunday. 
      // With weekStartsOn: 1 (Monday), Jan 1 should be the last day of the first week (if it falls in it) 
      // or the first week starts with Dec 26.
      
      // Let's check the first day of the calendar view
      // It should be Dec 26, 2022
      const firstDay = view.weeks[0][0];
      expect(firstDay.date.day).toBe(26);
      expect(firstDay.date.month).toBe(11); // December (0-indexed)
      expect(firstDay.date.year).toBe(2022);
      
      // And the last day of the first week should be Jan 1
      const sunday = view.weeks[0][6];
      expect(sunday.date.day).toBe(1);
      expect(sunday.date.month).toBe(0);
      expect(sunday.date.year).toBe(2023);
    });

    it('includes task counts for each day', () => {
      const year = 2023;
      const month = 0; // January
      const selectedDate = { year, month, day: 1 };
      const dateStr = '2023-01-15';
      const tasks: TaskTree = {
        [dateStr]: [
          { id: '1', title: 'Task 1', state: 'todo', createdAt: new Date(), updatedAt: new Date(), children: [], date: dateStr },
          { id: '2', title: 'Task 2', state: 'todo', createdAt: new Date(), updatedAt: new Date(), children: [], date: dateStr }
        ]
      };

      const view = calendarService.generateMonthView(year, month, selectedDate, tasks);
      
      // Find the day cell for Jan 15
      const dayCell = view.weeks.flat().find(d => d.dateString === dateStr);
      
      expect(dayCell?.hasTasks).toBe(true);
      expect(dayCell?.taskCount).toBe(2);
    });
  });

  describe('getNextMonth', () => {
    it('increments month correctly', () => {
      expect(calendarService.getNextMonth(2023, 0)).toEqual({ year: 2023, month: 1 });
    });

    it('wraps year when month is December', () => {
      expect(calendarService.getNextMonth(2023, 11)).toEqual({ year: 2024, month: 0 });
    });
  });

  describe('getPreviousMonth', () => {
    it('decrements month correctly', () => {
      expect(calendarService.getPreviousMonth(2023, 1)).toEqual({ year: 2023, month: 0 });
    });

    it('wraps year when month is January', () => {
      expect(calendarService.getPreviousMonth(2023, 0)).toEqual({ year: 2022, month: 11 });
    });
  });

  describe('getDayOfWeek', () => {
    it('returns correct day index', () => {
      // Jan 1 2023 is Sunday (0)
      const date = new Date(2023, 0, 1);
      expect(calendarService.getDayOfWeek(date)).toBe(0);
      
      // Jan 2 2023 is Monday (1)
      const date2 = new Date(2023, 0, 2);
      expect(calendarService.getDayOfWeek(date2)).toBe(1);
    });
  });

  describe('getMonthName', () => {
    it('returns correct month names', () => {
      expect(calendarService.getMonthName(0)).toBe('January');
      expect(calendarService.getMonthName(11)).toBe('December');
    });
  });
});
