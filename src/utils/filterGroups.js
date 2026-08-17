// Shared group-filtering logic for Emoji / Symbol / Kaomoji tabs.
// Data shape: [{ category: string, items: string[] }, ...]
// Matching semantics (same as the original SymbolTab implementation):
// 1. If the category name contains the filter text (case-insensitive),
//    the whole category is shown.
// 2. Otherwise only items whose text contains the filter string are kept.
// 3. Categories left with no items are dropped.
export const filterGroups = (groups, filter) => {
    if (!filter) return groups;
    const lowerFilter = filter.toLowerCase();
    return groups
        .map(cat => {
            if (cat.category.toLowerCase().includes(lowerFilter)) {
                return cat;
            }
            return {
                ...cat,
                items: cat.items.filter(item => item.toLowerCase().includes(lowerFilter)),
            };
        })
        .filter(cat => cat.items.length > 0);
};
