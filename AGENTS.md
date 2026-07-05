# text-emoji — 薄索引
跨平台規則正本：`~/.agents/institution/`（先讀 core/PRINCIPLES.md，照其指示附版本標記）。

## 專案專屬
- Build/test 指令：`npm run dev`（Vite）、`npm run build`（dist/）、`npm run build:gh`（dist-gh/，用於 GitHub Pages）、`npm run deploy`（gh-pages 部署）、`npm run lint`
- 架構一句話：純前端 React 19 + Vite + TypeScript 表情符號與文字符號搜尋工具，同時支援本機執行與 GitHub Pages 部署（https://miku4ocean.github.io/text-emoji/）
- 本專案禁區：dist/ 與 dist-gh/ 為建置產物，不得 commit（.gitignore 已設定）
