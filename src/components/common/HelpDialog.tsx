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
    { key: 'Ctrl+C (twice)', action: 'Quit application' },
    { key: 'Ctrl+U', action: 'Undo last action' },
    { key: 'Ctrl+S', action: 'Open settings' },
    { key: '?', action: 'Toggle help dialog' },
    { key: 'Shift+;', action: 'Show month overview' },
    { key: 't', action: 'Select theme' },
    { key: '1', action: 'Focus calendar pane' },
    { key: '2 / Tab', action: 'Focus tasks pane' },
    { key: '3 / Shift+Tab', action: 'Focus timeline pane' },
    { key: '', action: '' },
    { key: 'Calendar Pane', action: '' },
    { key: 'h/l ←/→', action: 'Navigate days' },
    { key: 'j/k ↓/↑', action: 'Navigate weeks' },
    { key: 'n/p', action: 'Next/prev month' },
    { key: 'T', action: 'Go to today' },
    { key: '', action: '' },
    { key: 'Tasks Pane', action: '' },
    { key: 'j/k ↓/↑', action: 'Navigate tasks' },
    { key: 'a', action: 'Add new task' },
    { key: 'e', action: 'Edit task' },
    { key: 'd', action: 'Delete task' },
    { key: 'Space', action: 'Toggle completion' },
    { key: 's', action: 'Start task' },
    { key: 'D', action: 'Mark delegated' },
    { key: 'x', action: 'Mark delayed/cancelled' },
    { key: 'r', action: 'Make task recurring' },
    { key: 'Enter', action: 'Expand/collapse subtasks' },
    { key: '', action: '' },
    { key: 'Timeline Pane', action: '' },
    { key: 'j/k', action: 'Scroll timeline' },
    { key: 'Shift+C', action: 'Clear timeline' },
    { key: '', action: '' },
    { key: 'Input Editing', action: '' },
    { key: '←/→', action: 'Move cursor left/right' },
    { key: 'Ctrl+←/→', action: 'Move by word' },
    { key: 'Ctrl+A', action: 'Move to start of line' },
    { key: 'Ctrl+E', action: 'Move to end of line' },
    { key: 'Delete/Backspace', action: 'Delete character' },
    { key: 'Ctrl+W', action: 'Delete word before cursor' },
    { key: 'Ctrl+U', action: 'Delete to start of line' },
    { key: 'Ctrl+K', action: 'Delete to end of line' },
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
          {shortcuts.map((item, idx) => (
            <Box key={idx} marginY={0}>
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
