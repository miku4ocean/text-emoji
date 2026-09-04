// 空白工具（WhitespaceTab）與斷行工具（LineBreakTab）的真實互動測試：
// 用 react-dom/client 掛載元件、模擬打字與點擊，檢查 textarea 產出的內容、
// 字元統計，以及 clipboard 失敗時的行為。
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import WhitespaceTab from '../components/WhitespaceTab';
import LineBreakTab from '../components/LineBreakTab';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container = null;
let root = null;
let writeText = null;

const mount = async (ui) => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => { root.render(ui); });
    return container;
};

const typeInto = async (el, value) => {
    const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
    ).set;
    await act(async () => {
        setter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
    });
};

const clickButton = async (label) => {
    const btn = [...container.querySelectorAll('button')]
        .find(b => b.textContent.includes(label));
    if (!btn) throw new Error(`找不到按鈕：${label}`);
    await act(async () => { btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};

const textarea = () => container.querySelector('textarea');

beforeEach(() => {
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

describe('WhitespaceTab', () => {
    it('注入：在每個空格與換行後加入零寬度空格並複製', async () => {
        const notify = vi.fn();
        await mount(<WhitespaceTab onNotify={notify} />);
        await typeInto(textarea(), 'a b\nc');
        await clickButton('注入');
        expect(textarea().value).toBe('a \u200Bb\n\u200Bc');
        expect(writeText).toHaveBeenCalledWith('a \u200Bb\n\u200Bc');
    });

    it('還原：移除所有零寬度空格', async () => {
        const notify = vi.fn();
        await mount(<WhitespaceTab onNotify={notify} />);
        await typeInto(textarea(), 'a \u200Bb\n\u200Bc');
        await clickButton('還原');
        expect(textarea().value).toBe('a b\nc');
    });

    // 字元統計用 String.length（UTF-16 code unit），一顆 emoji 會被算成 2、
    // ZWJ 組合字（👨‍👩‍👧‍👦）會被算成 11，對「以字元為單位」的工具是錯的數字。
    it('字元統計以使用者看到的字元為單位（emoji／ZWJ 組合字算 1 個）', async () => {
        await mount(<WhitespaceTab onNotify={vi.fn()} />);
        await typeInto(textarea(), '😀');
        expect(container.textContent).toContain('可見字元: 1');
        expect(container.textContent).toContain('總字元數: 1');

        await typeInto(textarea(), '👨‍👩‍👧‍👦');
        expect(container.textContent).toContain('可見字元: 1');
        expect(container.textContent).toContain('總字元數: 1');

        await typeInto(textarea(), '👍🏽台');   // 膚色修飾符 + 中文字
        expect(container.textContent).toContain('可見字元: 2');
    });

    it('字元統計：隱形空格不算進可見字元', async () => {
        await mount(<WhitespaceTab onNotify={vi.fn()} />);
        await typeInto(textarea(), 'a \u200Bb');
        expect(container.textContent).toContain('可見字元: 3');
        expect(container.textContent).toContain('隱形空格: 1');
        expect(container.textContent).toContain('總字元數: 4');
    });

    // 複製失敗（權限被拒／非安全來源／舊瀏覽器沒有 navigator.clipboard）
    // 舊實作只 console.error，畫面完全沒有反應，使用者以為已經複製好了。
    it('複製失敗時要通知使用者，不能默默吞掉', async () => {
        const notify = vi.fn();
        writeText = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
        await mount(<WhitespaceTab onNotify={notify} />);
        await typeInto(textarea(), 'hello world');
        await clickButton('複製');
        expect(notify).toHaveBeenCalled();
        expect(notify.mock.calls.at(-1)[0]).toContain('失敗');
    });

    it('注入後即使複製失敗，文字仍已完成處理', async () => {
        const notify = vi.fn();
        writeText = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
        await mount(<WhitespaceTab onNotify={notify} />);
        await typeInto(textarea(), 'a b');
        await clickButton('注入');
        expect(textarea().value).toBe('a \u200Bb');
        expect(notify.mock.calls.at(-1)[0]).toContain('失敗');
    });
});

describe('LineBreakTab', () => {
    it('移除多餘換行：連續換行合併為一個', async () => {
        await mount(<LineBreakTab onNotify={vi.fn()} />);
        await typeInto(textarea(), 'a\n\n\nb\n\nc');
        await clickButton('移除多餘換行');
        expect(textarea().value).toBe('a\nb\nc');
    });

    it('合併所有斷行：移除全部換行', async () => {
        await mount(<LineBreakTab onNotify={vi.fn()} />);
        await typeInto(textarea(), 'a\nb\n\nc');
        await clickButton('合併所有斷行');
        expect(textarea().value).toBe('abc');
    });

    // 中文句子常見「。」後面接右引號／右括號，斷行必須加在整組標點之後，
    // 否則下一行會以孤零零的「」」開頭；連續的「！！！」也不該被拆成三行。
    it('句號後加斷行：不把右引號／右括號留到下一行開頭', async () => {
        await mount(<LineBreakTab onNotify={vi.fn()} />);
        await typeInto(textarea(), '他說：「今天很好。」我笑了。');
        await clickButton('句號後加斷行');
        expect(textarea().value).toBe('他說：「今天很好。」\n我笑了。');
    });

    it('句號後加斷行：連續驚嘆號視為同一組，只斷一次', async () => {
        await mount(<LineBreakTab onNotify={vi.fn()} />);
        await typeInto(textarea(), '太棒了！！！真的嗎？？下次見。');
        await clickButton('句號後加斷行');
        expect(textarea().value).toBe('太棒了！！！\n真的嗎？？\n下次見。');
    });

    it('雙斷行加空白：段落之間插入零寬度空格', async () => {
        await mount(<LineBreakTab onNotify={vi.fn()} />);
        await typeInto(textarea(), '第一段\n\n第二段');
        await clickButton('雙斷行加空白');
        expect(textarea().value).toBe('第一段\n\u200B\n第二段');
    });

    // 舊實作把 setText 放在 await writeText 之後，clipboard 一失敗
    // 整個轉換就沒套用：按鈕按下去畫面毫無變化，也沒有任何錯誤提示。
    it('複製失敗時文字仍要完成處理，並通知使用者', async () => {
        const notify = vi.fn();
        writeText = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
        await mount(<LineBreakTab onNotify={notify} />);
        await typeInto(textarea(), 'a\n\n\nb');
        await clickButton('移除多餘換行');
        expect(textarea().value).toBe('a\nb');
        expect(notify).toHaveBeenCalled();
        expect(notify.mock.calls.at(-1)[0]).toContain('失敗');
    });

    it('字元統計以使用者看到的字元為單位（emoji 算 1 個）', async () => {
        await mount(<LineBreakTab onNotify={vi.fn()} />);
        await typeInto(textarea(), '👨‍👩‍👧‍👦😀');
        expect(container.textContent).toContain('總字元: 2');
    });
});
