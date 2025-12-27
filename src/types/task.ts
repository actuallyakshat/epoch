export type TaskState = 'todo' | 'completed' | 'delegated' | 'delayed';

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
}

export interface TaskTree {
  [date: string]: Task[];
}

export interface TaskStats {
  total: number;
  completed: number;
  percentage: number;
}
