import React, { useState, useEffect, useRef } from 'react';
import { Smile, Type, Cat, AlignLeft, WrapText, Search, Sun, Moon } from 'lucide-react';
import EmojiTab from './components/EmojiTab';
import SymbolTab from './components/SymbolTab';
import KaomojiTab from './components/KaomojiTab';
import WhitespaceTab from './components/WhitespaceTab';
import LineBreakTab from './components/LineBreakTab';
import { getRecent, addRecent } from './utils/recent';
import './App.css';

// Tab configuration with titles
const TABS = [
  { id: 'emoji', icon: Smile, label: '表情符號', subtitle: '點擊複製表情符號' },
  { id: 'symbol', icon: Type, label: '文字符號', subtitle: '點擊複製特殊符號' },
  { id: 'kaomoji', icon: Cat, label: '顏文字', subtitle: '點擊複製顏文字' },
  { id: 'whitespace', icon: AlignLeft, label: '空白工具', subtitle: '注入隱形空格' },
  { id: 'linebreak', icon: WrapText, label: '斷行工具', subtitle: '處理換行格式' },
];

// Theme utility functions
const THEMES = ['dark', 'light'];

const getStoredTheme = () => {
  try {
    // localStorage 是同網域共用的，只認得 dark／light，
    // 其他值一律當預設深色，避免 data-theme 設成無效值、
    // 造成畫面配色與切換鈕狀態不一致。
    const stored = localStorage.getItem('emoji-toolbox-theme');
    return THEMES.includes(stored) ? stored : 'dark';
  } catch {
    return 'dark';
  }
};

const setStoredTheme = (theme) => {
  try {
    localStorage.setItem('emoji-toolbox-theme', theme);
  } catch {
    // localStorage not available
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('emoji');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState(getStoredTheme);

  // Recents state (lazy init: read localStorage once on first render,
  // instead of setState inside a mount effect)
  const [recentEmojis, setRecentEmojis] = useState(() => getRecent('recent_emojis'));
  const [recentSymbols, setRecentSymbols] = useState(() => getRecent('recent_symbols'));
  const [recentKaomojis, setRecentKaomojis] = useState(() => getRecent('recent_kaomojis'));

  // Apply theme changes (theme state itself is lazy-initialized from storage,
  // so no extra mount effect / setState-in-effect is needed)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setStoredTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    showToast(newTheme === 'light' ? '🌞 亮色模式' : '🌙 深色模式');
  };

  const toastTimer = useRef(null);
  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };

  const handleSelect = async (item, type) => {
    try {
      await navigator.clipboard.writeText(item);
      showToast('已複製！');

      // Add to recent
      if (type === 'emoji') {
        const newRecent = addRecent('recent_emojis', item);
        setRecentEmojis(newRecent);
      } else if (type === 'symbol') {
        const newRecent = addRecent('recent_symbols', item);
        setRecentSymbols(newRecent);
      } else if (type === 'kaomoji') {
        const newRecent = addRecent('recent_kaomojis', item);
        setRecentKaomojis(newRecent);
      }
    } catch (err) {
      console.error('Copy failed', err);
      showToast('複製失敗');
    }
  };

  const currentTab = TABS.find(t => t.id === activeTab);

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">✨ Emoji 工具箱</h1>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? '切換亮色模式' : '切換深色模式'}
          aria-label={theme === 'dark' ? '切換亮色模式' : '切換深色模式'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); setSearch(''); }}
              title={tab.label}
              aria-label={tab.label}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </div>

      {/* Sub header with current tab title */}
      <div className="sub-header">
        <h2 className="sub-title">{currentTab?.label}</h2>
        <p className="sub-description">{currentTab?.subtitle}</p>
      </div>

      {/* Search (Not for Whitespace or LineBreak) */}
      {activeTab !== 'whitespace' && activeTab !== 'linebreak' && (
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="搜尋..."
            aria-label={`搜尋${currentTab?.label ?? ''}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Content */}
      <div className="content">
        {activeTab === 'emoji' && (
          <EmojiTab
            recent={recentEmojis}
            onSelect={(e) => handleSelect(e, 'emoji')}
            filter={search}
          />
        )}
        {activeTab === 'symbol' && (
          <SymbolTab
            recent={recentSymbols}
            onSelect={(e) => handleSelect(e, 'symbol')}
            filter={search}
          />
        )}
        {activeTab === 'kaomoji' && (
          <KaomojiTab
            recent={recentKaomojis}
            onSelect={(e) => handleSelect(e, 'kaomoji')}
            filter={search}
          />
        )}
        {activeTab === 'whitespace' && (
          <WhitespaceTab onNotify={showToast} />
        )}
        {activeTab === 'linebreak' && (
          <LineBreakTab onNotify={showToast} />
        )}
      </div>

      {/* Toast：複製成功／失敗是這個工具唯一的操作回饋，必須是 live region，
          否則螢幕閱讀器使用者按下去完全不知道有沒有複製到 */}
      <div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}

export default App;
