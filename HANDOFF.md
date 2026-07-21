# HANDOFF — text-emoji
更新：2026-07-21／claude

## 目前目標
表情符號與文字符號瀏覽器，已部署至 GitHub Pages，最後更新為放大顯示大小（2026-01-08）。

## 狀態
- 已完成：主題切換（深色/亮色）、表情符號放大顯示、GitHub Pages 部署流程
- 進行中：無（工作區乾淨，待 push）
- 驗收現況：**已驗證，「已部署穩定」屬實**（2026-07-21）
  - `npm run build:gh` 建置成功，`node --check` 全部 JS/bundle 通過
  - Playwright headless 實際載入 dist-gh，5 個分頁（表情/符號/顏文字/空白/斷行）與主題切換皆可點擊、無 console error、無 pageerror
  - 資料完整性：emoji 8 類 1762 個、符號 54 類 3372 個、顏文字 16 類 480 個，與 README 描述相符
  - 逐位元組比對：本機重建的 dist-gh ＝ origin/gh-pages 內容 ＝ 線上 https://miku4ocean.github.io/text-emoji/ 實際回應（curl 200，asset hash 一致），三者完全一致，無需重新部署
  - grep 未發現硬編碼金鑰
- 本次修正：`eslint.config.js` 補上 `dist-gh` 忽略（先前 `npm run lint` 誤掃建置產物噴出 109 條假錯誤）、`vite.config.js` 移除未用參數；修正後 `npm run lint` 僅剩 2 條 `App.jsx` 的 `react-hooks/set-state-in-effect` 建議（非執行期錯誤，未動，見下）

## 下一步（接手的人從這裡開始）
1. `App.jsx` 第 49-53、61-65 行有 2 條 react-hooks 新規則建議（effect 內直接 setState）——功能正常、非 bug，之後有空可依官方建議改寫成 lazy state init
2. 若需新功能，優先考慮搜尋/過濾功能（目前疑似缺少）

## 地雷（別踩）
- `npm run build:gh` 使用 `BUILD_TARGET=gh-pages` 環境變數，輸出至 dist-gh/（與一般 dist/ 不同），部署前確認用對指令
- `npm run lint` 之前會誤掃 dist-gh/（已修正，勿再移除 eslint.config.js 的 dist-gh 忽略規則）

## 主辦權
單線／待分派
