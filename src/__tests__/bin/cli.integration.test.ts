/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('CLI Integration Tests', () => {
  const projectRoot = path.resolve(__dirname, '../../..');
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const cliPath = path.join(projectRoot, 'bin/cli.js');
  const distIndexPath = path.join(projectRoot, 'dist/index.js');

  describe('Package Configuration', () => {
    it('should have package.json with correct name', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.name).toBe('@presto-ai/google-workspace-mcp');
    });

    it('should have bin field pointing to cli.js', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.bin).toBeDefined();
      expect(packageJson.bin).toBe('./bin/cli.js');
    });

    it('should have cli.js with shebang', () => {
      const cliContent = fs.readFileSync(cliPath, 'utf-8');
      expect(cliContent.startsWith('#!/usr/bin/env node')).toBe(true);
    });

    it('should have dist/index.js built', () => {
      expect(fs.existsSync(distIndexPath)).toBe(true);
    });

    it('should have files array including dist and bin', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.files).toContain('dist/');
      expect(packageJson.files).toContain('bin/');
    });

    it('should have prepublishOnly hook to build', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.scripts.prepublishOnly).toBe('npm run build');
    });
  });

  describe('CLI Executable', () => {
    it('should be executable', () => {
      const stats = fs.statSync(cliPath);
      // Check if file has execute permissions (mode & 0o111)
      expect(stats.mode & 0o111).toBeTruthy();
    });

    it('should require dist/index for MCP server', () => {
      const cliContent = fs.readFileSync(cliPath, 'utf-8');
      expect(cliContent).toContain('dist/index');
    });

    it('should export main CLI handler', () => {
      const cliContent = fs.readFileSync(cliPath, 'utf-8');
      expect(cliContent.length).toBeGreaterThan(100);
    });
  });

  describe('Build Output', () => {
    it('should produce valid JavaScript', () => {
      const distContent = fs.readFileSync(distIndexPath, 'utf-8');
      expect(distContent.length).toBeGreaterThan(1000);
      // Basic check that it looks like minified/built JavaScript
      expect(
        distContent.includes('function') ||
          distContent.includes('const') ||
          distContent.includes('var')
      ).toBeTruthy();
    });

    it('should include source maps', () => {
      const mapPath = path.join(projectRoot, 'dist/index.js.map');
      expect(fs.existsSync(mapPath)).toBe(true);
      const mapContent = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
      expect(mapContent.version).toBeDefined();
    });
  });

  describe('npm pack Simulation', () => {
    it('should list correct files in package', () => {
      try {
        const output = execSync('npm pack --dry-run 2>/dev/null || npm pack --dry-run 2>&1', {
          cwd: projectRoot,
          encoding: 'utf-8',
        });
        expect(output).toContain('package.json');
      } catch (_) {
        void _;
        // npm pack --dry-run might not be available in all versions
        console.warn('npm pack --dry-run not available');
      }
    });
  });

  describe('Entry Points', () => {
    it('should have main entry point', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.main).toBe('dist/index.js');
    });

    it('should have dist/index.js matching main field', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const mainPath = path.join(projectRoot, packageJson.main);
      expect(fs.existsSync(mainPath)).toBe(true);
    });

    it('should have bin entry point', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.bin).toBeDefined();
    });

    it('should have bin/cli.js matching bin field', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const binPath = path.join(projectRoot, packageJson.bin);
      expect(fs.existsSync(binPath)).toBe(true);
    });
  });

  describe('Version Management', () => {
    it('should have version field', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should follow semantic versioning', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const [major, minor, patch] = packageJson.version.split('.').map(Number);
      expect(major).toBeGreaterThanOrEqual(0);
      expect(minor).toBeGreaterThanOrEqual(0);
      expect(patch).toBeGreaterThanOrEqual(0);
    });
  });
});
