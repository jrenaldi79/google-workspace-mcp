# @presto-ai/google-workspace-mcp

[![npm version](https://img.shields.io/npm/v/@presto-ai/google-workspace-mcp.svg)](https://www.npmjs.com/package/@presto-ai/google-workspace-mcp)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

NPM-distributable Google Workspace MCP server for Claude Desktop, Claude Code CLI, and other MCP clients. Interact with Gmail, Calendar, Drive, Docs, Sheets, Chat, and more through Claude.

Based on [gemini-cli-extensions/workspace](https://github.com/gemini-cli-extensions/workspace).

## Quick Start

### Configure Your MCP Client

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

Then restart Claude Desktop. The MCP server will prompt for authentication on first use.

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

## Supported Services

- **Gmail**: Search emails, read messages, send emails, create/manage drafts
- **Google Calendar**: List calendars, create/read/update/delete events, find free time
- **Google Drive**: Search files, download documents, access metadata
- **Google Docs**: Read document content, create documents, insert/replace text
- **Google Sheets**: Read spreadsheet ranges, get metadata, append data
- **Google Chat**: Send messages, read threads, create spaces
- **Google Slides**: Read presentations, extract text, get metadata
- **Google People**: Get user profiles, retrieve contact information

## Configuration

### Environment Variables

```bash
# Override credential storage location (optional)
export GOOGLE_WORKSPACE_MCP_HOME=/custom/path/for/credentials
```

### Credential Storage

Credentials are stored in platform-standard locations:

| Platform | Location |
|----------|----------|
| macOS | `~/.config/google-workspace-mcp/` |
| Linux | `~/.config/google-workspace-mcp/` |
| Windows | `%APPDATA%/google-workspace-mcp/` |

## Requirements

- Node.js 18 or higher
- Active Google Account with Google Workspace access
- Web browser for OAuth authentication

## Troubleshooting

### Token refresh errors

Delete the credentials and restart:
```bash
rm -rf ~/.config/google-workspace-mcp  # macOS/Linux
npx @presto-ai/google-workspace-mcp    # Will prompt for re-auth
```

### "libsecret" errors on Linux

```bash
sudo apt-get install libsecret-1-dev  # Debian/Ubuntu
sudo dnf install libsecret-devel      # Fedora/RHEL
```

## License

Apache-2.0 - See [LICENSE](./LICENSE)
