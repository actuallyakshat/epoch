import React from 'react';
import { Box, useStdout } from 'ink';

interface FullscreenBackgroundProps {
  children: React.ReactNode;
  backgroundColor: string;
}

/**
 * A component that sets a fullscreen background color using Ink 6's
 * native Box backgroundColor support. Supports hex colors, RGB, and named colors.
 */
export const FullscreenBackground: React.FC<FullscreenBackgroundProps> = ({
  children,
  backgroundColor,
}) => {
  const { stdout } = useStdout();
  const width = stdout?.columns || 100;
  const height = stdout?.rows || 30;

  return (
    <Box flexDirection="column" width={width} height={height} backgroundColor={backgroundColor}>
      {children}
    </Box>
  );
};
