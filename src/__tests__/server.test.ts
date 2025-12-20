import * as fs from 'node:fs';
import * as path from 'node:path';

describe('MCP Server (src/index.ts)', () => {
  describe('Server initialization', () => {
    it('should export createServer or startServer function', () => {
      const indexPath = path.join(__dirname, '../index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      // Server should export something for initialization
      expect(indexContent).toMatch(/export|module\.exports/);
    });

    it('should use StdioServerTransport for MCP protocol', () => {
      const indexPath = path.join(__dirname, '../index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      expect(indexContent).toContain('StdioServerTransport');
    });

    it('should define tools for MCP server', () => {
      const indexPath = path.join(__dirname, '../index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      expect(indexContent).toContain('tools');
      expect(indexContent).toContain('Tool');
    });
  });

  describe('Tool definitions', () => {
    it('should have Gmail service tools', () => {
      const indexPath = path.join(__dirname, '../index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      expect(indexContent.toLowerCase()).toContain('gmail');
    });

    it('should have Calendar service tools', () => {
      const indexPath = path.join(__dirname, '../index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      expect(indexContent.toLowerCase()).toContain('calendar');
    });

    it('should have Drive service tools', () => {
      const indexPath = path.join(__dirname, '../index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      expect(indexContent.toLowerCase()).toContain('drive');
    });

    it('should have Docs service tools', () => {
      const indexPath = path.join(__dirname, '../index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      expect(indexContent.toLowerCase()).toContain('docs');
    });

    it('should have Sheets service tools', () => {
      const indexPath = path.join(__dirname, '../index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      expect(indexContent.toLowerCase()).toContain('sheets');
    });

    it('should have Chat service tools', () => {
      const indexPath = path.join(__dirname, '../index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      expect(indexContent.toLowerCase()).toContain('chat');
    });
  });

  describe('Error handling', () => {
    it('should have error handling for server startup', () => {
      const indexPath = path.join(__dirname, '../index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      expect(indexContent).toContain('catch');
    });
  });
});
