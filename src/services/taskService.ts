import { v4 as uuid } from 'uuid';
import type { Task, TaskState, TaskTree } from '../types/task';
import type { TimelineEvent, TimelineEventType } from '../types/timeline';
import {
  findTaskById,
  updateTaskInTree,
  deleteTaskFromTree,
  addSubtaskToTree,
  getTaskStats,
} from '../utils/tree';
import { validateTaskTitle, validateTaskTimes } from '../utils/validation';
import { logger } from '../utils/logger';

export class TaskService {
  createTask(title: string, date: string, state: TaskState = 'todo'): Task {
    const validation = validateTaskTitle(title);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    logger.log('Creating new task', { title, date, state });

    const now = new Date();
    return {
      id: uuid(),
      title,
      state,
      createdAt: now,
      updatedAt: now,
      children: [],
      date,
    };
  }

  updateTask(tasks: TaskTree, taskId: string, updates: Partial<Task>): TaskTree {
    logger.log('Updating task', { taskId, updates });

    const dateStr = Object.keys(tasks).find((date) => findTaskById(tasks[date], taskId));

    if (!dateStr) {
      throw new Error('Task not found');
    }

    if (updates.title !== undefined) {
      const validation = validateTaskTitle(updates.title);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }

    if (updates.startTime || updates.endTime) {
      const task = findTaskById(tasks[dateStr], taskId);
      if (task) {
        const updated = { ...task, ...updates };
        const validation = validateTaskTimes(updated);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }
    }

    return {
      ...tasks,
      [dateStr]: updateTaskInTree(tasks[dateStr], taskId, {
        ...updates,
        updatedAt: new Date(),
      }),
    };
  }

  deleteTask(tasks: TaskTree, taskId: string): TaskTree {
    logger.log('Deleting task', { taskId });

    const dateStr = Object.keys(tasks).find((date) => findTaskById(tasks[date], taskId));

    if (!dateStr) {
      logger.log('Task not found for deletion, it might be an ephemeral recurring instance', {
        taskId,
      });
      return tasks;
    }

    return {
      ...tasks,
      [dateStr]: deleteTaskFromTree(tasks[dateStr], taskId),
    };
  }

  addSubtask(tasks: TaskTree, parentId: string, title: string): TaskTree {
    const parentTask = Object.values(tasks)
      .flat()
      .find((t) => findTaskById([t], parentId));

    if (!parentTask) {
      throw new Error('Parent task not found');
    }

    const newSubtask = this.createTask(title, parentTask.date);

    const dateStr = Object.keys(tasks).find((date) => findTaskById(tasks[date], parentId));

    if (!dateStr) {
      throw new Error('Parent task not found');
    }

    return {
      ...tasks,
      [dateStr]: addSubtaskToTree(tasks[dateStr], parentId, {
        ...newSubtask,
        parentId,
      }),
    };
  }

  changeTaskState(tasks: TaskTree, taskId: string, newState: TaskState): TaskTree {
    logger.log('Changing task state', { taskId, newState });

    return this.updateTask(tasks, taskId, {
      state: newState,
      endTime: ['completed', 'delegated', 'delayed'].includes(newState) ? new Date() : undefined,
    });
  }

  startTask(tasks: TaskTree, taskId: string, startTime?: Date): TaskTree {
    // Clear endTime when starting a task (in case it was previously completed)
    return this.updateTask(tasks, taskId, {
      startTime: startTime || new Date(),
      endTime: undefined,
      state: 'todo', // Reset to todo when starting
    });
  }

  getTasksForDate(tasks: TaskTree, date: string): Task[] {
    return tasks[date] || [];
  }

  getAllTasks(tasks: TaskTree): Task[] {
    return Object.values(tasks).flat();
  }

  getTaskStats(tasks: TaskTree, date: string) {
    return getTaskStats(this.getTasksForDate(tasks, date));
  }

  excludeRecurringInstance(tasks: TaskTree, parentTaskId: string, dateStr: string): TaskTree {
    logger.log('Excluding recurring instance', { parentTaskId, dateStr });

    const parentDateStr = Object.keys(tasks).find((date) =>
      tasks[date].some((t) => t.id === parentTaskId),
    );

    if (!parentDateStr) {
      throw new Error('Parent recurring task not found');
    }

    return {
      ...tasks,
      [parentDateStr]: tasks[parentDateStr].map((task) => {
        if (task.id === parentTaskId) {
          const recurrence = task.recurrence;
          if (!recurrence) return task;

          const excludedDates = recurrence.excludedDates || [];
          if (!excludedDates.includes(dateStr)) {
            return {
              ...task,
              recurrence: {
                ...recurrence,
                excludedDates: [...excludedDates, dateStr],
              },
              updatedAt: new Date(),
            };
          }
        }
        return task;
      }),
    };
  }
}

export const taskService = new TaskService();
