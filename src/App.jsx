import React, { useState, useEffect, useRef } from 'react';
import * as FiIcons from 'react-icons/fi';

// A small, safe component to render icons
function SafeIcon({ icon: Icon, ...props }) {
  if (!Icon) return null;
  return <Icon {...props} />;
}

// The main App component
function App() {
  const [messages, setMessages] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const endOfMessagesRef = useRef(null);

  // --- SUPABASE & PLATFORM CONFIG ---
  const supabaseFunctionUrl = 'https://afmtcpfxjrqmgjmygwez.supabase.co/functions/v1';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbXRjcGZ4anJxbWdqbXlnd2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTg2NzgsImV4cCI6MjA2ODI5NDY3OH0.XhDlabjTxfM788yXuOzmY6a29NontTWUg4o572XQcMs';
  
  const platformOptions = [
    { id: 'pc', name: 'PC', value: 1 },
    { id: 'playstation', name: 'PlayStation', value: 2 },
    { id: 'xbox', name: 'Xbox', value: 3 },
    { id: 'nintendo', name: 'Nintendo', value: 7 }
  ];

  const invokeFunction = async (functionName, params = {}) => {
    const url = new URL(`${supabaseFunctionUrl}/${functionName}`);
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${supabaseAnonKey}` }
    });
    if (!response.ok) {
      throw new Error(`Function '${functionName}' failed: ${response.status}`);
    }
    return response.json();
  };
  
  const scrollToBottom = () => {
    setTimeout(() => {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const startConversation = async () => {
    setIsLoading(true);
    setError(null);
    setMessages([{ id: Date.now(), type: 'bot', content: "Hello! I'm Game Scout. Let's find your next favorite game." }]);
    try {
      const tagsData = await invokeFunction('get-all-tags');
      setAvailableTags(tagsData);
      addBotMessage({
        content: "To start, please select the genres or tags you'd like to include in your search.",
        component: 'TagSelector',
        props: { onConfirm: handleIncludeTagsConfirm, tags: tagsData }
      });
    } catch (err) {
      setError('Failed to load available tags. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startConversation();
  }, []);

  const addBotMessage = (messageData) => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'bot', ...messageData }]);
  };

  const addUserMessage = (content) => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content }]);
  };

  const handleIncludeTagsConfirm = (included, allTags) => {
    addUserMessage(`Including: ${included.map(t => t.name).join(', ') || 'Anything'}`);
    addBotMessage({
      content: "Great. Now, are there any genres or tags from that list you'd like to exclude?",
      component: 'TagSelector',
      props: { onConfirm: (excluded) => handleExcludeTagsConfirm(included, excluded), tags: allTags, isExclude: true }
    });
  };

  const handleExcludeTagsConfirm = (included, excluded) => {
    addUserMessage(`Excluding: ${excluded.map(t => t.name).join(', ') || 'Nothing'}`);
    addBotMessage({
      content: "Perfect. Next, which platforms are you interested in?",
      component: 'PlatformSelector',
      props: { onConfirm: (platforms) => handlePlatformsConfirm(included, excluded, platforms) }
    });
  };

  const handlePlatformsConfirm = (included, excluded, platforms) => {
    addUserMessage(`Platforms: ${platforms.map(p => p.name).join(', ') || 'Any'}`);
    addBotMessage({
      content: "Almost done. Are you looking for a game from a specific era?",
      component: 'DateSelector',
      props: { onConfirm: (dateRange) => handleDatesConfirm(included, excluded, platforms, dateRange) }
    });
  };

  const handleDatesConfirm = async (included, excluded, platforms, dateRange) => {
    const userResponse = dateRange ? `Released: ${dateRange.from}-${dateRange.to}` : "Released: Any time";
    addUserMessage(userResponse);
    addBotMessage({ content: "Excellent! Searching for the perfect games...", isSearching: true });
    
    try {
      const dateString = dateRange ? `${dateRange.from}-01-01,${dateRange.to}-12-31` : "";
      const searchData = await invokeFunction('get-game-recommendations', {
        tags: included.filter(t => t.type === 'tag').map(t => t.slug).join(','),
        genres: included.filter(t => t.type === 'genre').map(t => t.slug).join(','),
        exclude_tags: excluded.filter(t => t.type === 'tag').map(t => t.slug).join(','),
        exclude_genres: excluded.filter(t => t.type === 'genre').map(t => t.slug).join(','),
        platforms: platforms.map(p => p.value).join(','),
        dates: dateString,
      });
      
      setMessages(prev => [...prev.slice(0, -1), {
        id: Date.now() + 1,
        type: 'bot',
        content: `Here are your recommendations:`,
        component: 'GameResults',
        props: { games: searchData, onRestart: startConversation }
      }]);
    } catch (err) {
      setError('I encountered an error while searching. Please try again.');
    }
  };
  
  // --- UI SUB-COMPONENTS ---

  const TagSelector = ({ tags, isExclude = false, onConfirm }) => {
    const [selected, setSelected] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const handleToggle = (tag) => {
      setSelected(prev => prev.some(t => t.slug === tag.slug) ? prev.filter(t => t.slug !== tag.slug) : [...prev, tag]);
    };
    const filteredTags = (tags || []).filter(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
      <div className="mt-2 p-4 bg-gray-800/50 rounded-lg">
        <div className="relative mb-4">
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tags..." className="w-full p-2 pl-8 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-purple-500" />
          <SafeIcon icon={FiIcons.FiSearch} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex flex-wrap gap-2 mb-4 max-h-48 overflow-y-auto">
          {filteredTags.map((tag) => (
            <button key={tag.slug} onClick={() => handleToggle(tag)} className={`px-3 py-1 rounded-full text-sm transition-colors ${selected.some(t => t.slug === tag.slug) ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{tag.name}</button>
          ))}
        </div>
        {/* --- THIS IS THE CORRECTED LINE --- */}
        <button onClick={() => onConfirm(selected, tags)} className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">{isExclude ? 'Continue' : 'Done'}</button>
      </div>
    );
  };

  const PlatformSelector = ({ onConfirm }) => {
    const [selected, setSelected] = useState([]);
    const handleToggle = (platform) => {
      setSelected(prev => prev.some(p => p.id === platform.id) ? prev.filter(p => p.id !== platform.id) : [...prev, platform]);
    };
    return (
      <div className="mt-2 p-4 bg-gray-800/50 rounded-lg">
        <div className="flex flex-wrap gap-2 mb-4">
          {platformOptions.map((platform) => (
            <button key={platform.id} onClick={() => handleToggle(platform)} className={`px-3 py-1 rounded-full text-sm transition-colors ${selected.some(p => p.id === platform.id) ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{platform.name}</button>
          ))}
        </div>
        <button onClick={() => onConfirm(selected)} className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">Continue</button>
      </div>
    );
  };
  
  const DateSelector = ({ onConfirm }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 45 }, (_, i) => currentYear - i);
    const [from, setFrom] = useState('2000');
    const [to, setTo] = useState(currentYear.toString());
    const [anyDate, setAnyDate] = useState(true);

    return (
      <div className="mt-2 p-4 bg-gray-800/50 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
          <select value={from} onChange={e => setFrom(e.target.value)} disabled={anyDate} className="w-full sm:w-1/2 p-2 bg-gray-700 border border-gray-600 rounded-md disabled:opacity-50">
            {years.map(y => <option key={`from-${y}`} value={y}>{y}</option>)}
          </select>
          <span className="text-gray-400">to</span>
          <select value={to} onChange={e => setTo(e.target.value)} disabled={anyDate} className="w-full sm:w-1/2 p-2 bg-gray-700 border border-gray-600 rounded-md disabled:opacity-50">
            {years.map(y => <option key={`to-${y}`} value={y}>{y}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input type="checkbox" checked={anyDate} onChange={() => setAnyDate(!anyDate)} className="form-checkbox bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-600" />
          Any release date
        </label>
        <button onClick={() => onConfirm(anyDate ? null : { from, to })} className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">Find Games</button>
      </div>
    );
  };
  
  const GameResults = ({ games, onRestart }) => (
    <div className="mt-4 space-y-3">
      {games.length > 0 ? (
        games.map((game, index) => (
          <a key={game.id} href={`https://rawg.io/games/${game.slug}`} target="_blank" rel="noopener noreferrer" className="block bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition-colors">
            <div className="flex items-start gap-3">
              <span className="text-purple-400 font-mono text-sm mt-1">{index + 1}.</span>
              <div className="flex-1">
                <h4 className="text-lg font-medium text-white mb-1">{game.name}</h4>
                <div className="text-sm text-gray-400">Metacritic: {game.metacritic || 'N/A'}</div>
              </div>
            </div>
          </a>
        ))
      ) : (
        <p className="text-gray-400">No games matched your specific criteria.</p>
      )}
      <button onClick={onRestart} className="mt-3 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">Start Over</button>
    </div>
  );

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center gap-2 mb-6">
          <SafeIcon icon={FiIcons.FiGamepad} className="text-purple-400 text-2xl" />
          <h1 className="text-3xl font-bold">Game Scout</h1>
        </header>
        <main className="space-y-4">
          {error && <div className="bg-red-900/50 p-4 rounded-lg text-red-200">{error}</div>}
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isInteractive = index === messages.length - 1 && !isLoading;
              return (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-full lg:max-w-md px-4 py-2 rounded-lg ${msg.type === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-100'}`}>
                    <p>{msg.content}</p>
                    {msg.isSearching && <div className="flex items-center gap-2 mt-2"><SafeIcon icon={FiIcons.FiLoader} className="animate-spin text-purple-400" /></div>}
                    {isInteractive && msg.component === 'TagSelector' && <TagSelector {...msg.props} />}
                    {isInteractive && msg.component === 'PlatformSelector' && <PlatformSelector {...msg.props} />}
                    {isInteractive && msg.component === 'DateSelector' && <DateSelector {...msg.props} />}
                    {isInteractive && msg.component === 'GameResults' && <GameResults {...msg.props} />}
                  </div>
                </div>
              );
            })}
          </div>
          <div ref={endOfMessagesRef} />
          {isLoading && messages.length <= 1 && (
            <div className="text-center p-6"><SafeIcon icon={FiIcons.FiLoader} className="animate-spin text-purple-400 text-4xl mx-auto mb-2" /></div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;