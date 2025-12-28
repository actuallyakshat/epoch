import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "../../contexts/ThemeContext";

interface SeparatorProps {
  vertical?: boolean;
  height?: number;
  width?: number;
}

export const Separator: React.FC<SeparatorProps> = ({
  vertical = true,
  height,
  width = 1,
}) => {
  const { theme } = useTheme();

  if (vertical) {
    return (
      <Box flexDirection="column" width={width} height={height}>
        <Text color={theme.colors.separator}>│</Text>
      </Box>
    );
  }

  return (
    <Box width={width}>
      <Text color={theme.colors.separator}>─</Text>
    </Box>
  );
};
