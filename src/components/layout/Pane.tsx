import React from "react";
import { Box, Text } from "ink";
import type { ReactNode } from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface PaneProps {
  children: ReactNode;
  title?: string;
  isFocused?: boolean;
  width?: number | string;
  height?: number | string;
}

export const Pane: React.FC<PaneProps> = ({
  children,
  title,
  isFocused = false,
  width,
  height,
}) => {
  const { theme } = useTheme();
  // Allow height to be controlled by content or parent, don't force full screen
  const paneHeight = height;

  return (
    <Box
      flexDirection="column"
      width={width}
      height={paneHeight}
      paddingRight={1}
    >
      {title && (
        <Box marginBottom={1}>
          <Text color={theme.colors.taskHeader} bold>
            {title}
          </Text>
        </Box>
      )}
      <Box flexDirection="column" flexGrow={1} overflowY="hidden">
        {children}
      </Box>
    </Box>
  );
};
