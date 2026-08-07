# HANDOFF — text-emoji
更新：2026-08-07／claude

## 目前目標
表情符號與文字符號瀏覽器，已部署至 GitHub Pages，最後更新為放大顯示大小（2026-01-08）。

## 狀態
- 已完成：主題切換（深色/亮色）、表情符號放大顯示、GitHub Pages 部署流程；
  2026-07-26 修復輪：三分頁搜尋全部真接 filter（共用 `src/utils/filterGroups.js`）、
  symbols.js 清理 3 筆轉檔損壞資料（3372→3369，經 git diff 集合差集核對無正常符號遺失）、
  App.jsx 改 lazy state init（lint 警告歸零）、補 Vitest 測試 18 個全綠（`npm test`）——詳見 progress.md K 節
- 進行中：無
- 2026-08-07 修復輪：
  - Bug fix：`showToast` timer leak——連續點擊時舊 timer 未 clear，新 toast 被提前關閉；改用 `useRef` + `clearTimeout`
  - Bug fix：`index.css` 的 `color-scheme: dark` 硬編碼導致亮色模式下瀏覽器仍用深色 scrollbar／表單元件；改為 `dark light`
  - Bug fix：active tab 背景色 `rgba(59,130,246,0.1)` 為 dark accent 硬編碼，light 模式色系不符；新增 `--accent-bg` CSS 變數
  - Accessibility：所有 tab 按鈕、主題切換鈕、emoji/symbol item 按鈕加上 `aria-label`
  - 測試：新增 `recent.js` 7 個測試（getRecent/addRecent 含去重、截斷上限 24、非法 JSON 防禦）；全套 25 個測試全綠
  - build：`npm run build:gh` 建置成功，lint 零警告
- 驗收現況：**已驗證，「已部署穩定」屬實**（2026-07-21）
  - 逐位元組比對：線上版仍為 2026-07-26 前的 bundle，本輪修正需重新部署才生效

## 下一步（接手的人從這裡開始）
1. **部署**：線上版仍是 2026-07-26 前的 bundle，跑 `npm run deploy` 可一次推送所有修正至 GitHub Pages
2. 可選：emoji 無名稱 metadata，中文關鍵字只能命中分類名稱；要做單顆 emoji 語意搜尋需另建 metadata

## 地雷（別踩）
- `npm run build:gh` 使用 `BUILD_TARGET=gh-pages` 環境變數，輸出至 dist-gh/（與一般 dist/ 不同），部署前確認用對指令
- `npm run lint` 之前會誤掃 dist-gh/（已修正，勿再移除 eslint.config.js 的 dist-gh 忽略規則）

## 主辦權
單線／待分派
