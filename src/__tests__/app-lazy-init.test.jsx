// 驗證 App 的 theme 與最近使用皆為 lazy init：
// 用 renderToString（不執行 useEffect）檢查「第一次 render」就已反映 localStorage 內容。
// 若仍是「effect 內 setState」的舊寫法，首次 render 會是預設值，以下斷言會失敗。
import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from '../App';

describe('App lazy state init（首次 render 即讀取 localStorage，不靠 effect）', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('無儲存值時，首次 render 為預設深色主題', () => {
        const html = renderToString(<App />);
        // 深色模式下切換鈕 title 為「切換亮色模式」
        expect(html).toContain('切換亮色模式');
        expect(html).not.toContain('最近使用');
    });

    it('儲存 light 主題時，首次 render 即為亮色主題', () => {
        localStorage.setItem('emoji-toolbox-theme', 'light');
        const html = renderToString(<App />);
        expect(html).toContain('切換深色模式');
    });

    // 同網域（例如同一個 GitHub Pages 帳號下的多個工具）若把非陣列值寫進同名 key，
    // 整個 App 會在 `recent.map(...)` 當場拋錯 → 白屏。
    it('recent_* 存的是非陣列 JSON 時仍能正常 render（不白屏）', () => {
        localStorage.setItem('recent_emojis', JSON.stringify('壞掉的值'));
        expect(() => renderToString(<App />)).not.toThrow();
    });

    it('有最近使用紀錄時，首次 render 即顯示「最近使用」與該項目', () => {
        localStorage.setItem('recent_emojis', JSON.stringify(['😀', '🐱']));
        const html = renderToString(<App />);
        expect(html).toContain('最近使用');
        expect(html).toContain('😀');
        expect(html).toContain('🐱');
    });
});
