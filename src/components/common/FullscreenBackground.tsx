import React, { useEffect } from "react";
import { Box, useStdout } from "ink";

// ANSI color name to code mapping for background colors
const bgColorCodes: Record<string, string> = {
  black: "\x1b[40m",
  red: "\x1b[41m",
  green: "\x1b[42m",
  yellow: "\x1b[43m",
  blue: "\x1b[44m",
  magenta: "\x1b[45m",
  cyan: "\x1b[46m",
  white: "\x1b[47m",
  blackBright: "\x1b[100m",
  redBright: "\x1b[101m",
  greenBright: "\x1b[102m",
  yellowBright: "\x1b[103m",
  blueBright: "\x1b[104m",
  magentaBright: "\x1b[105m",
  cyanBright: "\x1b[106m",
  whiteBright: "\x1b[107m",
  gray: "\x1b[100m",
};

// ANSI color name to code mapping for foreground colors
const fgColorCodes: Record<string, string> = {
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  blackBright: "\x1b[90m",
  redBright: "\x1b[91m",
  greenBright: "\x1b[92m",
  yellowBright: "\x1b[93m",
  blueBright: "\x1b[94m",
  magentaBright: "\x1b[95m",
  cyanBright: "\x1b[96m",
  whiteBright: "\x1b[97m",
  gray: "\x1b[90m",
};

interface FullscreenBackgroundProps {
  children: React.ReactNode;
  backgroundColor: string;
  foregroundColor?: string;
}

/**
 * A component that sets the terminal's default background and foreground colors
 * using ANSI escape codes. This is the only reliable way to change the terminal's
 * background color - Ink's Box backgroundColor doesn't fill empty space.
 */
export const FullscreenBackground: React.FC<FullscreenBackgroundProps> = ({
  children,
  backgroundColor,
  foregroundColor = "white",
}) => {
  const { stdout } = useStdout();
  const width = stdout?.columns || 100;
  const height = stdout?.rows || 30;

  useEffect(() => {
    // Set the terminal's default background and foreground colors
    const bgCode = bgColorCodes[backgroundColor] || bgColorCodes.black;
    const fgCode = fgColorCodes[foregroundColor] || fgColorCodes.white;

    // Write the escape codes to set default colors
    // Don't clear screen as that interferes with Ink's rendering
    process.stdout.write(bgCode + fgCode);

    return () => {
      // Reset to terminal defaults on unmount
      process.stdout.write("\x1b[0m");
    };
  }, [backgroundColor, foregroundColor]);

  return (
    <Box flexDirection="column" width={width} height={height}>
      {children}
    </Box>
  );
};
