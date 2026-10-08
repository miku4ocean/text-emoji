#!/usr/bin/env bash
# 部署到 Cloudflare Pages（專案 text-emoji-miku）。需先 wrangler login。
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build                      # 產出 dist/（base ./，適合根網域）
rm -rf .deploy && mkdir .deploy
rsync -a --exclude='sidepanel.html' --exclude='manifest.json' --exclude='.DS_Store' --exclude='*.map' --exclude='.wrangler' --exclude='.dev.vars*' --exclude='wrangler.jsonc' --exclude='wrangler.json' dist/ .deploy/
if find .deploy \( -name '.env*' -o -name '*.md' -o -name 'wrangler.toml' \) | grep -q .; then echo "產物含敏感檔，中止"; exit 1; fi
# 守門：.deploy 不得含隱藏檔／敏感或開發用檔案
echo "==> 守門檢查 .deploy ..."
HIDDEN=$(find .deploy -name '.*' ! -name '.' ! -path '.deploy' -print)
BAD=$(find .deploy \( -name '*.sqlite' -o -name '*.env' -o -name 'package.json' -o -name '*.md' -o -name 'node_modules' -o -name 'tests' \) -print)
if [ -n "$HIDDEN$BAD" ]; then
  echo "!! .deploy 含不該公開的檔案，中止部署："
  printf '%s\n' "$HIDDEN" "$BAD" | sed '/^$/d'
  exit 1
fi
if [ "${DRY_RUN:-}" = "1" ]; then echo "DRY_RUN=1：守門通過，不部署。"; exit 0; fi

npx wrangler pages deploy .deploy --project-name text-emoji-miku --branch main
