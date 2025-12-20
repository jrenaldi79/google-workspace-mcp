# Testing Guide for @presto-ai/google-workspace-mcp

This guide covers how to test the MCP server locally before publishing to npm.

## Quick Start: Local Testing with npm link

Test the CLI as if it's installed globally (without publishing):

```bash
# Build and link the package locally
npm run build
npm link

# Test the CLI from anywhere
google-workspace-mcp --auth

# When done testing, unlink
npm unlink -g @presto-ai/google-workspace-mcp
```

## Method 1: npm link (Best for CLI Development)

`npm link` creates a symlink to your local package, allowing you to test as if it's installed globally.

### Setup

```bash
cd /path/to/google-workspace-mcp
npm run build    # Build the distribution
npm link         # Create global symlink
```

### Test CLI

```bash
# From any directory
google-workspace-mcp --auth        # Test authentication
google-workspace-mcp               # Test server startup

# Or with npx simulation
npx google-workspace-mcp --auth
```

### Verify Installation

```bash
which google-workspace-mcp
ls -la $(which google-workspace-mcp)
```

### Cleanup

```bash
npm unlink -g @presto-ai/google-workspace-mcp
npm unlink
```

## Method 2: npm pack (Simulate npm Publishing)

`npm pack` creates a tarball exactly as npm would publish it. This is the most accurate simulation of a real npm install.

### Create Package Tarball

```bash
npm run build
npm pack
# Creates: presto-ai-google-workspace-mcp-1.0.7.tgz
```

### Install Locally from Tarball

```bash
# Install globally
npm install -g ./presto-ai-google-workspace-mcp-1.0.7.tgz

# Or install in another project
cd /path/to/test-project
npm install /path/to/presto-ai-google-workspace-mcp-1.0.7.tgz
```

### Test It

```bash
google-workspace-mcp --auth
```

### Verify Bin Field

```bash
# Check that the binary is installed correctly
which google-workspace-mcp
cat $(which google-workspace-mcp)  # Should show shebang and CLI code
```

### Cleanup

```bash
npm uninstall -g @presto-ai/google-workspace-mcp
rm presto-ai-google-workspace-mcp-*.tgz
```

## Method 3: Automated Pre-Publish Validation

Before publishing to npm, run the validation script to catch configuration issues:

```bash
npm run validate:publish
```

This checks:

- ✅ package.json configuration (name, version, bin field)
- ✅ CLI executable exists and is executable
- ✅ Build output (dist/index.js, dist/auth-flow.js, source maps)
- ✅ Files array includes all necessary files
- ✅ Entry points (main, bin) are correct
- ✅ Scripts configuration (prepublishOnly, build, etc.)

## Method 4: CLI Integration Tests

Run automated tests that validate the package configuration:

```bash
# Run all tests
npm test

# Run only CLI integration tests
npm test -- src/__tests__/bin/cli.integration.test.ts

# Run with coverage
npm run test:coverage
```

### Test Coverage

The CLI integration tests verify:

- Package configuration (name, version, bin field)
- CLI executable (shebang, permissions)
- Build output (dist files, source maps)
- Files array configuration
- Entry points (main, bin)
- Version management (semver format)

## Full Testing Workflow Before Publishing

Follow this complete checklist before publishing to npm:

```bash
# 1. Run unit and integration tests
npm test

# 2. Run linting
npm run lint

# 3. Format code
npm run format

# 4. Run validation
npm run validate:publish

# 5. Test CLI with npm link
npm run build
npm link
google-workspace-mcp --auth  # Test auth flow
npm unlink -g @presto-ai/google-workspace-mcp
npm unlink

# 6. Test with npm pack
npm pack
npm install -g ./presto-ai-google-workspace-mcp-*.tgz
google-workspace-mcp --auth
npm uninstall -g @presto-ai/google-workspace-mcp
rm presto-ai-google-workspace-mcp-*.tgz

# 7. Ready to publish!
npm publish --otp=<YOUR_CODE>
```

## Testing in Claude Desktop Configuration

After publishing to npm, test in Claude Desktop:

### 1. Update claude_desktop_config.json

```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "npx",
      "args": ["-y", "@presto-ai/google-workspace-mcp"]
    }
  }
}
```

### 2. Restart Claude Desktop

The MCP server will automatically:

1. Download the latest version from npm
2. Run authentication if credentials don't exist
3. Connect and serve tools to Claude

## Troubleshooting

### Issue: "command not found: google-workspace-mcp"

**Solution:**

```bash
# Check that npm link worked
which google-workspace-mcp
npm link -g @presto-ai/google-workspace-mcp
```

### Issue: npx hangs on first run

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Try again
npx @presto-ai/google-workspace-mcp --auth
```

### Issue: Build fails

**Solution:**

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
npm run validate:publish
```

### Issue: Bin field not recognized

**Solution:**

```bash
# Verify bin field format
grep '"bin"' package.json
# Should see: "bin": "./bin/cli.js"

# Check CLI exists and is executable
test -x bin/cli.js && echo "✓ CLI executable"
head -1 bin/cli.js | grep '#!/usr/bin/env node' && echo "✓ Shebang correct"
```

## Environment Variables for Testing

```bash
# Override credentials location
export GOOGLE_WORKSPACE_MCP_HOME=/tmp/test-credentials

# Enable debug logging
export LOG_LEVEL=DEBUG

# Run CLI
google-workspace-mcp --auth
```

## Continuous Integration (CI)

The test suite runs in CI with:

```bash
npm run test:ci
```

This uses optimized settings for CI environments:

- Single worker to avoid memory issues
- Coverage reporting
- No interactive output
