#!/usr/bin/env bash
# 部署到 Cloudflare Pages（專案 text-emoji-miku）。需先 wrangler login。
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build                      # 產出 dist/（base ./，適合根網域）
rm -rf .deploy && mkdir .deploy
rsync -a --exclude='sidepanel.html' --exclude='manifest.json' --exclude='.DS_Store' --exclude='*.map' dist/ .deploy/
# 防呆：不可含不該公開的檔案
if find .deploy \( -name '.env*' -o -name '*.md' -o -name 'wrangler.toml' \) | grep -q .; then echo "產物含敏感檔，中止"; exit 1; fi
npx wrangler pages deploy .deploy --project-name text-emoji-miku --branch main
