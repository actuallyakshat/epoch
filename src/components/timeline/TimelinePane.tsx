import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "../../contexts/ThemeContext";
import { useApp } from "../../contexts/AppContext";
import { Pane } from "../layout/Pane";
import { TimelineEntry } from "./TimelineEntry";
import { KeyboardHints } from "../common/KeyboardHints";
import { getDateString } from "../../utils/date";
import { useTerminalSize } from "../../hooks/useTerminalSize";

export const TimelinePane: React.FC = () => {
  const { theme } = useTheme();
  const {
    selectedDate,
    tasks,
    timeline,
    setTimeline,
    activePane,
    isModalOpen,
    isInputMode,
  } = useApp();
  const isFocused = activePane === "timeline" && !isModalOpen;

  const [scrollOffset, setScrollOffset] = useState(0);
  const { height: terminalHeight } = useTerminalSize();
  const visibleRows = useMemo(() => {
    // Each entry can take 3-4 lines with wrapping (type+title wrapped, time, connector)
    // Conservative estimate: divide available height by 4 to get number of entries
    // Pane header/footer and keyboard hints take ~8 lines
    const availableHeight = Math.max(8, terminalHeight - 8);
    return Math.max(3, Math.floor(availableHeight / 4));
  }, [terminalHeight]);

  const dateStr = getDateString(
    new Date(selectedDate.year, selectedDate.month, selectedDate.day)
  );
  const dayEvents = timeline[dateStr] || [];
  const dayTasks = tasks[dateStr] || [];

  // Build a map of taskId -> parentId for hierarchy lookup
  const taskHierarchyMap = useMemo(() => {
    const map = new Map<string, string | undefined>();

    const traverse = (taskList: typeof dayTasks, parentId?: string) => {
      taskList.forEach(task => {
        map.set(task.id, parentId);
        traverse(task.children, task.id);
      });
    };

    traverse(dayTasks);
    return map;
  }, [dayTasks]);

  // Check if taskA is an ancestor of taskB
  const isAncestor = (taskAId: string, taskBId: string): boolean => {
    let currentId: string | undefined = taskBId;

    while (currentId) {
      const parentId = taskHierarchyMap.get(currentId);
      if (!parentId) break;
      if (parentId === taskAId) return true;
      currentId = parentId;
    }

    return false;
  };

  // Get depth of task in hierarchy (0 = root level)
  const getTaskDepth = (taskId: string): number => {
    let depth = 0;
    let currentId: string | undefined = taskId;

    while (currentId) {
      const parentId = taskHierarchyMap.get(currentId);
      if (!parentId) break;
      depth++;
      currentId = parentId;
    }

    return depth;
  };

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

    // Convert to array of task groups and sort by hierarchy first, then timestamp
    const taskGroups = Array.from(eventsByTask.entries()).sort(
      ([taskIdA, eventsA], [taskIdB, eventsB]) => {
        // If taskA is an ancestor of taskB, taskA comes first
        if (isAncestor(taskIdA, taskIdB)) return -1;
        // If taskB is an ancestor of taskA, taskB comes first
        if (isAncestor(taskIdB, taskIdA)) return 1;

        // If at different depths, shallower (parent) comes first
        const depthA = getTaskDepth(taskIdA);
        const depthB = getTaskDepth(taskIdB);
        if (depthA !== depthB) return depthA - depthB;

        // Otherwise, sort by earliest event timestamp
        const earliestA = eventsA[0]?.timestamp.getTime() || 0;
        const earliestB = eventsB[0]?.timestamp.getTime() || 0;
        return earliestA - earliestB;
      }
    );

    // Flatten back to a single array
    return taskGroups.flatMap(([, events]) => events);
  }, [dayEvents, taskHierarchyMap]);

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

      // Page down with Ctrl+D
      if (input === "d" && key.ctrl) {
        setScrollOffset((prev) =>
          Math.min(
            prev + Math.floor(visibleRows / 2),
            Math.max(0, sortedEvents.length - visibleRows)
          )
        );
      }

      // Note: Ctrl+U is reserved for global undo, removed from here
    },
    { isActive: isFocused && !isInputMode }
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
      <Box flexDirection="column" flexGrow={1} width="100%">
        {sortedEvents.length === 0 ? (
          <Box marginY={1} flexDirection="column">
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
        <KeyboardHints
          hints={[
            { key: "j/k", description: "scroll" },
            { key: "Shift+C", description: "clear" },
          ]}
        />
      </Box>
    </Pane>
  );
};
