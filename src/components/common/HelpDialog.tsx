import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "../../contexts/ThemeContext";
import { Modal } from "./Modal";

export const HelpDialog: React.FC = () => {
  const { theme } = useTheme();

  const shortcuts = [
    { key: "Ctrl+C (twice)", action: "Quit application" },
    { key: "?", action: "Toggle help dialog" },
    { key: "Shift+;", action: "Show month overview" },
    { key: "t", action: "Select theme" },
    { key: "1", action: "Focus calendar pane" },
    { key: "2 / Tab", action: "Focus tasks pane" },
    { key: "3 / Shift+Tab", action: "Focus timeline pane" },
    { key: "", action: "" },
    { key: "Calendar Pane", action: "" },
    { key: "h/l ←/→", action: "Navigate days" },
    { key: "j/k ↓/↑", action: "Navigate weeks" },
    { key: "n/p", action: "Next/prev month" },
    { key: "T", action: "Go to today" },
    { key: "", action: "" },
    { key: "Tasks Pane", action: "" },
    { key: "j/k ↓/↑", action: "Navigate tasks" },
    { key: "a", action: "Add new task" },
    { key: "e", action: "Edit task" },
    { key: "d", action: "Delete task" },
    { key: "Space", action: "Toggle completion" },
    { key: "s", action: "Start task" },
    { key: "D", action: "Mark delegated" },
    { key: "x", action: "Mark delayed/cancelled" },
    { key: "Enter", action: "Expand/collapse subtasks" },
    { key: "", action: "" },
    { key: "Timeline Pane", action: "" },
    { key: "j/k", action: "Scroll timeline" },
    { key: "Shift+C", action: "Clear timeline" },
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
        backgroundColor={
          theme.colors.modalBackground || theme.colors.background
        }
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
                    <Text color={theme.colors.timelineEventStarted}>
                      {item.key}
                    </Text>
                  </Box>
                  <Text color={theme.colors.foreground}>{item.action}</Text>
                </>
              ) : (
                <Text color={theme.colors.separator}>
                  ─────────────────────────
                </Text>
              )}
            </Box>
          ))}
        </Box>
        <Box marginY={1}>
          <Text color={theme.colors.keyboardHint} dimColor>
            Press &apos;?&apos; to close
          </Text>
        </Box>
      </Box>
    </Modal>
  );
};
