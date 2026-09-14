import { describe, it, expect } from 'vitest';
import { filterGroups } from '../utils/filterGroups';
import { emojis } from '../data/emojis';
import { symbols } from '../data/symbols';
import { kaomojis } from '../data/kaomojis';
import { emojiNames } from '../data/emojiNames';
import { symbolNames } from '../data/symbolNames';
import { kaomojiNames } from '../data/kaomojiNames';

const sample = [
    { category: 'Arrows 箭頭', items: ['→', '←', '↑'] },
    { category: '星星', items: ['★', '☆'] },
    { category: '雜項', items: ['♥', '★彡'] },
];

const sampleNames = { '→': '右箭頭', '←': '左箭頭', '↑': '上箭頭', '★': '實心星', '☆': '空心星', '♥': '愛心', '★彡': '流星' };

describe('filterGroups（合成資料）', () => {
    it('空 filter 回傳原陣列（同一參考）', () => {
        expect(filterGroups(sample, '')).toBe(sample);
        expect(filterGroups(sample, undefined)).toBe(sample);
    });

    it('不傳 nameMap 時分類名稱不會觸發全選', () => {
        const result = filterGroups(sample, '星星');
        expect(result).toEqual([]);
    });

    it('傳入 nameMap 可透過項目名稱搜尋', () => {
        const result = filterGroups(sample, '星', sampleNames);
        expect(result).toEqual([
            { category: '星星', items: ['★', '☆'] },
            { category: '雜項', items: ['★彡'] },
        ]);
    });

    it('不傳 nameMap 時只比對項目字元內容', () => {
        const result = filterGroups(sample, '★');
        expect(result).toEqual([
            { category: '星星', items: ['★'] },
            { category: '雜項', items: ['★彡'] },
        ]);
    });

    it('完全沒有命中時回傳空陣列', () => {
        expect(filterGroups(sample, '不存在的東西')).toEqual([]);
    });

    it('逐項比對時不分大小寫', () => {
        const withAscii = [
            ...sample,
            { category: '雜項2', items: ['TM', '♥'] },
        ];
        const result = filterGroups(withAscii, 'tm');
        expect(result).toEqual([{ category: '雜項2', items: ['TM'] }]);
    });

    it('nameMap 比對也不分大小寫', () => {
        const result = filterGroups(sample, '箭頭', sampleNames);
        expect(result).toHaveLength(1);
        expect(result[0].category).toBe('Arrows 箭頭');
        expect(result[0].items).toEqual(['→', '←', '↑']);
    });
});

describe('filterGroups（真實資料 + nameMap）', () => {
    it('emoji：搜「笑」透過 emojiNames 找到名稱含「笑」的表情', () => {
        const result = filterGroups(emojis, '笑', emojiNames);
        expect(result.length).toBeGreaterThan(0);
        const allItems = result.flatMap(g => g.items);
        expect(allItems.length).toBeGreaterThan(3);
    });

    it('emoji：貼上「❤️」可找到含該字元的項目', () => {
        const result = filterGroups(emojis, '❤️');
        expect(result.length).toBeGreaterThan(0);
        expect(result.some(g => g.items.includes('❤️'))).toBe(true);
    });

    it('symbol：搜「音」透過 symbolNames 找到音樂符號', () => {
        const result = filterGroups(symbols, '音', symbolNames);
        expect(result.length).toBeGreaterThan(0);
        const allItems = result.flatMap(g => g.items);
        expect(allItems.length).toBeGreaterThan(0);
    });

    it('kaomoji：搜「愛」透過 kaomojiNames 找到愛心相關顏文字', () => {
        const result = filterGroups(kaomojis, '愛', kaomojiNames);
        expect(result.length).toBeGreaterThan(0);
    });

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
