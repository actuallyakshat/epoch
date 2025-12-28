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

// Vertical separator component that fills height with proper background
const VerticalSeparator: React.FC<{
  color: string;
  backgroundColor?: string;
  height?: number;
  isFocused?: boolean;
}> = ({ color, backgroundColor, height, isFocused }) => {
  // Create a column of characters - use heavy vertical line if focused
  const char = isFocused ? "┃" : "│";
  const lines = height ? Array(height).fill(char) : [char];
  return (
    <Box flexDirection="column" backgroundColor={backgroundColor}>
      {lines.map((c, i) => (
        <Text key={i} color={color} backgroundColor={backgroundColor}>
          {c}
        </Text>
      ))}
    </Box>
  );
};

export const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = ({
  leftPane,
  centerPane,
  rightPane,
  leftWidth = "15%",
  rightWidth = "30%",
  height,
  activePane,
}) => {
  const { theme } = useTheme();

  const focusedColor = theme.colors.focusIndicator;
  const normalColor = theme.colors.border;

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
      {/* Left Pane - Calendar */}
      <Box
        width={leftWidth}
        flexShrink={0}
        flexDirection="column"
        backgroundColor={bgColor}
      >
        {leftPane}
      </Box>

      {/* Separator between Calendar and Tasks */}
      <VerticalSeparator
        isFocused={activePane === "calendar" || activePane === "tasks"}
        color={
          activePane === "calendar" || activePane === "tasks"
            ? focusedColor!
            : normalColor!
        }
        backgroundColor={bgColor}
        height={height}
      />

      {/* Center Pane - Tasks */}
      <Box
        flexGrow={1}
        flexShrink={1}
        flexDirection="column"
        backgroundColor={bgColor}
      >
        {centerPane}
      </Box>

      {/* Separator between Tasks and Timeline */}
      <VerticalSeparator
        isFocused={activePane === "tasks" || activePane === "timeline"}
        color={
          activePane === "tasks" || activePane === "timeline"
            ? focusedColor!
            : normalColor!
        }
        backgroundColor={bgColor}
        height={height}
      />

      {/* Right Pane - Timeline */}
      <Box
        width={rightWidth}
        flexShrink={0.3}
        flexDirection="column"
        backgroundColor={bgColor}
      >
        {rightPane}
      </Box>
    </Box>
  );
};
