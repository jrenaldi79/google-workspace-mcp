# CLAUDE.md - @presto-ai/google-workspace-mcp

This file provides project-specific guidance for the Google Workspace MCP server package.

## Project Overview

**@presto-ai/google-workspace-mcp** is an NPM-distributable Model Context Protocol (MCP) server that enables Claude Desktop, Claude Code CLI, and Chatwise to access Google Workspace services (Gmail, Calendar, Drive, Docs, Sheets, Chat).

**Key Design Goal**: Solve the token persistence problem when running MCP servers via `npx` by storing credentials in OS-standard persistent directories instead of ephemeral npm cache locations.

**Architecture**: Dual-mode CLI with interactive authentication (`--auth`) and silent server mode (default).

## Essential Commands

### Development

```bash
npm install              # Install dependencies
npm run build            # Build TypeScript → dist/
npm run dev              # Development mode (if available)
```

### Testing

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Testing the Package Locally

```bash
npm link                 # Create global symlink
google-workspace-mcp --auth        # Test auth mode
google-workspace-mcp               # Test server mode
npm unlink -g @presto-ai/google-workspace-mcp  # Clean up
```

### Publishing

```bash
npm run build            # Ensure clean build
npm publish              # Publish to npm registry
```

## Architecture & Code Structure

### Dual-Mode CLI Design

**Auth Mode** (`--auth` flag):

- Entry: `bin/cli.js` detects `--auth` flag
- Calls: `src/auth-flow.ts` → `AuthManager.authenticate(force=true)`
- Behavior: Interactive OAuth flow in terminal
- Output: Saves tokens to persistent storage
- Exit: `process.exit(0)` after success/failure

**Server Mode** (default):

- Entry: `bin/cli.js` without `--auth` flag
- Checks: `AuthManager.hasValidCredentials()`
- If valid: Starts MCP server normally
- If missing: Prints helpful error, exits with code 1

### Key Files

```
src/
├── index.ts                        # Main MCP server entry point
├── auth-flow.ts                    # Auth mode implementation
├── utils/
│   └── paths.ts                    # OS-standard credential paths
└── auth/
    ├── AuthManager.ts              # Added: hasValidCredentials()
    └── token-storage/              # Modified for persistent paths
        ├── file-token-storage.ts
        └── keychain-token-storage.ts

bin/
└── cli.js                          # CLI entry point (shebang script)

dist/                              # Compiled output
├── index.js
├── auth-flow.js
├── utils/
│   └── paths.js
└── ...
```

### Persistent Storage Paths

Tokens are stored in OS-standard locations:

- **macOS/Linux**: `~/.config/google-workspace-mcp/`
- **Windows**: `%APPDATA%/google-workspace-mcp/`
- **Override**: `GOOGLE_WORKSPACE_MCP_HOME` environment variable

Files stored:

- `token.json` - Encrypted OAuth token (encrypted by keytar/file storage)
- `.master-key` - Encryption master key (for file storage fallback)

## Google Auth Integration

### Credentials Flow

1. **Upstream uses**: `google-auth-library` + `@google-cloud/local-auth`
2. **OAuth endpoints**: Google's standard OAuth 2.0 flow
3. **Token storage**: HybridTokenStorage (keytar → file fallback)
4. **Refresh**: Automatic refresh with 5-minute buffer

### Authentication Methods

- **Local Development**: OAuth browser redirect
- **Production**: Stored/refreshed tokens from persistent storage
- **Keytar**: OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)
- **Fallback**: Encrypted file storage if keytar unavailable

## Vendored Upstream Code

This package vendors code from `gemini-cli-extensions/workspace`:

- **Original**: GitHub: https://github.com/gemini-cli-extensions/workspace
- **Purpose**: Direct MCP service implementations (Gmail, Calendar, Drive, etc.)
- **Modifications**: Path resolution only; logic unchanged

**Maintenance**: GitHub Action monitors upstream for updates (weekly check).

## Testing Strategy

### Overview

This project uses **Jest** as the test runner with TypeScript support via ts-jest. Tests are located in `src/__tests__/` and organized to mirror source structure.

**Test Coverage:** 336 passing tests across 20+ test files

- Authentication & credential storage: 95%+ coverage
- Logging system: 95%+ coverage
- CLI entry points: 90%+ coverage
- Services (Gmail, Calendar, Drive, etc.): 80%+ coverage
- Utilities: 85%+ coverage

### Running Tests

**All tests:**

```bash
npm test
```

**Watch mode** (re-run on file changes):

```bash
npm run test:watch
```

**Specific test file:**

```bash
npm test src/__tests__/logger.test.ts
npm test src/__tests__/auth-flow.test.ts
npm test src/__tests__/auth/AuthManager.test.ts
```

**Coverage report:**

```bash
npm run test:coverage
```

**CI mode** (optimized for CI/CD):

```bash
npm run test:ci
```

### Test Organization

```
src/__tests__/
├── auth/                           # Authentication tests
│   ├── AuthManager.test.ts        # Core auth manager (250+ lines)
│   └── token-storage/
│       ├── file-token-storage.test.ts
│       ├── keychain-token-storage.test.ts
│       └── hybrid-token-storage.test.ts
├── services/                       # Google Workspace service tests
│   ├── GmailService.test.ts       # Gmail operations
│   ├── CalendarService.test.ts    # Calendar operations
│   ├── DriveService.test.ts       # Drive file operations
│   ├── DocsService.test.ts        # Docs manipulation
│   ├── SheetsService.test.ts      # Sheets operations
│   ├── ChatService.test.ts        # Chat messaging
│   └── ...
├── utils/                          # Utility function tests
│   ├── logger.test.ts             # Logging system (235+ lines)
│   ├── paths.test.ts              # Path resolution
│   ├── secure-browser-launcher.test.ts
│   └── ...
├── auth-flow.test.ts              # Auth flow entry point
├── cli.test.ts                    # CLI (bin/cli.js) behavior
└── server.test.ts                 # MCP server initialization
```

### Key Test Categories

#### 1. Authentication Tests (`src/__tests__/auth/`)

Critical path with 95%+ coverage:

- `AuthManager.authenticate()` - OAuth flow, browser opening
- `AuthManager.clearAuth()` - **Important**: Clears cached credentials before fresh auth
- `AuthManager.getAuthenticatedClient()` - Client retrieval and token refresh
- Token storage (keychain with file fallback)
- Credential encryption/decryption
- Token refresh with 5-minute buffer

**Important invariant**: Auth flow must clear old cached credentials before attempting fresh browser auth. This was a critical bug fix in v1.0.4.

#### 2. Logging Tests (`src/__tests__/utils/logger.test.ts`)

Critical path with 95%+ coverage:

- LogLevel enum (ERROR, WARN, INFO, DEBUG)
- Console output filtering (only ERROR and WARN to console)
- File logging (all levels to `~/.config/google-workspace-mcp/logs/server.log`)
- Emoji formatting (❌ for ERROR, ⚠️ for WARN)
- Timestamp formatting (ISO 8601)
- Backward compatibility (`setLoggingEnabled()` function)

**Key pattern**: ERROR/WARN shown in console, INFO/DEBUG written to file only (unless LOG_LEVEL=DEBUG)

#### 3. CLI Tests (`src/__tests__/cli.test.ts`)

Tests for bin/cli.js behavior:

- `--auth` flag detection (runs `runAuthFlow()`)
- `--debug` flag (sets `LOG_LEVEL=DEBUG`)
- `hasValidCredentials()` function (checks for token.json)
- Interactive terminal detection (`isTTY`)
- Auto-prompt on first run (interactive mode only)
- Graceful failure in non-interactive environments

#### 4. Service Tests (`src/__tests__/services/`)

Tests for each Google Workspace service:

- **Gmail**: Search, read, send, draft management
- **Calendar**: Event CRUD, scheduling, availability checks
- **Drive**: File search, download, metadata
- **Docs**: Read, create, text manipulation (with tab support)
- **Sheets**: Range reading, data appending
- **Chat**: Message sending, thread management

### Writing Tests

Follow this pattern for all new tests:

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('ComponentName', () => {
  beforeEach(() => {
    // Reset mocks and state before each test
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should do something specific', async () => {
      // Arrange: Set up test data
      const input = 'test data';

      // Act: Call the function
      const result = await myFunction(input);

      // Assert: Verify the result
      expect(result).toBe('expected');
    });

    it('should handle errors', () => {
      // Test error scenarios
      expect(() => {
        myFunction(null);
      }).toThrow('Expected error message');
    });
  });
});
```

### Mocking Strategy

Tests mock external dependencies:

```typescript
// Mock file system for logger tests
jest.mock('node:fs/promises', () => ({
  appendFile: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
}));

// Mock AuthManager in auth-flow tests
jest.mock('../auth/AuthManager');
const MockAuthManager = AuthManager as jest.MockedClass<typeof AuthManager>;
MockAuthManager.prototype.authenticate = jest.fn().mockResolvedValue({});

// Use jest.Mock to access call history
const mockFn = fs.appendFile as jest.Mock;
expect(mockFn).toHaveBeenCalledWith(...);
expect(mockFn.mock.calls.length).toBe(2);
```

### Test Execution Guidelines

**Before committing code:**

```bash
npm run build      # Verify TypeScript compiles
npm test          # Run all tests (should pass)
```

**Before publishing:**

```bash
npm run test:coverage  # Verify >85% coverage
npm test               # All tests must pass
npm run build          # Clean build with no errors
npm link               # Manual integration test
```

**In CI/CD (GitHub Actions):**

```bash
npm run test:ci                    # Fast parallel test run
npm run test:coverage              # Coverage validation
npm run build                      # Verify build succeeds
```

### Coverage Goals

- **Critical paths** (auth, logging, CLI): 95%+
- **Services**: 80%+
- **Utilities**: 85%+
- **Overall target**: >85%

View detailed coverage:

```bash
npm run test:coverage
# HTML report in coverage/lcov-report/index.html
```

### Common Test Issues

**"Cannot read properties of undefined":**

- Usually mock not returning expected value
- Solution: Ensure all mocks have proper return values

**"Logger not writing to file":**

- fs.appendFile mock not resolving properly
- Solution: Use `jest.fn().mockResolvedValue(undefined)`

**"AuthManager tests failing":**

- Check `clearAuth()` is called before `getAuthenticatedClient()`
- Verify mocks are cleared between tests with `jest.clearAllMocks()`

## Security & Secrets Management

### Pre-Commit Secret Scanning

This project uses **Husky** and **secretlint** to prevent accidental commits of secrets (API keys, tokens, credentials).

**How it works:**

1. Before each git commit, the pre-commit hook runs automatically
2. `secretlint` scans all staged files for secret patterns
3. If a secret is detected, the commit is blocked

**Detected Secret Types:**

| Provider         | Pattern                | Example                                     |
| ---------------- | ---------------------- | ------------------------------------------- |
| **AWS**          | Secret Access Keys     | `AKIA[16 chars]` or `aws_secret_access_key` |
| **GitHub**       | Personal Access Tokens | `ghp_...`, `gho_...`, `ghs_...`, etc.       |
| **Slack**        | Bot/User Tokens        | `xoxb-...`, `xoxp-...`                      |
| **npm**          | Auth Tokens            | `npm_...` (36+ chars)                       |
| **Google Cloud** | Service Account Keys   | `-----BEGIN PRIVATE KEY-----`               |
| **Private Keys** | PEM Format             | RSA, DSA, EC, OpenSSH keys                  |
| **OpenRouter**   | API Keys               | `sk-or-v1-...`                              |
| **OpenAI**       | API Keys               | `sk-...` (32+ chars)                        |
| **Anthropic**    | API Keys               | `sk-ant-...` or `claude-key-...`            |
| **Stripe**       | API Keys               | `sk_live_...`, `sk_test_...`                |
| **Daytona**      | Tokens                 | `dt_...` (20+ chars)                        |
| **Firebase**     | API Keys               | Firebase format                             |

### Bypassing Pre-Commit Checks (⚠️ Use with Caution)

If you need to force a commit (only for emergencies):

```bash
git commit --no-verify
```

**WARNING:** Only use this for non-secret commits. Never bypass checks to commit credentials!

### Configuration

The secret detection rules are defined in `.secretlintrc.json`:

- Rules are automatically applied to all staged files
- Custom patterns can be added for project-specific secrets
- Run `npx secretlint` manually to check for secrets:
  ```bash
  npx secretlint "**"  # Check all files
  ```

### Best Practices

1. **Never commit secrets** - Always use environment variables or `.env` files (which are .gitignored)
2. **Rotate compromised keys** - If you accidentally commit a secret, rotate it immediately
3. **Review before committing** - Use `git diff` to verify you're not staging credentials
4. **Use `.gitignore`** - Ensure these files are ignored:
   ```
   .env
   .env.local
   .env.*.local
   credentials.json
   token.json
   ~/.config/google-workspace-mcp/
   ```

### If a Secret is Accidentally Committed

1. **Stop and assess** - Determine what was leaked
2. **Rotate credentials** - Generate new API keys, tokens, or credentials
3. **Rewrite history** (if not pushed):
   ```bash
   git reset HEAD~1
   # Remove the secret
   git add .
   git commit -m "Remove accidental secret"
   ```
4. **Alert your team** - If already pushed, notify relevant services
5. **Enable branch protection** - Require reviews before merging to main

## Environment Variables

### Runtime

- `GOOGLE_WORKSPACE_MCP_HOME` - Override credential storage location (optional)
- `LOG_LEVEL` - Logging level: ERROR, WARN, INFO (default), DEBUG
- `NODE_ENV` - Development/production mode

### Development

- (None required for local testing)

## Logging & Debugging

### Log Levels

The project uses a structured logging system with four levels:

- **ERROR** (0): Critical errors - always printed to console and file
- **WARN** (1): Warnings - printed to console and file
- **INFO** (2): General information (default) - file only
- **DEBUG** (3): Detailed debugging - file only

### Enable Debug Logging

```bash
# Method 1: Environment variable
LOG_LEVEL=DEBUG npx @presto-ai/google-workspace-mcp

# Method 2: CLI flag
npx @presto-ai/google-workspace-mcp --debug

# Method 3: When developing locally
npm run build
LOG_LEVEL=DEBUG node ./bin/cli.js --auth
```

### Log Files

Logs are written to: `~/.config/google-workspace-mcp/logs/server.log`

View logs:

```bash
tail -f ~/.config/google-workspace-mcp/logs/server.log
```

### Using Logger in Code

```typescript
import { error, warn, info, debug } from './utils/logger';

// ERROR - always shown in console
error('Failed to authenticate');

// WARN - shown in console when LOG_LEVEL >= WARN
warn('Retry attempt 3 of 5');

// INFO - shown in file only (default)
info('User authenticated successfully');

// DEBUG - shown in file only when LOG_LEVEL=DEBUG
debug('Token refresh in progress');
```

## MCP Server Implementation

### Services Available

The upstream MCP server exposes tools for:

- **Gmail**: Search, read, send, draft management
- **Calendar**: Create, read, update, delete events
- **Drive**: File search, download, metadata
- **Docs**: Read, create, edit documents
- **Sheets**: Read ranges, append data
- **Chat**: Send messages, read threads, create spaces

### MCP Protocol

- **Version**: MCP v1
- **Transport**: stdio (stdin/stdout)
- **Tools**: Exposed via `tools` handler
- **Resources**: File-based for Drive documents

## Package Configuration

### package.json Key Fields

```json
{
  "name": "@presto-ai/google-workspace-mcp",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "google-workspace-mcp": "./bin/cli.js"
  },
  "files": ["dist/", "bin/", "README.md"],
  "publishConfig": {
    "access": "public"
  }
}
```

### npm Link Testing

Before publishing, test with `npm link`:

```bash
npm run build
npm link                  # Global symlink
npx @presto-ai/google-workspace-mcp --auth
npm unlink -g @presto-ai/google-workspace-mcp
```

## NPM Publishing

### Pre-publish Checklist

- [ ] `npm run build` succeeds without errors
- [ ] `npm link` creates working symlink
- [ ] Auth mode: Opens browser, saves tokens correctly
- [ ] Server mode: Starts without --auth if tokens exist
- [ ] Server mode: Exits gracefully if --auth required

### Publishing Steps

```bash
# 1. Ensure logged in
npm login

# 2. Build
npm run build

# 3. Test locally
npm link
# ... test ...
npm unlink -g @presto-ai/google-workspace-mcp

# 4. Publish
npm publish --access public

# 5. Verify
npm view @presto-ai/google-workspace-mcp
npx @presto-ai/google-workspace-mcp --auth
```

### Version Management

Follow semantic versioning:

- `1.0.0` - Initial release
- `1.0.x` - Bug fixes and token storage improvements
- `1.x.0` - New MCP services, upstream features
- `x.0.0` - Breaking changes (CLI changes, auth flow changes)

## Upstream Synchronization

### GitHub Action

Automated check runs weekly (Monday 00:00 UTC):

- Fetches latest commit from upstream
- Creates issue if new commits detected
- No automatic merge (manual review required)

### Manual Sync Workflow

1. Check upstream: `https://github.com/gemini-cli-extensions/workspace`
2. Review changes
3. Copy modified files to `src/`
4. Re-apply patches (paths.ts changes)
5. Test locally with `npm link`
6. Publish new version

## Common Issues & Solutions

### Development

- **Build fails**: Ensure TypeScript is strict mode compatible
- **Auth mode doesn't open browser**: Check `@google-cloud/local-auth` is installed
- **Tokens not persisting**: Verify storage path permissions (fs.mkdirSync)
- **Keytar errors on Linux**: Install system dependencies (libsecret-1-dev)

### Testing

- **Temp directory cleanup**: Use jest cleanup hooks
- **File system mocking**: Mock fs module or use temp directories
- **Process spawning**: Use child_process.spawn for CLI testing

### Publishing

- **403 Forbidden**: Verify npm login and organization access
- **Version already published**: Increment version number
- **Missing files**: Check .npmignore and package.json files array

## Response Constraints

- Do not remove existing code unless necessary
- Do not remove comments or commented-out code unless necessary
- Do not change code formatting unless important for new functionality
- Maintain existing logging patterns and structured log format

## Maintenance Guidelines

Update this file when:

- [ ] Adding new MCP services
- [ ] Changing authentication flow
- [ ] Modifying storage paths or structure
- [ ] Updating publishing procedures
- [ ] Discovering new patterns or best practices
