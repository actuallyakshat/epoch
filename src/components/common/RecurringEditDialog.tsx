import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '../../contexts/ThemeContext';
import { Modal } from './Modal';
import { logger } from '../../utils/logger';

export type RecurringEditAction = 'this' | 'all' | 'from-today' | 'cancel';

interface RecurringEditDialogProps {
  taskTitle: string;
  actionType: 'edit' | 'delete' | 'complete' | 'state-change' | 'add-subtask';
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
    { value: 'this' as RecurringEditAction, label: getThisOptionLabel(actionType) },
    { value: 'all' as RecurringEditAction, label: 'All occurrences' },
    { value: 'from-today' as RecurringEditAction, label: 'All occurrences from today' },
  ];

  function getThisOptionLabel(action: typeof actionType): string {
    switch (action) {
      case 'edit':
        return 'This task only';
      case 'delete':
        return 'This task only';
      case 'complete':
        return 'This task only';
      case 'state-change':
        return 'This task only';
      case 'add-subtask':
        return 'This task only';
      default:
        return 'This task only';
    }
  }

  function getActionDescription(action: typeof actionType): string {
    switch (action) {
      case 'edit':
        return 'editing';
      case 'delete':
        return 'deleting';
      case 'complete':
        return 'completing';
      case 'state-change':
        return 'changing the state of';
      case 'add-subtask':
        return 'adding a subtask to';
      default:
        return 'modifying';
    }
  }

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
        return;
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
