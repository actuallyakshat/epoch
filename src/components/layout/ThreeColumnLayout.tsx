import React from 'react';
import { Box } from 'ink';
import type { ReactNode } from 'react';

interface ThreeColumnLayoutProps {
  leftPane: ReactNode;
  centerPane: ReactNode;
  rightPane: ReactNode;
  leftWidth?: number | string;
  rightWidth?: number | string;
  height?: number;
}

export const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = ({
  leftPane,
  centerPane,
  rightPane,
  leftWidth = 32,
  rightWidth = 30,
  height,
}) => {
  return (
    <Box flexDirection="row" width="100%" height={height}>
      {/* Left Pane */}
      <Box width={leftWidth} flexDirection="column">
        {leftPane}
      </Box>

      {/* Center Pane */}
      <Box flexGrow={1} flexDirection="column">
        {centerPane}
      </Box>

      {/* Right Pane */}
      <Box width={rightWidth} flexDirection="column">
        {rightPane}
      </Box>
    </Box>
  );
};
