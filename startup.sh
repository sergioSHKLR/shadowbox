#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  npm install
fi
# Live preview is 0.0.0.0:8080 (vite.config.ts). Do not change that port.
exec npm run dev
