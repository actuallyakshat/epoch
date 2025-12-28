import React, { createContext, useContext, useState, useCallback } from "react";
import type { UndoAction, UndoActionType } from "../types/undo";
import type { TaskTree } from "../types/task";
import type { TimelineEvent } from "../types/timeline";

interface UndoContextType {
  pushUndoAction: (
    type: UndoActionType,
    tasks: TaskTree,
    timeline: { [date: string]: TimelineEvent[] }
  ) => void;
  undo: () => UndoAction | null;
  canUndo: boolean;
  clearUndoStack: () => void;
}

const UndoContext = createContext<UndoContextType | undefined>(undefined);

interface UndoProviderProps {
  children: React.ReactNode;
}

const MAX_UNDO_STACK_SIZE = 50;

// Deep clone with Date object preservation
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as T;
  }

  const cloned: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

export const UndoProvider: React.FC<UndoProviderProps> = ({ children }) => {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);

  const pushUndoAction = useCallback(
    (
      type: UndoActionType,
      tasks: TaskTree,
      timeline: { [date: string]: TimelineEvent[] }
    ) => {
      const action: UndoAction = {
        type,
        timestamp: new Date(),
        previousTasks: deepClone(tasks),
        previousTimeline: deepClone(timeline),
      };

      setUndoStack((prev) => {
        const newStack = [...prev, action];
        if (newStack.length > MAX_UNDO_STACK_SIZE) {
          newStack.shift();
        }
        return newStack;
      });
    },
    []
  );

  const undo = useCallback((): UndoAction | null => {
    if (undoStack.length === 0) {
      return null;
    }

    const action = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    return action;
  }, [undoStack]);

  const clearUndoStack = useCallback(() => {
    setUndoStack([]);
  }, []);

  return (
    <UndoContext.Provider
      value={{
        pushUndoAction,
        undo,
        canUndo: undoStack.length > 0,
        clearUndoStack,
      }}
    >
      {children}
    </UndoContext.Provider>
  );
};

export const useUndo = (): UndoContextType => {
  const context = useContext(UndoContext);
  if (!context) {
    throw new Error("useUndo must be used within UndoProvider");
  }
  return context;
};
