import React, { useState, useMemo, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useTheme } from "../../contexts/ThemeContext";
import { useApp } from "../../contexts/AppContext";
import { Modal } from "./Modal";
import { getLightThemeNames, getDarkThemeNames } from "../../themes";

export const ThemeDialog: React.FC = () => {
  const { theme, setTheme, themeName } = useTheme();
  const { setShowThemeDialog } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [focusMode, setFocusMode] = useState<"search" | "list">("search");

  // Get organized theme lists
  const lightThemes = useMemo(() => getLightThemeNames(), []);
  const darkThemes = useMemo(() => getDarkThemeNames(), []);

  // Combined list: light themes first, then dark themes
  const allThemes = useMemo(() => {
    // Filter themes based on search query
    const query = searchQuery.toLowerCase();
    const filteredLightThemes = lightThemes.filter((t) =>
      t.toLowerCase().includes(query)
    );
    const filteredDarkThemes = darkThemes.filter((t) =>
      t.toLowerCase().includes(query)
    );

    // Create a flat list with section markers
    const items: Array<{ type: "theme" | "separator"; value: string }> = [];

    // Light themes section (only show if there are themes)
    if (filteredLightThemes.length > 0) {
      items.push({ type: "separator", value: "Light Themes" });
      filteredLightThemes.forEach((t) =>
        items.push({ type: "theme", value: t })
      );
    }

    // Dark themes section (only show if there are themes)
    if (filteredDarkThemes.length > 0) {
      items.push({ type: "separator", value: "Dark Themes" });
      filteredDarkThemes.forEach((t) =>
        items.push({ type: "theme", value: t })
      );
    }

    return items;
  }, [lightThemes, darkThemes, searchQuery]);

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

  // Reset selection when search query changes to highlight the first result
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useInput(
    (input, key) => {
      // Escape closes dialog from both modes
      if (key.escape) {
        setShowThemeDialog(false);
        return;
      }

      // Handle navigation based on focus mode
      if (focusMode === "search") {
        // Enter selects the first result and closes
        if (key.return && themeItems.length > 0) {
          setTheme(themeItems[0].value);
          setShowThemeDialog(false);
          return;
        }

        // In search mode, only down arrow moves to list (to avoid j/k interfering with typing)
        if (key.downArrow && themeItems.length > 0) {
          setFocusMode("list");
          setSelectedIndex(0);
          return;
        }
      } else {
        // In list mode
        if (key.upArrow || input === "k") {
          if (selectedIndex > 0) {
            setSelectedIndex((prev) => prev - 1);
          } else {
            // At top of list, move back to search
            setFocusMode("search");
          }
          return;
        }

        if (key.downArrow || input === "j") {
          setSelectedIndex((prev) =>
            prev < themeItems.length - 1 ? prev + 1 : 0
          );
          return;
        }

        // Enter selects theme only in list mode
        if (key.return && themeItems.length > 0) {
          setTheme(themeItems[selectedIndex].value);
          setShowThemeDialog(false);
          return;
        }
      }
    },
    { isActive: true }
  );

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
          Select Theme
        </Text>
        <Box marginTop={1} flexDirection="row" alignItems="center">
          <Text color={theme.colors.foreground} dimColor>
            Search:{" "}
          </Text>
          <Text color={theme.colors.foreground}>
            <TextInput
              value={searchQuery}
              onChange={setSearchQuery}
              focus={focusMode === "search"}
              placeholder="Type to filter..."
            />
          </Text>
        </Box>
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
            {focusMode === "search"
              ? "Type to search • ↓ to navigate list • Esc to close"
              : "↑/↓ or k/j to navigate • Enter to select • Esc to close"}
          </Text>
        </Box>
      </Box>
    </Modal>
  );
};
