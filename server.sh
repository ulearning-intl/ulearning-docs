#!/bin/bash

set -eo pipefail

echo "--- ulearning-docs server starting ---"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
  nvm install
  nvm use
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 16 ]; then
  echo "Node.js 16 or newer is required. Current version: $(node --version)"
  exit 1
fi

echo "--- install dependencies ---"
npm install
npm install pm2@5.4.3 -g

echo "--- start build ---"
# Respect explicit heap settings; otherwise leave headroom within host/cgroup limits.
if [[ "${NODE_OPTIONS:-}" =~ --max[-_]old[-_]space[-_]size(=|[[:space:]]) ]]; then
  node scripts/build-memory.cjs --report
  echo "Using the explicitly configured Node heap limit."
else
  BUILD_HEAP_MB="$(node scripts/build-memory.cjs)"
  export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--max-old-space-size=$BUILD_HEAP_MB"
fi

if npm run build; then
  echo "--- build completed ---"
else
  BUILD_EXIT_CODE=$?
  echo "--- build failed (exit $BUILD_EXIT_CODE) ---"
  node scripts/build-memory.cjs --report || true
  if [ "$BUILD_EXIT_CODE" -eq 137 ]; then
    echo "SIGKILL received. Check the remote host's kernel OOM log and cgroup memory.events; increase available memory if OOM is confirmed."
  fi
  exit "$BUILD_EXIT_CODE"
fi

echo "--- running ---"
pm2 delete ulearning-docs || true
pm2 start -n ulearning-docs npm -- run start
pm2 save
