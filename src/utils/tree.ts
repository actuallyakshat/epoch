import type { Task } from '../types/task';

export const findTaskById = (tasks: Task[], id: string): Task | null => {
  for (const task of tasks) {
    if (task.id === id) return task;
    const found = findTaskById(task.children, id);
    if (found) return found;
  }
  return null;
};

export const updateTaskInTree = (tasks: Task[], id: string, updates: Partial<Task>): Task[] => {
  return tasks.map(task => {
    if (task.id === id) {
      return { ...task, ...updates, updatedAt: new Date() };
    }
    return {
      ...task,
      children: updateTaskInTree(task.children, id, updates),
    };
  });
};

export const deleteTaskFromTree = (tasks: Task[], id: string): Task[] => {
  return tasks
    .filter(task => task.id !== id)
    .map(task => ({
      ...task,
      children: deleteTaskFromTree(task.children, id),
    }));
};

export const addSubtaskToTree = (
  tasks: Task[],
  parentId: string,
  newTask: Task
): Task[] => {
  return tasks.map(task => {
    if (task.id === parentId) {
      return {
        ...task,
        children: [...task.children, newTask],
      };
    }
    return {
      ...task,
      children: addSubtaskToTree(task.children, parentId, newTask),
    };
  });
};

export const flattenTasks = (tasks: Task[]): Task[] => {
  const result: Task[] = [];

  const traverse = (taskList: Task[]) => {
    for (const task of taskList) {
      result.push(task);
      traverse(task.children);
    }
  };

  traverse(tasks);
  return result;
};

export const getTaskStats = (tasks: Task[]): { total: number; completed: number; percentage: number } => {
  const flat = flattenTasks(tasks);
  const total = flat.length;
  const completed = flat.filter(t => t.state === 'completed').length;

  return {
    total,
    completed,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
};
