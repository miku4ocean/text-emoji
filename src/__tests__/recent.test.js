import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRecent, addRecent } from '../utils/recent';

describe('recent.js', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('getRecent', () => {
        it('key 不存在時回傳空陣列', () => {
            expect(getRecent('nonexistent')).toEqual([]);
        });

        it('讀取已儲存的陣列', () => {
            localStorage.setItem('test_key', JSON.stringify(['a', 'b']));
            expect(getRecent('test_key')).toEqual(['a', 'b']);
        });

        it('localStorage 內容非法 JSON 時回傳空陣列（不拋錯）', () => {
            localStorage.setItem('test_key', 'not-json');
            expect(getRecent('test_key')).toEqual([]);
        });

        // 合法 JSON 但不是陣列（例如同網域下的其他工具用了同名 key）：
        // 舊實作直接回傳 parse 結果，字串會通過 `recent.length > 0` 判斷，
        // 接著 `recent.map(...)` 拋 TypeError，整個 App 白屏。
        it('合法 JSON 但非陣列時回傳空陣列', () => {
            for (const payload of ['"just a string"', '{"a":1}', '42', 'null', 'true']) {
                localStorage.setItem('test_key', payload);
                expect(getRecent('test_key')).toEqual([]);
            }
        });

        it('陣列中的非字串項目會被濾掉', () => {
            localStorage.setItem('test_key', JSON.stringify(['😀', 42, null, { a: 1 }, '🐱']));
            expect(getRecent('test_key')).toEqual(['😀', '🐱']);
        });
    });

    describe('addRecent', () => {
        it('新增項目至最前面', () => {
            const result = addRecent('test_key', 'first');
            expect(result).toEqual(['first']);
            expect(getRecent('test_key')).toEqual(['first']);
        });

        it('重複項目移至最前面（去重）', () => {
            addRecent('test_key', 'a');
            addRecent('test_key', 'b');
            const result = addRecent('test_key', 'a');
            expect(result).toEqual(['a', 'b']);
        });

        it('超過 24 個時截斷尾端', () => {
            for (let i = 0; i < 30; i++) {
                addRecent('test_key', `item-${i}`);
            }
            const result = getRecent('test_key');
            expect(result).toHaveLength(24);
            // 最後加的 item-29 應在最前面
            expect(result[0]).toBe('item-29');
            // item-6 以前的應被截掉（30 - 24 = 6）
            expect(result).not.toContain('item-5');
        });

        it('回傳值與 localStorage 內容一致', () => {
            const returned = addRecent('test_key', 'x');
            const stored = getRecent('test_key');
            expect(returned).toEqual(stored);
        });

        // 無痕模式／容量已滿時 setItem 會丟 QuotaExceededError。
        // 舊實作回傳 []，呼叫端把它塞回 state，使用者「複製成功」的同時
        // 畫面上整排「最近使用」被清空。應該至少維持本次的正確清單。
        it('localStorage 寫入失敗時仍回傳正確的新清單（不清空畫面）', () => {
            localStorage.setItem('test_key', JSON.stringify(['b']));
            const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });
            try {
                expect(addRecent('test_key', 'a')).toEqual(['a', 'b']);
            } finally {
                spy.mockRestore();
            }
        });
    });
});
