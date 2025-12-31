import React, { useMemo } from 'react';
import { symbols } from '../data/symbols';

const SymbolTab = ({ recent, onSelect, filter }) => {
    const filteredGroups = useMemo(() => {
        if (!filter) return symbols;
        // Filter by checking if items include the filter text (useful if user pastes a symbol to find category?)
        // or filtering by category name
        const lowerFilter = filter.toLowerCase();
        return symbols.map(cat => ({
            ...cat,
            items: cat.items.filter(item => item.includes(filter)) // very basic
        })).filter(cat => cat.items.length > 0 || cat.category.toLowerCase().includes(lowerFilter));
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

export default SymbolTab;
