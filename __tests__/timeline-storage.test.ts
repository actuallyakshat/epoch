import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TimelineService } from '../src/services/timelineService';
import { StorageService } from '../src/services/storage';
import { TimelineEventType } from '../src/types/timeline';
import { promises as fs } from 'node:fs';
import path from 'path';
import { homedir } from 'os';

// Mock fs module
vi.mock('node:fs', () => {
  const mockPromises = {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  };
  return {
    promises: mockPromises,
    default: {
      promises: mockPromises,
    },
  };
});

describe('TimelineService', () => {
  let timelineService: TimelineService;
  const mockDate = new Date('2024-01-01T10:00:00.000Z');

  beforeEach(() => {
    timelineService = new TimelineService();
    // Use fake timers to control Date.now() if needed, but methods accept date
  });

  describe('createEvent', () => {
    it('creates event with correct structure, UUID, timestamps', () => {
      const event = timelineService.createEvent(
        'task-1',
        'My Task',
        TimelineEventType.CREATED,
        mockDate,
      );

      expect(event).toMatchObject({
        taskId: 'task-1',
        taskTitle: 'My Task',
        type: TimelineEventType.CREATED,
        timestamp: mockDate,
      });
      expect(event.id).toBeDefined();
      expect(typeof event.id).toBe('string');
      expect(event.previousState).toBeUndefined();
      expect(event.newState).toBeUndefined();
    });

    it('handles optional previousState/newState', () => {
      const event = timelineService.createEvent(
        'task-1',
        'My Task',
        TimelineEventType.UPDATED,
        mockDate,
        'todo',
        'completed',
      );

      expect(event.previousState).toBe('todo');
      expect(event.newState).toBe('completed');
    });
  });

  describe('getEventsForDate', () => {
    const events = [
      {
        id: '1',
        taskId: 't1',
        taskTitle: 'Task 1',
        type: TimelineEventType.CREATED,
        timestamp: mockDate,
      },
    ];
    const timeline = { '2024-01-01': events };

    it('returns events for specific date', () => {
      const result = timelineService.getEventsForDate(timeline, '2024-01-01');
      expect(result).toEqual(events);
    });

    it('returns empty array for date with no events', () => {
      const result = timelineService.getEventsForDate(timeline, '2024-01-02');
      expect(result).toEqual([]);
    });
  });

  describe('addEvent', () => {
    it('adds event to correct date bucket', () => {
      const existingEvent = {
        id: '1',
        taskId: 't1',
        taskTitle: 'Existing',
        type: TimelineEventType.CREATED,
        timestamp: mockDate,
      };
      const timeline = { '2024-01-01': [existingEvent] };

      const newEvent = {
        id: '2',
        taskId: 't2',
        taskTitle: 'New',
        type: TimelineEventType.STARTED,
        timestamp: new Date('2024-01-01T11:00:00.000Z'),
      };

      const result = timelineService.addEvent(timeline, newEvent);
      expect(result['2024-01-01']).toHaveLength(2);
      expect(result['2024-01-01'][1]).toEqual(newEvent);
    });

    it('creates new date bucket if needed', () => {
      const timeline = {};
      const newEvent = {
        id: '1',
        taskId: 't1',
        taskTitle: 'Task',
        type: TimelineEventType.CREATED,
        timestamp: mockDate,
      };

      const result = timelineService.addEvent(timeline, newEvent);
      expect(result['2024-01-01']).toBeDefined();
      expect(result['2024-01-01']).toEqual([newEvent]);
    });
  });

  describe('removeEventsByTaskId', () => {
    it('removes all events for a task across all dates', () => {
      const timeline = {
        '2024-01-01': [
          {
            id: '1',
            taskId: 't1',
            taskTitle: 'Task 1',
            type: TimelineEventType.CREATED,
            timestamp: mockDate,
          },
          {
            id: '2',
            taskId: 't2',
            taskTitle: 'Task 2',
            type: TimelineEventType.CREATED,
            timestamp: mockDate,
          },
        ],
        '2024-01-02': [
          {
            id: '3',
            taskId: 't1',
            taskTitle: 'Task 1',
            type: TimelineEventType.COMPLETED,
            timestamp: mockDate,
          },
        ],
      };

      const result = timelineService.removeEventsByTaskId(timeline, 't1');

      expect(result['2024-01-01']).toHaveLength(1);
      expect(result['2024-01-01'][0].taskId).toBe('t2');
      expect(result['2024-01-02']).toBeUndefined();
    });

    it('preserves events for other tasks', () => {
      const timeline = {
        '2024-01-01': [
          {
            id: '1',
            taskId: 't2',
            taskTitle: 'Task 2',
            type: TimelineEventType.CREATED,
            timestamp: mockDate,
          },
        ],
      };

      const result = timelineService.removeEventsByTaskId(timeline, 't1');
      expect(result).toEqual(timeline);
    });
  });

  describe('removeLastEventByType', () => {
    it('removes only the last matching event', () => {
      const t1 = new Date('2024-01-01T10:00:00.000Z');
      const t2 = new Date('2024-01-01T11:00:00.000Z');
      const timeline = {
        '2024-01-01': [
          {
            id: '1',
            taskId: 't1',
            taskTitle: 'Task 1',
            type: TimelineEventType.STARTED,
            timestamp: t1,
          },
          {
            id: '2',
            taskId: 't1',
            taskTitle: 'Task 1',
            type: TimelineEventType.STARTED,
            timestamp: t2,
          },
        ],
      };

      const result = timelineService.removeLastEventByType(
        timeline,
        't1',
        TimelineEventType.STARTED,
      );

      expect(result['2024-01-01']).toHaveLength(1);
      expect(result['2024-01-01'][0].timestamp).toBe(t1);
    });

    it('handles multiple dates correctly (stops after removing last)', () => {
      const t1 = new Date('2024-01-01');
      const t2 = new Date('2024-01-02');
      const t3 = new Date('2024-01-03');

      const timeline = {
        '2024-01-03': [
          { id: '3', taskId: 't1', taskTitle: 'T', type: TimelineEventType.CREATED, timestamp: t3 },
        ],
        '2024-01-02': [
          { id: '2', taskId: 't1', taskTitle: 'T', type: TimelineEventType.STARTED, timestamp: t2 },
        ],
        '2024-01-01': [
          { id: '1', taskId: 't1', taskTitle: 'T', type: TimelineEventType.STARTED, timestamp: t1 },
        ],
      };

      const result = timelineService.removeLastEventByType(
        timeline,
        't1',
        TimelineEventType.STARTED,
      );

      // Latest date (03): No match, unchanged
      expect(result['2024-01-03']).toHaveLength(1);

      // Middle date (02): Match found and removed
      expect(result['2024-01-02']).toBeUndefined(); // Empty array is not added to result in removeLastEventByType

      // Earliest date (01): Match exists but already removed one, so unchanged
      expect(result['2024-01-01']).toHaveLength(1);
    });
  });

  describe('formatEventDescription', () => {
    it('formats correctly with state changes', () => {
      const event = {
        id: '1',
        taskId: 't1',
        taskTitle: 'My Task',
        type: TimelineEventType.UPDATED,
        timestamp: new Date('2024-01-01T13:30:00.000Z'),
        previousState: 'todo' as const,
        newState: 'completed' as const,
      };

      const desc = timelineService.formatEventDescription(event);
      const expectedTime = event.timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      expect(desc).toContain(expectedTime);
      expect(desc).toContain('Updated: My Task');
      expect(desc).toContain('(todo -> completed)');
    });

    it('formats correctly without state changes', () => {
      const event = {
        id: '1',
        taskId: 't1',
        taskTitle: 'My Task',
        type: TimelineEventType.CREATED,
        timestamp: new Date('2024-01-01T09:00:00.000Z'),
      };

      const desc = timelineService.formatEventDescription(event);
      const expectedTime = event.timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      expect(desc).toContain(expectedTime);
      expect(desc).toContain('Created: My Task');
      expect(desc).not.toContain('->');
    });
  });
});

describe('StorageService', () => {
  let storageService: StorageService;
  const mockPath = '/tmp/test-storage.json';

  beforeEach(() => {
    vi.resetAllMocks();
    storageService = new StorageService(mockPath);
  });

  describe('load', () => {
    it('returns default schema for non-existent file', async () => {
      // Mock readFile to throw ENOENT
      const error: any = new Error('File not found');
      error.code = 'ENOENT';
      (fs.readFile as any).mockRejectedValue(error);

      const data = await storageService.load();

      expect(data).toMatchObject({
        version: '1.0.0',
        tasks: {},
        timeline: {},
        settings: expect.any(Object),
      });
    });

    it('loads and hydrates dates correctly from JSON', async () => {
      const mockJson = JSON.stringify({
        version: '1.0.0',
        tasks: {
          '2024-01-01': [
            {
              id: '1',
              title: 'Task',
              state: 'todo',
              createdAt: '2024-01-01T10:00:00.000Z',
              updatedAt: '2024-01-01T10:00:00.000Z',
              date: '2024-01-01',
              children: [],
            },
          ],
        },
        timeline: {
          '2024-01-01': [
            {
              id: 'e1',
              taskId: '1',
              taskTitle: 'Task',
              type: 'created',
              timestamp: '2024-01-01T10:00:00.000Z',
            },
          ],
        },
        settings: { theme: 'dark' },
      });

      (fs.readFile as any).mockResolvedValue(mockJson);

      const data = await storageService.load();

      expect(data.tasks['2024-01-01']).toHaveLength(1);
      expect(data.timeline['2024-01-01']).toHaveLength(1);
      expect(data.tasks['2024-01-01'][0].createdAt).toBeInstanceOf(Date);
      expect(data.timeline['2024-01-01'][0].timestamp).toBeInstanceOf(Date);
    });

    it('handles corrupted JSON gracefully', async () => {
      (fs.readFile as any).mockResolvedValue('invalid json');

      // Spy on console.error to suppress output during test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const data = await storageService.load();

      expect(data).toMatchObject({
        version: '1.0.0',
        tasks: {},
        timeline: {},
      });

      consoleSpy.mockRestore();
    });
  });

  describe('save', () => {
    it('creates directory if needed', async () => {
      const data = {
        version: '1.0.0',
        tasks: {},
        timeline: {},
        settings: {
          theme: 'dark',
          defaultStartTime: 'now' as const,
          dateFormat: 'MMMM do, yyyy',
          timeFormat: '12h' as const,
          autoMoveUnfinishedTasks: true,
        },
      };

      // Mock mkdir to resolve successfully (directory created)
      (fs.mkdir as any).mockResolvedValue(undefined);

      await storageService.save(data);

      expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(mockPath), { recursive: true });
    });

    it('serializes dates to ISO format correctly', async () => {
      const date = new Date('2024-01-01T10:00:00.000Z');
      const data = {
        version: '1.0.0',
        tasks: {
          '2024-01-01': [
            {
              id: '1',
              title: 'Task',
              state: 'todo' as const,
              createdAt: date,
              updatedAt: date,
              children: [],
              date: '2024-01-01',
            },
          ],
        },
        timeline: {
          '2024-01-01': [
            {
              id: 'e1',
              taskId: '1',
              taskTitle: 'Task',
              type: TimelineEventType.CREATED,
              timestamp: date,
            },
          ],
        },
        settings: {
          theme: 'dark',
          defaultStartTime: 'now' as const,
          dateFormat: 'MMMM do, yyyy',
          timeFormat: '12h' as const,
          autoMoveUnfinishedTasks: true,
        },
      };

      // Mock fs operations
      (fs.mkdir as any).mockResolvedValue(undefined);
      (fs.writeFile as any).mockResolvedValue(undefined);

      await storageService.save(data);

      const writeCall = (fs.writeFile as any).mock.calls[0];
      expect(writeCall).toBeDefined();
      const writtenContent = JSON.parse(writeCall[1]);

      expect(writtenContent.tasks['2024-01-01']).toHaveLength(1);
      expect(writtenContent.timeline['2024-01-01']).toHaveLength(1);
      expect(writtenContent.tasks['2024-01-01'][0].createdAt).toBe(date.toISOString());
      expect(writtenContent.timeline['2024-01-01'][0].timestamp).toBe(date.toISOString());
    });

    it('handles save error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Write failed');
      (fs.mkdir as any).mockResolvedValue(undefined);
      (fs.writeFile as any).mockRejectedValue(error);

      const data = { version: '1.0.0', tasks: {}, timeline: {}, settings: {} } as any;
      await storageService.save(data);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save storage:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('backup', () => {
    it('creates backup file with timestamp', async () => {
      const mockContent = '{"version":"1.0.0"}';
      (fs.readFile as any).mockResolvedValue(mockContent);
      (fs.writeFile as any).mockResolvedValue(undefined);

      await storageService.backup();

      expect(fs.readFile).toHaveBeenCalledWith(mockPath, 'utf-8');
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/\.backup-\d{4}-\d{2}-\d{2}T/),
        mockContent,
        'utf-8',
      );
    });

    it('handles backup error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Backup failed');
      (fs.readFile as any).mockRejectedValue(error);

      await storageService.backup();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to backup storage:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('getStoragePath', () => {
    it('preserves all data including nested children', async () => {
      // Create a complex data structure
      const date = new Date();
      const originalData = {
        version: '1.0.0',
        tasks: {
          '2024-01-01': [
            {
              id: '1',
              title: 'Parent',
              state: 'todo' as const,
              createdAt: date,
              updatedAt: date,
              date: '2024-01-01',
              children: [
                {
                  id: '2',
                  title: 'Child',
                  state: 'todo' as const,
                  createdAt: date,
                  updatedAt: date,
                  date: '2024-01-01',
                  children: [],
                },
              ],
            },
          ],
        },
        timeline: {},
        settings: {
          theme: 'dark',
          defaultStartTime: 'now' as const,
          dateFormat: 'MMMM do, yyyy',
          timeFormat: '12h' as const,
          autoMoveUnfinishedTasks: true,
        },
      };

      // Mock implementation of writeFile and readFile to simulate storage
      let storageContent: string = '';
      (fs.writeFile as any).mockImplementation((path: string, data: string) => {
        storageContent = data;
        return Promise.resolve();
      });
      (fs.readFile as any).mockImplementation(() => {
        return Promise.resolve(storageContent);
      });

      // Round trip
      await storageService.save(originalData);
      const loadedData = await storageService.load();

      // Check specific nested properties
      const parent = loadedData.tasks['2024-01-01'][0];
      expect(parent.title).toBe('Parent');
      expect(parent.children).toHaveLength(1);
      expect(parent.children[0].title).toBe('Child');
      expect(parent.children[0].createdAt).toEqual(date);
    });
  });

  describe('getStoragePath', () => {
    it('returns correct path for current platform', () => {
      // Since we mocked the path in constructor, it should return that
      expect(storageService.getStoragePath()).toBe(mockPath);

      // Test default path logic by instantiating without path
      // We need to check against process.platform but it's constant during run.
      // We can just verify it returns a non-empty string that looks like a path.
      const defaultService = new StorageService();
      expect(defaultService.getStoragePath()).toBeTruthy();
      expect(typeof defaultService.getStoragePath()).toBe('string');
    });

    it('returns correct path for Linux', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'linux' });

      const home = process.env.HOME || homedir();
      const service = new StorageService();
      expect(service.getStoragePath()).toBe(`${home}/.config/epoch/data.json`);

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('returns correct path for Windows', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });
      process.env.APPDATA = 'C:\\Users\\Test\\AppData\\Roaming';

      const service = new StorageService();
      expect(service.getStoragePath()).toBe(`C:\\Users\\Test\\AppData\\Roaming\\epoch\\data.json`);

      Object.defineProperty(process, 'platform', { value: originalPlatform });
      delete process.env.APPDATA;
    });

    it('returns correct path for macOS', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin' });

      const home = process.env.HOME || homedir();
      const service = new StorageService();
      expect(service.getStoragePath()).toBe(`${home}/Library/Application Support/epoch/data.json`);

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('returns default path for unknown platform', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'sunos' });

      const home = process.env.HOME || homedir();
      const service = new StorageService();
      expect(service.getStoragePath()).toBe(`${home}/.epoch/data.json`);

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
  });
});
