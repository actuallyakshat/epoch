import { useInput } from 'ink';
import { useApp } from '../contexts/AppContext';
import { useEffect } from 'react';
import { logger } from '../utils/logger';

interface KeyCode {
  ctrl?: boolean;
  tab?: boolean;
  shift?: boolean;
  escape?: boolean;
  meta?: boolean;
}

export const useKeyboardNav = () => {
  const { showHelp, setShowHelp, activePane, setActivePane, isInputMode, showOverview, setShowOverview, overviewMonth, setOverviewMonth, exitConfirmation, setExitConfirmation, showThemeDialog, setShowThemeDialog, showClearTimelineDialog, setShowClearTimelineDialog, showSettingsDialog, setShowSettingsDialog, showRecurringTaskDialog, showRecurringEditDialog, showUpdateDialog, saveNow, performUndo, canUndo } = useApp();

  // Auto-reset exit confirmation after 3 seconds
  useEffect(() => {
    if (exitConfirmation) {
      const timer = setTimeout(() => {
        setExitConfirmation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [exitConfirmation, setExitConfirmation]);

  // Global input handler - inactive when in input mode or dialogs open
  const isActive = !isInputMode && !showThemeDialog && !showClearTimelineDialog && !showSettingsDialog && !showRecurringTaskDialog && !showRecurringEditDialog && !showUpdateDialog;

  // Ctrl+C handler - ALWAYS active for emergency exit
  useInput((input: string, key: KeyCode) => {
    if (key.ctrl && input === 'c') {
      if (exitConfirmation) {
        logger.log("Exiting application");
        // Save data before exiting
        saveNow().then(() => {
          // Unmount the Ink app first
          const inkApp = (global as any).__inkApp;
          if (inkApp) {
            inkApp.unmount();
          }

          // Clear the terminal completely
          setTimeout(() => {
            console.clear();
            process.stdout.write('\x1Bc'); // Reset terminal
            process.exit(0);
          }, 100); // Give Ink time to unmount
        }).catch(() => {
          // Unmount the Ink app first even on error
          const inkApp = (global as any).__inkApp;
          if (inkApp) {
            inkApp.unmount();
          }

          // Clear the terminal completely
          setTimeout(() => {
            console.clear();
            process.stdout.write('\x1Bc'); // Reset terminal
            process.exit(0);
          }, 100); // Give Ink time to unmount
        });
        return;
      } else {
        logger.log("Exit confirmation requested");
        setExitConfirmation(true);
        return;
      }
    }
  }); // Always active

  // Other keyboard shortcuts - only active when no dialogs/input mode
  useInput((input: string, key: KeyCode) => {

    // Ctrl+U to undo
    if (key.ctrl && input === 'u' && canUndo) {
      logger.log("Performing undo");
      performUndo();
      return;
    }

    // Shift+; (colon) to toggle overview
    if (input === ':') {
      logger.log("Toggling overview", { show: !showOverview });
      setShowOverview(!showOverview);
      return;
    }

    if (input === '?') {
      logger.log("Toggling help dialog", { show: !showHelp });
      setShowHelp(!showHelp);
      return;
    }

    if (key.ctrl && input === 't') {
      logger.log("Opening theme dialog");
      setShowThemeDialog(true);
      return;
    }

    if (key.ctrl && input === 's') {
      logger.log("Opening settings dialog");
      setShowSettingsDialog(true);
      return;
    }

    // 'C' (shift+c) to clear timeline (when timeline pane is focused)
    if (input === 'C' && activePane === 'timeline') {
      logger.log("Opening clear timeline dialog");
      setShowClearTimelineDialog(true);
      return;
    }

    // Pane switching
    if (input === '1') {
      logger.log("Switching to calendar pane");
      setActivePane('calendar');
      return;
    }

    if (input === '2' || (key.tab && !key.shift)) {
      logger.log("Switching to tasks pane");
      setActivePane('tasks');
      return;
    }

    if (input === '3' || (key.tab && key.shift)) {
      logger.log("Switching to timeline pane");
      setActivePane('timeline');
      return;
    }
  }, {
    // Disable this hook when in input mode or dialogs are open to prevent interference with TextInput
    isActive: isActive
  });
};
