import React from "react";
import { Box, Text, useStdout } from "ink";
import { ThemeProvider } from "./contexts/ThemeContext";
import { StorageProvider } from "./contexts/StorageContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import { useKeyboardNav } from "./hooks/useKeyboardNav";
import { ThreeColumnLayout } from "./components/layout/ThreeColumnLayout";
import { CalendarPane } from "./components/calendar/CalendarPane";
import { TasksPane } from "./components/tasks/TasksPane";
import { TimelinePane } from "./components/timeline/TimelinePane";
import { HelpDialog } from "./components/common/HelpDialog";
import { OverviewScreen } from "./components/overview/OverviewScreen";

const AppContent: React.FC = () => {
  const { showHelp, showOverview, exitConfirmation } = useApp();
  const { stdout } = useStdout();

  useKeyboardNav();

  /* Use available width */
  const width = stdout?.columns || 100;

  return (
    <Box flexDirection="column" width={width}>
      {showOverview ? (
        <OverviewScreen />
      ) : (
        <ThreeColumnLayout
          leftPane={<CalendarPane />}
          centerPane={<TasksPane />}
          rightPane={<TimelinePane />}
        />
      )}
      {showHelp && <HelpDialog />}
      {exitConfirmation && (
        <Box width="100%" justifyContent="center" paddingY={1}>
          <Text backgroundColor="red" color="white" bold>
            {" "}
            Press Ctrl+C again to exit Epoch{" "}
          </Text>
        </Box>
      )}
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider initialTheme="dark">
      <StorageProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </StorageProvider>
    </ThemeProvider>
  );
};

export default App;
