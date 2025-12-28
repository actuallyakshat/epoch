import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "../../contexts/ThemeContext";
import { useApp } from "../../contexts/AppContext";
import { Pane } from "../layout/Pane";
import { TimelineEntry } from "./TimelineEntry";
import { getDateString } from "../../utils/date";

export const TimelinePane: React.FC = () => {
  const { theme } = useTheme();
  const { selectedDate, timeline, activePane, isModalOpen } = useApp();
  const isFocused = activePane === "timeline" && !isModalOpen;

  const [scrollOffset, setScrollOffset] = useState(0);
  const visibleRows = 15; // Number of visible entries

  const dateStr = getDateString(
    new Date(selectedDate.year, selectedDate.month, selectedDate.day)
  );
  const dayEvents = timeline[dateStr] || [];

  // Group events by task, then sort by timestamp within each task group
  const sortedEvents = useMemo(() => {
    // First, group events by taskId
    const eventsByTask = new Map<string, typeof dayEvents>();

    dayEvents.forEach((event) => {
      const taskEvents = eventsByTask.get(event.taskId) || [];
      taskEvents.push(event);
      eventsByTask.set(event.taskId, taskEvents);
    });

    // Sort events within each task group by timestamp
    eventsByTask.forEach((events) => {
      events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });

    // Convert to array of task groups and sort by earliest event timestamp
    const taskGroups = Array.from(eventsByTask.entries()).sort(
      ([, eventsA], [, eventsB]) => {
        const earliestA = eventsA[0]?.timestamp.getTime() || 0;
        const earliestB = eventsB[0]?.timestamp.getTime() || 0;
        return earliestA - earliestB;
      }
    );

    // Flatten back to a single array
    return taskGroups.flatMap(([, events]) => events);
  }, [dayEvents]);

  // Reset scroll when date changes
  useEffect(() => {
    setScrollOffset(0);
  }, [dateStr]);

  // Scroll with j/k when focused
  useInput(
    (input, key) => {
      if (!isFocused) return;

      if (input === "j" || key.downArrow) {
        setScrollOffset((prev) =>
          Math.min(prev + 1, Math.max(0, sortedEvents.length - visibleRows))
        );
      }

      if (input === "k" || key.upArrow) {
        setScrollOffset((prev) => Math.max(prev - 1, 0));
      }

      // Page down/up
      if (input === "d" && key.ctrl) {
        setScrollOffset((prev) =>
          Math.min(
            prev + Math.floor(visibleRows / 2),
            Math.max(0, sortedEvents.length - visibleRows)
          )
        );
      }

      if (input === "u" && key.ctrl) {
        setScrollOffset((prev) =>
          Math.max(prev - Math.floor(visibleRows / 2), 0)
        );
      }
    },
    { isActive: isFocused }
  );

  // Get visible events based on scroll
  const visibleEvents = sortedEvents.slice(
    scrollOffset,
    scrollOffset + visibleRows
  );

  // Check if scrolling is possible
  const canScrollUp = scrollOffset > 0;
  const canScrollDown = scrollOffset + visibleRows < sortedEvents.length;

  return (
    <Pane title="Timeline" isFocused={isFocused}>
      <Box flexDirection="column" flexGrow={1}>
        {sortedEvents.length === 0 ? (
          <Box marginY={1} flexDirection="column" paddingX={1}>
            <Text color={theme.colors.keyboardHint} dimColor>
              No activities yet.
            </Text>
            <Text color={theme.colors.keyboardHint} dimColor>
              Press 's' to start a task.
            </Text>
          </Box>
        ) : (
          <Box flexDirection="column">
            {/* Scroll indicator top */}
            {canScrollUp && (
              <Box justifyContent="center" marginBottom={1}>
                <Text color={theme.colors.keyboardHint} dimColor>
                  -- more above --
                </Text>
              </Box>
            )}

            {/* Timeline entries */}
            <Box flexDirection="column">
              {visibleEvents.map((event, index) => {
                const globalIndex = scrollOffset + index;
                const isLast = globalIndex === sortedEvents.length - 1;
                const nextEvent = sortedEvents[globalIndex + 1];
                const hasNextSameTask =
                  nextEvent && nextEvent.taskId === event.taskId;

                return (
                  <TimelineEntry
                    key={event.id}
                    event={event}
                    isLast={isLast}
                    hasNextSameTask={hasNextSameTask}
                  />
                );
              })}
            </Box>

            {/* Scroll indicator bottom */}
            {canScrollDown && (
              <Box justifyContent="center" marginTop={1}>
                <Text color={theme.colors.keyboardHint} dimColor>
                  -- more below --
                </Text>
              </Box>
            )}
          </Box>
        )}

        {/* Keyboard hints */}
        <Box marginTop={1}>
          <Text color={theme.colors.keyboardHint} dimColor>
            j/k: scroll
          </Text>
        </Box>
      </Box>
    </Pane>
  );
};
