import React from 'react';
import { Text } from 'ink';
import type { TextProps } from 'ink';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * A drop-in replacement for Ink's Text component that automatically applies
 * the theme's background color. This ensures text is visible on themed backgrounds.
 *
 * Usage: Replace `import { Text } from 'ink'` with
 *        `import { Text } from '../common/ThemedText'`
 */
export const ThemedText: React.FC<TextProps> = ({ children, backgroundColor, ...props }) => {
  const { theme } = useTheme();

  // Only apply theme background for non-terminal themes
  // If an explicit backgroundColor is passed, use that instead
  const bgColor =
    backgroundColor ?? (theme.name !== 'terminal' ? theme.colors.background : undefined);

  return (
    <Text {...props} backgroundColor={bgColor}>
      {children}
    </Text>
  );
};

// Re-export as Text for easy drop-in replacement
export { ThemedText as Text };
