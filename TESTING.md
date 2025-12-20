# Testing Guide for @presto-ai/google-workspace-mcp

This guide covers testing strategies for the Google Workspace MCP server before publishing.

---

## Quick Start

### Automated Local Testing

```bash
# Run the automated test script
./test-locally.sh
```

This script performs:
- ✅ Clean build
- ✅ npm link creation
- ✅ Symlink verification
- ✅ CLI availability check
- ✅ Server mode startup verification (expects graceful failure without credentials)
- ✅ Cleanup

---

## Manual Testing

### Prerequisites

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

### Test 1: Build Verification

```bash
# Clean build from scratch
rm -rf dist/
npm run build

# Verify dist/ contains compiled files
ls -la dist/
# Should show: index.js, auth-flow.js, auth/, services/, utils/, etc.
```

**Expected**: Build completes without errors, dist/ directory populated.

---

### Test 2: npm link Setup

```bash
# Create global symlink
npm link

# Verify it's available globally
which google-workspace-mcp
npm list -g @presto-ai/google-workspace-mcp
```

**Expected**:
- Command is in PATH: `/usr/local/bin/google-workspace-mcp` (or equivalent)
- Global npm list shows the package

---

### Test 3: Auth Mode (--auth flag)

**⚠️ Important: This requires interactive browser access**

```bash
# Run auth mode
google-workspace-mcp --auth
```

**Expected flow**:
1. Prints: "🔐 Starting Google Workspace MCP authentication..."
2. Browser opens to Google OAuth consent screen
3. User logs in with Google account
4. User grants "Google Workspace" permissions
5. Browser shows success redirect
6. CLI prints: "✅ Authentication successful!"
7. Credentials saved to: `~/.config/google-workspace-mcp/token.json`

**Verify credentials were saved**:
```bash
ls -la ~/.config/google-workspace-mcp/
# Should show: token.json, .master-key
```

---

### Test 4: Server Mode (Default)

**After completing auth mode test above:**

```bash
# Start server (will timeout after a few seconds)
timeout 5 google-workspace-mcp

# Or in background:
google-workspace-mcp &
SERVER_PID=$!

# Wait 2 seconds for startup
sleep 2

# Check if process is running
ps -p $SERVER_PID

# Kill the process
kill $SERVER_PID
```

**Expected output**:
```
Google Workspace MCP Server is running (registerTool). Listening for requests...
```

**Expected behavior**: Process starts, prints ready message, listens on stdio.

---

### Test 5: Server Mode Without Credentials

```bash
# Delete credentials (if you want to test this)
rm -rf ~/.config/google-workspace-mcp/

# Try to start server
google-workspace-mcp
```

**Expected behavior**:
```
❌ No valid credentials found.

Please run authentication first:
  npx @presto-ai/google-workspace-mcp --auth

```

**Exit code**: 1 (failure)

---

### Test 6: Verify CLI Execution Paths

```bash
# Test from different directories to ensure paths resolve correctly

cd /tmp
google-workspace-mcp --auth  # Should still find ~/.config/google-workspace-mcp/

cd ~
google-workspace-mcp --auth  # Should work from home directory

cd /
google-workspace-mcp --auth  # Should work from root
```

**Expected**: Works from any directory because credentials are in home directory.

---

### Test 7: Environment Variable Override

```bash
# Test GOOGLE_WORKSPACE_MCP_HOME override
export GOOGLE_WORKSPACE_MCP_HOME=/tmp/test-creds
google-workspace-mcp --auth

# Verify credentials saved to custom location
ls -la /tmp/test-creds/
# Should show: token.json, .master-key

# Reset override
unset GOOGLE_WORKSPACE_MCP_HOME
```

**Expected**: Credentials saved to custom location when env var is set.

---

## Integration Tests with MCP Clients

### Test 8: Claude Desktop Configuration

1. **Add to Claude Desktop config**:
   ```bash
   # macOS
   nano ~/Library/Application\ Support/Claude/claude_desktop_config.json

   # Linux
   nano ~/.config/Claude/claude_desktop_config.json
   ```

2. **Add server configuration**:
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

3. **Restart Claude Desktop**
   - Close Claude Desktop completely
   - Reopen it
   - Check MCP server is connected

4. **Test a simple tool** (once published to npm):
   - Ask Claude: "What's the current date and time?"
   - Should return date/time from `time.getCurrentDate` tool

---

### Test 9: Claude Code CLI Configuration

1. **Add to Claude Code CLI config**:
   ```bash
   nano ~/.claude/config.json
   ```

2. **Add server configuration**:
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

3. **Restart Claude Code CLI**

4. **Test with Claude Code**:
   - Use `claude run "your command"`
   - Should have access to Google Workspace tools

---

## Testing Checklist

Use this checklist before publishing:

### Pre-publish Testing

- [ ] `npm run build` succeeds without TypeScript errors
- [ ] `dist/` directory contains compiled `.js` files
- [ ] `npm link` creates global symlink without errors
- [ ] `which google-workspace-mcp` shows correct path
- [ ] `npm list -g @presto-ai/google-workspace-mcp` shows package
- [ ] `google-workspace-mcp --auth` opens browser and saves tokens
- [ ] Credentials saved to correct location:
  - [ ] macOS/Linux: `~/.config/google-workspace-mcp/`
  - [ ] Token file exists: `~/.config/google-workspace-mcp/token.json`
  - [ ] Master key exists: `~/.config/google-workspace-mcp/.master-key`
- [ ] `google-workspace-mcp` (server mode) starts successfully
- [ ] Server outputs: "Google Workspace MCP Server is running..."
- [ ] Server can be killed with Ctrl+C
- [ ] Server fails gracefully without credentials
- [ ] Error message instructs user to run `--auth`
- [ ] `GOOGLE_WORKSPACE_MCP_HOME` environment variable works
- [ ] Test from multiple directories (different working dirs)
- [ ] `npm unlink -g @presto-ai/google-workspace-mcp` removes link

### Publishing to npm

**⚠️ IMPORTANT**: Run `npm publish` from **your terminal**, not from Claude Code. The @presto-ai scope requires 2FA authentication, which cannot be handled by automated tools.

```bash
# From your terminal:
npm publish
```

npm will prompt you to authenticate with your security key or authenticator app. Complete the 2FA authentication when prompted.

### Post-publish Testing (after npm publish)

- [ ] `npx @presto-ai/google-workspace-mcp --auth` works
- [ ] Package installs from npm without errors
- [ ] Credentials saved to same location as locally-linked version
- [ ] Configure in Claude Desktop
- [ ] Claude Desktop connects to MCP server
- [ ] Can execute a simple tool (e.g., `time.getCurrentDate`)
- [ ] Configure in Claude Code CLI
- [ ] Claude Code CLI can access tools
- [ ] Test basic operations:
  - [ ] List calendars
  - [ ] Get current user profile
  - [ ] Search Gmail
  - [ ] List Drive files

---

## Troubleshooting

### Build Fails

```bash
# Check Node version
node --version  # Should be 18+

# Try clean rebuild
rm -rf dist/ node_modules/
npm install
npm run build
```

### npm link Not Working

```bash
# Manually remove old link
npm unlink -g @presto-ai/google-workspace-mcp

# Try again
npm link

# Verify
npm list -g @presto-ai/google-workspace-mcp
```

### Auth Flow Doesn't Open Browser

```bash
# Check if browser launcher is working
# Try opening a URL manually to verify browser availability

# If using remote/headless environment:
# Auth flow will fail (no X11 or browser available)
# This is expected - run --auth on desktop machine instead
```

### "No valid credentials found" After Auth

```bash
# Check permissions on config directory
ls -la ~/.config/google-workspace-mcp/
chmod 700 ~/.config/google-workspace-mcp/
chmod 600 ~/.config/google-workspace-mcp/token.json

# Try auth again
google-workspace-mcp --auth
```

### Server Doesn't Connect to MCP Client

```bash
# Check if server starts manually
google-workspace-mcp &
sleep 2
ps aux | grep google-workspace-mcp

# Check logs for errors
# Server logs to stderr: look for any error messages

# Verify config file in MCP client is correct JSON
# Try with full path instead of npx:
# "command": "/usr/local/bin/google-workspace-mcp"
```

---

## Performance Benchmarks

### Startup Time

```bash
# Measure auth flow startup
time google-workspace-mcp --auth

# Measure server mode startup
time google-workspace-mcp &
sleep 2
kill %1
```

**Expected**:
- Auth flow: <2 seconds to open browser
- Server mode: <500ms to print "running" message

### Token Refresh

```bash
# Check token refresh happens automatically
# Monitor ~/.config/google-workspace-mcp/token.json modification time
ls -la ~/.config/google-workspace-mcp/token.json

# Run server for 30 minutes (simulate long session)
# Token should refresh automatically without user intervention
```

---

## Continuous Integration (CI/CD)

See `.github/workflows/` for automated testing on GitHub:

```bash
# Tests run on:
# - Push to master
# - Pull requests
# - Weekly scheduled checks for upstream updates

# Local CI simulation:
npm run test
npm run test:coverage
npm run build
./test-locally.sh
```

---

## Test Data

### Test Credentials (for development)

For development testing, you can use a test Google account:
- Email: `test-workspace-mcp@gmail.com` (set up if needed)
- Scopes: All Google Workspace APIs (Gmail, Calendar, Drive, etc.)

**Note**: Do not commit real credentials to the repository.

---

## Known Limitations

- **Auth mode requires interactive terminal**: Can't run `--auth` on headless servers
- **keytar dependency**: Requires system libraries on Linux (`libsecret-1-dev`)
- **OAuth tokens are user-specific**: Each user needs their own credentials
- **Token refresh**: Happens automatically, manual refresh via `auth.refreshToken` tool

---

## References

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Workspace APIs](https://developers.google.com/workspace/apis)
- [npm link Documentation](https://docs.npmjs.com/cli/v8/commands/npm-link)
