import type { Task, TaskTree, TaskState } from '../src/types/task';
import type { TimelineEvent } from '../src/types/timeline';
import { TimelineEventType } from '../src/types/timeline';
import { v4 as uuid } from 'uuid';

export function createMockTask(overrides: Partial<Task> = {}): Task {
  const now = new Date();
  const id = overrides.id || uuid();

  return {
    id,
    title: overrides.title || 'Test Task',
    state: overrides.state || 'todo',
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    startTime: overrides.startTime,
    endTime: overrides.endTime,
    children: overrides.children || [],
    parentId: overrides.parentId,
    date: overrides.date || '2024-01-15',
    recurrence: overrides.recurrence,
    isRecurringInstance: overrides.isRecurringInstance,
    recurringParentId: overrides.recurringParentId,
  };
}

export function createMockTaskTree(overrides: Partial<TaskTree> = {}): TaskTree {
  const now = new Date();
  const id1 = uuid();
  const id2 = uuid();

  const baseTree: TaskTree = {
    '2024-01-15': [
      createMockTask({
        id: id1,
        title: 'Task 1',
        date: '2024-01-15',
      }),
      createMockTask({
        id: id2,
        title: 'Task 2',
        date: '2024-01-15',
      }),
    ],
    '2024-01-16': [
      createMockTask({
        title: 'Task 3',
        date: '2024-01-16',
      }),
    ],
  };

  const result: TaskTree = {};
  for (const key in baseTree) {
    result[key] = baseTree[key];
  }
  for (const key in overrides) {
    if (overrides[key] !== undefined) {
      result[key] = overrides[key];
    }
  }
  return result;
}

export function createMockTaskWithChildren(childCount: number = 2): Task {
  const task = createMockTask();
  const now = new Date();

  task.children = Array.from({ length: childCount }, (_, i) =>
    createMockTask({
      title: `Subtask ${i + 1}`,
      parentId: task.id,
    })
  );

  return task;
}

export function createMockTimelineEvent(overrides: Partial<TimelineEvent> = {}): TimelineEvent {
  const now = new Date();
  const id = overrides.id || uuid();

  return {
    id,
    taskId: overrides.taskId || uuid(),
    taskTitle: overrides.taskTitle || 'Test Task',
    type: overrides.type || TimelineEventType.CREATED,
    timestamp: overrides.timestamp || now,
    previousState: overrides.previousState,
    newState: overrides.newState,
    metadata: overrides.metadata,
  };
}

export function createMockTimeline(events: TimelineEvent[] = []): { [date: string]: TimelineEvent[] } {
  const timeline: { [date: string]: TimelineEvent[] } = {};

  events.forEach(event => {
    const dateStr = event.timestamp.toISOString().split('T')[0];
    if (!timeline[dateStr]) {
      timeline[dateStr] = [];
    }
    timeline[dateStr].push(event);
  });

  return timeline;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function areDatesEqual(date1: Date, date2: Date): boolean {
  return formatDate(date1) === formatDate(date2);
}

export function createMockDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const TASK_STATES: TaskState[] = ['todo', 'completed', 'delegated', 'delayed'];

export const TIMELINE_EVENT_TYPES: TimelineEventType[] = [
  TimelineEventType.CREATED,
  TimelineEventType.STARTED,
  TimelineEventType.COMPLETED,
  TimelineEventType.DELEGATED,
  TimelineEventType.DELAYED,
  TimelineEventType.UPDATED,
];
