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

# Nextra's production indexing can exceed Node's default 4 GB heap.
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=6144}"

echo "--- install dependencies ---"
npm install
npm install pm2@5.4.3 -g

echo "--- start build ---"
npm run build

echo "--- running ---"
pm2 delete ulearning-docs || true
pm2 start -n ulearning-docs npm -- run start
pm2 save
