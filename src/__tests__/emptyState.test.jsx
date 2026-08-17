// 搜尋「無結果」時必須顯示提示訊息，不能整個結果區塊變空白（白屏）。
// 這裡直接用 renderToString 檢查各分頁元件在 filter 命中 0 筆時的輸出。
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import EmojiTab from '../components/EmojiTab';
import SymbolTab from '../components/SymbolTab';
import KaomojiTab from '../components/KaomojiTab';

const NO_MATCH = 'xyz123notfound';

describe('搜尋無結果時顯示提示，不留白屏', () => {
    it('EmojiTab：無結果時顯示提示文字', () => {
        const html = renderToString(
            <EmojiTab recent={[]} onSelect={() => {}} filter={NO_MATCH} />
        );
        expect(html).toContain('empty-state');
        expect(html).toContain(NO_MATCH);
    });

    it('SymbolTab：無結果時顯示提示文字', () => {
        const html = renderToString(
            <SymbolTab recent={[]} onSelect={() => {}} filter={NO_MATCH} />
        );
        expect(html).toContain('empty-state');
        expect(html).toContain(NO_MATCH);
    });

    it('KaomojiTab：無結果時顯示提示文字', () => {
        const html = renderToString(
            <KaomojiTab recent={[]} onSelect={() => {}} filter={NO_MATCH} />
        );
        expect(html).toContain('empty-state');
        expect(html).toContain(NO_MATCH);
    });

    it('EmojiTab：有結果時不顯示空狀態提示', () => {
        const html = renderToString(
            <EmojiTab recent={[]} onSelect={() => {}} filter="動物" />
        );
        expect(html).not.toContain('empty-state');
    });

    it('EmojiTab：無 filter 時不顯示空狀態提示（即使 recent 為空）', () => {
        const html = renderToString(
            <EmojiTab recent={[]} onSelect={() => {}} filter="" />
        );
        expect(html).not.toContain('empty-state');
    });
});
