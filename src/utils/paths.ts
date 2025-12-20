/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'node:path';
import * as fs from 'node:fs';
import os from 'node:os';

/**
 * Determines the config directory for Google Workspace MCP credentials.
 *
 * Uses OS-standard persistent directories so tokens are available when
 * running via npx (where the package is in ephemeral npm cache).
 *
 * - Override: GOOGLE_WORKSPACE_MCP_HOME environment variable
 * - macOS/Linux: ~/.config/google-workspace-mcp/
 * - Windows: %APPDATA%/google-workspace-mcp/
 */
function getConfigDirectory(): string {
  const homeDir = os.homedir();

  // Allow override via environment variable
  if (process.env.GOOGLE_WORKSPACE_MCP_HOME) {
    return process.env.GOOGLE_WORKSPACE_MCP_HOME;
  }

  // Platform-specific defaults
  switch (process.platform) {
    case 'win32':
      return path.join(
        process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming'),
        'google-workspace-mcp',
      );
    case 'darwin':
    case 'linux':
    default:
      return path.join(homeDir, '.config', 'google-workspace-mcp');
  }
}

// Construct the config directory and ensure it exists
export const CONFIG_DIR = getConfigDirectory();

// Ensure directory exists on module load
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Token storage paths in the persistent config directory
export const ENCRYPTED_TOKEN_PATH = path.join(CONFIG_DIR, 'token.json');
export const ENCRYPTION_MASTER_KEY_PATH = path.join(CONFIG_DIR, '.master-key');

// Keep PROJECT_ROOT for backward compatibility with existing code
// (it was previously used by some token storage logic)
export const PROJECT_ROOT = CONFIG_DIR;
