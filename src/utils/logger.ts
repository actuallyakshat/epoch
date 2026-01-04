import fs from 'node:fs';
import path from 'node:path';

class Logger {
  private readonly logFile: string;
  private stream: fs.WriteStream | null = null;

  constructor() {
    this.logFile = path.join(process.cwd(), 'debug.log');
    this.initializeLog();
  }

  // Made public for testing
  initializeLog() {
    // Clear existing log file
    if (fs.existsSync(this.logFile)) {
      fs.unlinkSync(this.logFile);
    }

    // Create write stream
    this.stream = fs.createWriteStream(this.logFile, { flags: 'a' });
    this.log('Logger initialized');
  }

  log(message: string, data?: any) {
    if (!this.stream) return;

    const timestamp = new Date().toISOString();
    const logMessage = data
      ? `[${timestamp}] ${message} ${JSON.stringify(data, null, 2)}\n`
      : `[${timestamp}] ${message}\n`;

    this.stream.write(logMessage);
  }

  cleanup() {
    this.log('Cleaning up logger');

    if (this.stream) {
      this.stream.end();
      this.stream = null;
    }

    // Delete log file
    if (fs.existsSync(this.logFile)) {
      fs.unlinkSync(this.logFile);
    }
  }
}

// Singleton instance
export const logger = new Logger();

// Cleanup on process exit
process.on('exit', () => {
  logger.cleanup();
});

process.on('SIGINT', () => {
  logger.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.cleanup();
  process.exit(0);
});
