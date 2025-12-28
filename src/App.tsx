import React from "react";
import { Box, Text, useStdout } from "ink";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { StorageProvider } from "./contexts/StorageContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import { useKeyboardNav } from "./hooks/useKeyboardNav";
import { ThreeColumnLayout } from "./components/layout/ThreeColumnLayout";
import { CalendarPane } from "./components/calendar/CalendarPane";
import { TasksPane } from "./components/tasks/TasksPane";
import { TimelinePane } from "./components/timeline/TimelinePane";
import { HelpDialog } from "./components/common/HelpDialog";
import { ThemeDialog } from "./components/common/ThemeDialog";
import { OverviewScreen } from "./components/overview/OverviewScreen";
import { FullscreenBackground } from "./components/common/FullscreenBackground";

const AppContent: React.FC = () => {
  const {
    showHelp,
    showOverview,
    exitConfirmation,
    activePane,
    showThemeDialog,
  } = useApp();
  const { theme } = useTheme();
  const { stdout } = useStdout();

  useKeyboardNav();

  /* Use available width and height */
  const width = stdout?.columns || 100;
  const height = stdout?.rows || 30;

  // When a modal dialog is open, render only the modal
  if (showThemeDialog) {
    return <ThemeDialog />;
  }

  if (showHelp) {
    return <HelpDialog />;
  }

  return (
    <FullscreenBackground backgroundColor={theme.colors.background || "black"}>
      <Box flexDirection="column" width={width} height={height} padding={1}>
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
    <ThemeProvider initialTheme="terminal">
      <StorageProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </StorageProvider>
    </ThemeProvider>
  );
};

export default App;
