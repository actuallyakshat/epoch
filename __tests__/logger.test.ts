import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../src/utils/logger';
import fs from 'fs';
import path from 'path';

vi.mock('fs', () => {
  return {
    default: {
      existsSync: vi.fn(),
      unlinkSync: vi.fn(),
      createWriteStream: vi.fn(),
    },
    existsSync: vi.fn(),
    unlinkSync: vi.fn(),
    createWriteStream: vi.fn(),
  };
});

describe('Logger', () => {
  const mockWrite = vi.fn();
  const mockEnd = vi.fn();
  const mockStream = {
    write: mockWrite,
    end: mockEnd,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fs.createWriteStream as any).mockReturnValue(mockStream);
    (fs.existsSync as any).mockReturnValue(false);

    // Reset logger instance
    // Since logger is a singleton, we need to manually re-initialize if possible
    // or trust that each test sets up the mocks before the logger is used.
    // However, logger is initialized on import. To test initialization logic,
    // we might need to access the private methods or re-instantiate.
    // For this test, we'll access the private 'initializeLog' method via 'any'
    // to force re-initialization with our mocks.
    (logger as any).initializeLog();
  });

  describe('initialization', () => {
    it('creates log file on initialization', () => {
      expect(fs.createWriteStream).toHaveBeenCalledWith(expect.stringContaining('debug.log'), {
        flags: 'a',
      });
      expect(mockWrite).toHaveBeenCalledWith(expect.stringContaining('Logger initialized'));
    });

    it('clears existing log file if it exists', () => {
      (fs.existsSync as any).mockReturnValue(true);
      (logger as any).initializeLog();

      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('debug.log'));
      expect(fs.createWriteStream).toHaveBeenCalled();
    });
  });

  describe('log', () => {
    it('writes message to stream with timestamp', () => {
      const message = 'Test message';
      logger.log(message);

      expect(mockWrite).toHaveBeenCalledWith(expect.stringMatching(/\[.*\] Test message\n/));
    });

    it('writes message with data to stream', () => {
      const message = 'Test message';
      const data = { foo: 'bar' };
      logger.log(message, data);

      expect(mockWrite).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] Test message {\n  "foo": "bar"\n}\n/),
      );
    });

    it('does not write if stream is null', () => {
      mockWrite.mockClear();
      (logger as any).stream = null;
      logger.log('Test message');
      expect(mockWrite).not.toHaveBeenCalled();

      // Restore stream for other tests
      (logger as any).stream = mockStream;
    });
  });

  describe('cleanup', () => {
    it('ends stream and removes file', () => {
      (fs.existsSync as any).mockReturnValue(true);
      logger.cleanup();

      expect(mockWrite).toHaveBeenCalledWith(expect.stringContaining('Cleaning up logger'));
      expect(mockEnd).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect((logger as any).stream).toBeNull();
    });

    it('handles cleanup when stream is already null', () => {
      (logger as any).stream = null;
      (fs.existsSync as any).mockReturnValue(true);

      logger.cleanup();

      expect(mockEnd).not.toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it('does not unlink if file does not exist', () => {
      (fs.existsSync as any).mockReturnValue(false);
      logger.cleanup();
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });
});
