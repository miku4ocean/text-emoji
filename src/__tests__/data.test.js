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

    it('數量與文件記載一致：emoji 8 類 1761、符號 54 類 3366、顏文字 16 類 477', () => {
        // 符號原記載 3372，2026-07-25 清理 2 個空字串與 1 個 "<ctrl42>" 轉檔殘留後為 3369
        // 2026-09-04 移除「同一分類內完全重複」的項目（emoji 1、symbol 3、kaomoji 3 筆），
        // 1762/3369/480 → 1761/3366/477；重複項目只是同一顆符號的複本，無新符號遺失
        expect(emojis.length).toBe(8);
        expect(totalItems(emojis)).toBe(1761);
        expect(symbols.length).toBe(54);
        expect(totalItems(symbols)).toBe(3366);
        expect(kaomojis.length).toBe(16);
        expect(totalItems(kaomojis)).toBe(477);
    });

    it('各資料檔內分類名稱不重複', () => {
        for (const groups of [emojis, symbols, kaomojis]) {
            const names = groups.map(g => g.category);
            expect(new Set(names).size).toBe(names.length);
        }
    });

    // 同一分類內若有重複項目，畫面會出現一模一樣的按鈕好幾顆（使用者以為壞掉），
    // 而且三個 Tab 元件都用 `key={item}` 逐項渲染，重複值會讓 React 丟
    // 「Encountered two children with the same key」錯誤、更新時項目錯位。
    it('同一分類內項目不重複（避免重複按鈕與 React key 衝突）', () => {
        const offenders = [];
        for (const [name, groups] of [['emojis', emojis], ['symbols', symbols], ['kaomojis', kaomojis]]) {
            for (const group of groups) {
                const seen = new Set();
                for (const item of group.items) {
                    if (seen.has(item)) offenders.push(`${name} / ${group.category} / ${item}`);
                    seen.add(item);
                }
            }
        }
        expect(offenders).toEqual([]);
    });
});
