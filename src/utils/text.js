// 以「使用者看得到的字元」為單位計算長度。
//
// String.prototype.length 算的是 UTF-16 code unit：一顆 😀 會被算成 2、
// 帶膚色修飾符的 👍🏽 算成 4、ZWJ 組合字 👨‍👩‍👧‍👦 算成 11、國旗 🇹🇼 算成 4。
// 對「以字元為單位」的文字工具來說那是錯的數字，這裡改用 grapheme cluster。
const segmenter = (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function')
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

export const countChars = (text) => {
    if (!text) return 0;
    // 沒有 Intl.Segmenter 的舊環境退回 code point 計數：
    // 至少不會把一個 surrogate pair 拆成兩個字元。
    if (!segmenter) return Array.from(text).length;
    return [...segmenter.segment(text)].length;
};
