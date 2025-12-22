/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'node:path';
import * as os from 'node:os';

function getConfigDir(): string {
  const homeDir = os.homedir();
  if (process.env.GOOGLE_WORKSPACE_MCP_HOME) {
    return process.env.GOOGLE_WORKSPACE_MCP_HOME;
  }
  switch (process.platform) {
    case 'win32':
      return path.join(
        process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming'),
        'google-workspace-mcp'
      );
    default:
      return path.join(homeDir, '.config', 'google-workspace-mcp');
  }
}

export const CONFIG_DIR = getConfigDir();
export const PROJECT_ROOT = CONFIG_DIR;
export const ENCRYPTED_TOKEN_PATH = path.join(CONFIG_DIR, 'gemini-cli-workspace-token.json');
export const ENCRYPTION_MASTER_KEY_PATH = path.join(CONFIG_DIR, '.gemini-cli-workspace-master-key');
