import React, { useMemo } from 'react';
import { kaomojis } from '../data/kaomojis';
import { filterGroups } from '../utils/filterGroups';
import EmptyState from './EmptyState';

const KaomojiTab = ({ recent, onSelect, filter }) => {
    const filteredGroups = useMemo(() => filterGroups(kaomojis, filter), [filter]);

    if (filter && filteredGroups.length === 0) {
        return <EmptyState filter={filter} />;
    }

    return (
        <div>
            {recent.length > 0 && !filter && (
                <div className="section">
                    <div className="section-header">最近使用</div>
                    <div className="kaomoji-grid">
                        {recent.map((e, i) => (
                            <button key={`recent-${i}`} className="kaomoji-btn" onClick={() => onSelect(e)} title={e}>
                                {e}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {filteredGroups.map(cat => (
                <div key={cat.category} className="section">
                    <div className="section-header">{cat.category}</div>
                    <div className="kaomoji-grid">
                        {cat.items.map(e => (
                            <button key={e} className="kaomoji-btn" onClick={() => onSelect(e)} title={e}>
                                {e}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KaomojiTab;
