import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "../../contexts/ThemeContext";
import { useApp } from "../../contexts/AppContext";
import { Pane } from "../layout/Pane";
import { TimelineEntry } from "./TimelineEntry";
import { getDateString } from "../../utils/date";

export const TimelinePane: React.FC = () => {
  const { theme } = useTheme();
  const { selectedDate, timeline, activePane, isModalOpen } = useApp();
  const isFocused = activePane === "timeline" && !isModalOpen;

  const dateStr = getDateString(
    new Date(selectedDate.year, selectedDate.month, selectedDate.day)
  );
  const dayEvents = timeline[dateStr] || [];

  // Sort events by timestamp
  const sortedEvents = [...dayEvents].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  return (
    <Pane title="Timeline" isFocused={isFocused} width={35}>
      <Box flexDirection="column" flexGrow={1} paddingBottom={1}>
        {sortedEvents.length === 0 ? (
          <Box marginY={1}>
            <Text color={theme.colors.keyboardHint} dimColor>
              No activities for this day
            </Text>
          </Box>
        ) : (
          <>
            {sortedEvents.map((event) => (
              <TimelineEntry key={event.id} event={event} />
            ))}
          </>
        )}

        <Box marginTop={1}>
          <Text color={theme.colors.keyboardHint} dimColor>
            j/k: scroll
          </Text>
        </Box>
      </Box>
    </Pane>
  );
};
