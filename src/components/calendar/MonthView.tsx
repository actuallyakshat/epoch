import React from 'react';
import { Box } from 'ink';
import { Text } from '../common/ThemedText';
import { useTheme } from '../../contexts/ThemeContext';
import { DayCell } from './DayCell';
import type { CalendarView } from '../../types/calendar';

interface MonthViewProps {
  calendarView: CalendarView;
}

export const MonthView: React.FC<MonthViewProps> = ({ calendarView }) => {
  const { theme } = useTheme();
  const dayHeaders = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <Box flexDirection="column">
      {/* Day headers */}
      <Box marginBottom={1}>
        {dayHeaders.map((day) => (
          <Box key={day} width={4}>
            <Text color={theme.colors.calendarHeader} bold>
              {day}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Calendar weeks */}
      {calendarView.weeks.map((week) => {
        const weekKey = week[0]?.dateString || 'empty-week';
        return (
          <Box key={weekKey} marginBottom={0}>
            {week.map((day) => (
              <DayCell key={day.dateString} day={day} />
            ))}
          </Box>
        );
      })}
    </Box>
  );
};
