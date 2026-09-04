# text-emoji 專案進度報告

> 本檔依實際讀取的 HANDOFF.md、AGENTS.md、CLAUDE.md、README.md 與 src/ 原始碼整理而成。查不到的內容一律標示「未確認」，不做臆測。

---

## A. 專案名稱

text-emoji（README 顯示名稱：✨ Emoji 工具箱 / Emoji Toolbox）

---

## B. 專案路徑

`/Users/leonalin/Code/text-emoji`

---

## C. 專案簡介

一個純前端的表情符號、文字符號與顏文字瀏覽／複製工具。以 React 19 + Vite 7 開發，用同一份程式碼交付兩種形態：

- **網頁版**（GitHub Pages）：https://miku4ocean.github.io/text-emoji/
- **Chrome 擴充功能側邊面板**（Manifest V3，`chrome://extensions` 載入未封裝項目）

全部功能在瀏覽器端完成，沒有伺服器、沒有資料庫、沒有帳號系統。

---

## D. 專案開發目的

依 README 與 HANDOFF 記載：提供一個「精美的表情符號與文字處理工具」，同時涵蓋日常聊天／社群貼文常見的符號需求（emoji、特殊符號、日式顏文字）與兩個較特別的文字處理需求（隱形空白注入、換行格式整理），並以 Chrome 擴充功能 + 網頁版雙管道降低使用門檻。

---

## E. 解決使用者痛點

依 README 使用情境與程式邏輯推斷：

- 需要快速找到並複製 emoji／特殊符號／顏文字，不想在系統表情符號選單裡翻找。
- 需要繞過某些平台的關鍵字過濾或內容偵測，透過注入零寬度空格 (U+200B) 製造「看起來相同但字元不同」的文字。
- 貼文到 Facebook 等平台時，連續兩次換行常被平台壓縮成一次，導致段落間距消失——斷行工具的「雙斷行加空白」用隱形字元保住段落間距。
- 長文字想依全形句號／問號／驚嘆號自動斷句、或想合併成一行、或想清除多餘空行。

---

## F. 專案功能細項介紹

依 `src/App.jsx` 與 5 個 `src/components/*.jsx` 實際讀碼確認：

- **表情符號分頁**（EmojiTab）：8 個分類、1761 個 emoji，點擊即複製，含「最近使用」（localStorage，上限 24 筆）。搜尋已於 2026-07-26 修復生效（共用 `src/utils/filterGroups.js`：分類名稱不分大小寫比對，未命中時逐項比對字元內容）。
- **文字符號分頁**（SymbolTab）：54 個分類、3366 個符號（2026-07-25 清理 3 筆轉檔損壞資料：`" Ferry︎"` 改回正確的 `⛴︎`、移除 `"<ctrl42>"` 殘留與 2 個空字串，原 3372 → 3369；2026-09-04 再移除 3 筆同分類內重複項目 → 3366，無正常符號遺失）。搜尋生效，邏輯同上（原 SymbolTab 內建邏輯抽出為共用函式）。
- **顏文字分頁**（KaomojiTab）：16 個分類、477 個日式顏文字。搜尋已於 2026-07-26 修復生效，邏輯同上。
- **空白工具分頁**（WhitespaceTab）：在文字的每個空格與換行後注入零寬度空格 (U+200B)；顯示可見字元／隱形空格／總字元數統計；提供注入、複製、清除、還原四個操作。
- **斷行工具分頁**（LineBreakTab）：四個獨立處理模式——移除多餘換行（`\n{2,}` → `\n`）、合併所有斷行（移除全部 `\n`）、句號後加斷行（僅處理全形。！？，刻意不處理半形以避免誤斷網址）、雙斷行加空白（在雙換行間插入 ZWSP 保留段落間距）。按鈕點擊後以 accent 色標示目前使用中的模式。
- **主題切換**：Header 右上角太陽／月亮圖示，深色／亮色模式切換，偏好存於 `localStorage`（key: `emoji-toolbox-theme`），並在 `index.html`/`sidepanel.html` 內以行內 `<script>` 提前套用，避免刷新閃爍（FOUC）。
- **一鍵複製回饋**：所有分頁點擊項目後呼叫 `navigator.clipboard.writeText`，並跳出 Toast 提示（「已複製！」／「已處理並複製！」）。

---

## G. 專案規格及 RPD

**技術棧**
- React 19.2、Vite 7.2、`@vitejs/plugin-react`
- 圖示：lucide-react
- 程式碼檢查：ESLint 9（`eslint.config.js` 已排除 `dist-gh/` 建置產物）
- 測試：Vitest 4 + jsdom（2026-07-26 補上；`npm test` = `vitest run`，18 個測試涵蓋資料檔結構/筆數、filterGroups 過濾語意、App lazy state init）
- Chrome 擴充功能：Manifest V3，`side_panel.default_path = sidepanel.html`，僅宣告 `sidePanel` 權限，無 background/content script

**埠 / 開發指令**
- `npm run dev` — Vite 開發伺服器，依 `vite.config.js` 的 `server.open: '/sidepanel.html'`，開啟時預設導向側邊面板頁面；README 記載本機網址為 `http://localhost:5173/`（Vite 預設埠，`vite.config.js` 未覆寫埠號）
- `npm run build` — 建置 Chrome 擴充功能版本，輸出至 `dist/`，`base: './'`
- `npm run build:gh` — 建置 GitHub Pages 版本，輸出至 `dist-gh/`，`base: '/text-emoji/'`（`BUILD_TARGET=gh-pages` 環境變數觸發）
- `npm run preview` — 預覽建置產物
- `npm run lint` — ESLint 檢查
- `npm run deploy` — `build:gh` 後透過 `gh-pages` 套件推送至 `origin/gh-pages`

**資料流**
1. 使用者點擊分頁圖示 → `App.jsx` 切換 `activeTab` 並清空 `search`
2. 對應 Tab 元件從 `src/data/*.js` 讀取靜態陣列並渲染 grid/kaomoji-grid
3. 使用者點擊項目 → `handleSelect` → `navigator.clipboard.writeText` → 成功後呼叫 `addRecent()` 寫入 `localStorage` 並更新該分頁的 recent state → 顯示 Toast
4. 空白工具／斷行工具則是本機字串處理（regex 取代）後同樣呼叫 `navigator.clipboard.writeText`
5. 主題切換寫入 `localStorage`，並透過 `document.documentElement.setAttribute('data-theme', ...)` 套用 CSS

**部署現況（依 HANDOFF 2026-07-21 記載，屬已驗證事實）**
- `npm run build:gh` 建置成功，`node --check` 全部 JS/bundle 通過
- Playwright headless 驗證 dist-gh：5 分頁 + 主題切換皆可點擊、無 console error、無 pageerror
- 逐位元組比對：本機 dist-gh ＝ `origin/gh-pages` ＝ 線上實際回應，三者一致，無需重新部署
- grep 未發現硬編碼金鑰

---

## H. 目前已完成項目

依 HANDOFF.md「狀態」欄與 README 更新日誌：

- 5 個功能分頁（表情符號、文字符號、顏文字、空白工具、斷行工具）全部實作完成
- 深色／亮色主題切換，含 localStorage 記憶與 FOUC 防護
- Chrome 擴充功能與 GitHub Pages 雙重建置管線（`vite.config.js` 依 `BUILD_TARGET` 分岐）
- 最近使用記錄（emoji／symbol／kaomoji 三種各自獨立）
- GitHub Pages 部署流程已驗證穩定（見上方部署現況）
- `eslint.config.js` 已修正誤掃 `dist-gh/` 建置產物的問題

---

## I. 尚待完成項目

2026-07-26 修復輪已解決原列的前三項（詳見下方 K 節）。目前剩：

- 主辦權欄位標示「單線／待分派」，代表無固定負責人。
- （可選）Emoji 仍無名稱／關鍵字 metadata，中文關鍵字只能命中分類名稱，無法命中個別 emoji；若要做到單顆 emoji 的語意搜尋需另建 metadata。

---

## J. 系統優化或增加功能建議

以下為依實際架構觀察提出的建議（非既有規劃，供參考）：

- 補齊 EmojiTab／KaomojiTab 的搜尋邏輯，或若刻意不做，應同步修正 README 描述避免文件與實作不一致。
- Emoji 目前無法用中文關鍵字（如「笑臉」「動物」）找到對應項目，可考慮加入名稱／關鍵字 metadata 以支援真搜尋（SymbolTab 已有類似模式可參考）。
- 可評估補上基本的 unit test（例如 `utils/recent.js` 的邊界情況：超過 24 筆、重複項目移到最前）以降低回歸風險。
- `index.html`／`sidepanel.html` 內容幾乎完全重複（含行內主題防閃爍腳本），可考慮抽成共用 partial 或以建置腳本產生，降低雙檔維護成本。
- 依 HANDOFF 建議，`App.jsx` 的 2 條 `react-hooks/set-state-in-effect` 提示可安排小工找時間處理，屬低風險技術債。

---

## K. 2026-07-26 修復輪紀錄（FIX_PLAN text-emoji 段）

本輪由兩個 session 接力完成（前手因額度中止，後手接續驗證收尾）：

1. **假搜尋修復（選「真接 filter」路線）**：把原 SymbolTab 的過濾邏輯抽成共用 `src/utils/filterGroups.js`（分類名稱不分大小寫 includes → 命中留整類；未命中則逐項 `item.includes(filter)`；空類別剔除），EmojiTab／KaomojiTab／SymbolTab 三個分頁統一接上，搜尋框全站真正生效。README「搜尋功能」段已同步據實化。
2. **symbols.js 資料清理（含遺失疑慮調查）**：前手中止前擔心「少了一筆」。後手以 git diff + node 集合差集核對：移除的只有 `" Ferry︎"`（轉檔損壞文字，已補回正確符號 `⛴︎`）、`"<ctrl42>"`（轉檔殘留）、2 個空字串 `""`；總數 3372 → 3369，**無任何正常符號遺失**。emojis（1762）與 kaomojis（480）筆數不變。
3. **App.jsx lazy state init**：theme 與三組「最近使用」state 改為 `useState(() => ...)` 惰性初始化，移除兩個 mount effect 內 setState；`npm run lint` 由 2 條 `react-hooks/set-state-in-effect` 警告變為 0 條。
4. **補 Vitest 測試（18 個，全綠）**：`src/__tests__/data.test.js`（資料結構 + 筆數鎖定 8/1762、54/3369、16/480，防未來資料遺失）、`filterGroups.test.js`（合成與真實資料的過濾語意）、`app-lazy-init.test.jsx`（以 `renderToString` 驗證首次 render 即反映 localStorage，不靠 effect）。
5. **流程驗證（實際輸出）**：`npm test` 3 檔 18 測試全過；`npm run build`（dist/）與 `npm run build:gh`（dist-gh/）皆 `✓ built`；dev server `curl` `/` 與 `/sidepanel.html` 皆 200 後精準 kill；`npm run lint` 無輸出（乾淨）。

---


## L. 2026-09-04 深度偵錯輪（首輪）

build/lint/test 全綠但產品實際壞掉的 7 組真 bug，全部先寫紅測試再修：

1. **同分類內重複項目**（`src/data/*.js`）：`活動` 的 👼、`語言符號 - 字母字型` 的「构建」「𝘥」、`語言符號 - 日文字元` 的「ぺ」、顏文字 `愛心浪漫` 與 `傷心難過` 共 7 筆完全重複。三個 Tab 都用 `key={item}` 逐項渲染，重複值讓 React 在瀏覽器 console 丟 duplicate key error，畫面也出現一模一樣的按鈕（`(｡•́︿•̀｡)` 在同一類出現 3 次）。已移除重複，筆數 1762/3369/480 → **1761/3366/477**，並加測試鎖住「同分類內不得重複」。
2. **貼上帶 variation selector 的 emoji 搜不到**（`src/utils/filterGroups.js`）：手機鍵盤／聊天軟體複製來的 emoji 幾乎都帶著看不見的 U+FE0F（`❤️` = 2764 FE0F），symbols.js 存的是裸字元 `❤` = 2764。貼「❤️」搜文字符號 → 0 筆「找不到」，貼「❤」→ 3 筆；「⚡️」連 emoji 分頁都 0 筆。比對前統一去掉 U+FE0E／U+FE0F。
3. **斷行工具複製失敗時整個轉換消失**（`LineBreakTab.jsx`）：`setText` 寫在 `await clipboard.writeText` 之後，剪貼簿一被拒（權限／非安全來源／舊瀏覽器無 `navigator.clipboard`）文字完全沒被處理，按鈕按下去畫面毫無變化也沒有錯誤提示。改成先套用轉換再複製，失敗時提示「已處理，但複製失敗」。
4. **空白工具複製失敗完全靜音**（`WhitespaceTab.jsx`）：只 `console.error`，使用者以為已複製。補上失敗提示。
5. **字元統計把一顆 emoji 算成好幾個**（`WhitespaceTab.jsx`／`LineBreakTab.jsx`）：用 `String.length`（UTF-16 code unit），😀 算 2、👍🏽 算 4、👨‍👩‍👧‍👦 算 11。新增 `src/utils/text.js` 的 `countChars()`（`Intl.Segmenter` grapheme，舊環境退回 code point）。
6. **句號後加斷行拆壞中文標點**（`LineBreakTab.jsx`）：`他說：「今天很好。」我笑了。` → 下一行以孤零零的「」」開頭；`太棒了！！！` 被拆成三行。改成「連續的。！？ + 後續右引號／右括號」視為一組，斷行加在整組之後。
7. **localStorage 髒值造成白屏／狀態矛盾**（`src/utils/recent.js`、`App.jsx`）：`getRecent` 直接回傳 `JSON.parse` 結果，同網域（GitHub Pages 帳號下所有工具共用 origin）若有人把字串寫進 `recent_*`，`recent.map()` 直接拋 TypeError → 整頁白屏；主題值非 dark/light 時切換鈕狀態與實際配色不一致。兩者都改為驗證後回退。另修：`addRecent` 在 localStorage 寫入失敗（無痕／容量滿）時原本回傳 `[]`，會把畫面上的「最近使用」整排清空，改為仍回傳正確清單。

順手補的無障礙修正：toast 加 `role="status" aria-live="polite"`（複製成功／失敗是唯一回饋，原本螢幕閱讀器完全聽不到）、搜尋框補 `aria-label`、顏文字項目按鈕補 `aria-label`（Emoji／Symbol 早就有，只有顏文字漏掉）、`index.html`／`sidepanel.html` 移除 `user-scalable=no, maximum-scale=1.0`（擋掉手機雙指放大，WCAG 1.4.4）。

**反證（不是 bug，已寫測試鎖住）**：搜尋字串的 HTML 由 React 跳脫，`<img src=x onerror=...>` 只會變成純文字；ZWJ 組合字複製與畫面完全一致（`👨‍👩‍👧‍👦` codepoints 1f468,200d,1f469,200d,1f467,200d,1f466 原封不動）；CRLF 不需處理——textarea 的 API value 依規格已把換行正規化成 LF，`\r` 進不到 state。

驗收：`npm test` **63 個測試全綠**（連跑兩次一致，31 → 63）、`npm run lint` 零輸出、`npm run build:gh` `✓ built`。

---

*本報告由讀取 `/Users/leonalin/Code/text-emoji` 專案的 HANDOFF.md、AGENTS.md、CLAUDE.md、README.md、package.json、vite.config.js、src/App.jsx、src/main.jsx、src/components/*.jsx、src/utils/recent.js、src/data/*.js、public/manifest.json、index.html、sidepanel.html 後整理，2026-07-24；2026-07-26 補記 K 節修復輪紀錄；2026-09-04 補記 L 節深度偵錯輪。*
