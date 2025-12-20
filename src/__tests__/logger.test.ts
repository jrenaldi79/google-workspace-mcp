import * as fs from 'node:fs/promises';
import {
  LogLevel,
  setLogLevel,
  getLogLevel,
  error,
  warn,
  info,
  debug,
  setLoggingEnabled,
} from '../utils/logger';

// Mock fs.appendFile to capture log output
jest.mock('node:fs/promises', () => ({
  appendFile: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
}));

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setLogLevel(LogLevel.INFO);
  });

  describe('LogLevel parsing', () => {
    it('should parse ERROR log level', () => {
      setLogLevel(LogLevel.ERROR);
      expect(getLogLevel()).toBe(LogLevel.ERROR);
    });

    it('should parse WARN log level', () => {
      setLogLevel(LogLevel.WARN);
      expect(getLogLevel()).toBe(LogLevel.WARN);
    });

    it('should parse INFO log level', () => {
      setLogLevel(LogLevel.INFO);
      expect(getLogLevel()).toBe(LogLevel.INFO);
    });

    it('should parse DEBUG log level', () => {
      setLogLevel(LogLevel.DEBUG);
      expect(getLogLevel()).toBe(LogLevel.DEBUG);
    });

    it('should default to INFO if no level is set', () => {
      expect(getLogLevel()).toBe(LogLevel.INFO);
    });
  });

  describe('setLoggingEnabled backward compatibility', () => {
    it('should set DEBUG level when enabled=true', () => {
      setLoggingEnabled(true);
      expect(getLogLevel()).toBe(LogLevel.DEBUG);
    });

    it('should set ERROR level when enabled=false', () => {
      setLoggingEnabled(false);
      expect(getLogLevel()).toBe(LogLevel.ERROR);
    });
  });

  describe('error() function', () => {
    it('should log error messages', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      error('Test error');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test error'));
      consoleSpy.mockRestore();
    });

    it('should write to file even at ERROR level', () => {
      setLogLevel(LogLevel.ERROR);
      error('Test error');
      expect(fs.appendFile).toHaveBeenCalled();
    });

    it('should always be visible regardless of log level', () => {
      setLogLevel(LogLevel.ERROR);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      error('Critical error');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('warn() function', () => {
    it('should log warning messages at WARN level', () => {
      setLogLevel(LogLevel.WARN);
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      warn('Test warning');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test warning'));
      consoleSpy.mockRestore();
    });

    it('should not log warnings below WARN level', () => {
      setLogLevel(LogLevel.ERROR);
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      warn('Test warning');
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should write to file', () => {
      warn('Test warning');
      expect(fs.appendFile).toHaveBeenCalled();
    });
  });

  describe('info() function', () => {
    it('should write to file at INFO level', () => {
      setLogLevel(LogLevel.INFO);
      info('Test info');
      expect(fs.appendFile).toHaveBeenCalled();
    });

    it('should not print to console at INFO level', () => {
      setLogLevel(LogLevel.INFO);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      info('Test info');
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not log if below INFO level', () => {
      setLogLevel(LogLevel.WARN);
      (fs.appendFile as jest.Mock).mockClear();
      info('Test info');
      expect(fs.appendFile).not.toHaveBeenCalled();
    });
  });

  describe('debug() function', () => {
    it('should write to file at DEBUG level', () => {
      setLogLevel(LogLevel.DEBUG);
      debug('Test debug');
      expect(fs.appendFile).toHaveBeenCalled();
    });

    it('should not log if below DEBUG level', () => {
      setLogLevel(LogLevel.INFO);
      (fs.appendFile as jest.Mock).mockClear();
      debug('Test debug');
      expect(fs.appendFile).not.toHaveBeenCalled();
    });

    it('should not print to console at any level', () => {
      setLogLevel(LogLevel.DEBUG);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      debug('Test debug');
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('log level filtering', () => {
    it('should only log messages at or below the current level', () => {
      setLogLevel(LogLevel.WARN);
      const mockAppend = fs.appendFile as jest.Mock;
      mockAppend.mockClear();

      error('Should log');
      warn('Should log');
      info('Should not log');
      debug('Should not log');

      expect(mockAppend).toHaveBeenCalledTimes(2);
    });

    it('should log all messages at DEBUG level', () => {
      setLogLevel(LogLevel.DEBUG);
      const mockAppend = fs.appendFile as jest.Mock;
      mockAppend.mockClear();

      error('Should log');
      warn('Should log');
      info('Should log');
      debug('Should log');

      expect(mockAppend).toHaveBeenCalledTimes(4);
    });

    it('should only log errors at ERROR level', () => {
      setLogLevel(LogLevel.ERROR);
      const mockAppend = fs.appendFile as jest.Mock;
      mockAppend.mockClear();

      error('Should log');
      warn('Should not log');
      info('Should not log');
      debug('Should not log');

      expect(mockAppend).toHaveBeenCalledTimes(1);
    });
  });

  describe('message formatting', () => {
    it('should include timestamp in log messages', () => {
      const mockAppend = fs.appendFile as jest.Mock;
      mockAppend.mockClear();

      error('Test');

      const call = mockAppend.mock.calls[0];
      const logMessage = call[1] as string;
      expect(logMessage).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include log level in message', () => {
      const mockAppend = fs.appendFile as jest.Mock;
      mockAppend.mockClear();

      error('Test error');
      expect(mockAppend.mock.calls[0][1]).toContain('[ERROR]');

      mockAppend.mockClear();
      warn('Test warn');
      expect(mockAppend.mock.calls[0][1]).toContain('[WARN]');

      mockAppend.mockClear();
      info('Test info');
      expect(mockAppend.mock.calls[0][1]).toContain('[INFO]');

      mockAppend.mockClear();
      debug('Test debug');
      expect(mockAppend.mock.calls[0][1]).toContain('[DEBUG]');
    });

    it('should include the message text', () => {
      const mockAppend = fs.appendFile as jest.Mock;
      mockAppend.mockClear();

      error('Custom error message');
      expect(mockAppend.mock.calls[0][1]).toContain('Custom error message');
    });
  });

  describe('console output behavior', () => {
    it('should use emoji prefixes for console output', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      setLogLevel(LogLevel.WARN);
      error('Error message');
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('❌'));

      warn('Warning message');
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('⚠️'));

      errorSpy.mockRestore();
      warnSpy.mockRestore();
    });

    it('should only output ERROR and WARN to console', () => {
      setLogLevel(LogLevel.DEBUG);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      error('Error');
      warn('Warning');
      info('Info');
      debug('Debug');

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      errorSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  describe('file logging', () => {
    it('should handle file append errors gracefully', () => {
      const mockAppend = fs.appendFile as jest.Mock;
      mockAppend.mockRejectedValueOnce(new Error('File system error'));

      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      error('Test error');

      // The function should handle the error and not throw
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it('should append messages with newlines', () => {
      const mockAppend = fs.appendFile as jest.Mock;
      mockAppend.mockClear();

      error('Test');
      const message = mockAppend.mock.calls[0][1] as string;
      expect(message).toMatch(/\n$/);
    });
  });
});
