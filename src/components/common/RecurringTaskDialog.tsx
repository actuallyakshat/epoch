import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '../../contexts/ThemeContext';
import { Modal } from './Modal';
import type { RecurrencePattern, RecurrenceFrequency } from '../../types/task';
import { logger } from '../../utils/logger';

interface RecurringTaskDialogProps {
  onConfirm: (pattern: RecurrencePattern) => void;
  onCancel: () => void;
}

export const RecurringTaskDialog: React.FC<RecurringTaskDialogProps> = ({
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();

  const frequencies: { value: RecurrenceFrequency; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekdays', label: 'Weekdays (Mon-Fri)' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput(
    (input, key) => {
      // Escape cancels
      if (key.escape) {
        logger.log('Cancelling recurring task dialog');
        onCancel();
      }

      // Navigate frequencies
      if (key.upArrow || input === 'k') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : frequencies.length - 1));
      }

      if (key.downArrow || input === 'j') {
        setSelectedIndex((prev) => (prev < frequencies.length - 1 ? prev + 1 : 0));
      }

      // Confirm with Enter
      if (key.return) {
        const selectedFrequency = frequencies[selectedIndex].value;
        const pattern: RecurrencePattern = {
          frequency: selectedFrequency,
        };

        logger.log('Setting task recurrence', { frequency: selectedFrequency });
        onConfirm(pattern);
      }
    },
    { isActive: true },
  );

  return (
    <Modal>
      <Box
        flexDirection="column"
        borderStyle="double"
        borderColor={theme.colors.helpDialogBorder}
        paddingX={2}
        paddingY={1}
        width={44}
        // @ts-ignore - backgroundColor is a valid Ink prop
        backgroundColor={theme.colors.modalBackground || theme.colors.background}
      >
        <Text bold color={theme.colors.calendarHeader} underline>
          Make Task Recurring
        </Text>
        <Box flexDirection="column" marginTop={1}>
          {frequencies.map((freq, idx) => {
            const isSelected = idx === selectedIndex;

            return (
              <Box key={freq.value} marginY={0}>
                <Text
                  color={isSelected ? theme.colors.focusIndicator : theme.colors.foreground}
                  bold={isSelected}
                >
                  {isSelected ? '➜ ' : '  '}
                  {freq.label}
                </Text>
              </Box>
            );
          })}
        </Box>
        <Box marginTop={1}>
          <Text color={theme.colors.keyboardHint} dimColor>
            ↑/↓ or k/j to navigate • Enter to confirm • Esc to cancel
          </Text>
        </Box>
      </Box>
    </Modal>
  );
};
