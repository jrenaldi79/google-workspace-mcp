# @presto-ai/google-workspace-mcp

[![npm version](https://img.shields.io/npm/v/@presto-ai/google-workspace-mcp.svg)](https://www.npmjs.com/package/@presto-ai/google-workspace-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

NPM-distributable Google Workspace MCP server for Claude Desktop, Claude Code CLI, and Chatwise. Interact with Gmail, Calendar, Drive, Docs, Sheets, Chat, and more through Claude.

## Quick Start

### 1. Authenticate

```bash
npx @presto-ai/google-workspace-mcp --auth
```

This opens your browser to authorize Google Workspace access. Your credentials will be saved securely.

### 2. Configure Your MCP Client

#### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

#### Claude Code CLI

Edit `~/.claude/config.json`:

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

#### Chatwise

Configure server command in settings:
```
npx -y @presto-ai/google-workspace-mcp
```

### 3. Restart Your MCP Client

Your credentials are stored securely in:
- **macOS/Linux**: `~/.config/google-workspace-mcp/`
- **Windows**: `%APPDATA%/google-workspace-mcp/`

## Features

### Supported Google Workspace Services

- **Gmail**: Search emails, read messages, send emails, create/manage drafts, modify labels
- **Google Calendar**: List calendars, create/read/update/delete events, find free time, manage attendees
- **Google Drive**: Search files, download documents, access metadata, organize by folders
- **Google Docs**: Read document content, create documents, insert/append/replace text
- **Google Sheets**: Read spreadsheet ranges, get metadata, append data
- **Google Chat**: Send messages, read threads, create spaces, list members
- **Google Slides**: Read presentations, extract text, get metadata
- **Google People**: Get user profiles, retrieve contact information
- **Time Utilities**: Get current date/time in any timezone

### Available MCP Tools

Once connected, Claude has access to 40+ tools including:
- `gmail.search` - Search emails with Gmail query syntax
- `gmail.send` - Send emails directly
- `calendar.createEvent` - Schedule meetings
- `drive.search` - Find files in Google Drive
- `docs.create` - Create new Google Docs
- `docs.replaceText` - Update document content
- `sheets.getRange` - Read spreadsheet data
- `chat.sendMessage` - Send messages to Google Chat spaces
- `people.getMe` - Get your profile information
- And many more...

See [CLAUDE.md](./CLAUDE.md) for the complete list of available tools and their parameters.

## Configuration

### Environment Variables

```bash
# Override credential storage location (optional)
export GOOGLE_WORKSPACE_MCP_HOME=/custom/path/for/credentials

# Set logging level (optional, default: INFO)
# Options: ERROR, WARN, INFO, DEBUG
export LOG_LEVEL=DEBUG

# Or use --debug flag for quick debug mode
npx @presto-ai/google-workspace-mcp --debug
```

### Logging

Logs are automatically written to `~/.config/google-workspace-mcp/logs/server.log` (macOS/Linux) or `%APPDATA%\google-workspace-mcp\logs\server.log` (Windows).

**Log Levels:**
- **ERROR**: Critical errors only (always shown in console + file)
- **WARN**: Warnings and errors (shown in console + file)
- **INFO**: General information, warnings, and errors (default, file only)
- **DEBUG**: Detailed debugging information (file only)

Enable debug logging to troubleshoot issues:
```bash
LOG_LEVEL=DEBUG npx @presto-ai/google-workspace-mcp
# or
npx @presto-ai/google-workspace-mcp --debug
```

### Credential Storage

Credentials are automatically encrypted and stored in platform-standard locations:

| Platform | Location |
|----------|----------|
| macOS | `~/.config/google-workspace-mcp/` |
| Linux | `~/.config/google-workspace-mcp/` |
| Windows | `%APPDATA%/google-workspace-mcp/` |
| Custom | `$GOOGLE_WORKSPACE_MCP_HOME/` (if set) |

Files stored:
- `token.json` - Encrypted OAuth token
- `.master-key` - Encryption master key (for file-based storage)

**Security**: Credentials are encrypted using your machine's OS keychain (or encrypted file storage on Linux). They are never transmitted or logged.

## Platform Support

- ✅ macOS (tested on Sonoma, Ventura)
- ✅ Linux (Ubuntu, Debian, Fedora)
- ✅ Windows 10+
- ✅ Works with any MCP-compatible client

## Requirements

- Node.js 18 or higher
- npm 8 or higher
- Active Google Account with Google Workspace access
- Web browser for OAuth authentication (required once for --auth setup)

## Troubleshooting

### "No valid credentials found"

Run authentication again:
```bash
npx @presto-ai/google-workspace-mcp --auth
```

### Token refresh errors

Delete the credentials and re-authenticate:
```bash
rm -rf ~/.config/google-workspace-mcp  # macOS/Linux
rmdir %APPDATA%\google-workspace-mcp   # Windows

npx @presto-ai/google-workspace-mcp --auth
```

### Server won't start

1. Ensure you've run `--auth` first
2. Check that credentials file exists in your config directory
3. Verify file permissions (should be readable by your user)
4. Check logs: Run with `--debug` flag to see detailed error messages

### Browser won't open during --auth

If the OAuth browser doesn't open automatically:
1. The auth flow will provide a manual URL to visit
2. Visit the URL in your browser manually
3. Complete the OAuth consent
4. Return to the terminal to finish setup

### "libsecret-1-dev" errors on Linux

If you see "Could not find keytar module":
```bash
# Install required system libraries
sudo apt-get install libsecret-1-dev  # Debian/Ubuntu
sudo dnf install libsecret-devel      # Fedora/RHEL

# Reinstall npm dependencies
rm -rf node_modules/
npm install
```

For more detailed troubleshooting, see [TESTING.md](./TESTING.md#troubleshooting).

## Documentation

- **[TESTING.md](./TESTING.md)** - Complete testing guide, pre-publish checklist, integration tests
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Developer guide, syncing with upstream, code standards
- **[CLAUDE.md](./CLAUDE.md)** - Architecture overview, available tools, development patterns

## Usage Examples

### Search emails and draft a response

```
User: Search my unread emails from the past week and draft a response to the most recent one from boss@company.com
```

Claude will:
1. Search your Gmail for unread emails from the past week
2. Find the most recent one from boss@company.com
3. Use `gmail.createDraft` to create a draft response

### Schedule a meeting

```
User: Schedule a 1-hour meeting with alice@company.com and bob@company.com next Tuesday at 2 PM about Q1 planning
```

Claude will:
1. Use `calendar.findFreeTime` to check availability
2. Use `calendar.createEvent` to schedule the meeting
3. Automatically add attendees and send invitations

### Create a document with spreadsheet data

```
User: Export last quarter's sales data from my spreadsheet to a new Google Doc
```

Claude will:
1. Search for the spreadsheet using `drive.search`
2. Read the data with `sheets.getRange`
3. Create a new Doc with `docs.create`
4. Format and insert the data

## Advanced Configuration

### Use in Docker

```dockerfile
FROM node:18-alpine
RUN npm install -g @presto-ai/google-workspace-mcp

# Run authentication
RUN npx @presto-ai/google-workspace-mcp --auth

# Start server
CMD ["npx", "@presto-ai/google-workspace-mcp"]
```

### Custom credential location

```bash
# Set custom location for credentials
export GOOGLE_WORKSPACE_MCP_HOME=/secure/storage/location

# Run authentication (will use custom location)
npx @presto-ai/google-workspace-mcp --auth

# Verify credentials saved
ls -la $GOOGLE_WORKSPACE_MCP_HOME/
```

### Multiple Google accounts

To use multiple Google accounts:
```bash
# Account 1
export GOOGLE_WORKSPACE_MCP_HOME=~/.config/gws-account1/
npx @presto-ai/google-workspace-mcp --auth

# Account 2
export GOOGLE_WORKSPACE_MCP_HOME=~/.config/gws-account2/
npx @presto-ai/google-workspace-mcp --auth

# Switch between accounts by setting the environment variable
```

## Performance & Limitations

- **Startup time**: ~500ms to establish MCP connection
- **OAuth tokens**: Automatically refresh with 5-minute buffer
- **API rate limits**: Subject to Google Workspace API quotas
- **Concurrent requests**: Handled by MCP protocol
- **Offline mode**: Not supported (requires internet connection)

## Troubleshooting Advanced Issues

### "Token refresh failed"

```bash
# Clear credentials and re-authenticate
rm -rf ~/.config/google-workspace-mcp/
npx @presto-ai/google-workspace-mcp --auth
```

### "403 Forbidden" errors

Usually means:
1. Your Google account doesn't have access to requested resource
2. Permissions weren't granted during `--auth`
3. Re-run `--auth` and ensure you grant all permissions

### "Service temporarily unavailable"

Usually a temporary Google API outage:
1. Wait a few minutes and try again
2. Check [Google Workspace Status Dashboard](https://www.google.com/appsstatus)

## Security & Privacy

- ✅ **OAuth 2.0**: Secure authentication with Google
- ✅ **Encrypted storage**: Credentials encrypted using OS keychain
- ✅ **No cloud sync**: Credentials stay on your machine
- ✅ **Minimal logging**: Error logs only, no credential logging
- ✅ **Open source**: Code is auditable and transparent

For security concerns, please open a GitHub issue.

## Support

- 📖 [Documentation](https://github.com/jrenaldi79/google-workspace-mcp)
- 🐛 [Report Issues](https://github.com/jrenaldi79/google-workspace-mcp/issues)
- 💡 [Discussions](https://github.com/jrenaldi79/google-workspace-mcp/discussions)

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and architecture details.

## License

MIT - See [LICENSE](./LICENSE)

## Credits

Based on [gemini-cli-extensions/workspace](https://github.com/gemini-cli-extensions/workspace)

---

**Made with ❤️ by Presto AI**
