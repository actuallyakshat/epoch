import { TaskState } from '../types/task';
import { Theme } from '../types/theme';

export function getCheckbox(state: TaskState): string {
  switch (state) {
    case 'completed':
      return '[✓]';
    case 'delegated':
      return '[→]';
    case 'delayed':
      return '[‖]';
    default:
      return '[ ]';
  }
}

export function getStateColor(state: TaskState, theme: Theme): string | undefined {
  const colors: Record<TaskState, string | undefined> = {
    todo: theme.colors.taskStateTodo,
    completed: theme.colors.taskStateCompleted,
    delegated: theme.colors.taskStateDelegated,
    delayed: theme.colors.taskStateDelayed,
  };
  return colors[state] || theme.colors.foreground;
}
