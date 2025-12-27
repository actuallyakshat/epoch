import React, { useMemo } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "../../contexts/ThemeContext";
import { useApp } from "../../contexts/AppContext";
import { getDateString, formatDate } from "../../utils/date";
import { flattenTasks } from "../../utils/tree";
import type { Task } from "../../types/task";
import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export const OverviewScreen: React.FC = () => {
  const { theme } = useTheme();
  const { tasks, overviewMonth, setOverviewMonth, setShowOverview } = useApp();

  // Get all days in the current overview month
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
  });

  const monthName = formatDate(
    new Date(overviewMonth.year, overviewMonth.month, 1),
    "MMMM yyyy"
  );

  // Calculate grid layout - 4 columns
  const columns = 4;
  const rows = Math.ceil(monthDates.length / columns);

  return (
    <Box
      flexDirection="column"
      padding={2}
      borderStyle="round"
      borderColor={theme.colors.taskBorder}
      width="100%"
      height="100%"
    >
      {/* Header */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color={theme.colors.focusIndicator}>
          Overview
        </Text>
        <Text color={theme.colors.foreground}>{monthName}</Text>
      </Box>

      {/* Grid of days */}
      <Box flexDirection="column" flexGrow={1}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Box key={rowIndex} flexDirection="row" marginBottom={1}>
            {Array.from({ length: columns }).map((_, colIndex) => {
              const dateIndex = rowIndex * columns + colIndex;
              if (dateIndex >= monthDates.length) return null;

              const date = monthDates[dateIndex];
              const dateStr = getDateString(date);
              const dayTasks = tasksByDate[dateStr] || [];
              const flatTasks = flattenTasks(dayTasks);

              return (
                <Box
                  key={dateStr}
                  flexDirection="column"
                  width={25}
                  marginRight={2}
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
        ))}
      </Box>

      {/* Footer */}
      <Box marginTop={1}>
        <Text color={theme.colors.keyboardHint} dimColor>
          n/p or ←/→: change month Esc: close Shift+;: toggle
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
          {task.title.length > 18
            ? task.title.slice(0, 15) + "..."
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
