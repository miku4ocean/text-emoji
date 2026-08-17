import React, { useMemo } from 'react';
import { emojis } from '../data/emojis';
import { filterGroups } from '../utils/filterGroups';
import EmptyState from './EmptyState';

const EmojiTab = ({ recent, onSelect, filter }) => {
    const filteredGroups = useMemo(() => filterGroups(emojis, filter), [filter]);

    if (filter && filteredGroups.length === 0) {
        return <EmptyState filter={filter} />;
    }

    return (
        <div>
            {recent.length > 0 && !filter && (
                <div className="section">
                    <div className="section-header">最近使用</div>
                    <div className="grid">
                        {recent.map((e, i) => (
                            <button key={`recent-${i}`} className="item-btn" onClick={() => onSelect(e)} aria-label={`複製 ${e}`}>
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
                            <button key={e} className="item-btn" onClick={() => onSelect(e)} aria-label={`複製 ${e}`}>
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
