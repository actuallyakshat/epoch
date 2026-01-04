import type { TaskTree } from './task';
import type { TimelineEvent } from './timeline';

export type UndoActionType = 'TASK_ADD' | 'TASK_UPDATE' | 'TASK_DELETE' | 'TIMELINE_CLEAR';

export interface UndoAction {
  type: UndoActionType;
  timestamp: Date;
  previousTasks: TaskTree;
  previousTimeline: { [date: string]: TimelineEvent[] };
}

export interface UndoState {
  stack: UndoAction[];
  maxSize: number;
}
