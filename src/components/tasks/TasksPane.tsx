import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { ControlledTextInput } from '../common/ControlledTextInput';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';
import { Pane } from '../layout/Pane';
import { TaskHeader } from './TaskHeader';
import { KeyboardHints } from '../common/KeyboardHints';
import { getDateString, isToday } from '../../utils/date';
import { taskService } from '../../services/taskService';
import { timelineService } from '../../services/timelineService';
import { recurringTaskService } from '../../services/recurringTaskService';
import { findTaskById } from '../../utils/tree';
import { getCheckbox, getStateColor } from '../../utils/task';
import { logger } from '../../utils/logger';
import { RecurringChoice } from '../../types/recurring';
import type { Task, TaskState } from '../../types/task';
import { TimelineEventType } from '../../types/timeline';
import { useTerminalSize } from '../../hooks/useTerminalSize';
import * as helpers from './TasksPaneHelpers';

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
  } = useApp();
  const { theme } = useTheme();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editMode, setEditMode] = useState<EditMode>('none');
  const [editValue, setEditValue] = useState('');
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null); // Track which task is being edited
  const [inputFocusReady, setInputFocusReady] = useState(false); // Delay input focus to prevent key capture
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
    return taskService.getDayTasks(tasks, dateStr, recurringTaskService);
  }, [tasks, dateStr]);
  const stats = taskService.getTaskStats(tasks, dateStr);
  const isFocused = activePane === 'tasks' && !isModalOpen;

  // Flatten tasks for navigation (only visible ones based on expanded state)
  const flatTasks = useMemo(() => {
    try {
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
      logger.log('[flatTasks] Computed', {
        dayTasksLength: dayTasks.length,
        flatTasksLength: result.length,
        expandedIdsCount: expandedIds.size,
        taskTitles: result.map((item, idx) => `[${idx}] ${item.task.title}`),
      });
      return result;
    } catch (err) {
      logger.log('[flatTasks] Error computing flatTasks', { error: err });
      return [];
    }
  }, [dayTasks, expandedIds]);

  const selectedTask = flatTasks[selectedIndex]?.task;
  const selectedTaskId = selectedTask?.id;

  // Log when selectedIndex or selectedTask changes
  useEffect(() => {
    logger.log('[selectedIndex] Changed', {
      selectedIndex,
      flatTasksLength: flatTasks.length,
      selectedTaskId,
      selectedTaskTitle: selectedTask?.title,
      selectedTaskValid: selectedTask !== undefined,
    });
  }, [selectedIndex, selectedTaskId, selectedTask?.title, flatTasks.length]);

  // Expand all nested tasks by default when tasks change
  useEffect(() => {
    const allParentIds = new Set<string>();
    helpers.collectParentIds(dayTasks, allParentIds);

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

  // Enable input focus on the next frame when entering input mode
  useEffect(() => {
    if (isInputMode && !inputFocusReady) {
      // Use setTimeout to delay focus until after the current event is processed
      const timer = setTimeout(() => setInputFocusReady(true), 0);
      return () => clearTimeout(timer);
    } else if (!isInputMode && inputFocusReady) {
      setInputFocusReady(false);
    }
  }, [isInputMode, inputFocusReady]);

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

  const onConfirmDelete = (
    choice: RecurringChoice,
    taskId: string,
    task: Task,
    rootParent: Task | null,
  ) => {
    logger.log('Recurring delete confirmed', { choice });
    pushUndoableAction('TASK_DELETE');

    if (choice === 'this') {
      handleDeleteThis(taskId, task);
    } else if (choice === 'all' && rootParent) {
      handleDeleteAll(taskId, task, rootParent);
    } else if (choice === 'from-today' && rootParent) {
      handleDeleteFromToday(taskId, task, rootParent);
    }
  };

  const handleDeleteThis = (taskId: string, task: Task) => {
    let updated = tasks;
    const isMaterialized = Object.values(tasks).some((taskList) => findTaskById(taskList, taskId));

    if (isMaterialized) {
      updated = taskService.deleteTask(tasks, taskId);
    }

    if (task.isRecurringInstance && task.recurringParentId) {
      updated = taskService.excludeRecurringInstance(updated, task.recurringParentId, dateStr);
    } else if (task.recurrence) {
      updated = taskService.excludeRecurringInstance(updated, taskId, dateStr);
    }

    setTasks(updated);
    setTimeline(timelineService.removeEventsByTaskId(timeline, taskId));
  };

  const handleDeleteAll = (taskId: string, task: Task, rootParent: Task) => {
    if (task.parentId) {
      setTasks(helpers.deleteSubtaskFromRootParent(tasks, rootParent.id, taskId));
    } else {
      const parentIdToDelete = task.recurringParentId || taskId;
      setTasks(taskService.deleteTask(tasks, parentIdToDelete));
    }

    let updatedTimeline = timelineService.removeEventsByTaskId(timeline, taskId);
    if (task.recurringParentId) {
      updatedTimeline = timelineService.removeEventsByTaskId(
        updatedTimeline,
        task.recurringParentId,
      );
    }
    setTimeline(updatedTimeline);
  };

  const handleDeleteFromToday = (taskId: string, task: Task, rootParent: Task) => {
    const todayDateObj = new Date();
    todayDateObj.setHours(0, 0, 0, 0);

    if (task.parentId) {
      handleDeleteSubtaskFromToday(taskId, task, rootParent, todayDateObj);
    } else {
      handleDeleteTaskFromToday(taskId, task, todayDateObj);
    }

    setTimeline(timelineService.removeEventsByTaskId(timeline, taskId));
  };

  const handleDeleteSubtaskFromToday = (
    taskId: string,
    task: Task,
    rootParent: Task,
    today: Date,
  ) => {
    let updated = { ...tasks };
    const todayObj = new Date(today);
    todayObj.setHours(0, 0, 0, 0);

    // Only delete the subtask from root parents on or after today
    for (const [date, taskList] of Object.entries(tasks)) {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);

      if (dateObj >= todayObj) {
        const rootIndex = taskList.findIndex((t) => t.id === rootParent.id);
        if (rootIndex !== -1) {
          const titlePath = helpers.findSubtaskByTitlePath(taskList[rootIndex], task);
          const updatedRoot = titlePath
            ? helpers.deleteByTitlePath(taskList[rootIndex], titlePath)
            : helpers.deleteSubtaskFromTree(taskList[rootIndex], taskId);

          updated[date] = [
            ...taskList.slice(0, rootIndex),
            updatedRoot,
            ...taskList.slice(rootIndex + 1),
          ];
        }
      }
    }

    // Also delete from materialized instances from today onwards
    updated = helpers.deleteSubtaskFromMaterializedInstances(
      updated,
      rootParent.id,
      task.title,
      today,
    );
    setTasks(updated);
  };

  const handleDeleteTaskFromToday = (taskId: string, task: Task, today: Date) => {
    // For "from-today", we should NOT delete the original recurring task definition
    // We only delete materialized instances from today onwards
    const recurringParentToDelete = task.recurringParentId || taskId;
    const updated = helpers.deleteMaterializedInstances(tasks, recurringParentToDelete, today);
    setTasks(updated);
  };

  const performStateChange = (taskId: string, task: Task, newState: TaskState) => {
    logger.log('[performStateChange] Called', {
      taskId,
      taskTitle: task.title,
      taskDate: task.date,
      previousState: task.state,
      newState,
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

        if (taskExists) {
          // Task already materialized - update it normally
          const updated = taskService.changeTaskState(tasks, taskId, newState);
          setTasks(updated);
        } else {
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
        }
      } else {
        // Normal task or already materialized - update normally
        const updated = taskService.changeTaskState(tasks, taskId, newState);
        setTasks(updated);
      }

      // Handle timeline based on state change
      if (newState === 'todo') {
        // If toggling back to incomplete state, remove the previous state event
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
      if (hasRecurringAncestor(selectedTask)) {
        const rootParent = findRootParent(selectedTask);
        setRecurringEditConfig({
          taskId: selectedTaskId,
          taskTitle: selectedTask.title,
          actionType: 'delete',
          onConfirm: (choice: 'this' | 'all' | 'from-today') =>
            onConfirmDelete(choice, selectedTaskId, selectedTask, rootParent),
        });
        setShowRecurringEditDialog(true);
      } else {
        pushUndoableAction('TASK_DELETE');
        setTasks(taskService.deleteTask(tasks, selectedTaskId));
        setTimeline(timelineService.removeEventsByTaskId(timeline, selectedTaskId));
      }
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
      performStateChange(selectedTaskId, selectedTask, newState);
    }
  };

  const handleAddSubmit = (trimmed: string) => {
    pushUndoableAction('TASK_ADD');
    const newTask = taskService.createTask(trimmed, dateStr);
    const newTasks = {
      ...tasks,
      [dateStr]: [...dayTasks, newTask],
    };
    setTasks(newTasks);
    setSelectedIndex(flatTasks.length); // Select newly added task
    finishEdit();
  };

  const handleAddSubtaskSubmit = (trimmed: string) => {
    if (!parentTaskId) return;
    const parentTask = flatTasks.find((ft) => ft.task.id === parentTaskId)?.task;

    if (parentTask && isRecurringTask(parentTask)) {
      setRecurringEditConfig({
        taskId: parentTaskId,
        taskTitle: parentTask.title,
        actionType: 'add-subtask',
        onConfirm: (choice) => onConfirmAddSubtask(choice, parentTaskId, trimmed, parentTask),
      });
      setShowRecurringEditDialog(true);
    } else {
      pushUndoableAction('TASK_ADD');
      const updated = taskService.addSubtask(tasks, parentTaskId, trimmed);
      setTasks(updated);
      const parentIndex = flatTasks.findIndex((ft) => ft.task.id === parentTaskId);
      if (parentIndex !== -1) {
        setSelectedIndex(parentIndex + 1);
      }
      finishEdit();
    }
  };

  const onConfirmAddSubtask = (
    choice: RecurringChoice,
    parentId: string,
    title: string,
    parentTask: Task,
  ) => {
    pushUndoableAction('TASK_ADD');
    if (choice === 'this') {
      handleAddSubtaskThis(parentId, title);
    } else if (choice === 'all') {
      handleAddSubtaskAll(parentId, title, parentTask);
    } else if (choice === 'from-today') {
      handleAddSubtaskFromToday(parentId, title, parentTask);
    }

    setTimeout(() => {
      const parentIndex = flatTasks.findIndex((ft) => ft.task.id === parentId);
      if (parentIndex !== -1) {
        setSelectedIndex(parentIndex + 1);
      }
      finishEdit();
    }, 0);
  };

  const handleAddSubtaskThis = (parentId: string, title: string) => {
    const existingTasks = tasks[dateStr] || [];
    const taskExists = existingTasks.some((t) => t.id === parentId);

    if (taskExists) {
      setTasks(taskService.addSubtask(tasks, parentId, title));
    } else {
      const ephemeralParent = dayTasks.find((t) => t.id === parentId);
      if (ephemeralParent?.isRecurringInstance) {
        const newSubtask = taskService.createTask(title, dateStr);
        const materializedTask: Task = {
          ...ephemeralParent,
          children: [...ephemeralParent.children, { ...newSubtask, parentId }],
        };
        setTasks({ ...tasks, [dateStr]: [...existingTasks, materializedTask] });
      } else if (ephemeralParent) {
        setTasks(taskService.addSubtask(tasks, parentId, title));
      }
    }
  };

  const handleAddSubtaskAll = (parentId: string, title: string, parentTask: Task) => {
    const recurringParentId = parentTask.recurringParentId || parentId;
    let updated = taskService.addSubtask(tasks, recurringParentId, title);

    for (const taskList of Object.values(updated)) {
      for (const task of taskList) {
        if (task.isRecurringInstance && task.recurringParentId === recurringParentId) {
          updated = taskService.addSubtask(updated, task.id, title);
        }
      }
    }
    setTasks(updated);
  };

  const handleAddSubtaskFromToday = (parentId: string, title: string, parentTask: Task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recurringParentId = parentTask.recurringParentId || parentId;
    let updated = taskService.addSubtask(tasks, recurringParentId, title);

    for (const [date, taskList] of Object.entries(updated)) {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      if (dateObj >= today) {
        for (const task of taskList) {
          if (task.isRecurringInstance && task.recurringParentId === recurringParentId) {
            updated = taskService.addSubtask(updated, task.id, title);
          }
        }
      }
    }
    setTasks(updated);
  };

  const handleEditSubmit = (trimmed: string) => {
    if (!editingTaskId) return;
    const taskBeingEdited = flatTasks.find((ft) => ft.task.id === editingTaskId)?.task;

    if (taskBeingEdited && hasRecurringAncestor(taskBeingEdited)) {
      setRecurringEditConfig({
        taskId: editingTaskId,
        taskTitle: taskBeingEdited.title,
        actionType: 'edit',
        onConfirm: (choice) => onConfirmEditTask(choice, editingTaskId, trimmed, taskBeingEdited),
      });
      setShowRecurringEditDialog(true);
    } else {
      pushUndoableAction('TASK_UPDATE');
      setTasks(taskService.updateTask(tasks, editingTaskId, { title: trimmed }));
      finishEdit();
    }
  };

  const onConfirmEditTask = (
    choice: RecurringChoice,
    taskId: string,
    newTitle: string,
    task: Task,
  ) => {
    pushUndoableAction('TASK_UPDATE');
    const rootParent = findRootParent(task);

    if (choice === 'this') {
      setTasks(taskService.updateTask(tasks, taskId, { title: newTitle }));
    } else if (choice === 'all' && rootParent) {
      handleEditAll(taskId, newTitle, task, rootParent);
    } else if (choice === 'from-today' && rootParent) {
      handleEditFromToday(taskId, newTitle, task, rootParent);
    }

    setTimeout(() => finishEdit(), 0);
  };

  const handleEditAll = (taskId: string, newTitle: string, task: Task, rootParent: Task) => {
    let updated = tasks;
    if (task.parentId) {
      updated = helpers.updateSubtaskInRootParent(updated, rootParent.id, taskId, newTitle);
      updated = helpers.updateSubtaskInMaterializedInstances(
        updated,
        rootParent.id,
        taskId,
        newTitle,
      );
    } else {
      updated = taskService.updateTask(tasks, taskId, { title: newTitle });
    }
    setTasks(updated);
  };

  const handleEditFromToday = (taskId: string, newTitle: string, task: Task, rootParent: Task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let updated = tasks;

    if (task.parentId) {
      updated = helpers.updateSubtaskInRootParent(updated, rootParent.id, taskId, newTitle);
      updated = helpers.updateSubtaskInMaterializedInstances(
        updated,
        rootParent.id,
        taskId,
        newTitle,
        today,
      );
    } else {
      updated = taskService.updateTask(tasks, taskId, { title: newTitle });
      updated = helpers.updateMaterializedInstancesTitle(updated, taskId, newTitle, today);
    }
    setTasks(updated);
  };

  const finishEdit = () => {
    setEditMode('none');
    setEditValue('');
    setParentTaskId(null);
    setEditingTaskId(null);
    setIsInputMode(false);
  };

  const handleSubmitEdit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      finishEdit();
      return;
    }

    try {
      if (editMode === 'add') {
        handleAddSubmit(trimmed);
      } else if (editMode === 'addSubtask') {
        handleAddSubtaskSubmit(trimmed);
      } else if (editMode === 'edit') {
        handleEditSubmit(trimmed);
      }
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const handleCancelEdit = () => {
    finishEdit();
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
    const allParentIds = new Set<string>();
    helpers.collectParentIds(dayTasks, allParentIds);
    setExpandedIds(allParentIds);
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleGlobalKeys = (input: string, key: any) => {
    // Expand/Collapse ALL with Cmd/Ctrl + arrow keys
    if ((key.meta || key.ctrl) && (input === 'a' || key.leftArrow)) {
      handleCollapseAll();
      return true;
    }
    if ((key.meta || key.ctrl) && (input === 'e' || key.rightArrow)) {
      handleExpandAll();
      return true;
    }
    return false;
  };

  const handleNavigationKeys = (input: string, key: any) => {
    if (input === 'j' || key.downArrow) {
      logger.log('[handleNavigationKeys] Down key pressed', {
        currentIndex: selectedIndex,
        flatTasksLength: flatTasks.length,
        newIndex: Math.min(selectedIndex + 1, flatTasks.length - 1),
        selectedTaskId,
        selectedTaskTitle: selectedTask?.title,
      });
      setSelectedIndex((prev) => Math.min(prev + 1, flatTasks.length - 1));
      return true;
    }
    if (input === 'k' || key.upArrow) {
      logger.log('[handleNavigationKeys] Up key pressed', {
        currentIndex: selectedIndex,
        flatTasksLength: flatTasks.length,
        newIndex: Math.max(selectedIndex - 1, 0),
        selectedTaskId,
        selectedTaskTitle: selectedTask?.title,
      });
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
      return true;
    }
    if (key.leftArrow && !key.meta && !key.ctrl) {
      handleCollapse();
      return true;
    }
    if (key.rightArrow && !key.meta && !key.ctrl) {
      handleExpand();
      return true;
    }
    return false;
  };

  const handleTaskActionKeys = (input: string, key: any) => {
    // Handle 'a' key for adding tasks - works even when no task is selected
    if (input === 'a' && !key.meta && !key.ctrl && !key.shift) {
      handleAddTask();
      return true;
    }

    // All other task actions require a selected task
    if (!selectedTask) return false;

    if (input === 'e' && !key.meta && !key.ctrl && !key.shift) {
      handleEditTask();
      return true;
    }
    if (input === 'd') {
      handleDeleteTask();
      return true;
    }
    if (input === ' ') {
      handleToggleComplete();
      return true;
    }
    if (input === 'D') {
      handleChangeState('delegated');
      return true;
    }
    if (input === 'x') {
      toggleDelayedState();
      return true;
    }
    return false;
  };

  const toggleDelayedState = () => {
    if (!selectedTask) return;
    if (selectedTask.state === 'delayed') {
      handleChangeState('todo');
    } else {
      handleChangeState('delayed');
    }
  };

  const handleAdditionalTaskKeys = (input: string, key: any) => {
    if (!selectedTask) return false;

    if (input === 's') {
      handleStartTask();
      return true;
    }
    if (input === 'r') {
      handleRecurringTask();
      return true;
    }
    if (key.return) {
      handleToggleExpand();
      return true;
    }
    if (key.tab) {
      handleAddSubtask();
      return true;
    }
    return false;
  };

  const handleStartTask = () => {
    if (!selectedTask || !selectedTaskId) return;
    try {
      pushUndoableAction('TASK_UPDATE');
      if (selectedTask.startTime && !selectedTask.endTime) {
        setTasks(taskService.updateTask(tasks, selectedTaskId, { startTime: undefined }));
        setTimeline(
          timelineService.removeLastEventByType(
            timeline,
            selectedTaskId,
            TimelineEventType.STARTED,
          ),
        );
      } else {
        setTasks(taskService.startTask(tasks, selectedTaskId));
        if (isSelectedDateToday) {
          const event = timelineService.createEvent(
            selectedTaskId,
            selectedTask.title,
            TimelineEventType.STARTED,
            new Date(),
          );
          setTimeline(timelineService.addEvent(timeline, event));
        }
      }
    } catch (err) {
      console.error('Error toggling task start:', err);
    }
  };

  const handleRecurringTask = () => {
    if (!selectedTask || !selectedTaskId) return;
    if (selectedTask.parentId) {
      logger.log('Cannot mark nested task as recurring', {
        taskId: selectedTaskId,
        parentId: selectedTask.parentId,
      });
      return;
    }
    setRecurringTaskId(selectedTaskId);
    setShowRecurringTaskDialog(true);
  };

  // Input handler for navigation/command mode
  useInput(
    (input, key) => {
      if (handleGlobalKeys(input, key)) return;
      if (handleNavigationKeys(input, key)) return;
      if (handleTaskActionKeys(input, key)) return;
      if (handleAdditionalTaskKeys(input, key)) return;
    },
    { isActive: isFocused && !isInputMode },
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
              focus={inputFocusReady}
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
              focus={inputFocusReady}
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
                        focus={inputFocusReady}
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
