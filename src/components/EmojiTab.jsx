import React, { useMemo } from 'react';
import { emojis } from '../data/emojis';

const EmojiTab = ({ recent, onSelect, filter }) => {
    const filteredGroups = useMemo(() => {
        if (!filter) return emojis;
        // Simple filter?? Emojis are chars. Hard to filter without metadata.
        // We'll skip filter for emojis unless we map names. 
        // To keep it simple and efficient, we won't correct filter applied to main emojis unless exact match (useless).
        // So we ignore filter for emojis actually.
        return emojis;
    }, [filter]);

    return (
        <div>
            {recent.length > 0 && !filter && (
                <div className="section">
                    <div className="section-header">最近使用</div>
                    <div className="grid">
                        {recent.map((e, i) => (
                            <button key={`recent-${i}`} className="item-btn" onClick={() => onSelect(e)}>
                                {e}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {filteredGroups.map(cat => (
                <div key={cat.category} className="section">
                    <div className="section-header">{cat.category}</div>
                    <div className="grid">
                        {cat.items.map(e => (
                            <button key={e} className="item-btn" onClick={() => onSelect(e)}>
                                {e}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EmojiTab;
