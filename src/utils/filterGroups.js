// Shared group-filtering logic for Emoji / Symbol / Kaomoji tabs.
// Data shape: [{ category: string, items: string[] }, ...]
// Matching semantics (same as the original SymbolTab implementation):
// 1. If the category name contains the filter text (case-insensitive),
//    the whole category is shown.
// 2. Otherwise only items whose text contains the filter string are kept.
// 3. Categories left with no items are dropped.
//
// 比對前一律做 normalize：轉小寫，並移除 variation selector（U+FE0E／U+FE0F）。
// 使用者從聊天軟體或手機鍵盤複製來的 emoji 多半帶著看不見的 U+FE0F
// （「❤️」＝ 2764 FE0F），但資料檔存的常是裸字元「❤」＝ 2764。
// 兩者畫面上一模一樣，不 normalize 就會出現「明明看得到卻搜不到」。
const normalize = (text) => text.toLowerCase().replace(/[\uFE0E\uFE0F]/g, '');

export const filterGroups = (groups, filter) => {
    if (!filter) return groups;
    const lowerFilter = normalize(filter);
    // 整串都是看不見的字元（例如只貼到一個 variation selector）時視同未搜尋，
    // 否則空字串會讓每一項都命中，語意反而更奇怪。
    if (!lowerFilter) return groups;
    return groups
        .map(cat => {
            if (normalize(cat.category).includes(lowerFilter)) {
                return cat;
            }
            return {
                ...cat,
                items: cat.items.filter(item => normalize(item).includes(lowerFilter)),
            };
        })
        .filter(cat => cat.items.length > 0);
};
