import React from 'react';
import { Box, useStdout } from 'ink';
import { useTheme } from '../../contexts/ThemeContext';
import { FullscreenBackground } from './FullscreenBackground';

interface ModalProps {
  children: React.ReactNode;
}

/**
 * A fullscreen overlay modal component that centers its content.
 * This creates a floating dialog effect similar to OpenCode's command palette.
 */
export const Modal: React.FC<ModalProps> = ({ children }) => {
  const { theme } = useTheme();
  const { stdout } = useStdout();

  const width = stdout?.columns || 100;
  const height = stdout?.rows || 30;

  return (
    <FullscreenBackground backgroundColor={theme.colors.modalOverlay || 'black'}>
      <Box
        flexDirection="column"
        width={width}
        height={height}
        justifyContent="center"
        alignItems="center"
      >
        {children}
      </Box>
    </FullscreenBackground>
  );
};
