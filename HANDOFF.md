# HANDOFF — text-emoji
更新：2026-09-04／claude

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
- 2026-08-18 QA 驗收輪（Playwright 走完搜尋/複製/主題/emoji 渲染流程）：
  - **真 bug（已修）**：Emoji／Symbol／Kaomoji 三分頁搜尋「無結果」時，結果區塊直接變空白（白屏），
    無任何提示文字。新增共用元件 `src/components/EmptyState.jsx` + `.empty-state` CSS，
    三個 Tab 元件在 `filter && filteredGroups.length === 0` 時改渲染「找不到「{filter}」的結果」提示。
  - **真 bug（已修，小）**：`filterGroups.js` 的分類名稱比對有做 `.toLowerCase()`（不分大小寫），
    但逐項比對用的是原始 `filter`（區分大小寫），兩種比對邏輯不一致。已統一改用 `lowerFilter`。
    目前真實資料（emoji/symbol/kaomoji）皆無純 ASCII 字母項目，此問題暫無實際命中案例，
    但邏輯不一致本身是隱患，一併修掉並補迴歸測試。
  - 測試：新增 `emptyState.test.jsx`（5 個）+ `filterGroups.test.js` 補 1 個大小寫迴歸測試，
    全套 **31 個測試全綠**（`npm test`）；`npm run lint` 零警告；`npm run build:gh` 建置成功。
  - 複製正確性驗證：monkey-patch `navigator.clipboard.writeText` 記錄呼叫參數（原生 clipboard-read
    在自動化環境會卡在瀏覽器權限對話框，讀不到，改用這個方法繞過），確認 Emoji／Symbol／Kaomoji
    三分頁點擊複製的內容與畫面上顯示的字元完全一致，含多字元組合（顏文字）與 ZWJ 組合 emoji
    （👨‍👩‍👧‍👦：codepoints 1f468,200d,1f469,200d,1f467,200d,1f466）都複製正確。
  - Emoji 渲染驗證：用 canvas 量測文字寬度，ZWJ 組合 emoji（家庭、親吻）寬度與單一 emoji 相同
    （40px，vs. 4 個獨立 emoji 並排的 160px），證實瀏覽器把 ZWJ 序列疊合成單一字符渲染，非
    tofu／散開的獨立圖示；非透明像素數量正常（非空白方框）。
  - 主題切換：深色↔亮色切換正常，toast 提示「🌞 亮色模式」「🌙 深色模式」正確顯示（showToast 修復生效）。
  - 版面（375/768/1440）：**本輪環境限制** — `resize_window` 工具在本次瀏覽器 session 完全無效
    （多次呼叫 `window.innerWidth` 始終卡在 1440，懷疑瀏覽器視窗被 OS 分割畫面固定尺寸），
    無法用即時截圖驗證三種寬度。改用 CSS 靜態走查替代：`App.css` 有 320/400/600/768px 四層
    breakpoint 調整 grid 欄數（emoji grid 5→6→8 欄；kaomoji grid 1→2→auto-fill 欄），且全域
    `overflow-x: hidden`（line 43）保底不會出現水平捲軸；`.kaomoji-btn` 有 `overflow:hidden` +
    `text-overflow:ellipsis` 防止長顏文字視覺溢出。邏輯上成立，但**未經即時截圖驗證，下次接手
    若環境允許 resize，建議補跑一次真實 375/768px 截圖確認**。
  - 放大預覽：現況是純 CSS `:hover { transform: scale(1.15) }`，沒有獨立的「點擊放大→再複製」兩步
    互動，也沒有 touch 事件處理。桌面滑鼠 hover 可看到放大效果；手機/觸控裝置沒有 hover，等同
    直接點一下就複製（無中間放大預覽步驟）。這是既有設計本身如此（非本輪新增問題），先記錄，
    是否需要手機版加點擊預覽再複製由後續決定。
  - 英文關鍵字搜尋（如 "smile"）：現況命中 0 筆——emoji/symbol/kaomoji 資料只有中文分類名稱，
    沒有英文/單顆語意 metadata，此為既有已知限制（HANDOFF 先前已記錄），非本輪新發現。
    修完 bug 後至少確保這種情況會顯示「找不到結果」提示而非白屏。
- 驗收現況：**已驗證，「已部署穩定」屬實**（2026-07-21）
  - 逐位元組比對：線上版仍為 2026-07-26 前的 bundle，本輪修正需重新部署才生效

- 2026-09-04 深度偵錯輪（首輪，7 組真 bug，全部先寫紅測試再修，明細見 progress.md L 節）：
  1. 三個資料檔共 7 筆「同分類內完全重複」的項目 → React duplicate key error ＋ 畫面重複按鈕；
     已移除，筆數 1762/3369/480 → **1761/3366/477**（測試已改成新數字並鎖住「不得重複」）
  2. `filterGroups.js` 比對前未去掉 variation selector → 貼上手機鍵盤複製的「❤️」搜文字符號 0 筆、
     「⚡️」連 emoji 分頁都 0 筆；已統一 normalize 掉 U+FE0E/U+FE0F
  3. `LineBreakTab` 的 `setText` 寫在 `await writeText` 之後 → 剪貼簿被拒時整個轉換沒套用且無提示
  4. `WhitespaceTab` 複製失敗只 console.error，畫面全無回饋
  5. 兩個工具的字元統計用 `String.length` → 😀 算 2、👨‍👩‍👧‍👦 算 11；改用新的 `src/utils/text.js` `countChars()`
  6. 「句號後加斷行」把「。」」拆兩行、「！！！」拆三行；改成整組標點（含右引號括號）後才斷
  7. `recent.js` 直接回傳 `JSON.parse` 結果 → 同網域髒值會讓 `recent.map()` 拋錯白屏；
     另 `addRecent` 寫入失敗時原本回傳 `[]` 會清空畫面上的最近使用
  - 順手：toast 加 `role="status" aria-live`、搜尋框與顏文字按鈕補 aria-label、
    兩個 HTML 移除 `user-scalable=no`（擋雙指放大）
  - 驗收：`npm test` **63 全綠**（連跑兩次一致）、`npm run lint` 零輸出、`npm run build:gh` ✓ built

## 下一步（接手的人從這裡開始）
1. **部署**：線上版仍是 2026-07-26 前的 bundle（含 2026-08-18 白屏修復與 2026-09-04 偵錯輪都還沒上線），
   跑 `npm run deploy` 可一次推送所有修正至 GitHub Pages
2. 可選：emoji 無名稱 metadata，中文關鍵字只能命中分類名稱；要做單顆 emoji 語意搜尋需另建 metadata
3. 可選：補一次真實 375px/768px/1440px 截圖驗證（本輪 resize_window 工具失效，只做了 CSS 靜態走查）

## 地雷（別踩）
- `npm run build:gh` 使用 `BUILD_TARGET=gh-pages` 環境變數，輸出至 dist-gh/（與一般 dist/ 不同），部署前確認用對指令
- `npm run lint` 之前會誤掃 dist-gh/（已修正，勿再移除 eslint.config.js 的 dist-gh 忽略規則）
- 自動化瀏覽器測試複製功能時，`navigator.clipboard.readText()` 在本環境會卡住不 resolve（權限對話框
  卡在瀏覽器層級，頁面截圖看不到也點不到），驗證複製內容請改用 monkey-patch `writeText` 記錄參數，
  不要用 `readText()`，會直接卡死整個 tab（連帶讓同一分頁後續所有 CDP 呼叫全部逾時，需開新分頁才能恢復）

## 主辦權
單線／待分派
