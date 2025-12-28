import React from "react";
import { Box, Text } from "ink";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { StorageProvider } from "./contexts/StorageContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import { useKeyboardNav } from "./hooks/useKeyboardNav";
import { useTerminalSize } from "./hooks/useTerminalSize";
import { ThreeColumnLayout } from "./components/layout/ThreeColumnLayout";
import { CalendarPane } from "./components/calendar/CalendarPane";
import { TasksPane } from "./components/tasks/TasksPane";
import { TimelinePane } from "./components/timeline/TimelinePane";
import { HelpDialog } from "./components/common/HelpDialog";
import { ThemeDialog } from "./components/common/ThemeDialog";
import { ClearTimelineDialog } from "./components/common/ClearTimelineDialog";
import { OverviewScreen } from "./components/overview/OverviewScreen";
import { FullscreenBackground } from "./components/common/FullscreenBackground";

const AppContent: React.FC = () => {
  const {
    showHelp,
    showOverview,
    exitConfirmation,
    activePane,
    showThemeDialog,
    showClearTimelineDialog,
  } = useApp();
  const { theme } = useTheme();

  useKeyboardNav();

  /* Use available width and height - automatically updates on resize */
  const { width, height } = useTerminalSize();

  // When a modal dialog is open, render only the modal
  if (showThemeDialog) {
    return <ThemeDialog />;
  }

  if (showHelp) {
    return <HelpDialog />;
  }

  if (showClearTimelineDialog) {
    return <ClearTimelineDialog />;
  }

  return (
    <FullscreenBackground backgroundColor={theme.colors.background || "black"}>
      <Box flexDirection="column" width={width} height={height} padding={1} backgroundColor={theme.colors.background}>
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
              {" "}
              Press Ctrl+C again to exit Epoch{" "}
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
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </StorageProvider>
  );
};

export default App;
