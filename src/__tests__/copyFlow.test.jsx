// 主要流程的端到端鎖定：搜尋 → 點擊 → 複製 → 進入「最近使用」。
// 重點在「送進剪貼簿的字串必須與畫面上的字元完全一致」——
// ZWJ 組合字（👨‍👩‍👧‍👦）、膚色修飾符、國旗都是多個 code point 組成，
// 任何一處用 slice/charAt 切過就會複製出半個 emoji。
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const FAMILY = '👨‍👩‍👧‍👦';

let container = null;
let root = null;
let writeText = null;

const mount = async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => { root.render(<App />); });
};

const typeSearch = async (value) => {
    const input = container.querySelector('.search-input');
    const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
    ).set;
    await act(async () => {
        setter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
};

const click = async (el) => {
    await act(async () => { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};

const toastText = () => container.querySelector('.toast').textContent;

beforeEach(() => {
    localStorage.clear();
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: (...a) => writeText(...a) },
        configurable: true,
        writable: true,
    });
});

afterEach(async () => {
    if (root) await act(async () => { root.unmount(); });
    container?.remove();
    container = null;
    root = null;
    vi.restoreAllMocks();
});

describe('複製流程', () => {
    it('點擊 ZWJ 組合 emoji：複製內容與畫面字元完全一致', async () => {
        await mount();
        await typeSearch(FAMILY);
        const btn = [...container.querySelectorAll('.item-btn')]
            .find(b => b.textContent === FAMILY);
        expect(btn, '搜尋 ZWJ 組合字應找得到對應按鈕').toBeTruthy();

        await click(btn);

        expect(writeText).toHaveBeenCalledTimes(1);
        const copied = writeText.mock.calls[0][0];
        expect(copied).toBe(FAMILY);
        expect([...copied].map(c => c.codePointAt(0).toString(16)))
            .toEqual(['1f468', '200d', '1f469', '200d', '1f467', '200d', '1f466']);
        expect(toastText()).toBe('已複製！');
    });

    it('複製後進入「最近使用」，字元不被截斷', async () => {
        await mount();
        await typeSearch(FAMILY);
        const btn = [...container.querySelectorAll('.item-btn')]
            .find(b => b.textContent === FAMILY);
        await click(btn);
        await typeSearch('');

        expect(container.textContent).toContain('最近使用');
        expect(JSON.parse(localStorage.getItem('recent_emojis'))).toEqual([FAMILY]);
        const recentBtn = container.querySelector('.section .item-btn');
        expect(recentBtn.textContent).toBe(FAMILY);
    });

    it('剪貼簿被拒絕時顯示失敗提示', async () => {
        writeText = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
        await mount();
        await typeSearch(FAMILY);
        const btn = [...container.querySelectorAll('.item-btn')]
            .find(b => b.textContent === FAMILY);
        await click(btn);
        expect(toastText()).toContain('失敗');
    });
});

describe('搜尋輸入的邊界與安全', () => {
    // 搜尋字串會直接被塞進「找不到「…」的結果」裡顯示。
    // React 預設會跳脫，這裡把行為鎖住，避免將來有人改用 dangerouslySetInnerHTML。
    it('搜尋字串中的 HTML 會被當成純文字，不會變成節點', async () => {
        const payload = '<img src=x onerror="alert(1)">';
        await mount();
        await typeSearch(payload);
        expect(container.querySelector('.empty-state')).toBeTruthy();
        expect(container.querySelectorAll('img')).toHaveLength(0);
        expect(container.querySelector('.empty-state-title').textContent)
            .toContain(payload);
    });

    it('超長輸入不會拋錯，正常顯示無結果提示', async () => {
        await mount();
        await typeSearch('な'.repeat(5000));
        expect(container.querySelector('.empty-state')).toBeTruthy();
    });

    it('切換分頁會清空搜尋，不會把上一頁的關鍵字帶過去', async () => {
        await mount();
        await typeSearch('動物');
        const symbolTabBtn = [...container.querySelectorAll('.tab-btn')][1];
        await click(symbolTabBtn);
        expect(container.querySelector('.search-input').value).toBe('');
        expect(container.querySelector('.empty-state')).toBeNull();
    });
});
