import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "../../contexts/ThemeContext";
import type { TimelineEvent } from "../../types/timeline";

interface TimelineEntryProps {
  event: TimelineEvent;
  isLast: boolean;
  hasNextSameTask: boolean;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({
  event,
  isLast,
  hasNextSameTask,
}) => {
  const { theme } = useTheme();

  // Format time as "7:31 am"
  const hours = event.timestamp.getHours();
  const minutes = event.timestamp.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;
  const timeStr = `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;

  const typeStr = event.type.charAt(0).toUpperCase() + event.type.slice(1);

  // Color mapping for event types
  const eventTypeColors: Record<string, string | undefined> = {
    created: theme.colors.foreground,
    started: theme.colors.foreground,
    completed: theme.colors.taskStateCompleted,
    delegated: theme.colors.taskStateDelegated,
    delayed: theme.colors.taskStateDelayed,
    updated: theme.colors.foreground,
  };

  const color = eventTypeColors[event.type] || theme.colors.foreground;

  // Circle style: hollow for started, filled for completed/delegated/delayed
  const isFilledCircle = ["completed", "delegated", "delayed"].includes(
    event.type
  );

  return (
    <Box flexDirection="column" width="100%">
      {/* Main entry row */}
      <Box width="100%">
        {/* Circle indicator */}
        <Box width={3} flexShrink={0} justifyContent="center">
          <Text color={color}>{isFilledCircle ? "●" : "○"}</Text>
        </Box>
        {/* Event content */}
        <Box flexDirection="column" flexGrow={1} flexShrink={1} minWidth={0}>
          <Text wrap="wrap" color={theme.colors.foreground}>
            <Text color={color} bold>
              {typeStr}:
            </Text>
            {" "}{event.taskTitle}
          </Text>
          <Text color={theme.colors.keyboardHint} dimColor>
            {timeStr}
          </Text>
        </Box>
      </Box>
      {/* Vertical connector line */}
      {!isLast && (
        <Box>
          <Box width={3} justifyContent="center">
            <Text color={hasNextSameTask ? color : theme.colors.border}>│</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};
