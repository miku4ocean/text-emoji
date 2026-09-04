import React, { useState } from 'react';
import { Copy, Trash2, Wand2, RotateCcw } from 'lucide-react';
import { countChars } from '../utils/text';

const WhitespaceTab = ({ onNotify }) => {
    const [text, setText] = useState('');

    // Count zero-width spaces in text
    // \u5B57\u5143\u6578\u4EE5 grapheme \u8A08\u7B97\uFF0C\u5426\u5247 emoji\uFF0FZWJ \u7D44\u5408\u5B57\u6703\u88AB String.length \u7B97\u6210\u597D\u5E7E\u500B
    const zwspCount = (text.match(/\u200B/g) || []).length;
    const totalChars = countChars(text);
    const visibleChars = totalChars - zwspCount;

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
        onNotify('已還原！');
    };

    const copyToClipboard = async (txt) => {
        const isProcessed = txt !== undefined;
        try {
            await navigator.clipboard.writeText(isProcessed ? txt : text);
            onNotify(isProcessed ? '已處理並複製！' : '已複製！');
        } catch (err) {
            // 權限被拒、非安全來源、舊瀏覽器沒有 navigator.clipboard 都會走到這裡。
            // 只寫 console 的話畫面毫無反應，使用者會以為已經複製好了。
            console.error('Failed to copy', err);
            onNotify(isProcessed ? '已處理，但複製失敗，請手動複製' : '複製失敗，請手動複製');
        }
    };

    return (
        <div className="whitespace-tool">
            <div className="section-header">整理分段空白 (Zero-Width Space)</div>

            {/* Character count display */}
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
                <span>可見字元: <strong style={{ color: 'var(--text-primary)' }}>{visibleChars}</strong></span>
                <span>隱形空格: <strong style={{ color: zwspCount > 0 ? 'var(--success)' : 'var(--text-primary)' }}>{zwspCount}</strong></span>
                <span>總字元數: <strong style={{ color: 'var(--text-primary)' }}>{totalChars}</strong></span>
            </div>

            <textarea
                className="ws-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="在此輸入文字...&#10;&#10;範例：Hello World&#10;&#10;點擊「注入」後，文字看起來相同，但會包含隱形的零寬度空格。"
            />
            <div className="ws-controls">
                <button className="action-btn" onClick={handleInject}>
                    <Wand2 size={20} />
                    <span>注入</span>
                </button>
                <button className="action-btn secondary" onClick={() => copyToClipboard()}>
                    <Copy size={20} />
                    <span>複製</span>
                </button>
                <button className="action-btn secondary" onClick={() => setText('')}>
                    <Trash2 size={20} />
                    <span>清除</span>
                </button>
                <button className="action-btn secondary" onClick={handleClean}>
                    <RotateCcw size={20} />
                    <span>還原</span>
                </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.5 }}>
                💡 <strong>使用說明：</strong>點擊「注入」會在所有空格與換行後加入零寬度空格 (U+200B)。
                <br />
                可用於：繞過文字過濾器、防止內容被自動偵測、製造獨特的文字指紋。
            </div>
        </div>
    );
};

export default WhitespaceTab;

