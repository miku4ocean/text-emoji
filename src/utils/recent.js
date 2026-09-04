// 「最近使用」清單的讀寫。
// localStorage 是同網域共用的，內容不保證是本工具寫的（同一個 GitHub Pages
// 帳號底下的其他工具也可能用到同名 key），所以讀出來的東西一律當成不可信輸入：
// 只接受「字串陣列」，其餘一律當作沒有紀錄，避免呼叫端 `.map()` 當場炸掉整頁。
export const getRecent = (key) => {
    try {
        const item = localStorage.getItem(key);
        if (!item) return [];
        const parsed = JSON.parse(item);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(i => typeof i === 'string');
    } catch (e) {
        console.error("Error reading recent items", e);
        return [];
    }
};

export const addRecent = (key, item) => {
    // Remove if exists to move to top
    const filtered = getRecent(key).filter(i => i !== item);
    // Add to front, limit to 24
    const newItems = [item, ...filtered].slice(0, 24);
    try {
        localStorage.setItem(key, JSON.stringify(newItems));
    } catch (e) {
        // 無痕模式／容量已滿時寫入會失敗；這只影響「下次開啟還在不在」，
        // 本次的清單仍是正確的，不能回傳空陣列讓畫面上的最近使用整排消失。
        console.error("Error saving recent items", e);
    }
    return newItems;
};
