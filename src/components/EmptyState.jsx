import React from 'react';

// Shared "no search results" placeholder for Emoji / Symbol / Kaomoji tabs.
// Shown when a filter is active but produced zero matches, so the results
// area never goes blank (white screen) on a no-hit search.
const EmptyState = ({ filter }) => (
    <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <div className="empty-state-title">找不到「{filter}」的結果</div>
        <div className="empty-state-hint">試試其他關鍵字，或清空搜尋瀏覽全部分類</div>
    </div>
);

export default EmptyState;
