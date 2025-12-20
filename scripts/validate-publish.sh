#!/bin/bash

# Pre-publish validation script
# Tests package.json configuration, bin field, build output, and more
# Run before publishing: npm run validate:publish

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔍 Running pre-publish validation..."
echo ""

passed=0
failed=0

# Test function - simplified
test_check() {
  local name=$1
  local check=$2

  printf "  ✓ %-45s " "$name..."
  if eval "$check" >/dev/null 2>&1; then
    echo "PASS"
    ((passed++))
  else
    echo "FAIL"
    ((failed++))
  fi
}

echo "📦 Package Configuration"
test_check "package.json exists" "test -f package.json"
test_check "name is @presto-ai/google-workspace-mcp" "grep -q '@presto-ai/google-workspace-mcp' package.json"
test_check "version follows semver" "grep -qE '\"version\": \"[0-9]+\.[0-9]+\.[0-9]+\"' package.json"

echo ""
echo "📝 CLI Configuration"
test_check "bin/cli.js exists" "test -f bin/cli.js"
test_check "bin/cli.js is executable" "test -x bin/cli.js"
test_check "bin field is ./bin/cli.js" "grep -q '\"bin\": \"./bin/cli.js\"' package.json"

echo ""
echo "🏗️  Build Output"
test_check "dist/index.js exists" "test -f dist/index.js"
test_check "dist/index.js has content" "test -s dist/index.js"
test_check "dist/index.js.map exists" "test -f dist/index.js.map"
test_check "dist/auth-flow.js exists" "test -f dist/auth-flow.js"

echo ""
echo "📋 Package Files"
test_check "files array includes dist/" "grep -q '\"dist/\"' package.json"
test_check "files array includes bin/" "grep -q '\"bin/\"' package.json"
test_check "main field is dist/index.js" "grep -q '\"main\": \"dist/index.js\"' package.json"

echo ""
echo "🚀 Build Configuration"
test_check "prepublishOnly runs build" "grep -q 'prepublishOnly.*build' package.json"
test_check "build script exists" "grep -q '\"build\":' package.json"

echo ""
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Passed: $passed"
echo "  Failed: $failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $failed -gt 0 ]; then
  echo ""
  echo "❌ Pre-publish validation FAILED"
  exit 1
else
  echo ""
  echo "✅ All pre-publish checks PASSED"
  exit 0
fi
