import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDate } from '../../utils/date';

interface TaskHeaderProps {
  selectedDate: Date;
  completionPercentage: number;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({ selectedDate, completionPercentage }) => {
  const { theme } = useTheme();

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color={theme.colors.taskHeader}>{formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}</Text>
      <Text color={theme.colors.taskHeader}>{completionPercentage}% completed</Text>
    </Box>
  );
};
