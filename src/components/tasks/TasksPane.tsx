import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useTheme } from "../../contexts/ThemeContext";
import { useApp } from "../../contexts/AppContext";
import { Pane } from "../layout/Pane";
import { TaskHeader } from "./TaskHeader";
import { TaskList } from "./TaskList";
import { getDateString } from "../../utils/date";
import { taskService } from "../../services/taskService";
import { flattenTasks } from "../../utils/tree";
import type { Task } from "../../types/task";

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
  } = useApp();
  const { theme } = useTheme();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editMode, setEditMode] = useState<EditMode>("none");
  const [editValue, setEditValue] = useState("");
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);

  const dateStr = getDateString(
    new Date(selectedDate.year, selectedDate.month, selectedDate.day)
  );

  const dayTasks = tasks[dateStr] || [];
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
      // Auto-expand the parent to show the new subtask when created
      setExpandedIds((prev) => new Set(prev).add(selectedTask.id));
    }
  };

  const handleDeleteTask = () => {
    if (selectedTaskId) {
      try {
        const updated = taskService.deleteTask(tasks, selectedTaskId);
        setTasks(updated);
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    }
  };

  const handleChangeState = (
    newState: "todo" | "completed" | "delegated" | "delayed"
  ) => {
    if (selectedTaskId) {
      try {
        const updated = taskService.changeTaskState(
          tasks,
          selectedTaskId,
          newState
        );
        setTasks(updated);
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
        const newTask = taskService.createTask(trimmed, dateStr);
        const newTasks = {
          ...tasks,
          [dateStr]: [...dayTasks, newTask],
        };
        setTasks(newTasks);
        setSelectedIndex(flatTasks.length); // Select newly added task
      } else if (editMode === "addSubtask" && parentTaskId) {
        const updated = taskService.addSubtask(tasks, parentTaskId, trimmed);
        setTasks(updated);
        // Find and select the newly added subtask
        const parentIndex = flatTasks.findIndex(
          (ft) => ft.task.id === parentTaskId
        );
        if (parentIndex !== -1) {
          setSelectedIndex(parentIndex + 1); // Select first child (newly added)
        }
      } else if (editMode === "edit" && selectedTaskId) {
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

  useInput(
    (input: string, key) => {
      if (!isFocused) return;

      // When in edit mode, only handle escape
      if (editMode !== "none") {
        if (key.escape) {
          handleCancelEdit();
        }
        return;
      }

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
        handleChangeState("delayed");
        return;
      }

      if (input === "s" && selectedTask) {
        // Start task
        try {
          const updated = taskService.startTask(tasks, selectedTaskId!);
          setTasks(updated);
        } catch (err) {
          console.error("Error starting task:", err);
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
    { isActive: isFocused }
  );

  return (
    <Pane title="Tasks" isFocused={isFocused}>
      <Box flexDirection="column" flexGrow={1}>
        <TaskHeader
          selectedDate={
            new Date(selectedDate.year, selectedDate.month, selectedDate.day)
          }
          completionPercentage={stats.percentage}
        />

        {editMode === "add" && (
          <Box marginY={1}>
            <Text color={theme.colors.focusIndicator}>{">  "}</Text>
            <TextInput
              value={editValue}
              onChange={setEditValue}
              onSubmit={handleSubmitEdit}
              placeholder="Enter task name..."
            />
          </Box>
        )}

        {editMode === "addSubtask" && (
          <Box marginY={1}>
            <Text color={theme.colors.focusIndicator}>{">  "}</Text>
            <Text color={theme.colors.keyboardHint}>{"  "}</Text>
            <TextInput
              value={editValue}
              onChange={setEditValue}
              onSubmit={handleSubmitEdit}
              placeholder="Enter subtask name..."
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
          <Box flexDirection="column" marginY={1}>
            {flatTasks.map(({ task, depth }, index) => {
              const isSelected = index === selectedIndex;
              const isExpanded = expandedIds.has(task.id);
              const isEditing = editMode === "edit" && isSelected;

              if (isEditing) {
                return (
                  <Box key={task.id}>
                    <Text color={theme.colors.focusIndicator}>{">  "}</Text>
                    <TextInput
                      value={editValue}
                      onChange={setEditValue}
                      onSubmit={handleSubmitEdit}
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
                  <Text color={getStateColor(task.state, theme)}>
                    {getCheckbox(task.state)}
                  </Text>
                  <Text> </Text>
                  <Text>
                    {task.children.length > 0
                      ? isExpanded
                        ? "▼ "
                        : "▶ "
                      : "  "}
                  </Text>
                  <Text>{"  ".repeat(depth)}</Text>
                  <Text
                    color={getStateColor(task.state, theme)}
                    strikethrough={task.state === "completed"}
                    dimColor={task.state === "delayed"}
                  >
                    {task.title}
                  </Text>
                  {task.startTime && !task.endTime && (
                    <Text color={theme.colors.timelineEventStarted}> ▶</Text>
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        <Box marginTop={1} flexDirection="column">
          <Text color={theme.colors.keyboardHint} dimColor>
            j/k: navigate a: add Tab: add subtask e: edit d: delete
          </Text>
          <Text color={theme.colors.keyboardHint} dimColor>
            Space: complete D: delegate x: delay s: start
          </Text>
          <Text color={theme.colors.keyboardHint} dimColor>
            ←/→: collapse/expand Cmd+←/→: collapse/expand all
          </Text>
        </Box>
      </Box>
    </Pane>
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

function getStateColor(state: string, theme: any): string | undefined {
  const colors: Record<string, string | undefined> = {
    todo: theme.colors.taskStateTodo,
    completed: theme.colors.taskStateCompleted,
    delegated: theme.colors.taskStateDelegated,
    delayed: theme.colors.taskStateDelayed,
  };
  return colors[state] || theme.colors.foreground;
}
