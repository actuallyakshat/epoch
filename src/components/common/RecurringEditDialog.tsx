import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '../../contexts/ThemeContext';
import { Modal } from './Modal';
import { logger } from '../../utils/logger';
import { RecurringChoice, RecurringActionType } from '../../types/recurring';

export type RecurringEditAction = RecurringChoice | 'cancel';

interface RecurringEditDialogProps {
  taskTitle: string;
  actionType: RecurringActionType;
  onConfirm: (action: RecurringEditAction) => void;
}

export const RecurringEditDialog: React.FC<RecurringEditDialogProps> = ({
  taskTitle,
  actionType,
  onConfirm,
}) => {
  const { theme } = useTheme();

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Different options based on action type
  const options = [
    { value: 'this' as RecurringEditAction, label: 'This task only' },
    { value: 'all' as RecurringEditAction, label: 'All occurrences' },
    { value: 'from-today' as RecurringEditAction, label: 'All occurrences from today' },
  ];

  const getActionDescription = (action: RecurringEditDialogProps['actionType']): string => {
    const descriptions: Record<string, string> = {
      edit: 'editing',
      delete: 'deleting',
      complete: 'completing',
      'state-change': 'changing the state of',
      'add-subtask': 'adding a subtask to',
    };
    return descriptions[action] || 'modifying';
  };

  useInput(
    (input, key) => {
      // Escape cancels
      if (key.escape) {
        logger.log('Cancelling recurring edit dialog');
        onConfirm('cancel');
        return;
      }

      // Navigate options
      if (key.upArrow || input === 'k') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        return;
      }

      if (key.downArrow || input === 'j') {
        setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        return;
      }

      // Confirm with Enter
      if (key.return) {
        const selectedAction = options[selectedIndex].value;
        logger.log('Recurring edit action selected', {
          actionType,
          selectedAction,
          taskTitle,
        });
        onConfirm(selectedAction);
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
        width={54}
        // @ts-ignore - backgroundColor is a valid Ink prop
        backgroundColor={theme.colors.modalBackground || theme.colors.background}
      >
        <Text bold color={theme.colors.calendarHeader}>
          Modify Recurring Task
        </Text>
        <Box marginTop={1} marginBottom={1}>
          <Text color={theme.colors.foreground}>
            You are {getActionDescription(actionType)} a recurring task:
          </Text>
        </Box>
        <Box marginBottom={1}>
          <Text color={theme.colors.focusIndicator} bold>
            "{taskTitle}"
          </Text>
        </Box>
        <Box flexDirection="column" marginTop={1}>
          {options.map((option, idx) => {
            const isSelected = idx === selectedIndex;

            return (
              <Box key={option.value} marginY={0}>
                <Text
                  color={isSelected ? theme.colors.focusIndicator : theme.colors.foreground}
                  bold={isSelected}
                >
                  {isSelected ? '➜ ' : '  '}
                  {option.label}
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
