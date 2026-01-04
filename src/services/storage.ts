import { promises as fs } from 'fs';
import { dirname } from 'path';
import { homedir } from 'os';
import type { StorageSchema } from '../types/storage';

const getStoragePath = (): string => {
  const home = homedir();
  const platform = process.platform;

  if (platform === 'darwin') {
    return `${home}/Library/Application Support/epoch/data.json`;
  } else if (platform === 'linux') {
    return `${home}/.config/epoch/data.json`;
  } else if (platform === 'win32') {
    const appData = process.env.APPDATA || `${home}\\AppData\\Roaming`;
    return `${appData}\\epoch\\data.json`;
  }

  return `${home}/.epoch/data.json`;
};

const getDefaultSchema = (): StorageSchema => ({
  version: '1.0.0',
  tasks: {},
  timeline: {},
  settings: {
    theme: 'dark',
    defaultStartTime: 'now',
    dateFormat: 'MMMM do, yyyy',
    timeFormat: '12h',
    autoMoveUnfinishedTasks: true,
  },
});

export class StorageService {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || getStoragePath();
  }

  async load(): Promise<StorageSchema> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data) as StorageSchema;

      // Convert date strings back to Date objects
      return this.hydrateDates(parsed);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return getDefaultSchema();
      }
      console.error('Failed to load storage:', error);
      return getDefaultSchema();
    }
  }

  async save(data: StorageSchema): Promise<void> {
    try {
      const dir = dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });

      // Convert Date objects to ISO strings for JSON serialization
      const serialized = this.serializeDates(data);
      await fs.writeFile(this.filePath, JSON.stringify(serialized, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save storage:', error);
    }
  }

  async backup(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const backupPath = `${this.filePath}.backup-${timestamp}`;
      const data = await fs.readFile(this.filePath, 'utf-8');
      await fs.writeFile(backupPath, data, 'utf-8');
    } catch (error) {
      console.error('Failed to backup storage:', error);
    }
  }

  getStoragePath(): string {
    return this.filePath;
  }

  private hydrateDates(data: any): StorageSchema {
    if (data.tasks) {
      Object.keys(data.tasks).forEach((date) => {
        data.tasks[date] = data.tasks[date].map((task: any) => this.hydrateTask(task));
      });
    }

    if (data.timeline) {
      Object.keys(data.timeline).forEach((date) => {
        data.timeline[date] = data.timeline[date].map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp),
          previousState: event.previousState,
          newState: event.newState,
        }));
      });
    }

    return data as StorageSchema;
  }

  private hydrateTask(task: any): any {
    return {
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      startTime: task.startTime ? new Date(task.startTime) : undefined,
      endTime: task.endTime ? new Date(task.endTime) : undefined,
      recurrence: task.recurrence
        ? {
            ...task.recurrence,
            endDate: task.recurrence.endDate ? new Date(task.recurrence.endDate) : undefined,
          }
        : undefined,
      children: task.children ? task.children.map((child: any) => this.hydrateTask(child)) : [],
    };
  }

  private serializeDates(data: StorageSchema): any {
    return {
      ...data,
      tasks: Object.keys(data.tasks).reduce(
        (acc, date) => {
          acc[date] = data.tasks[date].map((task) => this.serializeTask(task));
          return acc;
        },
        {} as Record<string, any>,
      ),
      timeline: Object.keys(data.timeline).reduce(
        (acc, date) => {
          acc[date] = data.timeline[date].map((event) => ({
            ...event,
            timestamp: event.timestamp.toISOString(),
          }));
          return acc;
        },
        {} as Record<string, any>,
      ),
    };
  }

  private serializeTask(task: any): any {
    return {
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      startTime: task.startTime ? task.startTime.toISOString() : undefined,
      endTime: task.endTime ? task.endTime.toISOString() : undefined,
      recurrence: task.recurrence
        ? {
            ...task.recurrence,
            endDate: task.recurrence.endDate ? task.recurrence.endDate.toISOString() : undefined,
          }
        : undefined,
      children: task.children ? task.children.map((child: any) => this.serializeTask(child)) : [],
    };
  }
}

export const storageService = new StorageService();
