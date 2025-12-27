import React from "react";
import { Box } from "ink";
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

export const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = ({
  leftPane,
  centerPane,
  rightPane,
  leftWidth = 32,
  rightWidth = 30,
  height,
  activePane,
}) => {
  const { theme } = useTheme();

  const focusedColor = theme.colors.focusIndicator;
  const normalColor = theme.colors.border;

  return (
    <Box flexDirection="row" width="100%" height={height}>
      {/* Left Pane */}
      <Box
        width={leftWidth}
        flexDirection="column"
        borderRight
        borderStyle="single"
        borderColor={activePane === "calendar" ? focusedColor : normalColor}
      >
        {leftPane}
      </Box>

      {/* Center Pane */}
      <Box
        flexGrow={1}
        flexDirection="column"
        borderRight
        borderStyle="single"
        borderColor={activePane === "tasks" ? focusedColor : normalColor}
      >
        {centerPane}
      </Box>

      {/* Right Pane */}
      <Box
        width={rightWidth}
        flexDirection="column"
        borderLeft
        borderStyle="single"
        borderColor={activePane === "timeline" ? focusedColor : normalColor}
      >
        {rightPane}
      </Box>
    </Box>
  );
};
