import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useStorage } from "./StorageContext";
import type { Task, TaskTree } from "../types/task";
import type { TimelineEvent } from "../types/timeline";
import type { CalendarDate } from "../types/calendar";

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
  isModalOpen: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { data, save } = useStorage();
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
  const [isInputMode, setIsInputMode] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [overviewMonth, setOverviewMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [exitConfirmation, setExitConfirmation] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);

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
        isModalOpen: showHelp || showThemeDialog || showOverview,
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
