import React, { useMemo } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "../../contexts/ThemeContext";
import { useApp } from "../../contexts/AppContext";
import { getDateString, formatDate } from "../../utils/date";
import { flattenTasks } from "../../utils/tree";
import type { Task } from "../../types/task";
import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { useTerminalSize } from "../../hooks/useTerminalSize";

export const OverviewScreen: React.FC = () => {
  const { theme } = useTheme();
  const { tasks, overviewMonth, setOverviewMonth, setShowOverview } = useApp();
  const [scrollOffset, setScrollOffset] = React.useState(0);
  const { height: terminalHeight } = useTerminalSize();

  // Calculate visible rows based on terminal height to avoid wasting space
  // Header (~3) + Footer (~2) + Padding (~2) + Indicators (~2) = ~9 lines fixed
  // Minimum row height is 3 lines (Date + "No tasks" + margin)
  const visibleRows = useMemo(() => {
    return Math.max(2, Math.floor((terminalHeight - 9) / 3));
  }, [terminalHeight]);
  const monthDates = useMemo(() => {
    const monthStart = startOfMonth(
      new Date(overviewMonth.year, overviewMonth.month, 1)
    );
    const monthEnd = endOfMonth(monthStart);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [overviewMonth]);

  // Get tasks grouped by date
  const tasksByDate = useMemo(() => {
    const grouped: { [date: string]: Task[] } = {};
    monthDates.forEach((date) => {
      const dateStr = getDateString(date);
      grouped[dateStr] = tasks[dateStr] || [];
    });
    return grouped;
  }, [monthDates, tasks]);

  // Month navigation
  const handlePrevMonth = () => {
    const newMonth = overviewMonth.month - 1;
    if (newMonth < 0) {
      setOverviewMonth({ year: overviewMonth.year - 1, month: 11 });
    } else {
      setOverviewMonth({ ...overviewMonth, month: newMonth });
    }
  };

  const handleNextMonth = () => {
    const newMonth = overviewMonth.month + 1;
    if (newMonth > 11) {
      setOverviewMonth({ year: overviewMonth.year + 1, month: 0 });
    } else {
      setOverviewMonth({ ...overviewMonth, month: newMonth });
    }
  };

  // Reset scroll when month changes
  React.useEffect(() => {
    setScrollOffset(0);
  }, [overviewMonth]);

  useInput((input: string, key) => {
    if (key.escape) {
      setShowOverview(false);
      return;
    }

    if (input === "n" || key.rightArrow) {
      handleNextMonth();
      return;
    }

    if (input === "p" || key.leftArrow) {
      handlePrevMonth();
      return;
    }

    if (input === "j" || key.downArrow) {
      setScrollOffset((prev) =>
        Math.min(prev + 1, Math.max(0, rows - visibleRows))
      );
      return;
    }

    if (input === "k" || key.upArrow) {
      setScrollOffset((prev) => Math.max(prev - 1, 0));
      return;
    }
  });

  const monthName = formatDate(
    new Date(overviewMonth.year, overviewMonth.month, 1),
    "MMMM yyyy"
  );

  // Calculate grid layout - 4 columns
  const columns = 4;
  const rows = Math.ceil(monthDates.length / columns);

  const visibleRowData = Array.from({ length: rows }).slice(
    scrollOffset,
    scrollOffset + visibleRows
  );

  const canScrollUp = scrollOffset > 0;
  const canScrollDown = scrollOffset + visibleRows < rows;

  return (
    <Box flexDirection="column" padding={1} width="100%" height="100%">
      {/* Header */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color={theme.colors.focusIndicator}>
          Overview
        </Text>
        <Text color={theme.colors.foreground}>{monthName}</Text>
      </Box>

      {/* Grid of days */}
      <Box flexDirection="column" flexGrow={1}>
        {canScrollUp && (
          <Box justifyContent="center" marginBottom={1}>
            <Text color={theme.colors.keyboardHint} dimColor>
              -- more above --
            </Text>
          </Box>
        )}

        {visibleRowData.map((_, index) => {
          const rowIndex = scrollOffset + index;
          return (
            <Box key={rowIndex} flexDirection="row" marginBottom={1}>
              {Array.from({ length: columns }).map((_, colIndex) => {
                const dateIndex = rowIndex * columns + colIndex;
                const date = monthDates[dateIndex];

                if (!date) {
                  return (
                    <Box
                      key={`empty-${colIndex}`}
                      flexDirection="column"
                      flexGrow={1}
                      flexBasis={0}
                      marginRight={colIndex === columns - 1 ? 0 : 2}
                    />
                  );
                }

                const dateStr = getDateString(date);
                const dayTasks = tasksByDate[dateStr] || [];
                const flatTasks = flattenTasks(dayTasks);

                return (
                  <Box
                    key={dateStr}
                    flexDirection="column"
                    flexGrow={1}
                    flexBasis={0}
                    marginRight={colIndex === columns - 1 ? 0 : 2}
                  >
                    {/* Date header */}
                    <Text bold color={theme.colors.calendarSelected}>
                      {formatDate(date, "do MMM")}
                    </Text>

                    {/* Tasks */}
                    <Box flexDirection="column">
                      {flatTasks.length === 0 ? (
                        <Text dimColor color={theme.colors.keyboardHint}>
                          No tasks
                        </Text>
                      ) : (
                        flatTasks
                          .slice(0, 10)
                          .map((task) => (
                            <TaskItem key={task.id} task={task} theme={theme} />
                          ))
                      )}
                      {flatTasks.length > 10 && (
                        <Text dimColor color={theme.colors.keyboardHint}>
                          +{flatTasks.length - 10} more...
                        </Text>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          );
        })}

        {canScrollDown && (
          <Box justifyContent="center" marginTop={1}>
            <Text color={theme.colors.keyboardHint} dimColor>
              -- more below --
            </Text>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box marginTop={1}>
        <Text color={theme.colors.keyboardHint} dimColor>
          n/p or ←/→: month | j/k or ↓/↑: scroll | Esc: close | Shift+;: toggle
        </Text>
      </Box>
    </Box>
  );
};

interface TaskItemProps {
  task: Task;
  theme: any;
  depth?: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, theme, depth = 0 }) => {
  const checkbox = getCheckbox(task.state);
  const color = getStateColor(task.state, theme);

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={color}>{checkbox} </Text>
        {depth > 0 && <Text>{"  ".repeat(depth)}</Text>}
        <Text
          color={color}
          strikethrough={task.state === "completed"}
          dimColor={task.state === "delayed"}
        >
          {task.title.length > 40
            ? task.title.slice(0, 37) + "..."
            : task.title}
        </Text>
      </Box>
      {task.children.map((child) => (
        <TaskItem key={child.id} task={child} theme={theme} depth={depth + 1} />
      ))}
    </Box>
  );
};

function getCheckbox(state: string): string {
  switch (state) {
    case "completed":
      return "☑";
    case "delegated":
      return "↦";
    case "delayed":
      return "⏸";
    default:
      return "☐";
  }
}

function getStateColor(state: string, theme: any): string {
  const colors: Record<string, string> = {
    todo: theme.colors.taskStateTodo,
    completed: theme.colors.taskStateCompleted,
    delegated: theme.colors.taskStateDelegated,
    delayed: theme.colors.taskStateDelayed,
  };
  return colors[state] || theme.colors.foreground;
}
