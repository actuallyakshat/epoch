import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '../../contexts/ThemeContext';

export interface KeyBinding {
  key: string;
  description: string;
}

interface KeyboardHintsProps {
  hints: KeyBinding[];
}

export const KeyboardHints: React.FC<KeyboardHintsProps> = ({ hints }) => {
  const { theme } = useTheme();

  return (
    <Box marginTop={1} flexDirection="row" flexWrap="wrap" columnGap={2} width="100%">
      {hints.map((hint) => (
        <Box key={`${hint.key}-${hint.description}`}>
          <Text color={theme.colors.focusIndicator} bold>
            {hint.key}
          </Text>
          <Text color={theme.colors.keyboardHint}> {hint.description}</Text>
        </Box>
      ))}
    </Box>
  );
};
