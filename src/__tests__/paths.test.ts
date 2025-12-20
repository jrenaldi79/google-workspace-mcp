import * as os from 'node:os';
import * as path from 'node:path';

describe('Paths Utility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('CONFIG_DIR determination', () => {
    it('should use GOOGLE_WORKSPACE_MCP_HOME if set', () => {
      process.env.GOOGLE_WORKSPACE_MCP_HOME = '/custom/path';

      // Re-require to get fresh import with new env
      delete require.cache[require.resolve('../utils/paths')];
      const { CONFIG_DIR } = require('../utils/paths');

      expect(CONFIG_DIR).toBe('/custom/path');
    });

    it('should use ~/.config/google-workspace-mcp on Linux', () => {
      // This test is platform-dependent, so we'll skip if not on Linux
      if (process.platform !== 'linux') {
        expect(true).toBe(true);
        return;
      }

      delete require.cache[require.resolve('../utils/paths')];
      const { CONFIG_DIR } = require('../utils/paths');
      const homeDir = os.homedir();

      expect(CONFIG_DIR).toBe(path.join(homeDir, '.config', 'google-workspace-mcp'));
    });

    it('should use ~/.config/google-workspace-mcp on macOS', () => {
      // This test is platform-dependent, so we'll skip if not on macOS
      if (process.platform !== 'darwin') {
        expect(true).toBe(true);
        return;
      }

      delete require.cache[require.resolve('../utils/paths')];
      const { CONFIG_DIR } = require('../utils/paths');
      const homeDir = os.homedir();

      expect(CONFIG_DIR).toBe(path.join(homeDir, '.config', 'google-workspace-mcp'));
    });

    it('should use %APPDATA%/google-workspace-mcp on Windows', () => {
      // This test is platform-dependent, so we'll skip if not on Windows
      if (process.platform !== 'win32') {
        expect(true).toBe(true);
        return;
      }

      delete require.cache[require.resolve('../utils/paths')];
      const { CONFIG_DIR } = require('../utils/paths');

      const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      expect(CONFIG_DIR).toBe(path.join(appData, 'google-workspace-mcp'));
    });
  });

  describe('Token paths', () => {
    it('should define ENCRYPTED_TOKEN_PATH', () => {
      delete require.cache[require.resolve('../utils/paths')];
      const { ENCRYPTED_TOKEN_PATH } = require('../utils/paths');

      expect(ENCRYPTED_TOKEN_PATH).toBeDefined();
      expect(ENCRYPTED_TOKEN_PATH).toContain('token.json');
    });

    it('should define ENCRYPTION_MASTER_KEY_PATH', () => {
      delete require.cache[require.resolve('../utils/paths')];
      const { ENCRYPTION_MASTER_KEY_PATH } = require('../utils/paths');

      expect(ENCRYPTION_MASTER_KEY_PATH).toBeDefined();
      expect(ENCRYPTION_MASTER_KEY_PATH).toContain('.master-key');
    });

    it('should place token paths in CONFIG_DIR', () => {
      delete require.cache[require.resolve('../utils/paths')];
      const {
        CONFIG_DIR,
        ENCRYPTED_TOKEN_PATH,
        ENCRYPTION_MASTER_KEY_PATH,
      } = require('../utils/paths');

      expect(ENCRYPTED_TOKEN_PATH).toContain(CONFIG_DIR);
      expect(ENCRYPTION_MASTER_KEY_PATH).toContain(CONFIG_DIR);
    });
  });

  describe('Persistent storage behavior', () => {
    it('should resolve to user home directory', () => {
      delete require.cache[require.resolve('../utils/paths')];
      const { CONFIG_DIR } = require('../utils/paths');

      const homeDir = os.homedir();
      expect(CONFIG_DIR).toContain(homeDir);
    });

    it('should be accessible across multiple invocations', () => {
      process.env.GOOGLE_WORKSPACE_MCP_HOME = '/test/path';

      delete require.cache[require.resolve('../utils/paths')];
      const firstImport = require('../utils/paths');

      delete require.cache[require.resolve('../utils/paths')];
      const secondImport = require('../utils/paths');

      expect(firstImport.CONFIG_DIR).toBe(secondImport.CONFIG_DIR);
    });
  });
});
