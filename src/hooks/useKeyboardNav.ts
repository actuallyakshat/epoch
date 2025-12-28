import { useInput } from 'ink';
import { useApp } from '../contexts/AppContext';
import { useEffect } from 'react';

interface KeyCode {
  ctrl?: boolean;
  tab?: boolean;
  shift?: boolean;
  escape?: boolean;
  meta?: boolean;
}

export const useKeyboardNav = () => {
  const { showHelp, setShowHelp, activePane, setActivePane, isInputMode, showOverview, setShowOverview, overviewMonth, setOverviewMonth, exitConfirmation, setExitConfirmation, showThemeDialog, setShowThemeDialog, showClearTimelineDialog, setShowClearTimelineDialog, saveNow } = useApp();

  // Auto-reset exit confirmation after 3 seconds
  useEffect(() => {
    if (exitConfirmation) {
      const timer = setTimeout(() => {
        setExitConfirmation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [exitConfirmation, setExitConfirmation]);

  useInput((input: string, key: KeyCode) => {

    // Handle Ctrl+C with confirmation
    if (key.ctrl && input === 'c') {
      if (exitConfirmation) {
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
        setExitConfirmation(true);
        return;
      }
    }

    // Skip all shortcuts when in input mode or modal dialogs
    if (isInputMode || showThemeDialog || showClearTimelineDialog) {
      return;
    }

    // Shift+; (colon) to toggle overview
    if (input === ':') {
      setShowOverview(!showOverview);
      return;
    }

    if (input === '?') {
      setShowHelp(!showHelp);
      return;
    }

    if (key.ctrl && input === 't') {
      setShowThemeDialog(true);
      return;
    }

    // 'C' (shift+c) to clear timeline (when timeline pane is focused)
    if (input === 'C' && activePane === 'timeline') {
      setShowClearTimelineDialog(true);
      return;
    }

    // Pane switching
    if (input === '1') {
      setActivePane('calendar');
      return;
    }

    if (input === '2' || (key.tab && !key.shift)) {
      setActivePane('tasks');
      return;
    }

    if (input === '3' || (key.tab && key.shift)) {
      setActivePane('timeline');
      return;
    }
  });
};
