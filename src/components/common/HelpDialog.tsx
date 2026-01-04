import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '../../contexts/ThemeContext';
import { Modal } from './Modal';
import { useApp } from '../../contexts/AppContext';

export const HelpDialog: React.FC = () => {
  const { theme } = useTheme();
  const { setShowHelp, setShowSettingsDialog } = useApp();

  useInput(
    (input, key) => {
      if (key.escape || input === '?') {
        setShowHelp(false);
      }

      if (key.ctrl && input === 's') {
        setShowHelp(false);
        setShowSettingsDialog(true);
      }
    },
    { isActive: true },
  );

  const shortcuts = [
    { id: 'quit', key: 'Ctrl+C (twice)', action: 'Quit application' },
    { id: 'undo', key: 'Ctrl+U', action: 'Undo last action' },
    { id: 'settings', key: 'Ctrl+S', action: 'Open settings' },
    { id: 'help', key: '?', action: 'Toggle help dialog' },
    { id: 'overview', key: 'Shift+;', action: 'Show month overview' },
    { id: 'theme', key: 't', action: 'Select theme' },
    { id: 'focus-calendar', key: '1', action: 'Focus calendar pane' },
    { id: 'focus-tasks', key: '2 / Tab', action: 'Focus tasks pane' },
    { id: 'focus-timeline', key: '3 / Shift+Tab', action: 'Focus timeline pane' },
    { id: 'sep1', key: '', action: '' },
    { id: 'header-calendar', key: 'Calendar Pane', action: '' },
    { id: 'nav-days', key: 'h/l ←/→', action: 'Navigate days' },
    { id: 'nav-weeks', key: 'j/k ↓/↑', action: 'Navigate weeks' },
    { id: 'nav-month', key: 'n/p', action: 'Next/prev month' },
    { id: 'go-today', key: 'T', action: 'Go to today' },
    { id: 'sep2', key: '', action: '' },
    { id: 'header-tasks', key: 'Tasks Pane', action: '' },
    { id: 'nav-tasks', key: 'j/k ↓/↑', action: 'Navigate tasks' },
    { id: 'add-task', key: 'a', action: 'Add new task' },
    { id: 'edit-task', key: 'e', action: 'Edit task' },
    { id: 'delete-task', key: 'd', action: 'Delete task' },
    { id: 'toggle-task', key: 'Space', action: 'Toggle completion' },
    { id: 'start-task', key: 's', action: 'Start task' },
    { id: 'delegate-task', key: 'D', action: 'Mark delegated' },
    { id: 'delay-task', key: 'x', action: 'Mark delayed/cancelled' },
    { id: 'recurring-task', key: 'r', action: 'Make task recurring' },
    { id: 'expand-task', key: 'Enter', action: 'Expand/collapse subtasks' },
    { id: 'sep3', key: '', action: '' },
    { id: 'header-timeline', key: 'Timeline Pane', action: '' },
    { id: 'scroll-timeline', key: 'j/k', action: 'Scroll timeline' },
    { id: 'clear-timeline', key: 'Shift+C', action: 'Clear timeline' },
    { id: 'sep4', key: '', action: '' },
    { id: 'header-input', key: 'Input Editing', action: '' },
    { id: 'cursor-move', key: '←/→', action: 'Move cursor left/right' },
    { id: 'cursor-word', key: 'Ctrl+←/→', action: 'Move by word' },
    { id: 'cursor-start', key: 'Ctrl+A', action: 'Move to start of line' },
    { id: 'cursor-end', key: 'Ctrl+E', action: 'Move to end of line' },
    { id: 'delete-char', key: 'Delete/Backspace', action: 'Delete character' },
    { id: 'delete-word', key: 'Ctrl+W', action: 'Delete word before cursor' },
    { id: 'delete-start', key: 'Ctrl+U', action: 'Delete to start of line' },
    { id: 'delete-end', key: 'Ctrl+K', action: 'Delete to end of line' },
  ];

  return (
    <Modal>
      <Box
        flexDirection="column"
        borderStyle="double"
        borderColor={theme.colors.helpDialogBorder}
        paddingX={2}
        paddingY={1}
        // @ts-ignore - backgroundColor is a valid Ink prop
        backgroundColor={theme.colors.modalBackground || theme.colors.background}
      >
        <Text bold color={theme.colors.calendarHeader}>
          Keyboard Shortcuts
        </Text>
        <Box flexDirection="column" marginTop={1}>
          {shortcuts.map((item) => (
            <Box key={item.id} marginY={0}>
              {item.key ? (
                <>
                  <Box width={20}>
                    <Text color={theme.colors.timelineEventStarted}>{item.key}</Text>
                  </Box>
                  <Text color={theme.colors.foreground}>{item.action}</Text>
                </>
              ) : (
                <Text color={theme.colors.separator}>─────────────────────────</Text>
              )}
            </Box>
          ))}
        </Box>
        <Box marginY={1}>
          <Text color={theme.colors.keyboardHint} dimColor>
            Press &apos;?&apos; or Esc to close
          </Text>
        </Box>
      </Box>
    </Modal>
  );
};
