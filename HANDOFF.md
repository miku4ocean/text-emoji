# HANDOFF — text-emoji
更新：2026-07-05／claude

## 目前目標
表情符號與文字符號瀏覽器，已部署至 GitHub Pages，最後更新為放大顯示大小（2026-01-08）。

## 狀態
- 已完成：主題切換（深色/亮色）、表情符號放大顯示、GitHub Pages 部署流程
- 進行中：無（工作區乾淨）
- 驗收現況：未驗證（可訪問 https://miku4ocean.github.io/text-emoji/ 確認線上版）

## 下一步（接手的人從這裡開始）
1. 執行 `npm run dev` 確認本機正常執行
2. 執行 `npm run lint` 確認無 ESLint 錯誤
3. 若需新功能，優先考慮搜尋/過濾功能（目前疑似缺少）

## 地雷（別踩）
- `npm run build:gh` 使用 `BUILD_TARGET=gh-pages` 環境變數，輸出至 dist-gh/（與一般 dist/ 不同），部署前確認用對指令

## 主辦權
單線／待分派
