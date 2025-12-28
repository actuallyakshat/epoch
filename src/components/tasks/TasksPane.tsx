import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import { ControlledTextInput } from "../common/ControlledTextInput";
import { useTheme } from "../../contexts/ThemeContext";
import { useApp } from "../../contexts/AppContext";
import { Pane } from "../layout/Pane";
import { TaskHeader } from "./TaskHeader";
import { TaskList } from "./TaskList";
import { KeyboardHints } from "../common/KeyboardHints";
import { getDateString } from "../../utils/date";
import { taskService } from "../../services/taskService";
import { timelineService } from "../../services/timelineService";
import { flattenTasks } from "../../utils/tree";
import type { Task, TaskState } from "../../types/task";
import { TimelineEventType } from "../../types/timeline";
import { useTerminalSize } from "../../hooks/useTerminalSize";

type EditMode = "none" | "add" | "edit" | "addSubtask";

export const TasksPane: React.FC = () => {
  const {
    tasks,
    setTasks,
    timeline,
    setTimeline,
    activePane,
    selectedDate,
    isInputMode,
    setIsInputMode,
    isModalOpen,
    pushUndoableAction,
  } = useApp();
  const { theme } = useTheme();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editMode, setEditMode] = useState<EditMode>("none");
  const [editValue, setEditValue] = useState("");
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const { height: terminalHeight } = useTerminalSize();

  const visibleRows = useMemo(() => {
    // Header/Stats (4) + Keyboard Hints (3) + Padding/Margins (4) = ~11 lines
    return Math.max(5, terminalHeight - 11);
  }, [terminalHeight]);

  const dateStr = getDateString(
    new Date(selectedDate.year, selectedDate.month, selectedDate.day)
  );

  // Memoize to prevent new array reference on every render when empty
  const dayTasks = useMemo(() => tasks[dateStr] || [], [tasks, dateStr]);
  const stats = taskService.getTaskStats(tasks, dateStr);
  const isFocused = activePane === "tasks" && !isModalOpen;

  // Flatten tasks for navigation (only visible ones based on expanded state)
  const flatTasks = useMemo(() => {
    const result: { task: Task; depth: number }[] = [];

    const traverse = (taskList: Task[], depth: number) => {
      for (const task of taskList) {
        result.push({ task, depth });
        if (task.children.length > 0 && expandedIds.has(task.id)) {
          traverse(task.children, depth + 1);
        }
      }
    };

    traverse(dayTasks, 0);
    return result;
  }, [dayTasks, expandedIds]);

  const selectedTask = flatTasks[selectedIndex]?.task;
  const selectedTaskId = selectedTask?.id;

  // Expand all nested tasks by default when tasks change
  useEffect(() => {
    const allParentIds = new Set<string>();
    const collectParents = (taskList: Task[]) => {
      for (const task of taskList) {
        if (task.children.length > 0) {
          allParentIds.add(task.id);
          collectParents(task.children);
        }
      }
    };
    collectParents(dayTasks);

    // Only update if the IDs have actually changed
    setExpandedIds((prev) => {
      if (prev.size !== allParentIds.size) return allParentIds;
      for (const id of allParentIds) {
        if (!prev.has(id)) return allParentIds;
      }
      return prev; // No change, keep same reference
    });
  }, [dayTasks]);

  // Reset selection when day changes
  useEffect(() => {
    setSelectedIndex(0);
    setEditMode("none");
  }, [dateStr]);

  // Clamp selection index when tasks change
  useEffect(() => {
    if (selectedIndex >= flatTasks.length && flatTasks.length > 0) {
      setSelectedIndex(flatTasks.length - 1);
    }
  }, [flatTasks.length, selectedIndex]);

  // Keep selected task in view
  useEffect(() => {
    setScrollOffset((currentOffset) => {
      if (selectedIndex < currentOffset) {
        return selectedIndex;
      } else if (selectedIndex >= currentOffset + visibleRows) {
        return selectedIndex - visibleRows + 1;
      }
      return currentOffset; // No change needed
    });
  }, [selectedIndex, visibleRows]);

  // Reset scroll when day changes
  useEffect(() => {
    setScrollOffset(0);
  }, [dateStr]);

  const handleAddTask = () => {
    setEditMode("add");
    setEditValue("");
    setIsInputMode(true);
  };

  const handleEditTask = () => {
    if (selectedTask) {
      setEditMode("edit");
      setEditValue(selectedTask.title);
      setIsInputMode(true);
    }
  };

  const handleAddSubtask = () => {
    if (selectedTask) {
      setEditMode("addSubtask");
      setEditValue("");
      setParentTaskId(selectedTask.id);
      setIsInputMode(true);
      setExpandedIds((prev) => new Set(prev).add(selectedTask.id));
    }
  };

  const handleDeleteTask = () => {
    if (selectedTaskId) {
      try {
        pushUndoableAction("TASK_DELETE");
        const updated = taskService.deleteTask(tasks, selectedTaskId);
        setTasks(updated);

        // Remove all timeline events for this task
        const updatedTimeline = timelineService.removeEventsByTaskId(
          timeline,
          selectedTaskId
        );
        setTimeline(updatedTimeline);
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    }
  };

  const handleChangeState = (
    newState: "todo" | "completed" | "delegated" | "delayed"
  ) => {
    if (selectedTaskId && selectedTask) {
      try {
        pushUndoableAction("TASK_UPDATE");
        const previousState = selectedTask.state;
        const updated = taskService.changeTaskState(
          tasks,
          selectedTaskId,
          newState
        );
        setTasks(updated);

        // Handle timeline based on state change
        if (newState === "todo") {
          // If toggling back to todo, remove the previous state event
          const eventTypeToRemove: Record<TaskState, TimelineEventType> = {
            todo: TimelineEventType.STARTED, // shouldn't happen
            completed: TimelineEventType.COMPLETED,
            delegated: TimelineEventType.DELEGATED,
            delayed: TimelineEventType.DELAYED,
          };
          const updatedTimeline = timelineService.removeLastEventByType(
            timeline,
            selectedTaskId,
            eventTypeToRemove[previousState]
          );
          setTimeline(updatedTimeline);
        } else {
          // Create timeline event for state change
          const eventTypeMap: Record<TaskState, TimelineEventType> = {
            todo: TimelineEventType.STARTED, // shouldn't happen
            completed: TimelineEventType.COMPLETED,
            delegated: TimelineEventType.DELEGATED,
            delayed: TimelineEventType.DELAYED,
          };
          const event = timelineService.createEvent(
            selectedTaskId,
            selectedTask.title,
            eventTypeMap[newState],
            new Date(),
            previousState,
            newState
          );
          const updatedTimeline = timelineService.addEvent(timeline, event);
          setTimeline(updatedTimeline);
        }
      } catch (err) {
        console.error("Error changing task state:", err);
      }
    }
  };

  const handleToggleComplete = () => {
    if (selectedTask) {
      const newState =
        selectedTask.state === "completed" ? "todo" : "completed";
      handleChangeState(newState);
    }
  };

  const handleSubmitEdit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setEditMode("none");
      setEditValue("");
      setParentTaskId(null);
      setIsInputMode(false);
      return;
    }

    try {
      if (editMode === "add") {
        pushUndoableAction("TASK_ADD");
        const newTask = taskService.createTask(trimmed, dateStr);
        const newTasks = {
          ...tasks,
          [dateStr]: [...dayTasks, newTask],
        };
        setTasks(newTasks);
        setSelectedIndex(flatTasks.length); // Select newly added task
        // No timeline event for task creation - only track started/completed/etc
      } else if (editMode === "addSubtask" && parentTaskId) {
        pushUndoableAction("TASK_ADD");
        const updated = taskService.addSubtask(tasks, parentTaskId, trimmed);
        setTasks(updated);
        // Find and select the newly added subtask
        const parentIndex = flatTasks.findIndex(
          (ft) => ft.task.id === parentTaskId
        );
        if (parentIndex !== -1) {
          setSelectedIndex(parentIndex + 1); // Select first child (newly added)
        }
        // No timeline event for subtask creation
      } else if (editMode === "edit" && selectedTaskId) {
        pushUndoableAction("TASK_UPDATE");
        const updated = taskService.updateTask(tasks, selectedTaskId, {
          title: trimmed,
        });
        setTasks(updated);
      }
    } catch (err) {
      console.error("Error saving task:", err);
    }

    setEditMode("none");
    setEditValue("");
    setParentTaskId(null);
    setIsInputMode(false);
  };

  const handleCancelEdit = () => {
    setEditMode("none");
    setEditValue("");
    setParentTaskId(null);
    setIsInputMode(false);
  };

  const handleToggleExpand = () => {
    if (selectedTaskId && selectedTask?.children.length > 0) {
      setExpandedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(selectedTaskId)) {
          newSet.delete(selectedTaskId);
        } else {
          newSet.add(selectedTaskId);
        }
        return newSet;
      });
    }
  };

  const handleExpand = () => {
    if (selectedTaskId && selectedTask?.children.length > 0) {
      setExpandedIds((prev) => new Set(prev).add(selectedTaskId));
    }
  };

  const handleCollapse = () => {
    if (selectedTaskId && selectedTask?.children.length > 0) {
      setExpandedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedTaskId);
        return newSet;
      });
    }
  };

  const handleExpandAll = () => {
    // Get all task IDs that have children
    const allParentIds = new Set<string>();
    const collectParents = (taskList: Task[]) => {
      for (const task of taskList) {
        if (task.children.length > 0) {
          allParentIds.add(task.id);
          collectParents(task.children);
        }
      }
    };
    collectParents(dayTasks);
    setExpandedIds(allParentIds);
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  // Input handler for navigation/command mode
  useInput(
    (input, key) => {
      // Expand/Collapse ALL with Cmd/Ctrl + arrow keys
      // Note: On Mac terminals, Cmd+Left sends Ctrl+a and Cmd+Right sends Ctrl+e
      if ((key.meta || key.ctrl) && (input === "a" || key.leftArrow)) {
        handleCollapseAll();
        return;
      }

      if ((key.meta || key.ctrl) && (input === "e" || key.rightArrow)) {
        handleExpandAll();
        return;
      }

      // Navigation
      if (input === "j" || key.downArrow) {
        setSelectedIndex((prev) => Math.min(prev + 1, flatTasks.length - 1));
        return;
      }

      if (input === "k" || key.upArrow) {
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      // Expand/Collapse current with arrow keys (no modifiers)
      if (key.leftArrow && !key.meta && !key.ctrl) {
        handleCollapse();
        return;
      }

      if (key.rightArrow && !key.meta && !key.ctrl) {
        handleExpand();
        return;
      }

      // Task actions (only if no modifier keys are pressed)
      if (input === "a" && !key.meta && !key.ctrl && !key.shift) {
        handleAddTask();
        return;
      }

      if (
        input === "e" &&
        selectedTask &&
        !key.meta &&
        !key.ctrl &&
        !key.shift
      ) {
        handleEditTask();
        return;
      }

      if (input === "d" && selectedTask) {
        handleDeleteTask();
        return;
      }

      if (input === " " && selectedTask) {
        handleToggleComplete();
        return;
      }

      if (input === "D" && selectedTask) {
        handleChangeState("delegated");
        return;
      }

      if (input === "x" && selectedTask) {
        // Toggle delayed state
        if (selectedTask.state === "delayed") {
          handleChangeState("todo");
        } else {
          handleChangeState("delayed");
        }
        return;
      }

      if (input === "s" && selectedTask) {
        try {
          pushUndoableAction("TASK_UPDATE");
          // Toggle start - if already started (has startTime but no endTime), unstart it
          if (selectedTask.startTime && !selectedTask.endTime) {
            // Unstart: clear startTime and remove timeline event
            const updated = taskService.updateTask(tasks, selectedTaskId!, {
              startTime: undefined,
            });
            setTasks(updated);

            // Remove the started event from timeline
            const updatedTimeline = timelineService.removeLastEventByType(
              timeline,
              selectedTaskId!,
              TimelineEventType.STARTED
            );
            setTimeline(updatedTimeline);
          } else {
            // Start task
            const updated = taskService.startTask(tasks, selectedTaskId!);
            setTasks(updated);

            // Create timeline event for starting task
            const event = timelineService.createEvent(
              selectedTaskId!,
              selectedTask.title,
              TimelineEventType.STARTED,
              new Date()
            );
            const updatedTimeline = timelineService.addEvent(timeline, event);
            setTimeline(updatedTimeline);
          }
        } catch (err) {
          console.error("Error toggling task start:", err);
        }
        return;
      }

      if (key.return && selectedTask) {
        handleToggleExpand();
        return;
      }

      if (key.tab && selectedTask) {
        handleAddSubtask();
        return;
      }
    },
    { isActive: isFocused && editMode === "none" }
  );

  return (
    <Pane title="Tasks" isFocused={isFocused}>
      <Box flexDirection="column" flexGrow={1} width="100%">
        <TaskHeader
          selectedDate={
            new Date(selectedDate.year, selectedDate.month, selectedDate.day)
          }
          completionPercentage={stats.percentage}
        />

        {editMode === "add" && (
          <Box marginY={1}>
            <Text color={theme.colors.focusIndicator}>{">  "}</Text>
            <ControlledTextInput
              value={editValue}
              placeholder="Enter task name..."
              onChange={setEditValue}
              onSubmit={handleSubmitEdit}
              onCancel={handleCancelEdit}
              color={theme.colors.foreground}
              placeholderColor={theme.colors.foreground}
              maxLength={60}
            />
          </Box>
        )}

        {editMode === "addSubtask" && (
          <Box marginY={1}>
            <Text color={theme.colors.focusIndicator}>{">  "}</Text>
            <Text color={theme.colors.keyboardHint}>{"  "}</Text>
            <ControlledTextInput
              value={editValue}
              placeholder="Enter subtask name..."
              onChange={setEditValue}
              onSubmit={handleSubmitEdit}
              onCancel={handleCancelEdit}
              color={theme.colors.foreground}
              placeholderColor={theme.colors.foreground}
              maxLength={60}
            />
          </Box>
        )}

        {dayTasks.length === 0 &&
        editMode !== "add" &&
        editMode !== "addSubtask" ? (
          <Box marginY={1}>
            <Text color={theme.colors.keyboardHint} dimColor>
              No tasks. Press &apos;a&apos; to add one.
            </Text>
          </Box>
        ) : (
          <Box flexDirection="column" marginY={1} paddingRight={2}>
            {scrollOffset > 0 && (
              <Box justifyContent="center" marginBottom={1}>
                <Text color={theme.colors.keyboardHint} dimColor>
                  -- more above --
                </Text>
              </Box>
            )}

            {flatTasks
              .slice(scrollOffset, scrollOffset + visibleRows)
              .map(({ task, depth }, sliceIndex) => {
                const index = scrollOffset + sliceIndex;
                const isSelected = index === selectedIndex;
                const isExpanded = expandedIds.has(task.id);
                const isEditing = editMode === "edit" && isSelected;

                if (isEditing) {
                  return (
                    <Box key={task.id}>
                      <Text color={theme.colors.focusIndicator}>{">  "}</Text>
                      <ControlledTextInput
                        value={editValue}
                        onChange={setEditValue}
                        onSubmit={handleSubmitEdit}
                        onCancel={handleCancelEdit}
                        color={theme.colors.foreground}
                        placeholderColor={theme.colors.foreground}
                        maxLength={60}
                      />
                    </Box>
                  );
                }

                return (
                  <Box key={task.id}>
                    <Text
                      color={
                        isSelected
                          ? theme.colors.focusIndicator
                          : theme.colors.foreground
                      }
                    >
                      {isSelected ? ">" : " "}
                    </Text>
                    <Text> </Text>
                    <Text>{"  ".repeat(depth)}</Text>
                    <Text
                      color={
                        isSelected
                          ? theme.colors.focusIndicator
                          : getStateColor(task.state, theme)
                      }
                    >
                      {getCheckbox(task.state)}
                    </Text>
                    <Text> </Text>
                    {task.children.length > 0 && (
                      <>
                        <Text>{isExpanded ? "▼" : "▶"}</Text>
                        <Text> </Text>
                      </>
                    )}
                    <Text
                      color={
                        isSelected
                          ? theme.colors.focusIndicator
                          : getStateColor(task.state, theme)
                      }
                      strikethrough={task.state === "completed"}
                      dimColor={task.state === "delayed" && !isSelected}
                    >
                      {task.title}
                    </Text>
                    {task.startTime && !task.endTime && (
                      <Text
                        color={
                          isSelected
                            ? theme.colors.focusIndicator
                            : theme.colors.timelineEventStarted
                        }
                      >
                        {" "}
                        ▶
                      </Text>
                    )}
                  </Box>
                );
              })}

            {scrollOffset + visibleRows < flatTasks.length && (
              <Box justifyContent="center" marginTop={1}>
                <Text color={theme.colors.keyboardHint} dimColor>
                  -- more below --
                </Text>
              </Box>
            )}
          </Box>
        )}

        <KeyboardHints
          hints={[
            { key: "j/k", description: "navigate" },
            { key: "a", description: "add" },
            { key: "Tab", description: "add subtask" },
            { key: "e", description: "edit" },
            { key: "d", description: "delete" },
            { key: "Space", description: "complete" },
            { key: "D", description: "delegate" },
            { key: "x", description: "delay" },
            { key: "s", description: "start" },
            { key: "←/→", description: "collapse/expand" },
            { key: "Cmd+←/→", description: "all" },
          ]}
        />
      </Box>
    </Pane>
  );
};

function getCheckbox(state: string): string {
  switch (state) {
    case "completed":
      return "[✓]";
    case "delegated":
      return "[→]";
    case "delayed":
      return "[‖]";
    default:
      return "[ ]";
  }
}

function getStateColor(state: string, theme: any): string | undefined {
  const colors: Record<string, string | undefined> = {
    todo: theme.colors.taskStateTodo,
    completed: theme.colors.taskStateCompleted,
    delegated: theme.colors.taskStateDelegated,
    delayed: theme.colors.taskStateDelayed,
  };
  return colors[state] || theme.colors.foreground;
}
