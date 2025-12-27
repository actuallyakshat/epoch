import { TaskState } from './task';

export enum TimelineEventType {
  CREATED = 'created',
  STARTED = 'started',
  COMPLETED = 'completed',
  DELEGATED = 'delegated',
  DELAYED = 'delayed',
  UPDATED = 'updated',
}

export interface TimelineEvent {
  id: string;
  taskId: string;
  taskTitle: string;
  type: TimelineEventType;
  timestamp: Date;
  previousState?: TaskState;
  newState?: TaskState;
  metadata?: Record<string, unknown>;
}

export interface DayTimeline {
  date: string;
  events: TimelineEvent[];
}
