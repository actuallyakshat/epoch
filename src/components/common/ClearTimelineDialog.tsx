import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';
import { Modal } from './Modal';
import { getDateString } from '../../utils/date';
import { format } from 'date-fns';

export const ClearTimelineDialog: React.FC = () => {
  const { theme } = useTheme();
  const { selectedDate, timeline, setShowClearTimelineDialog, clearTimelineForDate } = useApp();

  const date = new Date(selectedDate.year, selectedDate.month, selectedDate.day);
  const dateStr = getDateString(date);
  const formattedDate = format(date, 'MMMM do, yyyy');
  const eventCount = (timeline[dateStr] || []).length;

  const handleConfirm = () => {
    clearTimelineForDate(dateStr);
    setShowClearTimelineDialog(false);
  };

  const handleCancel = () => {
    setShowClearTimelineDialog(false);
  };

  useInput((input, key) => {
    if (input.toLowerCase() === 'y' || key.return) {
      handleConfirm();
    } else if (input.toLowerCase() === 'n' || key.escape) {
      handleCancel();
    }
  });

  return (
    <Modal>
      <Box
        flexDirection="column"
        borderStyle="double"
        borderColor={theme.colors.taskStateDelayed}
        paddingX={4}
        paddingY={2}
        // @ts-ignore - backgroundColor is a valid Ink prop
        backgroundColor={theme.colors.modalBackground || theme.colors.background}
      >
        <Box justifyContent="center" marginBottom={1}>
          <Text bold color={theme.colors.taskStateDelayed}>
            Clear Timeline
          </Text>
        </Box>

        <Box flexDirection="column" marginY={1}>
          <Text color={theme.colors.foreground}>You are about to clear the timeline for</Text>
          <Box justifyContent="center" marginY={1}>
            <Text bold color={theme.colors.calendarHeader}>
              {formattedDate}
            </Text>
          </Box>
          {eventCount > 0 ? (
            <Text color={theme.colors.keyboardHint}>
              This will remove {eventCount} event{eventCount === 1 ? '' : 's'} from the timeline.
            </Text>
          ) : (
            <Text color={theme.colors.keyboardHint} dimColor>
              The timeline is already empty.
            </Text>
          )}
        </Box>

        <Box marginTop={2} justifyContent="center">
          <Text color={theme.colors.foreground}>Are you sure? </Text>
          <Text color={theme.colors.taskStateCompleted} bold>
            [Y]es
          </Text>
          <Text color={theme.colors.foreground}> / </Text>
          <Text color={theme.colors.taskStateDelayed} bold>
            [N]o
          </Text>
        </Box>

        <Box marginTop={2} justifyContent="center">
          <Text color={theme.colors.keyboardHint} dimColor>
            Press Y to confirm, N or Esc to cancel
          </Text>
        </Box>
      </Box>
    </Modal>
  );
};
