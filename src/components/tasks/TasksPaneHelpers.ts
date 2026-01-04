import type { Task, TaskTree } from '../../types/task';

/**
 * Helper functions for TasksPane component
 * Extracted to reduce cognitive complexity and nested function issues
 */

/**
 * Recursively delete a subtask from a task tree by ID
 */
export const deleteSubtaskFromTree = (task: Task, targetId: string): Task => {
  return {
    ...task,
    children: task.children
      .filter((child) => child.id !== targetId)
      .map((child) => deleteSubtaskFromTree(child, targetId)),
  };
};

/**
 * Find a subtask path by matching titles (for ephemeral instances)
 */
export const findSubtaskByTitlePath = (
  task: Task,
  targetTask: Task,
  path: string[] = [],
): string[] | null => {
  if (task.title === targetTask.title && path.length > 0) {
    return path;
  }
  for (const child of task.children) {
    const result = findSubtaskByTitlePath(child, targetTask, [...path, child.title]);
    if (result) return result;
  }
  return null;
};

/**
 * Delete subtask by following a title path
 */
export const deleteByTitlePath = (
  task: Task,
  titlePath: string[],
  currentDepth: number = 0,
): Task => {
  if (currentDepth >= titlePath.length) return task;
  return {
    ...task,
    children: task.children
      .filter((child) => child.title !== titlePath[currentDepth])
      .map((child) => deleteByTitlePath(child, titlePath, currentDepth + 1)),
  };
};

/**
 * Delete subtask by title (for materialized instances)
 */
export const deleteByTitle = (task: Task, targetTitle: string): Task => {
  return {
    ...task,
    children: task.children
      .filter((child) => child.title !== targetTitle)
      .map((child) => deleteByTitle(child, targetTitle)),
  };
};

/**
 * Update a subtask in a task tree by ID
 */
export const updateSubtaskInTree = (task: Task, targetId: string, newTitle: string): Task => {
  if (task.id === targetId) {
    return { ...task, title: newTitle, updatedAt: new Date() };
  }
  return {
    ...task,
    children: task.children.map((child) => updateSubtaskInTree(child, targetId, newTitle)),
  };
};

/**
 * Delete subtask from root parent in tasks tree
 */
export const deleteSubtaskFromRootParent = (
  tasks: TaskTree,
  rootParentId: string,
  targetId: string,
): TaskTree => {
  let updated = { ...tasks };
  for (const [date, taskList] of Object.entries(tasks)) {
    const rootIndex = taskList.findIndex((t) => t.id === rootParentId);
    if (rootIndex !== -1) {
      const updatedRoot = deleteSubtaskFromTree(taskList[rootIndex], targetId);
      updated[date] = [
        ...taskList.slice(0, rootIndex),
        updatedRoot,
        ...taskList.slice(rootIndex + 1),
      ];
      break;
    }
  }
  return updated;
};

/**
 * Delete subtask from materialized instances starting from a specific date
 */
export const deleteSubtaskFromMaterializedInstances = (
  tasks: TaskTree,
  rootParentId: string,
  targetTitle: string,
  fromDate: Date,
): TaskTree => {
  const updated = { ...tasks };
  const fromDateObj = new Date(fromDate);
  fromDateObj.setHours(0, 0, 0, 0);

  for (const [date, taskList] of Object.entries(updated)) {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    if (dateObj >= fromDateObj) {
      const updatedTaskList = taskList.map((task) => {
        if (task.isRecurringInstance && task.recurringParentId === rootParentId) {
          return deleteByTitle(task, targetTitle);
        }
        return task;
      });

      updated[date] = updatedTaskList;
    }
  }

  return updated;
};

/**
 * Update subtask in root parent
 */
export const updateSubtaskInRootParent = (
  tasks: TaskTree,
  rootParentId: string,
  targetId: string,
  newTitle: string,
): TaskTree => {
  let updated = { ...tasks };
  for (const [date, taskList] of Object.entries(tasks)) {
    const rootIndex = taskList.findIndex((t) => t.id === rootParentId);
    if (rootIndex !== -1) {
      const updatedRoot = updateSubtaskInTree(taskList[rootIndex], targetId, newTitle);
      updated[date] = [
        ...taskList.slice(0, rootIndex),
        updatedRoot,
        ...taskList.slice(rootIndex + 1),
      ];
      break;
    }
  }
  return updated;
};

/**
 * Update subtask in materialized instances
 */
export const updateSubtaskInMaterializedInstances = (
  tasks: TaskTree,
  rootParentId: string,
  targetId: string,
  newTitle: string,
  fromDate?: Date,
): TaskTree => {
  const updated = { ...tasks };
  const fromDateObj = fromDate ? new Date(fromDate) : null;
  if (fromDateObj) {
    fromDateObj.setHours(0, 0, 0, 0);
  }

  for (const [date, taskList] of Object.entries(updated)) {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    // Skip dates before fromDate if specified
    if (fromDateObj && dateObj < fromDateObj) {
      continue;
    }

    const updatedTaskList = taskList.map((task) => {
      if (task.isRecurringInstance && task.recurringParentId === rootParentId) {
        return updateSubtaskInTree(task, targetId, newTitle);
      }
      return task;
    });

    updated[date] = updatedTaskList;
  }

  return updated;
};

/**
 * Delete materialized instances starting from a specific date
 */
export const deleteMaterializedInstances = (
  tasks: TaskTree,
  recurringParentId: string,
  fromDate: Date,
): TaskTree => {
  const updated = { ...tasks };
  const fromDateObj = new Date(fromDate);
  fromDateObj.setHours(0, 0, 0, 0);

  for (const [date, taskList] of Object.entries(updated)) {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    if (dateObj >= fromDateObj) {
      const filteredTaskList = taskList.filter((task) => {
        return !(task.isRecurringInstance && task.recurringParentId === recurringParentId);
      });

      if (filteredTaskList.length !== taskList.length) {
        updated[date] = filteredTaskList;
      }
    }
  }

  return updated;
};

/**
 * Update materialized instances title starting from a specific date
 */
export const updateMaterializedInstancesTitle = (
  tasks: TaskTree,
  recurringParentId: string,
  newTitle: string,
  fromDate: Date,
): TaskTree => {
  const updated = { ...tasks };
  const fromDateObj = new Date(fromDate);
  fromDateObj.setHours(0, 0, 0, 0);

  for (const [date, taskList] of Object.entries(updated)) {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    if (dateObj >= fromDateObj) {
      const updatedTaskList = taskList.map((task) => {
        if (task.isRecurringInstance && task.recurringParentId === recurringParentId) {
          return { ...task, title: newTitle, updatedAt: new Date() };
        }
        return task;
      });

      updated[date] = updatedTaskList;
    }
  }

  return updated;
};

/**
 * Collect all parent IDs (tasks with children) from a task list recursively
 */
export const collectParentIds = (taskList: Task[], parentIds: Set<string>) => {
  for (const task of taskList) {
    if (task.children.length > 0) {
      parentIds.add(task.id);
      collectParentIds(task.children, parentIds);
    }
  }
};
