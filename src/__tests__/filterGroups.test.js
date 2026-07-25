import { describe, it, expect } from 'vitest';
import { filterGroups } from '../utils/filterGroups';
import { emojis } from '../data/emojis';
import { symbols } from '../data/symbols';
import { kaomojis } from '../data/kaomojis';

const sample = [
    { category: 'Arrows 箭頭', items: ['→', '←', '↑'] },
    { category: '星星', items: ['★', '☆'] },
    { category: '雜項', items: ['♥', '★彡'] },
];

describe('filterGroups（合成資料）', () => {
    it('空 filter 回傳原陣列（同一參考）', () => {
        expect(filterGroups(sample, '')).toBe(sample);
        expect(filterGroups(sample, undefined)).toBe(sample);
    });

    it('分類名稱命中時保留整個分類', () => {
        const result = filterGroups(sample, '星星');
        expect(result).toHaveLength(1);
        expect(result[0].items).toEqual(['★', '☆']);
    });

    it('分類名稱比對不分大小寫', () => {
        const result = filterGroups(sample, 'arrows');
        expect(result).toHaveLength(1);
        expect(result[0].category).toBe('Arrows 箭頭');
    });

    it('分類名稱未命中時逐項比對字元內容', () => {
        const result = filterGroups(sample, '★');
        // 「星星」分類名不含「★」，逐項比對：「★」留、「☆」濾掉；「雜項」剩「★彡」
        expect(result).toEqual([
            { category: '星星', items: ['★'] },
            { category: '雜項', items: ['★彡'] },
        ]);
    });

    it('完全沒有命中時回傳空陣列', () => {
        expect(filterGroups(sample, '不存在的東西')).toEqual([]);
    });
});

describe('filterGroups（真實資料）', () => {
    it('emoji：搜「動物」只留「動物與大自然」分類', () => {
        const result = filterGroups(emojis, '動物');
        expect(result).toHaveLength(1);
        expect(result[0].category).toBe('動物與大自然');
        expect(result[0].items.length).toBeGreaterThan(0);
    });

    it('emoji：貼上「❤️」可找到含該字元的項目', () => {
        const result = filterGroups(emojis, '❤️');
        expect(result.length).toBeGreaterThan(0);
        expect(result.some(g => g.items.includes('❤️'))).toBe(true);
    });

    it('symbol：搜「音符」命中音符分類', () => {
        const result = filterGroups(symbols, '音符');
        expect(result.length).toBeGreaterThan(0);
        expect(result.some(g => g.category.includes('音符'))).toBe(true);
    });

    it('kaomoji：搜「愛心」命中愛心浪漫分類', () => {
        const result = filterGroups(kaomojis, '愛心');
        expect(result).toHaveLength(1);
        expect(result[0].category).toContain('愛心');
        expect(result[0].items.length).toBe(30);
    });

    it('kaomoji：搜掀桌片段「┻━┻」逐項命中', () => {
        const result = filterGroups(kaomojis, '┻━┻');
        expect(result.length).toBeGreaterThan(0);
        for (const g of result) {
            for (const item of g.items) {
                expect(item).toContain('┻━┻');
            }
        }
    });
});
