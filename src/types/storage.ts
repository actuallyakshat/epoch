import { Task, TaskTree } from './task';
import { TimelineEvent } from './timeline';

export interface UserSettings {
  theme: string;
  defaultStartTime: 'now' | 'custom';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  skippedVersion?: string;
}

export interface StorageSchema {
  version: string;
  tasks: TaskTree;
  timeline: {
    [date: string]: TimelineEvent[];
  };
  settings: UserSettings;
}

export interface StorageConfig {
  filePath: string;
  autoSave: boolean;
  saveDebounceMs: number;
}
