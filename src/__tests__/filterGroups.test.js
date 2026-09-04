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

    it('分類名稱未命中、逐項比對時同樣不分大小寫', () => {
        // 「雜項」分類名不含 "tm"，需逐項比對；'TM' 項目要能被小寫的 'tm' 找到
        const withAscii = [
            ...sample,
            { category: '雜項2', items: ['TM', '♥'] },
        ];
        const result = filterGroups(withAscii, 'tm');
        expect(result).toEqual([{ category: '雜項2', items: ['TM'] }]);
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
        // 30 → 29：2026-09-04 移除該分類內重複的「(´,,•ω•,,)♡」
        expect(result[0].items.length).toBe(29);
    });

    // 使用者從聊天軟體／手機鍵盤複製來的 emoji 幾乎都帶著看不見的
    // variation selector（U+FE0F）。symbols.js 存的是不帶 VS 的裸字元，
    // 兩者長得一模一樣卻比對不到，搜尋直接顯示「找不到」。
    it('symbol：貼上帶 variation selector 的「❤️」也要找到裸的「❤」', () => {
        const withVS = filterGroups(symbols, '❤️');
        const bare = filterGroups(symbols, '❤');
        expect(bare.length).toBeGreaterThan(0);
        expect(withVS).toEqual(bare);
    });

    it('emoji：貼上「⚡️」（帶 VS16）要找到資料裡的「⚡」', () => {
        const result = filterGroups(emojis, '⚡️');
        expect(result.some(g => g.items.includes('⚡'))).toBe(true);
    });

    it('搜尋字串只剩看不見的字元時不當機，視同未搜尋', () => {
        expect(filterGroups(sample, '️')).toEqual(sample);
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
