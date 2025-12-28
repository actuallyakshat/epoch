import React, { useState, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "../../contexts/ThemeContext";
import { useApp } from "../../contexts/AppContext";
import { Modal } from "./Modal";
import { getLightThemeNames, getDarkThemeNames } from "../../themes";

export const ThemeDialog: React.FC = () => {
  const { theme, setTheme, themeName } = useTheme();
  const { setShowThemeDialog } = useApp();

  // Get organized theme lists
  const lightThemes = useMemo(() => getLightThemeNames(), []);
  const darkThemes = useMemo(() => getDarkThemeNames(), []);

  // Combined list: light themes first, then dark themes
  const allThemes = useMemo(() => {
    // Create a flat list with section markers
    const items: Array<{ type: "theme" | "separator"; value: string }> = [];

    // Light themes section
    items.push({ type: "separator", value: "☀️ Light Themes" });
    lightThemes.forEach((t) => items.push({ type: "theme", value: t }));

    // Dark themes section
    items.push({ type: "separator", value: "🌙 Dark Themes" });
    darkThemes.forEach((t) => items.push({ type: "theme", value: t }));

    return items;
  }, [lightThemes, darkThemes]);

  // Get only theme items (for navigation)
  const themeItems = useMemo(
    () => allThemes.filter((item) => item.type === "theme"),
    [allThemes]
  );

  // Find initial selected index
  const initialIndex = useMemo(() => {
    const idx = themeItems.findIndex((item) => item.value === themeName);
    return idx >= 0 ? idx : 0;
  }, [themeItems, themeName]);

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  useInput((input, key) => {
    if (key.escape) {
      setShowThemeDialog(false);
      return;
    }

    if (key.upArrow || input === "k") {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : themeItems.length - 1));
      return;
    }

    if (key.downArrow || input === "j") {
      setSelectedIndex((prev) => (prev < themeItems.length - 1 ? prev + 1 : 0));
      return;
    }

    if (key.return) {
      setTheme(themeItems[selectedIndex].value);
      setShowThemeDialog(false);
      return;
    }
  });

  // Get the currently selected theme name
  const selectedThemeName = themeItems[selectedIndex]?.value;

  // Format display name
  const formatThemeName = (name: string): string => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

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
        backgroundColor={
          theme.colors.modalBackground || theme.colors.background
        }
      >
        <Text bold color={theme.colors.calendarHeader} underline>
          🎨 Select Theme
        </Text>
        <Box flexDirection="column" marginTop={1}>
          {allThemes.map((item, idx) => {
            if (item.type === "separator") {
              return (
                <Box
                  key={`sep-${idx}`}
                  marginTop={idx > 0 ? 1 : 0}
                  marginBottom={0}
                >
                  <Text bold color={theme.colors.calendarHeader} dimColor>
                    {item.value}
                  </Text>
                </Box>
              );
            }

            const isSelected = item.value === selectedThemeName;
            const isCurrent = item.value === themeName;

            return (
              <Box key={item.value} paddingLeft={1}>
                <Text
                  color={
                    isSelected
                      ? theme.colors.focusIndicator
                      : theme.colors.foreground
                  }
                  bold={isSelected}
                >
                  {isSelected ? "➜ " : "  "}
                  {formatThemeName(item.value)}
                  {isCurrent ? " (current)" : ""}
                </Text>
              </Box>
            );
          })}
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
