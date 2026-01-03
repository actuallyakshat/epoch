import type { Task, TaskTree } from '../types/task';
import { getDateString } from '../utils/date';
import { logger } from '../utils/logger';

/**
 * Service for moving unfinished tasks from previous days to the current day
 */
export class TaskMoveService {
  /**
   * Get all unfinished tasks from a specific date
   */
  getUnfinishedTasks(tasks: Task[]): Task[] {
    const unfinished: Task[] = [];
    
    const traverse = (taskList: Task[]) => {
      for (const task of taskList) {
        if (task.state === 'todo') {
          unfinished.push(task);
        }
        if (task.children.length > 0) {
          traverse(task.children);
        }
      }
    };
    
    traverse(tasks);
    return unfinished;
  }

  /**
   * Move unfinished tasks from a previous date to a new date
   */
  moveUnfinishedTasksToDate(
    tasks: TaskTree,
    fromDate: string,
    toDate: string
  ): TaskTree {
    const sourceTasks = tasks[fromDate] || [];
    const unfinishedTasks = this.getUnfinishedTasks(sourceTasks);

    if (unfinishedTasks.length === 0) {
      logger.log(`No unfinished tasks to move from ${fromDate} to ${toDate}`);
      return tasks;
    }

    logger.log(`Moving ${unfinishedTasks.length} tasks from ${fromDate} to ${toDate}`, {
      taskIds: unfinishedTasks.map(t => t.id),
      taskTitles: unfinishedTasks.map(t => t.title)
    });

    // Create new task instances with updated date and reset times
    const movedTasks = unfinishedTasks.map(task => ({
      ...task,
      date: toDate,
      startTime: undefined,
      endTime: undefined,
      updatedAt: new Date(),
    }));

    // Add moved tasks to the target date
    const targetTasks = tasks[toDate] || [];
    const newTargetTasks = [...targetTasks, ...movedTasks];

    // Remove moved tasks from source date (only top-level unfinished tasks)
    const newSourceTasks = sourceTasks.filter(
      task => !unfinishedTasks.some(ut => ut.id === task.id)
    );

    return {
      ...tasks,
      [fromDate]: newSourceTasks,
      [toDate]: newTargetTasks,
    };
  }

  /**
   * Get all dates that have unfinished tasks before a given date
   */
  getDatesWithUnfinishedTasks(tasks: TaskTree, beforeDate: Date): string[] {
    const dates: string[] = [];
    const beforeDateStr = getDateString(beforeDate);

    for (const [dateStr, taskList] of Object.entries(tasks)) {
      if (dateStr < beforeDateStr) {
        const unfinished = this.getUnfinishedTasks(taskList);
        if (unfinished.length > 0) {
          dates.push(dateStr);
        }
      }
    }

    return dates.sort(); // Sort chronologically
  }

  /**
   * Auto-move all unfinished tasks from previous days to today
   */
  /**
   * Auto-move all unfinished tasks from previous days to today
   */
  autoMoveUnfinishedTasksToToday(tasks: TaskTree): TaskTree {
    const today = new Date();
    const todayStr = getDateString(today);
    const datesWithUnfinished = this.getDatesWithUnfinishedTasks(tasks, today);

    logger.log("Starting auto-move of unfinished tasks", {
      today: todayStr,
      datesWithUnfinished
    });

    let updatedTasks = { ...tasks };

    for (const dateStr of datesWithUnfinished) {
      updatedTasks = this.moveUnfinishedTasksToDate(
        updatedTasks,
        dateStr,
        todayStr
      );
      logger.log(`Moved tasks from ${dateStr} to ${todayStr}`);
    }

    logger.log("Auto-move completed", {
      tasksMoved: datesWithUnfinished.length,
      fromDates: datesWithUnfinished
    });

    return updatedTasks;
  }
}

export const taskMoveService = new TaskMoveService();
