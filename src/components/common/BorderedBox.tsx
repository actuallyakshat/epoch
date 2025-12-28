import React from "react";
import { Box, Text } from "ink";

interface BorderedBoxProps {
  children: React.ReactNode;
  borderColor: string;
  backgroundColor?: string;
  width?: number;
  paddingX?: number;
  paddingY?: number;
  title?: string;
  titleColor?: string;
}

/**
 * A box component with double borders that properly applies backgroundColor
 * to border characters. This fixes the issue where Ink's built-in borderStyle
 * doesn't apply backgroundColor to border characters.
 */
export const BorderedBox: React.FC<BorderedBoxProps> = ({
  children,
  borderColor,
  backgroundColor,
  width,
  paddingX = 2,
  paddingY = 1,
  title,
  titleColor,
}) => {
  // Double border characters
  const topLeft = "╔";
  const topRight = "╗";
  const bottomLeft = "╚";
  const bottomRight = "╝";
  const horizontal = "═";
  const vertical = "║";

  // Calculate inner width (content area)
  // If width is specified, calculate inner width; otherwise use auto
  const innerWidth = width ? width - 2 : undefined; // -2 for left and right borders

  // Create horizontal border line
  const createHorizontalBorder = (
    left: string,
    right: string,
    fill: string
  ) => {
    if (innerWidth) {
      const fillCount = innerWidth;
      return (
        <Text color={borderColor} backgroundColor={backgroundColor}>
          {left}
          {fill.repeat(fillCount)}
          {right}
        </Text>
      );
    }
    // For auto-width, we need to measure or use a reasonable default
    return (
      <Box flexDirection="row">
        <Text color={borderColor} backgroundColor={backgroundColor}>
          {left}
        </Text>
        <Box flexGrow={1}>
          <Text color={borderColor} backgroundColor={backgroundColor}>
            {fill.repeat(40)}
          </Text>
        </Box>
        <Text color={borderColor} backgroundColor={backgroundColor}>
          {right}
        </Text>
      </Box>
    );
  };

  return (
    <Box flexDirection="column" backgroundColor={backgroundColor}>
      {/* Top border */}
      {createHorizontalBorder(topLeft, topRight, horizontal)}

      {/* Content area with side borders */}
      <Box flexDirection="row">
        {/* Left border */}
        <Text color={borderColor} backgroundColor={backgroundColor}>
          {vertical}
        </Text>

        {/* Content */}
        <Box
          flexDirection="column"
          width={innerWidth}
          paddingX={paddingX}
          paddingY={paddingY}
          backgroundColor={backgroundColor}
        >
          {title && (
            <Box marginBottom={1}>
              <Text bold color={titleColor || borderColor}>
                {title}
              </Text>
            </Box>
          )}
          {children}
        </Box>

        {/* Right border */}
        <Text color={borderColor} backgroundColor={backgroundColor}>
          {vertical}
        </Text>
      </Box>

      {/* Bottom border */}
      {createHorizontalBorder(bottomLeft, bottomRight, horizontal)}
    </Box>
  );
};
