import React from 'react';
import { Box } from 'ink';
import { Text } from '../common/ThemedText';
import { useTheme } from '../../contexts/ThemeContext';
import type { CalendarDay } from '../../types/calendar';

interface DayCellProps {
  day: CalendarDay;
}

export const DayCell: React.FC<DayCellProps> = ({ day }) => {
  const { theme } = useTheme();

  let textColor = theme.colors.calendarDayOtherMonth;

  if (day.isCurrentMonth) {
    textColor = day.hasTasks ? theme.colors.calendarDayWithTasks : theme.colors.foreground;
  }

  // Determine indicators - selected takes priority, then today
  const isToday = day.isToday && !day.isSelected;

  if (day.isSelected) {
    textColor = theme.colors.calendarSelected;
  } else if (day.isToday) {
    textColor = theme.colors.calendarToday;
  }

  const dayNum = day.date.day.toString().padStart(2, ' ');

  let leftBracket = ' ';
  if (day.isSelected) {
    leftBracket = '[';
  } else if (isToday) {
    leftBracket = '(';
  }

  let rightBracket = ' ';
  if (day.isSelected) {
    rightBracket = ']';
  } else if (isToday) {
    rightBracket = ')';
  }

  return (
    <Box width={4}>
      <Text color={textColor}>
        {leftBracket}
        {dayNum}
        {rightBracket}
      </Text>
    </Box>
  );
};
