import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { ControlledTextInput } from '../common/ControlledTextInput';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';
import { Pane } from '../layout/Pane';
import { TaskHeader } from './TaskHeader';
import { TaskList } from './TaskList';
import { KeyboardHints } from '../common/KeyboardHints';
import { getDateString, isToday } from '../../utils/date';
import { taskService } from '../../services/taskService';
import { timelineService } from '../../services/timelineService';
import { recurringTaskService } from '../../services/recurringTaskService';
import { flattenTasks, findTaskById } from '../../utils/tree';
import { logger } from '../../utils/logger';
import type { Task, TaskState, RecurrencePattern } from '../../types/task';
import { TimelineEventType } from '../../types/timeline';
import { useTerminalSize } from '../../hooks/useTerminalSize';

type EditMode = 'none' | 'add' | 'edit' | 'addSubtask';
type PendingSaveType =
  | 'normal'
  | 'recurring-this'
  | 'recurring-all'
  | 'recurring-from-today'
  | null;

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
    setShowRecurringTaskDialog,
    setRecurringTaskId,
    setShowRecurringEditDialog,
    setRecurringEditConfig,
    recurringEditConfig,
  } = useApp();
  const { theme } = useTheme();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editMode, setEditMode] = useState<EditMode>('none');
  const [editValue, setEditValue] = useState('');
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null); // Track which task is being edited
  const [pendingAction, setPendingAction] = useState<{
    action: 'edit' | 'delete';
    taskId: string;
    data?: any;
  } | null>(null);
  const { height: terminalHeight } = useTerminalSize();

  const visibleRows = useMemo(() => {
    // Header/Stats (4) + Keyboard Hints (3) + Padding/Margins (4) = ~11 lines
    return Math.max(5, terminalHeight - 11);
  }, [terminalHeight]);

  const selectedDateObj = useMemo(
    () => new Date(selectedDate.year, selectedDate.month, selectedDate.day),
    [selectedDate.year, selectedDate.month, selectedDate.day],
  );
  const dateStr = getDateString(selectedDateObj);
  const isSelectedDateToday = isToday(selectedDateObj);

  // Get tasks for the current date including recurring instances
  const dayTasks = useMemo(() => {
    const existingTasks = tasks[dateStr] || [];
    const recurringInstances: Task[] = [];
    const currentDateObj = new Date(selectedDate.year, selectedDate.month, selectedDate.day);

    logger.log('[dayTasks] Calculating dayTasks with recurring instances', {
      dateStr,
      existingTaskCount: existingTasks.length,
      existingTasks: existingTasks.map((t) => ({
        id: t.id,
        title: t.title,
        state: t.state,
        isRecurringInstance: t.isRecurringInstance,
        recurringParentId: t.recurringParentId,
        hasRecurrence: !!t.recurrence,
      })),
    });

    // Find all recurring tasks from all dates
    for (const [taskDate, taskList] of Object.entries(tasks)) {
      for (const task of taskList) {
        if (task.recurrence && !task.isRecurringInstance) {
          // Check if this recurring task should appear on the selected date
          if (recurringTaskService.shouldTaskGenerateForDate(task, currentDateObj)) {
            // Check if an instance already exists for this date
            const instanceExists = existingTasks.some((t) => t.recurringParentId === task.id);
            if (!instanceExists) {
              const instance = recurringTaskService.generateRecurringInstance(task, currentDateObj);
              logger.log('[dayTasks] Generated recurring instance', {
                instanceId: instance.id,
                instanceTitle: instance.title,
                parentId: task.id,
                parentDate: taskDate,
                targetDate: dateStr,
              });
              recurringInstances.push(instance);
            } else {
              logger.log('[dayTasks] Instance already exists for parent', {
                parentId: task.id,
                parentTitle: task.title,
                targetDate: dateStr,
              });
            }
          }
        }
      }
    }

    logger.log('[dayTasks] Recurring instances generated', {
      dateStr,
      recurringInstanceCount: recurringInstances.length,
      totalTasks: existingTasks.length + recurringInstances.length,
    });

    return [...existingTasks, ...recurringInstances];
  }, [tasks, dateStr, selectedDate.year, selectedDate.month, selectedDate.day]);
  const stats = taskService.getTaskStats(tasks, dateStr);
  const isFocused = activePane === 'tasks' && !isModalOpen;

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

  // Log when editMode or isInputMode changes
  useEffect(() => {
    logger.log('[TasksPane] Edit mode or input mode changed', {
      editMode,
      isInputMode,
      parentTaskId,
      editValue,
      isModalOpen,
      isFocused,
    });
  }, [editMode, isInputMode, parentTaskId, editValue, isModalOpen, isFocused]);

  // Reset selection when day changes
  useEffect(() => {
    setSelectedIndex(0);
    setEditMode('none');
    setEditingTaskId(null);
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

  // Helper function to check if task is recurring or an instance
  const isRecurringTask = (task: Task): boolean => {
    return !!(task.recurrence || task.isRecurringInstance);
  };

  // Helper function to find the root parent of a task
  const findRootParent = (task: Task): Task | null => {
    if (!task.parentId) {
      return task; // This is already the root
    }

    // Search through all tasks to find the parent
    for (const taskList of Object.values(tasks)) {
      for (const potentialParent of taskList) {
        // Check if this is the direct parent
        if (potentialParent.id === task.parentId) {
          // Recursively find the root
          return findRootParent(potentialParent);
        }
        // Check nested children
        const foundInChildren = findInChildren(potentialParent.children, task.parentId);
        if (foundInChildren) {
          return findRootParent(foundInChildren);
        }
      }
    }
    return null;
  };

  const findInChildren = (children: Task[], id: string): Task | null => {
    for (const child of children) {
      if (child.id === id) {
        return child;
      }
      const found = findInChildren(child.children, id);
      if (found) {
        return found;
      }
    }
    return null;
  };

  // Helper function to check if a task or any of its ancestors is recurring
  const hasRecurringAncestor = (task: Task): boolean => {
    const root = findRootParent(task);
    return root ? isRecurringTask(root) : false;
  };

  // Execute the pending action
  const executePendingAction = (action: typeof pendingAction, thisOnly: boolean) => {
    if (!action) return;

    const task = flatTasks.find((ft) => ft.task.id === action.taskId)?.task;
    if (!task) return;

    logger.log('[TasksPane] executePendingAction called', {
      action: action.action,
      thisOnly,
      taskId: action.taskId,
      currentEditMode: editMode,
      currentIsInputMode: isInputMode,
    });

    switch (action.action) {
      case 'delete':
        performDelete(action.taskId, task, thisOnly);
        break;
      case 'edit':
        performEdit(action.taskId, task, thisOnly);
        break;
    }

    logger.log('[TasksPane] executePendingAction completed', {
      newEditMode: editMode,
      newIsInputMode: isInputMode,
    });
  };

  // Perform functions for recurring task actions
  const performDelete = (taskId: string, task: Task, thisOnly: boolean) => {
    try {
      pushUndoableAction('TASK_DELETE');

      if (thisOnly) {
        // Delete only this instance
        let updated = tasks;
        const isMaterialized = Object.values(tasks).some((taskList) =>
          findTaskById(taskList, taskId),
        );

        if (isMaterialized) {
          updated = taskService.deleteTask(tasks, taskId);
        }

        // If it's a recurring task (parent or instance), add to excludedDates
        if (task.isRecurringInstance && task.recurringParentId) {
          updated = taskService.excludeRecurringInstance(updated, task.recurringParentId, dateStr);
        } else if (task.recurrence) {
          updated = taskService.excludeRecurringInstance(updated, taskId, dateStr);
        }

        setTasks(updated);

        // Remove all timeline events for this task
        const updatedTimeline = timelineService.removeEventsByTaskId(timeline, taskId);
        setTimeline(updatedTimeline);
      } else {
        // Delete all occurrences - delete the parent task entirely
        const parentIdToDelete = task.recurringParentId || taskId;
        const updated = taskService.deleteTask(tasks, parentIdToDelete);
        setTasks(updated);

        // Remove all timeline events for this task
        const updatedTimeline = timelineService.removeEventsByTaskId(timeline, taskId);
        if (task.recurringParentId) {
          const parentTimeline = timelineService.removeEventsByTaskId(
            updatedTimeline,
            task.recurringParentId,
          );
          setTimeline(parentTimeline);
        } else {
          setTimeline(updatedTimeline);
        }
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const performEdit = (taskId: string, task: Task, thisOnly: boolean) => {
    if (thisOnly || task.isRecurringInstance) {
      // Edit just this instance - remove it from recurrence
      setEditMode('edit');
      setEditValue(task.title);
      setIsInputMode(true);
    } else {
      // Edit all occurrences - edit the parent recurring task
      setEditMode('edit');
      setEditValue(task.title);
      setIsInputMode(true);
    }
  };

  const performStateChange = (
    taskId: string,
    task: Task,
    newState: TaskState,
    thisOnly: boolean,
  ) => {
    logger.log('[performStateChange] Called', {
      taskId,
      taskTitle: task.title,
      taskDate: task.date,
      previousState: task.state,
      newState,
      thisOnly,
      isRecurringInstance: task.isRecurringInstance,
      recurringParentId: task.recurringParentId,
      hasRecurrence: !!task.recurrence,
      parentId: task.parentId,
    });

    try {
      pushUndoableAction('TASK_UPDATE');
      const previousState = task.state;

      // Check if this is a recurring instance that hasn't been materialized yet
      if (task.isRecurringInstance && task.recurringParentId) {
        // Check if this task already exists in the tasks object
        const existingTasks = tasks[task.date] || [];
        const taskExists = existingTasks.some((t) => t.id === taskId);

        if (!taskExists) {
          // This is an ephemeral recurring instance - we need to materialize it first
          logger.log('[performStateChange] Materializing recurring instance', {
            taskId,
            taskDate: task.date,
          });

          // Create a persisted version of this recurring instance
          const materializedTask: Task = {
            ...task,
            state: newState,
            endTime: ['completed', 'delegated', 'delayed'].includes(newState)
              ? new Date()
              : undefined,
            updatedAt: new Date(),
          };

          // Add it to the tasks object for this date
          const updated = {
            ...tasks,
            [task.date]: [...existingTasks, materializedTask],
          };

          logger.log('[performStateChange] Materialized task added to tasks', {
            taskId,
            date: task.date,
            tasksForDate: updated[task.date].length,
          });

          setTasks(updated);
        } else {
          // Task already materialized - update it normally
          logger.log('[performStateChange] Task already materialized, updating normally', {
            taskId,
            newState,
          });

          const updated = taskService.changeTaskState(tasks, taskId, newState);

          logger.log('[performStateChange] Task state updated, setting tasks', {
            taskId,
            updatedTasksKeys: Object.keys(updated),
            tasksForDate: updated[task.date]?.length || 0,
          });

          setTasks(updated);
        }
      } else {
        // Normal task or already materialized - update normally
        logger.log('[performStateChange] Calling taskService.changeTaskState', {
          taskId,
          newState,
        });

        const updated = taskService.changeTaskState(tasks, taskId, newState);

        logger.log('[performStateChange] Task state updated, setting tasks', {
          taskId,
          updatedTasksKeys: Object.keys(updated),
          tasksForDate: updated[task.date]?.length || 0,
        });

        setTasks(updated);
      }

      // Handle timeline based on state change
      if (newState === 'todo') {
        // If toggling back to todo, remove the previous state event
        const eventTypeToRemove: Record<TaskState, TimelineEventType> = {
          todo: TimelineEventType.STARTED, // shouldn't happen
          completed: TimelineEventType.COMPLETED,
          delegated: TimelineEventType.DELEGATED,
          delayed: TimelineEventType.DELAYED,
        };
        const updatedTimeline = timelineService.removeLastEventByType(
          timeline,
          taskId,
          eventTypeToRemove[previousState],
        );
        setTimeline(updatedTimeline);
        logger.log('[performStateChange] Toggled back to todo, removed timeline event');
      } else if (isSelectedDateToday) {
        // Only create timeline events for today's tasks
        const eventTypeMap: Record<TaskState, TimelineEventType> = {
          todo: TimelineEventType.STARTED, // shouldn't happen
          completed: TimelineEventType.COMPLETED,
          delegated: TimelineEventType.DELEGATED,
          delayed: TimelineEventType.DELAYED,
        };

        const event = timelineService.createEvent(
          taskId,
          task.title,
          eventTypeMap[newState],
          new Date(),
          previousState,
          newState,
        );
        const updatedTimeline = timelineService.addEvent(timeline, event);
        setTimeline(updatedTimeline);
        logger.log('[performStateChange] Created timeline event for today', {
          eventType: eventTypeMap[newState],
        });
      } else {
        logger.log('[performStateChange] Not today, skipping timeline event', {
          isSelectedDateToday,
          selectedDate: dateStr,
        });
      }

      logger.log('[performStateChange] Completed successfully');
    } catch (err) {
      logger.log('[performStateChange] Error', { error: err });
      console.error('Error changing task state:', err);
    }
  };

  const handleAddTask = () => {
    setEditMode('add');
    setEditValue('');
    setIsInputMode(true);
  };

  const handleEditTask = () => {
    if (selectedTask) {
      // Always allow editing immediately - just set up edit mode
      setEditMode('edit');
      setEditValue(selectedTask.title);
      setEditingTaskId(selectedTask.id);
      setIsInputMode(true);
    }
  };

  const handleAddSubtask = () => {
    if (selectedTask) {
      // Always allow adding subtask immediately - just set up input mode
      setEditMode('addSubtask');
      setEditValue('');
      setParentTaskId(selectedTask.id);
      setIsInputMode(true);
      setExpandedIds((prev) => new Set(prev).add(selectedTask.id));
    }
  };

  const handleDeleteTask = () => {
    if (selectedTaskId && selectedTask) {
      logger.log('handleDeleteTask called', {
        taskId: selectedTaskId,
        isRecurring: isRecurringTask(selectedTask),
        hasRecurrence: !!selectedTask.recurrence,
        isInstance: !!selectedTask.isRecurringInstance,
        hasRecurringAncestor: hasRecurringAncestor(selectedTask),
      });

      if (hasRecurringAncestor(selectedTask)) {
        // Show recurring edit dialog
        const action = { action: 'delete' as const, taskId: selectedTaskId };
        const savedIndex = selectedIndex; // Save current selection
        const rootParent = findRootParent(selectedTask);

        setPendingAction(action);
        setRecurringEditConfig({
          taskId: selectedTaskId,
          taskTitle: selectedTask.title,
          actionType: 'delete',
          onConfirm: (choice: 'this' | 'all' | 'from-today') => {
            logger.log('Recurring delete confirmed', { choice, action });

            pushUndoableAction('TASK_DELETE');

            if (choice === 'this') {
              // Delete just from this instance
              let updated = tasks;
              const isMaterialized = Object.values(tasks).some((taskList) =>
                findTaskById(taskList, selectedTaskId),
              );

              if (isMaterialized) {
                updated = taskService.deleteTask(tasks, selectedTaskId);
              }

              // If it's a recurring task (parent or instance), add to excludedDates to prevent it from reappearing
              if (selectedTask.isRecurringInstance && selectedTask.recurringParentId) {
                updated = taskService.excludeRecurringInstance(
                  updated,
                  selectedTask.recurringParentId,
                  dateStr,
                );
              } else if (selectedTask.recurrence) {
                updated = taskService.excludeRecurringInstance(updated, selectedTaskId, dateStr);
              }

              setTasks(updated);

              // Remove all timeline events for this task
              const updatedTimeline = timelineService.removeEventsByTaskId(
                timeline,
                selectedTaskId,
              );
              setTimeline(updatedTimeline);
            } else if (choice === 'all' && rootParent) {
              // Delete from the root parent (all future occurrences won't have this)
              if (selectedTask.parentId) {
                // This is a subtask - find and delete it from the root parent
                const deleteSubtaskFromTree = (task: Task, targetId: string): Task => {
                  return {
                    ...task,
                    children: task.children
                      .filter((child) => child.id !== targetId)
                      .map((child) => deleteSubtaskFromTree(child, targetId)),
                  };
                };

                // Find the root parent in tasks and delete the subtask
                let updated = { ...tasks };
                for (const [date, taskList] of Object.entries(tasks)) {
                  const rootIndex = taskList.findIndex((t) => t.id === rootParent.id);
                  if (rootIndex !== -1) {
                    const updatedRoot = deleteSubtaskFromTree(taskList[rootIndex], selectedTaskId);
                    updated[date] = [
                      ...taskList.slice(0, rootIndex),
                      updatedRoot,
                      ...taskList.slice(rootIndex + 1),
                    ];
                    break;
                  }
                }
                setTasks(updated);
              } else {
                // Root task itself - delete it entirely (delete the parent task)
                const parentIdToDelete = selectedTask.recurringParentId || selectedTaskId;
                const updated = taskService.deleteTask(tasks, parentIdToDelete);
                setTasks(updated);
              }

              // Remove all timeline events for this task
              const updatedTimeline = timelineService.removeEventsByTaskId(
                timeline,
                selectedTaskId,
              );
              if (selectedTask.recurringParentId) {
                const parentTimeline = timelineService.removeEventsByTaskId(
                  updatedTimeline,
                  selectedTask.recurringParentId,
                );
                setTimeline(parentTimeline);
              } else {
                setTimeline(updatedTimeline);
              }
            } else if (choice === 'from-today' && rootParent) {
              // Delete from root parent AND all materialized instances from today onwards
              const todayDateObj = new Date();
              todayDateObj.setHours(0, 0, 0, 0);

              if (selectedTask.parentId) {
                // This is a subtask - delete it from the root parent and future materialized instances
                const deleteSubtaskFromTree = (task: Task, targetId: string): Task => {
                  return {
                    ...task,
                    children: task.children
                      .filter((child) => child.id !== targetId)
                      .map((child) => deleteSubtaskFromTree(child, targetId)),
                  };
                };

                // Find the root parent in tasks and delete the subtask
                let updated = { ...tasks };

                // For subtasks, we need to delete by matching the subtask structure in the parent
                // Since ephemeral instances generate new IDs for children, we need a different approach
                // We'll delete the subtask from the root parent, which will affect all future generated instances
                for (const [date, taskList] of Object.entries(tasks)) {
                  const rootIndex = taskList.findIndex((t) => t.id === rootParent.id);
                  if (rootIndex !== -1) {
                    // For ephemeral subtasks, we need to find by title match since IDs are regenerated
                    const findSubtaskByTitlePath = (
                      task: Task,
                      targetTask: Task,
                      path: string[] = [],
                    ): string[] | null => {
                      if (task.title === targetTask.title && path.length > 0) {
                        return path;
                      }
                      for (const child of task.children) {
                        const result = findSubtaskByTitlePath(child, targetTask, [
                          ...path,
                          child.title,
                        ]);
                        if (result) return result;
                      }
                      return null;
                    };

                    const deleteByTitlePath = (
                      task: Task,
                      titlePath: string[],
                      currentDepth: number = 0,
                    ): Task => {
                      if (currentDepth >= titlePath.length) return task;
                      return {
                        ...task,
                        children: task.children
                          .filter((child) => child.title !== titlePath[currentDepth])
                          .map((child) => deleteByTitlePath(child, titlePath, currentDepth + 1)),
                      };
                    };

                    // Try to find the subtask path in the root parent
                    const titlePath = findSubtaskByTitlePath(taskList[rootIndex], selectedTask);

                    if (titlePath) {
                      const updatedRoot = deleteByTitlePath(taskList[rootIndex], titlePath);
                      updated[date] = [
                        ...taskList.slice(0, rootIndex),
                        updatedRoot,
                        ...taskList.slice(rootIndex + 1),
                      ];
                      logger.log('Deleting subtask from root parent by title path (from-today)', {
                        rootParentId: rootParent.id,
                        titlePath,
                      });
                    } else {
                      // Fallback to ID-based deletion for materialized subtasks
                      const updatedRoot = deleteSubtaskFromTree(
                        taskList[rootIndex],
                        selectedTaskId,
                      );
                      updated[date] = [
                        ...taskList.slice(0, rootIndex),
                        updatedRoot,
                        ...taskList.slice(rootIndex + 1),
                      ];
                      logger.log('Deleting subtask from root parent by ID (from-today)', {
                        rootParentId: rootParent.id,
                        subtaskId: selectedTaskId,
                      });
                    }
                    break;
                  }
                }

                // Also delete from materialized instances from today onwards
                for (const [date, taskList] of Object.entries(updated)) {
                  const dateObj = new Date(date);
                  dateObj.setHours(0, 0, 0, 0);

                  if (dateObj >= todayDateObj) {
                    let hasChanges = false;
                    const updatedTaskList = taskList.map((task) => {
                      if (task.isRecurringInstance && task.recurringParentId === rootParent.id) {
                        logger.log('Deleting subtask from materialized instance (from-today)', {
                          instanceId: task.id,
                          instanceDate: date,
                          subtaskTitle: selectedTask.title,
                        });
                        hasChanges = true;
                        // Use title-based deletion for materialized instances too
                        const deleteByTitle = (t: Task, targetTitle: string): Task => {
                          return {
                            ...t,
                            children: t.children
                              .filter((child) => child.title !== targetTitle)
                              .map((child) => deleteByTitle(child, targetTitle)),
                          };
                        };
                        return deleteByTitle(task, selectedTask.title);
                      }
                      return task;
                    });

                    if (hasChanges) {
                      updated[date] = updatedTaskList;
                    }
                  }
                }

                setTasks(updated);
              } else {
                // Root task itself - delete it and all materialized instances from today onwards
                let updated = { ...tasks };

                // Check if this is a materialized task or ephemeral instance
                const isMaterialized = Object.values(tasks).some((taskList) =>
                  taskList.some((t) => t.id === selectedTaskId),
                );

                if (isMaterialized) {
                  // Delete the materialized task
                  updated = taskService.deleteTask(tasks, selectedTaskId);
                  logger.log('Deleting materialized root task (from-today)', {
                    taskId: selectedTaskId,
                  });
                } else {
                  // This is an ephemeral instance, find and delete the parent recurring task
                  const parentId = selectedTask.recurringParentId;
                  if (parentId) {
                    updated = taskService.deleteTask(tasks, parentId);
                    logger.log('Deleting parent recurring task (from-today)', {
                      parentId,
                      ephemeralTaskId: selectedTaskId,
                    });
                  }
                }

                // Delete materialized instances from today onwards
                const recurringParentToDelete = selectedTask.recurringParentId || selectedTaskId;
                for (const [date, taskList] of Object.entries(updated)) {
                  const dateObj = new Date(date);
                  dateObj.setHours(0, 0, 0, 0);

                  if (dateObj >= todayDateObj) {
                    const filteredTaskList = taskList.filter((task) => {
                      if (
                        task.isRecurringInstance &&
                        task.recurringParentId === recurringParentToDelete
                      ) {
                        logger.log('Deleting materialized instance (from-today)', {
                          instanceId: task.id,
                          instanceDate: date,
                        });
                        return false;
                      }
                      return true;
                    });

                    if (filteredTaskList.length !== taskList.length) {
                      updated[date] = filteredTaskList;
                    }
                  }
                }

                setTasks(updated);
              }

              // Remove all timeline events for this task
              const updatedTimeline = timelineService.removeEventsByTaskId(
                timeline,
                selectedTaskId,
              );
              setTimeline(updatedTimeline);
            }

            setPendingAction(null);
            // For delete, don't restore index as task will be gone
          },
        });
        setShowRecurringEditDialog(true);
      } else {
        logger.log('Not recurring, deleting directly');
        try {
          pushUndoableAction('TASK_DELETE');
          const updated = taskService.deleteTask(tasks, selectedTaskId);
          setTasks(updated);

          // Remove all timeline events for this task
          const updatedTimeline = timelineService.removeEventsByTaskId(timeline, selectedTaskId);
          setTimeline(updatedTimeline);
        } catch (err) {
          console.error('Error deleting task:', err);
        }
      }
    }
  };

  const handleChangeState = (newState: 'todo' | 'completed' | 'delegated' | 'delayed') => {
    // State changes always apply to "this task only" - never ask for confirmation
    if (selectedTaskId && selectedTask) {
      logger.log('[handleChangeState] Called', {
        selectedTaskId,
        taskTitle: selectedTask.title,
        taskDate: selectedTask.date,
        currentState: selectedTask.state,
        newState,
        isRecurringInstance: selectedTask.isRecurringInstance,
        recurringParentId: selectedTask.recurringParentId,
        hasRecurrence: !!selectedTask.recurrence,
        parentId: selectedTask.parentId,
      });
      performStateChange(selectedTaskId, selectedTask, newState, true);
    }
  };

  const handleToggleComplete = () => {
    // State changes always apply to "this task only" - never ask for confirmation
    if (selectedTask) {
      const newState = selectedTask.state === 'completed' ? 'todo' : 'completed';
      logger.log('[handleToggleComplete] Called', {
        selectedTaskId,
        taskTitle: selectedTask.title,
        taskDate: selectedTask.date,
        currentState: selectedTask.state,
        newState,
        isRecurringInstance: selectedTask.isRecurringInstance,
        recurringParentId: selectedTask.recurringParentId,
      });
      handleChangeState(newState);
    }
  };

  const handleSubmitEdit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setEditMode('none');
      setEditValue('');
      setParentTaskId(null);
      setEditingTaskId(null);
      setIsInputMode(false);
      return;
    }

    try {
      if (editMode === 'add') {
        pushUndoableAction('TASK_ADD');
        const newTask = taskService.createTask(trimmed, dateStr);
        const newTasks = {
          ...tasks,
          [dateStr]: [...dayTasks, newTask],
        };
        setTasks(newTasks);
        setSelectedIndex(flatTasks.length); // Select newly added task
        // No timeline event for task creation - only track started/completed/etc
        setEditMode('none');
        setEditValue('');
        setParentTaskId(null);
        setEditingTaskId(null);
        setIsInputMode(false);
      } else if (editMode === 'addSubtask' && parentTaskId) {
        // Check if the parent task is a recurring task
        const parentTask = flatTasks.find((ft) => ft.task.id === parentTaskId)?.task;

        if (parentTask && isRecurringTask(parentTask)) {
          // Show dialog to ask "this or all"
          const savedValue = trimmed;
          const savedParentId = parentTaskId;
          const savedIndex = selectedIndex;

          setRecurringEditConfig({
            taskId: savedParentId,
            taskTitle: parentTask.title,
            actionType: 'add-subtask',
            onConfirm: (choice: 'this' | 'all' | 'from-today') => {
              logger.log('Recurring subtask save confirmed', { choice, newSubtask: savedValue });

              pushUndoableAction('TASK_ADD');

              if (choice === 'this') {
                // Add subtask to just this task (whether it's the parent or an instance)
                // We need to check if this is an ephemeral recurring instance that needs to be materialized first

                // Check if the parent task is materialized (exists in the tasks object)
                const existingTasks = tasks[dateStr] || [];
                const taskExists = existingTasks.some((t) => t.id === savedParentId);

                if (taskExists) {
                  // Task is already materialized - add subtask directly
                  logger.log('Adding subtask to already materialized task (this only)', {
                    parentId: savedParentId,
                    subtaskTitle: savedValue,
                  });
                  const updated = taskService.addSubtask(tasks, savedParentId, savedValue);
                  setTasks(updated);
                } else {
                  // This is an ephemeral recurring instance - we need to materialize it first
                  // Find the parent task from the ephemeral dayTasks (which includes generated instances)
                  const ephemeralParent = dayTasks.find((t) => t.id === savedParentId);

                  if (ephemeralParent && ephemeralParent.isRecurringInstance) {
                    logger.log(
                      'Materializing ephemeral recurring instance for subtask addition (this only)',
                      {
                        parentId: savedParentId,
                        recurringParentId: ephemeralParent.recurringParentId,
                        subtaskTitle: savedValue,
                      },
                    );

                    // Create the subtask
                    const newSubtask = taskService.createTask(savedValue, dateStr);

                    // Materialize the ephemeral instance with the new subtask
                    const materializedTask: Task = {
                      ...ephemeralParent,
                      children: [
                        ...ephemeralParent.children,
                        { ...newSubtask, parentId: savedParentId },
                      ],
                    };

                    // Add the materialized task to the tasks for this date
                    const updated = {
                      ...tasks,
                      [dateStr]: [...existingTasks, materializedTask],
                    };

                    setTasks(updated);
                  } else if (ephemeralParent) {
                    // It's the original recurring parent task - add subtask to it (will affect all instances)
                    // This shouldn't happen if the parent was a recurring task, but handle it gracefully
                    logger.log(
                      'Parent is original recurring task, adding subtask (this only - but will affect template)',
                      {
                        parentId: savedParentId,
                        subtaskTitle: savedValue,
                      },
                    );
                    const updated = taskService.addSubtask(tasks, savedParentId, savedValue);
                    setTasks(updated);
                  } else {
                    logger.log('Parent task not found in ephemeral dayTasks', {
                      parentId: savedParentId,
                    });
                  }
                }
              } else if (choice === 'all') {
                // Add subtask to the parent task (all future occurrences will have it)
                const recurringParentId = parentTask.recurringParentId || savedParentId;

                // First, add to the parent recurring task
                let updated = taskService.addSubtask(tasks, recurringParentId, savedValue);

                // Then, also add to any materialized instances of this recurring task
                logger.log('Adding subtask to parent and materialized instances', {
                  recurringParentId,
                  subtaskTitle: savedValue,
                });

                // Find all materialized instances (tasks with recurringParentId matching this parent)
                for (const [date, taskList] of Object.entries(updated)) {
                  for (let i = 0; i < taskList.length; i++) {
                    const task = taskList[i];
                    if (task.isRecurringInstance && task.recurringParentId === recurringParentId) {
                      // This is a materialized instance - add the subtask to it too
                      logger.log('Adding subtask to materialized instance', {
                        instanceId: task.id,
                        instanceDate: date,
                        subtaskTitle: savedValue,
                      });
                      updated = taskService.addSubtask(updated, task.id, savedValue);
                    }
                  }
                }

                setTasks(updated);
              } else if (choice === 'from-today') {
                // Add subtask to the parent task and materialized instances from today onwards
                const todayDateObj = new Date();
                todayDateObj.setHours(0, 0, 0, 0);
                const recurringParentId = parentTask.recurringParentId || savedParentId;

                // First, add to the parent recurring task
                let updated = taskService.addSubtask(tasks, recurringParentId, savedValue);

                // Then, also add to materialized instances from today onwards
                logger.log(
                  'Adding subtask to parent and future materialized instances (from-today)',
                  {
                    recurringParentId,
                    subtaskTitle: savedValue,
                  },
                );

                // Find materialized instances from today onwards
                for (const [date, taskList] of Object.entries(updated)) {
                  const dateObj = new Date(date);
                  dateObj.setHours(0, 0, 0, 0);

                  if (dateObj >= todayDateObj) {
                    for (let i = 0; i < taskList.length; i++) {
                      const task = taskList[i];
                      if (
                        task.isRecurringInstance &&
                        task.recurringParentId === recurringParentId
                      ) {
                        // This is a materialized instance from today onwards - add the subtask to it too
                        logger.log('Adding subtask to materialized instance (from-today)', {
                          instanceId: task.id,
                          instanceDate: date,
                          subtaskTitle: savedValue,
                        });
                        updated = taskService.addSubtask(updated, task.id, savedValue);
                      }
                    }
                  }
                }

                setTasks(updated);
              }

              // Clean up edit state and select the newly added subtask
              setTimeout(() => {
                const parentIndex = flatTasks.findIndex((ft) => ft.task.id === savedParentId);
                if (parentIndex !== -1) {
                  setSelectedIndex(parentIndex + 1); // Select first child (newly added)
                }
                setEditMode('none');
                setEditValue('');
                setParentTaskId(null);
                setEditingTaskId(null);
                setIsInputMode(false);
              }, 0);
            },
          });
          setShowRecurringEditDialog(true);
        } else {
          // Non-recurring parent - add subtask normally
          pushUndoableAction('TASK_ADD');
          const updated = taskService.addSubtask(tasks, parentTaskId, trimmed);
          setTasks(updated);
          // Find and select the newly added subtask
          const parentIndex = flatTasks.findIndex((ft) => ft.task.id === parentTaskId);
          if (parentIndex !== -1) {
            setSelectedIndex(parentIndex + 1); // Select first child (newly added)
          }
          // No timeline event for subtask creation
          setEditMode('none');
          setEditValue('');
          setParentTaskId(null);
          setEditingTaskId(null);
          setIsInputMode(false);
        }
      } else if (editMode === 'edit' && editingTaskId) {
        // Check if the task being edited or any of its ancestors is recurring
        const taskBeingEdited = flatTasks.find((ft) => ft.task.id === editingTaskId)?.task;

        if (taskBeingEdited && hasRecurringAncestor(taskBeingEdited)) {
          // Show dialog to ask "this or all"
          const savedValue = trimmed;
          const savedTaskId = editingTaskId;
          const savedIndex = selectedIndex;
          const rootParent = findRootParent(taskBeingEdited);

          setRecurringEditConfig({
            taskId: savedTaskId,
            taskTitle: taskBeingEdited.title,
            actionType: 'edit',
            onConfirm: (choice: 'this' | 'all' | 'from-today') => {
              logger.log('Recurring edit save confirmed', { choice, newTitle: savedValue });

              // Perform the actual edit
              pushUndoableAction('TASK_UPDATE');

              if (choice === 'this') {
                // Edit just this instance (or just this subtask in this instance)
                const updated = taskService.updateTask(tasks, savedTaskId, {
                  title: savedValue,
                });
                setTasks(updated);
              } else if (choice === 'all' && rootParent) {
                // Edit in the root parent (all future occurrences will have this change)
                let updated = { ...tasks };

                if (taskBeingEdited.parentId) {
                  // This is a subtask - update it in the root parent and all materialized instances
                  const updateSubtaskInTree = (
                    task: Task,
                    targetId: string,
                    newTitle: string,
                  ): Task => {
                    if (task.id === targetId) {
                      return { ...task, title: newTitle, updatedAt: new Date() };
                    }
                    return {
                      ...task,
                      children: task.children.map((child) =>
                        updateSubtaskInTree(child, targetId, newTitle),
                      ),
                    };
                  };

                  logger.log('Updating subtask in root parent and materialized instances', {
                    subtaskId: savedTaskId,
                    newTitle: savedValue,
                    rootParentId: rootParent.id,
                  });

                  // Find the root parent in tasks and update the subtask
                  for (const [date, taskList] of Object.entries(tasks)) {
                    const rootIndex = taskList.findIndex((t) => t.id === rootParent.id);
                    if (rootIndex !== -1) {
                      const updatedRoot = updateSubtaskInTree(
                        taskList[rootIndex],
                        savedTaskId,
                        savedValue,
                      );
                      updated[date] = [
                        ...taskList.slice(0, rootIndex),
                        updatedRoot,
                        ...taskList.slice(rootIndex + 1),
                      ];
                      break;
                    }
                  }

                  // Also update in all materialized instances
                  for (const [date, taskList] of Object.entries(updated)) {
                    let hasChanges = false;
                    const updatedTaskList = taskList.map((task) => {
                      if (task.isRecurringInstance && task.recurringParentId === rootParent.id) {
                        // This is a materialized instance - update the subtask in it too
                        logger.log('Updating subtask in materialized instance', {
                          instanceId: task.id,
                          instanceDate: date,
                          subtaskId: savedTaskId,
                          newTitle: savedValue,
                        });
                        hasChanges = true;
                        return updateSubtaskInTree(task, savedTaskId, savedValue);
                      }
                      return task;
                    });

                    if (hasChanges) {
                      updated[date] = updatedTaskList;
                    }
                  }

                  setTasks(updated);
                } else {
                  // Root task itself - update it and all materialized instances
                  const updated = taskService.updateTask(tasks, savedTaskId, {
                    title: savedValue,
                  });
                  setTasks(updated);
                }
              } else if (choice === 'from-today' && rootParent) {
                // Edit in the root parent and materialized instances from today onwards
                const todayDateObj = new Date();
                todayDateObj.setHours(0, 0, 0, 0);
                let updated = { ...tasks };

                if (taskBeingEdited.parentId) {
                  // This is a subtask - update it in the root parent and future materialized instances
                  const updateSubtaskInTree = (
                    task: Task,
                    targetId: string,
                    newTitle: string,
                  ): Task => {
                    if (task.id === targetId) {
                      return { ...task, title: newTitle, updatedAt: new Date() };
                    }
                    return {
                      ...task,
                      children: task.children.map((child) =>
                        updateSubtaskInTree(child, targetId, newTitle),
                      ),
                    };
                  };

                  logger.log(
                    'Updating subtask in root parent and future materialized instances (from-today)',
                    {
                      subtaskId: savedTaskId,
                      newTitle: savedValue,
                      rootParentId: rootParent.id,
                    },
                  );

                  // Find the root parent in tasks and update the subtask
                  for (const [date, taskList] of Object.entries(tasks)) {
                    const rootIndex = taskList.findIndex((t) => t.id === rootParent.id);
                    if (rootIndex !== -1) {
                      const updatedRoot = updateSubtaskInTree(
                        taskList[rootIndex],
                        savedTaskId,
                        savedValue,
                      );
                      updated[date] = [
                        ...taskList.slice(0, rootIndex),
                        updatedRoot,
                        ...taskList.slice(rootIndex + 1),
                      ];
                      break;
                    }
                  }

                  // Also update in materialized instances from today onwards
                  for (const [date, taskList] of Object.entries(updated)) {
                    const dateObj = new Date(date);
                    dateObj.setHours(0, 0, 0, 0);

                    if (dateObj >= todayDateObj) {
                      let hasChanges = false;
                      const updatedTaskList = taskList.map((task) => {
                        if (task.isRecurringInstance && task.recurringParentId === rootParent.id) {
                          // This is a materialized instance from today onwards - update the subtask in it too
                          logger.log('Updating subtask in materialized instance (from-today)', {
                            instanceId: task.id,
                            instanceDate: date,
                            subtaskId: savedTaskId,
                            newTitle: savedValue,
                          });
                          hasChanges = true;
                          return updateSubtaskInTree(task, savedTaskId, savedValue);
                        }
                        return task;
                      });

                      if (hasChanges) {
                        updated[date] = updatedTaskList;
                      }
                    }
                  }

                  setTasks(updated);
                } else {
                  // Root task itself - update it and materialized instances from today onwards
                  let updated = taskService.updateTask(tasks, savedTaskId, {
                    title: savedValue,
                  });

                  // Update materialized instances from today onwards
                  for (const [date, taskList] of Object.entries(updated)) {
                    const dateObj = new Date(date);
                    dateObj.setHours(0, 0, 0, 0);

                    if (dateObj >= todayDateObj) {
                      let hasChanges = false;
                      const updatedTaskList = taskList.map((task) => {
                        if (task.isRecurringInstance && task.recurringParentId === savedTaskId) {
                          logger.log('Updating materialized instance (from-today)', {
                            instanceId: task.id,
                            instanceDate: date,
                            newTitle: savedValue,
                          });
                          hasChanges = true;
                          return { ...task, title: savedValue, updatedAt: new Date() };
                        }
                        return task;
                      });

                      if (hasChanges) {
                        updated[date] = updatedTaskList;
                      }
                    }
                  }

                  setTasks(updated);
                }
              }

              // Clean up edit state
              setTimeout(() => {
                setEditMode('none');
                setEditValue('');
                setEditingTaskId(null);
                setIsInputMode(false);
                setSelectedIndex(savedIndex);
              }, 0);
            },
          });
          setShowRecurringEditDialog(true);
        } else {
          // Non-recurring task - save normally
          pushUndoableAction('TASK_UPDATE');
          const updated = taskService.updateTask(tasks, editingTaskId, {
            title: trimmed,
          });
          setTasks(updated);
          setEditMode('none');
          setEditValue('');
          setEditingTaskId(null);
          setIsInputMode(false);
        }
      }
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditMode('none');
    setEditValue('');
    setParentTaskId(null);
    setEditingTaskId(null);
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
      if ((key.meta || key.ctrl) && (input === 'a' || key.leftArrow)) {
        handleCollapseAll();
        return;
      }

      if ((key.meta || key.ctrl) && (input === 'e' || key.rightArrow)) {
        handleExpandAll();
        return;
      }

      // Navigation
      if (input === 'j' || key.downArrow) {
        setSelectedIndex((prev) => Math.min(prev + 1, flatTasks.length - 1));
        return;
      }

      if (input === 'k' || key.upArrow) {
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
      if (input === 'a' && !key.meta && !key.ctrl && !key.shift) {
        handleAddTask();
        return;
      }

      if (input === 'e' && selectedTask && !key.meta && !key.ctrl && !key.shift) {
        handleEditTask();
        return;
      }

      if (input === 'd' && selectedTask) {
        handleDeleteTask();
        return;
      }

      if (input === ' ' && selectedTask) {
        handleToggleComplete();
        return;
      }

      if (input === 'D' && selectedTask) {
        handleChangeState('delegated');
        return;
      }

      if (input === 'x' && selectedTask) {
        // Toggle delayed state
        if (selectedTask.state === 'delayed') {
          handleChangeState('todo');
        } else {
          handleChangeState('delayed');
        }
        return;
      }

      if (input === 's' && selectedTask) {
        try {
          pushUndoableAction('TASK_UPDATE');
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
              TimelineEventType.STARTED,
            );
            setTimeline(updatedTimeline);
          } else {
            // Start task
            const updated = taskService.startTask(tasks, selectedTaskId!);
            setTasks(updated);

            // Only create timeline event for today's tasks
            if (isSelectedDateToday) {
              const event = timelineService.createEvent(
                selectedTaskId!,
                selectedTask.title,
                TimelineEventType.STARTED,
                new Date(),
              );
              const updatedTimeline = timelineService.addEvent(timeline, event);
              setTimeline(updatedTimeline);
            }
          }
        } catch (err) {
          console.error('Error toggling task start:', err);
        }
        return;
      }

      if (input === 'r' && selectedTask) {
        // Only root-level tasks can be marked as recurring
        if (selectedTask.parentId) {
          // This is a nested task - cannot be marked as recurring
          logger.log('Cannot mark nested task as recurring', {
            taskId: selectedTask.id,
            parentId: selectedTask.parentId,
          });
          return;
        }
        // Open recurring task dialog for selected task
        setRecurringTaskId(selectedTaskId!);
        setShowRecurringTaskDialog(true);
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
    { isActive: isFocused && editMode === 'none' },
  );

  return (
    <Pane title="Tasks" isFocused={isFocused}>
      <Box flexDirection="column" flexGrow={1} width="100%">
        <TaskHeader
          selectedDate={new Date(selectedDate.year, selectedDate.month, selectedDate.day)}
          completionPercentage={stats.percentage}
        />

        {editMode === 'add' && (
          <Box marginY={1}>
            <Text color={theme.colors.focusIndicator}>{'>  '}</Text>
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

        {editMode === 'addSubtask' && (
          <Box marginY={1}>
            <Text color={theme.colors.focusIndicator}>{'>  '}</Text>
            <Text color={theme.colors.keyboardHint}>{'  '}</Text>
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

        {dayTasks.length === 0 && editMode !== 'add' && editMode !== 'addSubtask' ? (
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
                const isEditing = editMode === 'edit' && isSelected;

                if (isEditing) {
                  return (
                    <Box key={task.id}>
                      <Text color={theme.colors.focusIndicator}>{'>  '}</Text>
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
                      color={isSelected ? theme.colors.focusIndicator : theme.colors.foreground}
                    >
                      {isSelected ? '>' : ' '}
                    </Text>
                    <Text> </Text>
                    <Text>{'  '.repeat(depth)}</Text>
                    <Text
                      color={
                        isSelected ? theme.colors.focusIndicator : getStateColor(task.state, theme)
                      }
                    >
                      {getCheckbox(task.state)}
                    </Text>
                    <Text> </Text>
                    {task.children.length > 0 && (
                      <>
                        <Text color={theme.colors.foreground}>{isExpanded ? '▼' : '▶'}</Text>
                        <Text> </Text>
                      </>
                    )}
                    <Text
                      color={
                        isSelected ? theme.colors.focusIndicator : getStateColor(task.state, theme)
                      }
                      strikethrough={task.state === 'completed'}
                      dimColor={task.state === 'delayed' && !isSelected}
                    >
                      {task.title}
                    </Text>
                    {task.recurrence && (
                      <Text
                        color={
                          isSelected
                            ? theme.colors.focusIndicator
                            : theme.colors.timelineEventStarted
                        }
                      >
                        {' '}
                        ↺
                      </Text>
                    )}
                    {task.startTime && !task.endTime && (
                      <Text
                        color={
                          isSelected
                            ? theme.colors.focusIndicator
                            : theme.colors.timelineEventStarted
                        }
                      >
                        {' '}
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
            { key: 'j/k', description: 'navigate' },
            { key: 'a', description: 'add' },
            { key: 'Tab', description: 'add subtask' },
            { key: 'e', description: 'edit' },
            { key: 'd', description: 'delete' },
            { key: 'Space', description: 'complete' },
            { key: 'D', description: 'delegate' },
            { key: 'x', description: 'delay' },
            { key: 's', description: 'start' },
            { key: 'r', description: 'recurring' },
            { key: '←/→', description: 'collapse/expand' },
            { key: 'Cmd+←/→', description: 'all' },
          ]}
        />
      </Box>
    </Pane>
  );
};

function getCheckbox(state: string): string {
  switch (state) {
    case 'completed':
      return '[✓]';
    case 'delegated':
      return '[→]';
    case 'delayed':
      return '[‖]';
    default:
      return '[ ]';
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
