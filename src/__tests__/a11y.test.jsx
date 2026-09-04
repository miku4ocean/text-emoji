// 無障礙與輸入健壯性：複製結果的提示、可讀的控制項名稱、可縮放的頁面，
// 以及外部（同網域其他工具）寫進 localStorage 的髒值不能讓 UI 進入矛盾狀態。
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToString } from 'react-dom/server';
import App from '../App';
import KaomojiTab from '../components/KaomojiTab';

const projectRoot = resolve(import.meta.dirname, '../..');

describe('無障礙', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    // 這個工具唯一的操作回饋就是那顆 toast（「已複製！」／「複製失敗」）。
    // 沒有 aria-live 的話，螢幕閱讀器使用者按下去完全不知道有沒有複製成功。
    it('toast 是 live region，複製結果會被朗讀', () => {
        const html = renderToString(<App />);
        const toastTag = html.match(/<div[^>]*class="toast[^"]*"[^>]*>/)?.[0] ?? '';
        expect(toastTag).toContain('aria-live');
        expect(toastTag).toContain('role="status"');
    });

    it('搜尋框有可讀的名稱（不只靠 placeholder）', () => {
        const html = renderToString(<App />);
        const input = html.match(/<input[^>]*class="search-input"[^>]*>/)?.[0] ?? '';
        expect(input).toContain('aria-label');
    });

    // Emoji／Symbol 分頁的項目按鈕都有 aria-label，只有顏文字漏掉：
    // 螢幕閱讀器只會唸到一串沒有語意的符號，也不知道按下去會做什麼。
    it('顏文字項目按鈕有 aria-label（與其他兩個分頁一致）', () => {
        const html = renderToString(
            <KaomojiTab recent={[]} onSelect={() => { }} filter="愛心" />
        );
        const buttons = html.match(/<button[^>]*class="kaomoji-btn"[^>]*>/g) ?? [];
        expect(buttons.length).toBeGreaterThan(0);
        for (const btn of buttons) {
            expect(btn).toContain('aria-label');
        }
    });

    // user-scalable=no / maximum-scale=1 會擋掉手機的雙指放大（WCAG 1.4.4），
    // 對這種滿版都是小符號的工具影響特別大。
    it('頁面允許使用者縮放', () => {
        for (const file of ['index.html', 'sidepanel.html']) {
            const html = readFileSync(resolve(projectRoot, file), 'utf8');
            const viewport = html.match(/<meta name="viewport"[^>]*>/)?.[0] ?? '';
            expect(viewport, file).not.toContain('user-scalable=no');
            expect(viewport, file).not.toContain('maximum-scale=1');
        }
    });
});

describe('外部髒資料', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    // localStorage 是整個網域共用的。若同網域其他工具寫了非 dark/light 的值，
    // 畫面會套用預設的深色配色，但切換鈕卻顯示「切換深色模式」，
    // 使用者按下去畫面毫無變化（因為本來就是深色）。
    it('主題值不是 dark/light 時退回 dark，切換鈕狀態一致', () => {
        localStorage.setItem('emoji-toolbox-theme', 'banana');
        const html = renderToString(<App />);
        expect(html).toContain('切換亮色模式');
        expect(html).not.toContain('切換深色模式');
    });
});
