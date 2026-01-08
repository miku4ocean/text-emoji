import React, { useState } from 'react';
import { Minus, Merge, SplitSquareHorizontal, Space } from 'lucide-react';

const LineBreakTab = ({ onNotify }) => {
    const [text, setText] = useState('');
    const [activeMode, setActiveMode] = useState(null); // Track which mode/button is active

    // Count line breaks
    const lineBreakCount = (text.match(/\n/g) || []).length;
    const doubleBreakCount = (text.match(/\n\n/g) || []).length;

    const copyToClipboard = async (newText) => {
        try {
            await navigator.clipboard.writeText(newText);
            setText(newText);
            onNotify('已處理並複製！');
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    // 移除多餘換行：將多個連續換行變成單一換行
    const handleRemoveExtraBreaks = () => {
        if (!text) return;
        setActiveMode('removeExtra');
        const newText = text.replace(/\n{2,}/g, '\n');
        copyToClipboard(newText);
    };

    // 合併所有斷行：移除所有換行
    const handleMergeAllBreaks = () => {
        if (!text) return;
        setActiveMode('mergeAll');
        const newText = text.replace(/\n/g, '');
        copyToClipboard(newText);
    };

    // 句號後加斷行：只在全形句號、問號、驚嘆號後加換行（不處理半形）
    const handleAddBreakAfterPeriod = () => {
        if (!text) return;
        setActiveMode('addBreak');
        // 只處理全形標點符號，避免誤判網址等內容
        const newText = text
            .replace(/。/g, '。\n')
            .replace(/！/g, '！\n')
            .replace(/？/g, '？\n')
            // 清理可能產生的多餘換行
            .replace(/\n{2,}/g, '\n')
            .trim();
        copyToClipboard(newText);
    };

    // 雙斷行加空白：在雙換行之間加入特殊字元，防止平台（如 Facebook）吞掉換行
    const handleDoubleBreakWithSpace = () => {
        if (!text) return;
        setActiveMode('doubleBreak');
        // 使用零寬度空格 + 換行來保持段落間距
        const zwsp = '\u200B'; // 零寬度空格
        const newText = text
            // 先統一換行符
            .replace(/\r\n/g, '\n')
            // 將兩個以上的連續換行替換為：換行 + 零寬度空格 + 換行
            .replace(/\n{2,}/g, `\n${zwsp}\n`);
        copyToClipboard(newText);
    };

    // Button style helper
    const getButtonClass = (mode) => {
        return `action-btn ${activeMode === mode ? '' : 'secondary'}`;
    };

    return (
        <div className="whitespace-tool">
            <div className="section-header">斷行工具 (Line Break Tool)</div>

            {/* Statistics display */}
            <div style={{
                display: 'flex',
                gap: '16px',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '6px',
                border: '1px solid var(--border)'
            }}>
                <span>總字元: <strong style={{ color: 'var(--text-primary)' }}>{text.length}</strong></span>
                <span>換行數: <strong style={{ color: 'var(--text-primary)' }}>{lineBreakCount}</strong></span>
                <span>雙換行: <strong style={{ color: doubleBreakCount > 0 ? 'var(--success)' : 'var(--text-primary)' }}>{doubleBreakCount}</strong></span>
            </div>

            <textarea
                className="ws-textarea"
                value={text}
                onChange={(e) => { setText(e.target.value); setActiveMode(null); }}
                placeholder="在此輸入或貼上文字...&#10;&#10;然後使用下方按鈕處理換行格式。"
            />

            <div className="ws-controls" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <button
                    className={getButtonClass('removeExtra')}
                    onClick={handleRemoveExtraBreaks}
                    title="將多個連續換行變成單一換行"
                >
                    <Minus size={20} />
                    <span>移除多餘換行</span>
                </button>
                <button
                    className={getButtonClass('mergeAll')}
                    onClick={handleMergeAllBreaks}
                    title="移除所有換行，合併成一行"
                >
                    <Merge size={20} />
                    <span>合併所有斷行</span>
                </button>
                <button
                    className={getButtonClass('addBreak')}
                    onClick={handleAddBreakAfterPeriod}
                    title="在全形句號。！？後加換行（不影響半形標點）"
                >
                    <SplitSquareHorizontal size={20} />
                    <span>句號後加斷行</span>
                </button>
                <button
                    className={getButtonClass('doubleBreak')}
                    onClick={handleDoubleBreakWithSpace}
                    title="在雙換行處加入隱形字元，防止 Facebook 等平台吞掉換行"
                >
                    <Space size={20} />
                    <span>雙斷行加空白</span>
                </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>
                <div style={{ marginBottom: '6px' }}>💡 <strong>功能說明：</strong></div>
                <div style={{ paddingLeft: '12px' }}>
                    • <strong>移除多餘換行</strong>：將多個連續空行合併為單一換行<br />
                    • <strong>合併所有斷行</strong>：移除所有換行，把文字連成一行<br />
                    • <strong>句號後加斷行</strong>：在全形。！？後自動加換行（不影響英文與網址）<br />
                    • <strong>雙斷行加空白</strong>：解決 Facebook 貼文吞換行問題
                </div>
            </div>
        </div>
    );
};

export default LineBreakTab;
