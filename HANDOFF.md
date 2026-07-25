# HANDOFF — text-emoji
更新：2026-07-26／claude

## 目前目標
表情符號與文字符號瀏覽器，已部署至 GitHub Pages，最後更新為放大顯示大小（2026-01-08）。

## 狀態
- 已完成：主題切換（深色/亮色）、表情符號放大顯示、GitHub Pages 部署流程；
  2026-07-26 修復輪：三分頁搜尋全部真接 filter（共用 `src/utils/filterGroups.js`）、
  symbols.js 清理 3 筆轉檔損壞資料（3372→3369，經 git diff 集合差集核對無正常符號遺失）、
  App.jsx 改 lazy state init（lint 警告歸零）、補 Vitest 測試 18 個全綠（`npm test`）——詳見 progress.md K 節
- 進行中：無
- 驗收現況：**已驗證，「已部署穩定」屬實**（2026-07-21）
  - `npm run build:gh` 建置成功，`node --check` 全部 JS/bundle 通過
  - Playwright headless 實際載入 dist-gh，5 個分頁（表情/符號/顏文字/空白/斷行）與主題切換皆可點擊、無 console error、無 pageerror
  - 資料完整性：emoji 8 類 1762 個、符號 54 類 3372 個、顏文字 16 類 480 個，與 README 描述相符
  - 逐位元組比對：本機重建的 dist-gh ＝ origin/gh-pages 內容 ＝ 線上 https://miku4ocean.github.io/text-emoji/ 實際回應（curl 200，asset hash 一致），三者完全一致，無需重新部署
  - grep 未發現硬編碼金鑰
- 本次修正：`eslint.config.js` 補上 `dist-gh` 忽略（先前 `npm run lint` 誤掃建置產物噴出 109 條假錯誤）、`vite.config.js` 移除未用參數；修正後 `npm run lint` 僅剩 2 條 `App.jsx` 的 `react-hooks/set-state-in-effect` 建議（非執行期錯誤，未動，見下）

## 下一步（接手的人從這裡開始）
1. 前一輪的兩項（lazy state init、搜尋/過濾）已於 2026-07-26 完成，無迫切待辦
2. 可選：線上版仍是修復前的 bundle，若要讓 GitHub Pages 也有新搜尋功能，跑 `npm run deploy` 重新部署
3. 可選：emoji 無名稱 metadata，中文關鍵字只能命中分類名稱；要做單顆 emoji 語意搜尋需另建 metadata

## 地雷（別踩）
- `npm run build:gh` 使用 `BUILD_TARGET=gh-pages` 環境變數，輸出至 dist-gh/（與一般 dist/ 不同），部署前確認用對指令
- `npm run lint` 之前會誤掃 dist-gh/（已修正，勿再移除 eslint.config.js 的 dist-gh 忽略規則）

## 主辦權
單線／待分派
