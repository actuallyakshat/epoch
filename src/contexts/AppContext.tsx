import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useStorage } from "./StorageContext";
import { useUndo } from "./UndoContext";
import type { Task, TaskTree } from "../types/task";
import type { TimelineEvent } from "../types/timeline";
import type { CalendarDate } from "../types/calendar";
import type { UndoActionType } from "../types/undo";
import { checkForUpdate, UpdateInfo } from "../utils/version";

interface AppContextType {
  selectedDate: CalendarDate;
  setSelectedDate: (date: CalendarDate) => void;
  tasks: TaskTree;
  setTasks: (tasks: TaskTree) => void;
  timeline: { [date: string]: TimelineEvent[] };
  setTimeline: (timeline: { [date: string]: TimelineEvent[] }) => void;
  activePane: "calendar" | "tasks" | "timeline";
  setActivePane: (pane: "calendar" | "tasks" | "timeline") => void;
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  isInputMode: boolean;
  setIsInputMode: (mode: boolean) => void;
  showOverview: boolean;
  setShowOverview: (show: boolean) => void;
  overviewMonth: { year: number; month: number };
  setOverviewMonth: (date: { year: number; month: number }) => void;
  exitConfirmation: boolean;
  setExitConfirmation: (show: boolean) => void;
  showThemeDialog: boolean;
  setShowThemeDialog: (show: boolean) => void;
  showClearTimelineDialog: boolean;
  setShowClearTimelineDialog: (show: boolean) => void;
  clearTimelineForDate: (dateStr: string) => void;
  isModalOpen: boolean;
  saveNow: () => Promise<void>;
  pushUndoableAction: (actionType: UndoActionType) => void;
  performUndo: () => void;
  canUndo: boolean;
  showUpdateDialog: boolean;
  setShowUpdateDialog: (show: boolean) => void;
  updateInfo: UpdateInfo | null;
  skipVersion: (version: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { data, save, saveNow } = useStorage();
  const { pushUndoAction, undo, canUndo } = useUndo();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<CalendarDate>({
    year: today.getFullYear(),
    month: today.getMonth(),
    day: today.getDate(),
  });
  const [tasks, setTasks] = useState<TaskTree>({});
  const [timeline, setTimeline] = useState<{ [date: string]: TimelineEvent[] }>(
    {}
  );
  const [activePane, setActivePane] = useState<
    "calendar" | "tasks" | "timeline"
  >("tasks");
  const [showHelp, setShowHelp] = useState(false);
  // Use ref for isInputMode to avoid React state timing issues
  const isInputModeRef = useRef(false);
  const [isInputModeState, setIsInputModeState] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  // Use ref for immediate updates to avoid React state timing issues with useInput hooks
  const setIsInputMode = useCallback((mode: boolean) => {
    isInputModeRef.current = mode;
    setIsInputModeState(mode);
  }, []);

  // Read from ref for immediate access in useInput hooks
  const isInputMode = isInputModeRef.current;
  const [overviewMonth, setOverviewMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [exitConfirmation, setExitConfirmation] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showClearTimelineDialog, setShowClearTimelineDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  // Function to clear timeline for a specific date
  const clearTimelineForDate = useCallback((dateStr: string) => {
    pushUndoAction("TIMELINE_CLEAR", tasks, timeline);
    setTimeline((prev) => {
      const newTimeline = { ...prev };
      delete newTimeline[dateStr];
      return newTimeline;
    });
  }, [pushUndoAction, tasks, timeline]);

  // Push current state to undo stack before a mutation
  const pushUndoableAction = useCallback(
    (actionType: UndoActionType) => {
      pushUndoAction(actionType, tasks, timeline);
    },
    [pushUndoAction, tasks, timeline]
  );

  // Perform undo operation
  const performUndo = useCallback(() => {
    const action = undo();
    if (action) {
      setTasks(action.previousTasks);
      setTimeline(action.previousTimeline);
    }
  }, [undo]);

  // Skip a version for update notifications
  const skipVersion = useCallback(
    (version: string) => {
      if (data) {
        save({
          ...data,
          settings: {
            ...data.settings,
            skippedVersion: version,
          },
        });
      }
      setShowUpdateDialog(false);
    },
    [data, save]
  );

  // Track if initial data has been loaded to prevent save loop
  const initialLoadDone = useRef(false);
  const dataRef = useRef(data);
  const saveRef = useRef(save);

  // Keep refs updated
  useEffect(() => {
    dataRef.current = data;
    saveRef.current = save;
  }, [data, save]);

  // Load data from storage (only once)
  useEffect(() => {
    if (data && !initialLoadDone.current) {
      setTasks(data.tasks);
      setTimeline(data.timeline);
      initialLoadDone.current = true;

      // Check for updates after initial load
      checkForUpdate().then((info) => {
        if (info.hasUpdate) {
          // Only show dialog if this version hasn't been skipped
          const skippedVersion = data.settings?.skippedVersion;
          if (skippedVersion !== info.latestVersion) {
            setUpdateInfo(info);
            setShowUpdateDialog(true);
          }
        }
      });
    }
  }, [data]);

  // Save when tasks or timeline change (only after initial load)
  useEffect(() => {
    if (initialLoadDone.current && dataRef.current) {
      saveRef.current({
        ...dataRef.current,
        tasks,
        timeline,
      });
    }
  }, [tasks, timeline]);

  return (
    <AppContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        tasks,
        setTasks,
        timeline,
        setTimeline,
        activePane,
        setActivePane,
        showHelp,
        setShowHelp,
        isInputMode,
        setIsInputMode,
        showOverview,
        setShowOverview,
        overviewMonth,
        setOverviewMonth,
        exitConfirmation,
        setExitConfirmation,
        showThemeDialog,
        setShowThemeDialog,
        showClearTimelineDialog,
        setShowClearTimelineDialog,
        clearTimelineForDate,
        isModalOpen: showHelp || showThemeDialog || showOverview || showClearTimelineDialog || showUpdateDialog,
        saveNow,
        pushUndoableAction,
        performUndo,
        canUndo,
        showUpdateDialog,
        setShowUpdateDialog,
        updateInfo,
        skipVersion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
