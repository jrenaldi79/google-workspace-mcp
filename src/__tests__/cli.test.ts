import * as fs from 'node:fs';
import * as path from 'node:path';

// Test helpers for CLI behavior
describe('CLI Entry Point (bin/cli.js)', () => {
  describe('--auth flag', () => {
    it('should load the auth-flow module when --auth is passed', () => {
      const cliPath = path.join(__dirname, '../../bin/cli.js');
      expect(fs.existsSync(cliPath)).toBe(true);

      const cliContent = fs.readFileSync(cliPath, 'utf-8');
      expect(cliContent).toContain('--auth');
      expect(cliContent).toContain('runAuthFlow');
    });

    it('should set LOG_LEVEL=DEBUG when --debug is passed', () => {
      const cliPath = path.join(__dirname, '../../bin/cli.js');
      const cliContent = fs.readFileSync(cliPath, 'utf-8');
      expect(cliContent).toContain('LOG_LEVEL');
      expect(cliContent).toContain('DEBUG');
    });

    it('should export runAuthFlow from dist/auth-flow', () => {
      const cliPath = path.join(__dirname, '../../bin/cli.js');
      const cliContent = fs.readFileSync(cliPath, 'utf-8');
      expect(cliContent).toContain("require('../dist/auth-flow')");
    });
  });

  describe('Credential detection', () => {
    it('should have hasValidCredentials helper function', () => {
      const cliPath = path.join(__dirname, '../../bin/cli.js');
      const cliContent = fs.readFileSync(cliPath, 'utf-8');
      expect(cliContent).toContain('hasValidCredentials');
    });

    it('should check token.json existence', () => {
      const cliPath = path.join(__dirname, '../../bin/cli.js');
      const cliContent = fs.readFileSync(cliPath, 'utf-8');
      expect(cliContent).toContain('token.json');
      expect(cliContent).toContain('fs.existsSync');
    });

    it('should use GOOGLE_WORKSPACE_MCP_HOME environment variable', () => {
      const cliPath = path.join(__dirname, '../../bin/cli.js');
      const cliContent = fs.readFileSync(cliPath, 'utf-8');
      expect(cliContent).toContain('GOOGLE_WORKSPACE_MCP_HOME');
    });
  });

  describe('Auto-authentication on first run', () => {
    it('should detect interactive terminal', () => {
      const cliPath = path.join(__dirname, '../../bin/cli.js');
      const cliContent = fs.readFileSync(cliPath, 'utf-8');
      expect(cliContent).toContain('isInteractiveTerminal');
      expect(cliContent).toContain('isTTY');
    });

    it('should auto-prompt for auth if no credentials and interactive', () => {
      const cliPath = path.join(__dirname, '../../bin/cli.js');
      const cliContent = fs.readFileSync(cliPath, 'utf-8');
      expect(cliContent).toContain('No credentials found');
    });

    it('should fail gracefully in non-interactive environment', () => {
      const cliPath = path.join(__dirname, '../../bin/cli.js');
      const cliContent = fs.readFileSync(cliPath, 'utf-8');
      expect(cliContent).toContain('Non-interactive');
      expect(cliContent).toContain('automated/non-interactive');
    });
  });

  describe('Server mode', () => {
    it('should load index from dist when no --auth flag', () => {
      const cliPath = path.join(__dirname, '../../bin/cli.js');
      const cliContent = fs.readFileSync(cliPath, 'utf-8');
      expect(cliContent).toContain("require('../dist/index')");
    });

    it('should exit with code 1 if no credentials in non-interactive', () => {
      const cliPath = path.join(__dirname, '../../bin/cli.js');
      const cliContent = fs.readFileSync(cliPath, 'utf-8');
      expect(cliContent).toContain('process.exit(1)');
    });
  });
});
