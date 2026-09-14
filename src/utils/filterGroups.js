// Shared group-filtering logic for Emoji / Symbol / Kaomoji tabs.
// Data shape: [{ category: string, items: string[] }, ...]
// Matching semantics:
// 1. Each item is matched against: its text content, AND its tooltip name (from nameMap).
// 2. Category name match no longer shows the whole category — every item must individually match.
// 3. Categories left with no items are dropped.
const normalize = (text) => text.toLowerCase().replace(/[︎️]/g, '');

export const filterGroups = (groups, filter, nameMap) => {
    if (!filter) return groups;
    const lowerFilter = normalize(filter);
    if (!lowerFilter) return groups;
    return groups
        .map(cat => {
            return {
                ...cat,
                items: cat.items.filter(item => {
                    if (normalize(item).includes(lowerFilter)) return true;
                    if (nameMap) {
                        const name = nameMap[item] || nameMap[normalize(item)] || '';
                        if (name.toLowerCase().includes(lowerFilter)) return true;
                    }
                    return false;
                }),
            };
        })
        .filter(cat => cat.items.length > 0);
};
