/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { CONFIG_DIR } from './paths';

// Log levels in order of severity
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Parse LOG_LEVEL environment variable, default to INFO
function parseLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();
  switch (envLevel) {
    case 'ERROR':
      return LogLevel.ERROR;
    case 'WARN':
      return LogLevel.WARN;
    case 'INFO':
      return LogLevel.INFO;
    case 'DEBUG':
      return LogLevel.DEBUG;
    default:
      return LogLevel.INFO;
  }
}

let currentLogLevel = parseLogLevel();
const logFilePath = path.join(CONFIG_DIR, 'logs', 'server.log');

async function ensureLogDirectoryExists() {
  try {
    await fs.mkdir(path.dirname(logFilePath), { recursive: true });
  } catch (error) {
    // If we can't create the log directory, log to console as a fallback.
    console.error('Could not create log directory:', error);
  }
}

// Ensure the directory exists when the module is loaded.
ensureLogDirectoryExists();

export function setLogLevel(level: LogLevel) {
  currentLogLevel = level;
}

export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

export function setLoggingEnabled(enabled: boolean) {
  // For backward compatibility - enabling sets to DEBUG, disabling sets to ERROR
  currentLogLevel = enabled ? LogLevel.DEBUG : LogLevel.ERROR;
}

function formatLogMessage(level: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `${timestamp} [${level}] ${message}`;
}

function writeLog(level: LogLevel, levelName: string, message: string) {
  if (level > currentLogLevel) {
    return;
  }

  const logMessage = formatLogMessage(levelName, message);

  // Write to file
  fs.appendFile(logFilePath, logMessage + '\n').catch(err => {
    // Fallback to console if file logging fails
    console.error('Failed to write to log file:', err);
  });

  // Also write to console for ERROR and WARN
  if (level <= LogLevel.WARN) {
    if (level === LogLevel.ERROR) {
      console.error(`❌ ${message}`);
    } else {
      console.warn(`⚠️  ${message}`);
    }
  }
}

export function error(message: string) {
  writeLog(LogLevel.ERROR, 'ERROR', message);
}

export function warn(message: string) {
  writeLog(LogLevel.WARN, 'WARN', message);
}

export function info(message: string) {
  writeLog(LogLevel.INFO, 'INFO', message);
}

export function debug(message: string) {
  writeLog(LogLevel.DEBUG, 'DEBUG', message);
}

// Keep old function name for backward compatibility
export function logToFile(message: string) {
  info(message);
}
