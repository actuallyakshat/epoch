import React from "react";
import { Box, Text } from "ink";
import type { ReactNode } from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface ThreeColumnLayoutProps {
  leftPane: ReactNode;
  centerPane: ReactNode;
  rightPane: ReactNode;
  leftWidth?: number | string;
  rightWidth?: number | string;
  height?: number;
  activePane?: "calendar" | "tasks" | "timeline";
}

// Thin vertical separator using box drawing character
const ThinSeparator: React.FC<{
  color: string;
  backgroundColor?: string;
  height: number;
}> = ({ color, backgroundColor, height }) => {
  // Use thin vertical line character
  const line = "│";
  const lines = Array(height).fill(line).join("\n");

  return (
    <Box width={1} flexShrink={0} backgroundColor={backgroundColor}>
      <Text color={color}>{lines}</Text>
    </Box>
  );
};

export const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = ({
  leftPane,
  centerPane,
  rightPane,
  leftWidth = "20%",
  rightWidth = "30%",
  height,
  activePane,
}) => {
  const { theme } = useTheme();

  // Highlighting logic:
  // - Calendar selected → left separator highlighted
  // - Tasks selected → both separators highlighted
  // - Timeline selected → only right separator highlighted
  const leftSeparatorColor =
    activePane === "calendar" || activePane === "tasks"
      ? theme.colors.focusIndicator!
      : theme.colors.separator!;

  const rightSeparatorColor =
    activePane === "tasks" || activePane === "timeline"
      ? theme.colors.focusIndicator!
      : theme.colors.separator!;

  // Apply background color for non-terminal themes
  const bgColor =
    theme.name !== "terminal" ? theme.colors.background : undefined;

  return (
    <Box
      flexDirection="row"
      width="100%"
      height={height}
      backgroundColor={bgColor}
    >
      {/* Pane 1: Calendar */}
      <Box
        width={leftWidth}
        flexShrink={0}
        flexDirection="column"
        backgroundColor={bgColor}
      >
        {leftPane}
      </Box>

      {/* Pane 2: Left Separator */}
      <ThinSeparator
        color={leftSeparatorColor}
        backgroundColor={bgColor}
        height={height || 30}
      />

      {/* Pane 3: Tasks */}
      <Box
        flexGrow={1}
        flexShrink={1}
        flexDirection="column"
        backgroundColor={bgColor}
      >
        {centerPane}
      </Box>

      {/* Pane 4: Right Separator */}
      <ThinSeparator
        color={rightSeparatorColor}
        backgroundColor={bgColor}
        height={height || 30}
      />

      {/* Pane 5: Timeline */}
      <Box
        width={rightWidth}
        flexShrink={0.3}
        flexDirection="column"
        backgroundColor={bgColor}
        overflow="hidden"
      >
        {rightPane}
      </Box>
    </Box>
  );
};
