import React, { useState, useEffect } from 'react';
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
const getStoredTheme = () => {
  try {
    return localStorage.getItem('emoji-toolbox-theme') || 'dark';
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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
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

      {/* Toast */}
      <div className={`toast ${toast ? 'visible' : ''}`}>
        {toast}
      </div>
    </div>
  );
}

export default App;
