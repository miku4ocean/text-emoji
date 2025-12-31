import React, { useState } from 'react';
import { Copy, Trash2, Wand2 } from 'lucide-react';

const WhitespaceTab = ({ onNotify }) => {
    const [text, setText] = useState('');

    const handleInject = () => {
        if (!text) return;
        // Inject ZWSP (\u200B) into spaces and newlines
        // Replace space with "space + zwsp"
        // Replace newline with "newline + zwsp"
        const zwsp = '\u200B';
        const newText = text
            .replace(/ /g, ` ${zwsp}`)
            .replace(/\n/g, `\n${zwsp}`);

        setText(newText);
        copyToClipboard(newText);
    };

    const handleClean = () => {
        // Remove ZWSP
        const newText = text.replace(/\u200B/g, '');
        setText(newText);
    };

    const copyToClipboard = async (txt) => {
        try {
            await navigator.clipboard.writeText(txt);
            onNotify('已處理並複製！');
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <div className="whitespace-tool">
            <div className="section-header">整理分段空白 (Zero-Width Space)</div>
            <textarea
                className="ws-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="在此輸入文字..."
            />
            <div className="ws-controls">
                <button className="action-btn" onClick={handleInject}>
                    <Wand2 size={16} style={{ marginRight: 6 }} />
                    注入隱形空白
                </button>
                <button className="action-btn secondary" onClick={() => copyToClipboard(text)}>
                    <Copy size={16} /> 複製
                </button>
                <button className="action-btn secondary" onClick={() => setText('')}>
                    <Trash2 size={16} /> 清除
                </button>
                <button className="action-btn secondary" onClick={handleClean}>
                    還原
                </button>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                將在所有空格與換行後加入零寬度空格 (U+200B)。可用於防止文字被自動合併或繞過某些過濾器。
            </div>
        </div>
    );
};

export default WhitespaceTab;
