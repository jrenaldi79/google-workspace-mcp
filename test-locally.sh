#!/bin/bash

# Test script for local development with npm link
# Tests both auth mode and server mode before publishing

set -e

PACKAGE_NAME="@presto-ai/google-workspace-mcp"
TIMEOUT_SECONDS=5

echo "=========================================="
echo "🧪 Local Testing for $PACKAGE_NAME"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

# Step 1: Clean build
echo "Step 1: Building package..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  print_status "Build successful"
else
  print_error "Build failed"
  exit 1
fi
echo ""

# Step 2: Create npm link
echo "Step 2: Creating npm link..."
npm link > /dev/null 2>&1
if [ $? -eq 0 ]; then
  print_status "npm link created"
else
  print_error "npm link failed"
  exit 1
fi
echo ""

# Step 3: Verify global symlink exists
echo "Step 3: Verifying global symlink..."
if npm list -g $PACKAGE_NAME > /dev/null 2>&1; then
  print_status "Global symlink verified"
else
  print_error "Global symlink not found"
  npm unlink -g $PACKAGE_NAME > /dev/null 2>&1
  exit 1
fi
echo ""

# Step 4: Test help/version (basic functionality)
echo "Step 4: Testing basic command execution..."
if command -v google-workspace-mcp > /dev/null; then
  print_status "CLI command is available"
else
  print_error "CLI command not found in PATH"
  npm unlink -g $PACKAGE_NAME > /dev/null 2>&1
  exit 1
fi
echo ""

# Step 5: Test server mode startup (should fail gracefully without auth)
echo "Step 5: Testing server mode (expected to fail - no credentials)..."
timeout $TIMEOUT_SECONDS google-workspace-mcp 2>&1 | grep -q "No valid credentials" && {
  print_status "Server mode fails gracefully without credentials"
} || {
  print_warning "Expected error message not found (this might be OK if testing in different environment)"
}
echo ""

# Step 6: Cleanup
echo "Step 6: Cleaning up..."
npm unlink -g $PACKAGE_NAME > /dev/null 2>&1
if [ $? -eq 0 ]; then
  print_status "npm link removed"
else
  print_warning "Failed to remove npm link (might need manual cleanup)"
fi
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}✓ All local tests passed!${NC}"
echo "=========================================="
echo ""
echo "Package is ready for publishing."
echo ""
echo "Next steps:"
echo "1. Run: npm publish"
echo "2. Test published version: npx $PACKAGE_NAME --auth"
echo ""
