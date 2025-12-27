import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "../../contexts/ThemeContext";
import { useApp } from "../../contexts/AppContext";
import { Modal } from "./Modal";

export const ThemeDialog: React.FC = () => {
  const { theme, setTheme, availableThemes, themeName } = useTheme();
  const { setShowThemeDialog } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(
    availableThemes.indexOf(themeName)
  );

  useInput((input, key) => {
    // Prevent event propagation if possible, though Ink doesn't fully support stopPropagation
    // but we can ensure we handle it.

    if (key.escape) {
      setShowThemeDialog(false);
      return;
    }

    if (key.upArrow || input === "k") {
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : availableThemes.length - 1
      );
      return;
    }

    if (key.downArrow || input === "j") {
      setSelectedIndex((prev) =>
        prev < availableThemes.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (key.return) {
      setTheme(availableThemes[selectedIndex]);
      setShowThemeDialog(false);
      return;
    }
  });

  return (
    <Modal>
      <Box
        flexDirection="column"
        borderStyle="double"
        borderColor={theme.colors.helpDialogBorder}
        paddingX={2}
        paddingY={1}
        width={40}
        // @ts-ignore - backgroundColor is a valid Ink prop
        backgroundColor={
          theme.colors.modalBackground || theme.colors.background
        }
      >
        <Text bold color={theme.colors.calendarHeader} underline>
          🎨 Select Theme
        </Text>
        <Box flexDirection="column" marginTop={1}>
          {availableThemes.map((t, idx) => (
            <Box key={t}>
              <Text
                color={
                  idx === selectedIndex
                    ? theme.colors.focusIndicator
                    : theme.colors.foreground
                }
                bold={idx === selectedIndex}
              >
                {idx === selectedIndex ? "➜ " : "  "}
                {t.charAt(0).toUpperCase() + t.slice(1)}{" "}
                {t === themeName ? "(current)" : ""}
              </Text>
            </Box>
          ))}
        </Box>
        <Box marginTop={1}>
          <Text color={theme.colors.keyboardHint} dimColor>
            Use ↑/↓ to navigate • Enter to select • Esc to close
          </Text>
        </Box>
      </Box>
    </Modal>
  );
};
