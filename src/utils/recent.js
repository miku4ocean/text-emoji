export const getRecent = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    } catch (e) {
        console.error("Error reading recent items", e);
        return [];
    }
};

export const addRecent = (key, item) => {
    try {
        const current = getRecent(key);
        // Remove if exists to move to top
        const filtered = current.filter(i => i !== item);
        // Add to front, limit to 24
        const newItems = [item, ...filtered].slice(0, 24);
        localStorage.setItem(key, JSON.stringify(newItems));
        return newItems;
    } catch (e) {
        console.error("Error saving recent items", e);
        return [];
    }
};
