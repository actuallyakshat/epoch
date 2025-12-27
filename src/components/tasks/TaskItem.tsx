import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '../../contexts/ThemeContext';
import type { Task } from '../../types/task';

interface TaskItemProps {
  task: Task;
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, depth, isSelected, isExpanded }) => {
  const { theme } = useTheme();

  const stateColors: Record<string, string> = {
    todo: theme.colors.taskStateTodo,
    completed: theme.colors.taskStateCompleted,
    delegated: theme.colors.taskStateDelegated,
    delayed: theme.colors.taskStateDelayed,
  };

  const checkbox = task.state === 'completed' ? '☑' :
                   task.state === 'delegated' ? '↦' :
                   task.state === 'delayed' ? '⏸' : '☐';

  const expandIcon = task.children.length > 0 ? (isExpanded ? '▼ ' : '▶ ') : '  ';
  const indent = '  '.repeat(depth);
  const selector = isSelected ? '>' : ' ';
  const textColor = stateColors[task.state] || theme.colors.foreground;
  const strikethrough = task.state === 'completed';

  return (
    <Box>
      <Text color={isSelected ? theme.colors.focusIndicator : theme.colors.foreground}>
        {selector}
      </Text>
      <Text> </Text>
      <Text color={textColor}>{checkbox}</Text>
      <Text> </Text>
      <Text>{expandIcon}</Text>
      <Text>{indent}</Text>
      <Text
        color={textColor}
        strikethrough={strikethrough}
        dimColor={task.state === 'delayed'}
      >
        {task.title}
      </Text>
      {task.startTime && !task.endTime && (
        <Text color={theme.colors.timelineEventStarted}> ▶</Text>
      )}
    </Box>
  );
};
