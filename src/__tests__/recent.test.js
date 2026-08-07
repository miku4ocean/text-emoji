import { describe, it, expect, beforeEach } from 'vitest';
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
    });
});
