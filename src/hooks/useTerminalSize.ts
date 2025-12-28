import { useState, useEffect } from "react";
import { useStdout } from "ink";

interface TerminalSize {
  width: number;
  height: number;
}

/**
 * Hook to track terminal dimensions and automatically update on resize
 */
export const useTerminalSize = (): TerminalSize => {
  const { stdout } = useStdout();

  const [size, setSize] = useState<TerminalSize>({
    width: stdout?.columns || 100,
    height: stdout?.rows || 30,
  });

  useEffect(() => {
    if (!stdout) return;

    // Update size immediately in case it changed
    setSize({
      width: stdout.columns || 100,
      height: stdout.rows || 30,
    });

    // Listen for resize events
    const handleResize = () => {
      setSize({
        width: stdout.columns || 100,
        height: stdout.rows || 30,
      });
    };

    stdout.on("resize", handleResize);

    // Cleanup listener on unmount
    return () => {
      stdout.off("resize", handleResize);
    };
  }, [stdout]);

  return size;
};
