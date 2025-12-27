import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "../../contexts/ThemeContext";
import { timelineService } from "../../services/timelineService";
import type { TimelineEvent } from "../../types/timeline";

interface TimelineEntryProps {
  event: TimelineEvent;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({ event }) => {
  const { theme } = useTheme();
  const icon = timelineService.getEventIcon(event.type);

  const timeStr = event.timestamp.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const typeStr = event.type.charAt(0).toUpperCase() + event.type.slice(1);

  const eventTypeColors: Record<string, string | undefined> = {
    created: theme.colors.timelineEventCreated,
    started: theme.colors.timelineEventStarted,
    completed: theme.colors.timelineEventCompleted,
    delegated: theme.colors.timelineEventDelegated,
    delayed: theme.colors.timelineEventDelayed,
    updated: theme.colors.foreground,
  };

  return (
    <Box marginY={0}>
      <Box width={2}>
        <Text color={eventTypeColors[event.type]}>{icon}</Text>
      </Box>
      <Box width={8}>
        <Text color={theme.colors.timelineTimestamp}>{timeStr}</Text>
      </Box>
      <Text color={eventTypeColors[event.type]}>{typeStr}:</Text>
      <Box marginLeft={1} flexGrow={1}>
        <Text color={theme.colors.foreground}>{event.taskTitle}</Text>
      </Box>
    </Box>
  );
};
