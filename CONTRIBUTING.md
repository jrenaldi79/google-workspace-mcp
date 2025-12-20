# Contributing to @presto-ai/google-workspace-mcp

This document provides guidance for developers maintaining and contributing to the Google Workspace MCP server.

---

## Project Structure

### Key Directories

```
src/
├── index.ts                    # Main MCP server (entry point for server mode)
├── auth-flow.ts                # Interactive auth flow (entry point for --auth mode)
├── auth/                       # Authentication logic
│   ├── AuthManager.ts          # Main auth orchestrator
│   └── token-storage/          # Credential persistence
│       ├── hybrid-token-storage.ts       # Selects keytar or file
│       ├── keychain-token-storage.ts     # OS keychain integration
│       └── file-token-storage.ts         # Encrypted file storage
├── services/                   # Google Workspace API services
│   ├── GmailService.ts
│   ├── CalendarService.ts
│   ├── DriveService.ts
│   ├── ChatService.ts
│   ├── DocsService.ts
│   ├── SheetsService.ts
│   ├── SlidesService.ts
│   ├── PeopleService.ts
│   └── TimeService.ts
└── utils/
    ├── paths.ts                # Token storage paths (MODIFIED: OS-standard)
    ├── logger.ts               # Structured logging
    └── [other utilities]

bin/
└── cli.js                      # CLI entry point (dual-mode logic)

dist/                           # Compiled JavaScript (generated)
```

---

## Development Setup

### Prerequisites

```bash
# Required
- Node.js 18+
- npm 8+

# Optional but recommended
- git (for version control)
- Docker (for isolated testing)
```

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/jrenaldi79/google-workspace-mcp.git
cd google-workspace-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Verify build
ls -la dist/
```

---

## Development Workflow

### Making Changes

1. **Create a feature branch** (if not working directly on master):
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Edit TypeScript files** in `src/`:
   - Services: `src/services/*.ts`
   - Auth logic: `src/auth/*.ts`
   - Utilities: `src/utils/*.ts`

3. **Build** to compile TypeScript:
   ```bash
   npm run build
   ```

4. **Test locally** with npm link:
   ```bash
   ./test-locally.sh
   ```

5. **Commit with clear messages**:
   ```bash
   git commit -m "Fix: [description]"
   git commit -m "Feature: [description]"
   git commit -m "Docs: [description]"
   ```

6. **Push to GitHub**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub

---

## Syncing with Upstream

The upstream repository is `gemini-cli-extensions/workspace`. This package vendors code from that repo.

### Manual Sync Process

When the upstream receives updates:

#### Step 1: Check for Updates

```bash
# View upstream commits
# https://github.com/gemini-cli-extensions/workspace/commits/main

# Or check via API
curl https://api.github.com/repos/gemini-cli-extensions/workspace/commits/main \
  | jq '.sha'
```

#### Step 2: Download Updated Source

```bash
# Clone latest upstream
cd /tmp
git clone --depth 1 https://github.com/gemini-cli-extensions/workspace.git upstream-latest

# Compare changes
diff -r upstream-latest/workspace-server/src/ ~/google-workspace-mcp/src/
```

#### Step 3: Review Changes

Focus on:
- **Services** (`src/services/`): New Google Workspace API features?
- **Auth logic** (`src/auth/`): Better authentication methods?
- **Utils** (`src/utils/`): Bug fixes or improvements?

**Skip if already modified**:
- `src/utils/paths.ts` - We've already modified for persistent storage
- `bin/cli.js` - Our dual-mode CLI

#### Step 4: Apply Updates

**Option A: Manual merge** (safer)
```bash
# Copy specific files that changed
cp /tmp/upstream-latest/workspace-server/src/services/GmailService.ts \
   ~/google-workspace-mcp/src/services/

# Re-apply our patches if needed
# (paths.ts should already be patched)
```

**Option B: Full merge** (riskier, but captures all changes)
```bash
# Add upstream as a remote
git remote add upstream https://github.com/gemini-cli-extensions/workspace.git

# Fetch upstream
git fetch upstream main

# Merge workspace-server/ changes
# (This is complex due to directory structure differences)
# Usually better to do Option A
```

#### Step 5: Re-apply Our Patches

Our key modification is in `src/utils/paths.ts`:

```typescript
// Ensure this is present:
function getConfigDirectory(): string {
  // OS-standard path logic
  // macOS/Linux: ~/.config/google-workspace-mcp/
  // Windows: %APPDATA%/google-workspace-mcp/
  // Override: GOOGLE_WORKSPACE_MCP_HOME env var
}
```

If upstream changed `paths.ts`, merge their changes and re-apply ours.

#### Step 6: Test and Commit

```bash
# Build
npm run build

# Test
./test-locally.sh

# Commit
git commit -m "Sync: Update from gemini-cli-extensions/workspace

Upstream commits: [commit hashes]
Changes: [Brief description of what changed]
Re-applied: src/utils/paths.ts patches for persistent storage"

# Push
git push origin master
```

#### Step 7: Release New Version

```bash
# Update version in package.json
npm version patch  # or minor/major

# Publish
npm publish
```

---

## Automated Sync Monitoring

A GitHub Action runs weekly to check for upstream updates:

**File**: `.github/workflows/upstream-sync-check.yml`

This action:
1. Fetches latest upstream commits
2. Compares against last known commit
3. Creates an issue if updates found

**When an issue is created**:
1. Review the issue for what changed
2. Follow the "Manual Sync Process" above
3. Close the issue when sync is complete

---

## Code Style & Standards

### TypeScript

- Use `strict` mode (enabled in `tsconfig.json`)
- Prefer `const` over `let` over `var`
- Use explicit type annotations
- Avoid `any` - use proper types

```typescript
// Good
const config: { timeout: number; retries: number } = {
  timeout: 5000,
  retries: 3,
};

// Bad
const config: any = {
  timeout: 5000,
  retries: 3,
};
```

### Error Handling

- Log errors with context
- Provide user-friendly error messages
- Don't swallow errors silently

```typescript
// Good
try {
  await authenticateUser();
} catch (error) {
  logToFile(`Auth failed: ${error instanceof Error ? error.message : String(error)}`);
  console.error('❌ Authentication failed. Please try again.');
  process.exit(1);
}

// Bad
try {
  await authenticateUser();
} catch (error) {
  // Silent failure
}
```

### Comments

- Comment **why**, not **what**
- Use JSDoc for public functions
- Keep comments updated with code changes

```typescript
// Good
/**
 * Ensures the config directory exists for storing credentials.
 * Creates the directory with secure permissions (700) if it doesn't exist.
 */
function ensureConfigDirectory(): void {
  // ...
}

// Bad
// Get config dir
function getConfigDir(): string {
  // ...
}
```

### Logging

Use the structured logger (`src/utils/logger.ts`):

```typescript
import { logToFile } from './utils/logger';

// File-based logging (doesn't pollute stderr)
logToFile('Auth flow started');

// Console output (for user-facing messages)
console.error('❌ Authentication failed');
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test src/__tests__/auth/AuthManager.test.ts

# Watch mode (re-run on changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Writing Tests

- Mock external dependencies (Google APIs, file system)
- Test happy path and error cases
- Use descriptive test names

```typescript
describe('AuthManager', () => {
  it('should save credentials to persistent storage', async () => {
    // Test implementation
  });

  it('should fail gracefully if credentials are invalid', async () => {
    // Test implementation
  });
});
```

---

## Building & Publishing

### Local Build

```bash
npm run build
ls -la dist/
```

### Pre-publish Checklist

- [ ] TypeScript builds without errors
- [ ] `npm test` passes
- [ ] `./test-locally.sh` passes
- [ ] CHANGELOG.md updated
- [ ] Version number updated in package.json
- [ ] No console.log statements (use logger instead)
- [ ] All error paths handled
- [ ] Documentation updated

### Publishing to npm

```bash
# Ensure logged in
npm login

# Build and publish
npm run build
npm publish --access public

# Verify
npm view @presto-ai/google-workspace-mcp

# Test from npm
npx @presto-ai/google-workspace-mcp --auth
```

---

## Debugging

### Enable Debug Logging

```bash
# Run server with debug output
google-workspace-mcp --debug

# Or set environment variable
DEBUG=* npm start
```

### Inspect Token Storage

```bash
# Check if credentials exist
ls -la ~/.config/google-workspace-mcp/

# Check token file (encrypted, so will be binary)
file ~/.config/google-workspace-mcp/token.json

# Check keychain (macOS)
security dump-keychain | grep google-workspace-mcp
```

### Common Issues

**"Cannot find module @modelcontextprotocol/sdk"**
```bash
npm install
npm run build
```

**"Token file not found"**
```bash
google-workspace-mcp --auth
# And complete OAuth flow
```

**"Browser won't open"**
```bash
# Check if browser is available
which open  # macOS
which xdg-open  # Linux
which start  # Windows

# If not available, manually grant OAuth access by visiting:
# https://accounts.google.com/o/oauth2/v2/auth
```

---

## Performance Considerations

### Token Storage

- Keytar is faster but requires system libraries
- File storage is fallback when keytar unavailable
- Both encrypt sensitive credentials

### Service Initialization

- Services are lazy-loaded (created only when needed)
- Auth manager caches authenticated client
- Avoid creating new service instances unnecessarily

```typescript
// Good: Reuse authManager
const authManager = new AuthManager(SCOPES);
const gmailService = new GmailService(authManager);
const calendarService = new CalendarService(authManager);

// Bad: Create multiple auth managers
const gm = new GmailService(new AuthManager(SCOPES));
const cal = new CalendarService(new AuthManager(SCOPES));
```

---

## Security Considerations

### Credentials

- Never log full credentials
- Use secure file permissions (600 for files, 700 for directories)
- Credentials are encrypted by default (via keytar/file-storage)
- Master encryption key is machine/user-specific

### OAuth Tokens

- Tokens refresh automatically with 5-minute buffer
- Tokens stored in OS keychain (encrypted)
- User must run `--auth` to grant initial access
- User cannot revoke access from CLI (must use Google account settings)

### Environment Variables

- `GOOGLE_WORKSPACE_MCP_HOME` - Override credential storage location
- No secrets should be in environment variables normally
- All config in persistent storage or env vars is treated securely

---

## Troubleshooting Guide

### "Could not find project root"

**Before our changes**, the code would error if it couldn't find `gemini-extension.json`.

**After our changes**, it should always work because we use OS-standard paths.

If you still see this error:
1. You might be running old compiled code
2. Run `npm run build` again
3. Check that `src/utils/paths.ts` has our modifications

### Dependencies Won't Install

```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules/ package-lock.json
npm install
```

### Module Import Errors

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Check that dist/ files exist after build
npm run build
ls dist/
```

---

## Releasing New Versions

### Version Strategy

We follow Semantic Versioning:
- `1.0.0` - Initial stable release
- `1.0.x` - Bug fixes and patches
- `1.x.0` - New features (backward compatible)
- `x.0.0` - Breaking changes

### Release Checklist

1. Update CHANGELOG.md
2. Update version in package.json
3. Commit with message: `Release: v1.x.x`
4. Tag: `git tag v1.x.x`
5. Push: `git push origin master && git push origin v1.x.x`
6. Publish: `npm publish`

---

## Support & Questions

- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discussions**: GitHub Discussions for general questions
- **Upstream**: Check [gemini-cli-extensions/workspace](https://github.com/gemini-cli-extensions/workspace) for MCP server details

---

## License

This project is MIT licensed. See LICENSE file for details.

Original code from [gemini-cli-extensions/workspace](https://github.com/gemini-cli-extensions/workspace) is Apache 2.0 licensed.
