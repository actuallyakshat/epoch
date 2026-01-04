import React from 'react';
import { Box, Text } from 'ink';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { StorageProvider } from './contexts/StorageContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { UndoProvider } from './contexts/UndoContext';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { useTerminalSize } from './hooks/useTerminalSize';
import { ThreeColumnLayout } from './components/layout/ThreeColumnLayout';
import { CalendarPane } from './components/calendar/CalendarPane';
import { TasksPane } from './components/tasks/TasksPane';
import { TimelinePane } from './components/timeline/TimelinePane';
import { HelpDialog } from './components/common/HelpDialog';
import { ThemeDialog } from './components/common/ThemeDialog';
import { SettingsDialog } from './components/common/SettingsDialog';
import { RecurringTaskDialog } from './components/common/RecurringTaskDialog';
import { RecurringEditDialog } from './components/common/RecurringEditDialog';
import type { RecurringEditAction } from './components/common/RecurringEditDialog';
import { ClearTimelineDialog } from './components/common/ClearTimelineDialog';
import { UpdateDialog } from './components/common/UpdateDialog';
import { OverviewScreen } from './components/overview/OverviewScreen';
import { FullscreenBackground } from './components/common/FullscreenBackground';
import { taskService } from './services/taskService';
import type { RecurrencePattern } from './types/task';
import { logger } from './utils/logger';

const AppContent: React.FC = () => {
  const {
    showHelp,
    showOverview,
    exitConfirmation,
    activePane,
    showThemeDialog,
    showClearTimelineDialog,
    showSettingsDialog,
    showRecurringTaskDialog,
    showRecurringEditDialog,
    showUpdateDialog,
    setShowUpdateDialog,
    updateInfo,
    skipVersion,
    recurringTaskId,
    setRecurringTaskId,
    setShowRecurringTaskDialog,
    recurringEditConfig,
    setRecurringEditConfig,
    setShowRecurringEditDialog,
    tasks,
    setTasks,
    pushUndoableAction,
  } = useApp();
  const { theme } = useTheme();

  useKeyboardNav();

  /* Use available width and height - automatically updates on resize */
  const { width, height } = useTerminalSize();

  // When a modal dialog is open, render only the modal
  if (showUpdateDialog && updateInfo) {
    return (
      <UpdateDialog
        currentVersion={updateInfo.currentVersion}
        latestVersion={updateInfo.latestVersion}
        onDismiss={() => setShowUpdateDialog(false)}
        onSkipVersion={skipVersion}
      />
    );
  }

  if (showThemeDialog) {
    return <ThemeDialog />;
  }

  if (showHelp) {
    return <HelpDialog />;
  }

  if (showClearTimelineDialog) {
    return <ClearTimelineDialog />;
  }

  if (showSettingsDialog) {
    return <SettingsDialog />;
  }

  if (showRecurringTaskDialog && recurringTaskId) {
    const handleConfirm = (pattern: RecurrencePattern) => {
      try {
        pushUndoableAction('TASK_UPDATE');
        const updated = taskService.updateTask(tasks, recurringTaskId, {
          recurrence: pattern,
        });
        setTasks(updated);
        setShowRecurringTaskDialog(false);
        setRecurringTaskId(null);
      } catch (err) {
        console.error('Error setting task recurrence:', err);
      }
    };

    const handleCancel = () => {
      setShowRecurringTaskDialog(false);
      setRecurringTaskId(null);
    };

    return <RecurringTaskDialog onConfirm={handleConfirm} onCancel={handleCancel} />;
  }

  if (showRecurringEditDialog && recurringEditConfig) {
    const handleConfirm = (action: RecurringEditAction) => {
      logger.log('[App] RecurringEditDialog handleConfirm called', {
        action,
        actionType: recurringEditConfig.actionType,
      });

      if (action === 'cancel') {
        logger.log('[App] User cancelled, closing dialog');
        setShowRecurringEditDialog(false);
        setRecurringEditConfig(null);
        return;
      }

      // Call the onConfirm callback passed from TasksPane FIRST
      if (action === 'this' || action === 'all' || action === 'from-today') {
        logger.log('[App] Calling onConfirm callback from TasksPane', { action });
        recurringEditConfig.onConfirm(action);
      }

      // Close dialog after a microtask to ensure TasksPane state updates are processed
      logger.log('[App] Scheduling dialog close');
      setTimeout(() => {
        logger.log('[App] Closing dialog now');
        setShowRecurringEditDialog(false);
        setRecurringEditConfig(null);
      }, 0);
    };

    return (
      <RecurringEditDialog
        taskTitle={recurringEditConfig.taskTitle}
        actionType={recurringEditConfig.actionType}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <FullscreenBackground backgroundColor={theme.colors.background || 'black'}>
      <Box
        flexDirection="column"
        width={width}
        height={height}
        padding={1}
        backgroundColor={theme.colors.background}
      >
        {showOverview ? (
          <OverviewScreen />
        ) : (
          <ThreeColumnLayout
            leftPane={<CalendarPane />}
            centerPane={<TasksPane />}
            rightPane={<TimelinePane />}
            activePane={activePane}
            height={height - 2} // Account for padding
          />
        )}
        {exitConfirmation && (
          <Box width="100%" justifyContent="center" paddingY={1}>
            <Text backgroundColor="red" color="white" bold>
              {' '}
              Press Ctrl+C again to exit Epoch{' '}
            </Text>
          </Box>
        )}
      </Box>
    </FullscreenBackground>
  );
};

const App: React.FC = () => {
  return (
    <StorageProvider>
      <ThemeProvider initialTheme="dark">
        <UndoProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </UndoProvider>
      </ThemeProvider>
    </StorageProvider>
  );
};

export default App;
