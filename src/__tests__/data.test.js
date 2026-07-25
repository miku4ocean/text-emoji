import { describe, it, expect } from 'vitest';
import { emojis } from '../data/emojis';
import { symbols } from '../data/symbols';
import { kaomojis } from '../data/kaomojis';

const totalItems = (groups) => groups.reduce((n, g) => n + g.items.length, 0);

const checkStructure = (groups) => {
    expect(Array.isArray(groups)).toBe(true);
    for (const group of groups) {
        expect(typeof group.category).toBe('string');
        expect(group.category.length).toBeGreaterThan(0);
        expect(Array.isArray(group.items)).toBe(true);
        expect(group.items.length).toBeGreaterThan(0);
        for (const item of group.items) {
            expect(typeof item).toBe('string');
            expect(item.length).toBeGreaterThan(0);
        }
    }
};

describe('資料檔結構完整性', () => {
    it('emojis：每組有 category 字串與非空 items 字串陣列', () => {
        checkStructure(emojis);
    });

    it('symbols：每組有 category 字串與非空 items 字串陣列', () => {
        checkStructure(symbols);
    });

    it('kaomojis：每組有 category 字串與非空 items 字串陣列', () => {
        checkStructure(kaomojis);
    });

    it('數量與文件記載一致：emoji 8 類 1762、符號 54 類 3369、顏文字 16 類 480', () => {
        // 符號原記載 3372，2026-07-25 清理 2 個空字串與 1 個 "<ctrl42>" 轉檔殘留後為 3369
        expect(emojis.length).toBe(8);
        expect(totalItems(emojis)).toBe(1762);
        expect(symbols.length).toBe(54);
        expect(totalItems(symbols)).toBe(3369);
        expect(kaomojis.length).toBe(16);
        expect(totalItems(kaomojis)).toBe(480);
    });

    it('各資料檔內分類名稱不重複', () => {
        for (const groups of [emojis, symbols, kaomojis]) {
            const names = groups.map(g => g.category);
            expect(new Set(names).size).toBe(names.length);
        }
    });
});
