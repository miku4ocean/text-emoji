import React, { useState, useEffect } from 'react';
import { Smile, Type, Meh, AlignLeft, Search } from 'lucide-react';
import EmojiTab from './components/EmojiTab';
import SymbolTab from './components/SymbolTab';
import KaomojiTab from './components/KaomojiTab';
import WhitespaceTab from './components/WhitespaceTab';
import { getRecent, addRecent } from './utils/recent';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('emoji');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Recents state
  const [recentEmojis, setRecentEmojis] = useState([]);
  const [recentSymbols, setRecentSymbols] = useState([]);
  const [recentKaomojis, setRecentKaomojis] = useState([]);

  useEffect(() => {
    setRecentEmojis(getRecent('recent_emojis'));
    setRecentSymbols(getRecent('recent_symbols'));
    setRecentKaomojis(getRecent('recent_kaomojis'));
  }, []);

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

  return (
    <div className="container">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'emoji' ? 'active' : ''}`}
          onClick={() => { setActiveTab('emoji'); setSearch(''); }}
          title="表情符號"
        >
          <Smile size={20} />
        </button>
        <button
          className={`tab-btn ${activeTab === 'symbol' ? 'active' : ''}`}
          onClick={() => { setActiveTab('symbol'); setSearch(''); }}
          title="特殊符號"
        >
          <Type size={20} />
        </button>
        <button
          className={`tab-btn ${activeTab === 'kaomoji' ? 'active' : ''}`}
          onClick={() => { setActiveTab('kaomoji'); setSearch(''); }}
          title="顏文字"
        >
          <Meh size={20} />
        </button>
        <button
          className={`tab-btn ${activeTab === 'whitespace' ? 'active' : ''}`}
          onClick={() => { setActiveTab('whitespace'); setSearch(''); }}
          title="分段空白"
        >
          <AlignLeft size={20} />
        </button>
      </div>

      {/* Search (Not for Whitespace) */}
      {activeTab !== 'whitespace' && (
        <div className="search-bar">
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
      </div>

      {/* Toast */}
      <div className={`toast ${toast ? 'visible' : ''}`}>
        {toast}
      </div>
    </div>
  );
}

export default App;
