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
  const [input, setInput] = useState(''); // NEW: State for the user's text input
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const endOfMessagesRef = useRef(null);

  // --- SUPABASE CONFIG ---
  const supabaseFunctionUrl = 'https://afmtcpfxjrqmgjmygwez.supabase.co/functions/v1/get-openai-recommendations';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbXRjcGZ4anJxbWdqbXlnd2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTg2NzgsImV4cCI6MjA2ODI5NDY3OH0.XhDlabjTxfM788yXuOzmY6a29NontTWUg4o572XQcMs';

  // --- NEW: HELPER FUNCTION TO CALL OPENAI BACKEND ---
  const invokeOpenAIFunction = async (query) => {
    const response = await fetch(supabaseFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "The AI failed to respond.");
    }
    return response.json();
  };

  // --- UI & MESSAGE HELPERS ---
  const scrollToBottom = () => {
    setTimeout(() => {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const startConversation = (isRestart = false) => {
    setError(null);
    setIsLoading(false);
    const welcomeMessage = { id: Date.now(), type: 'bot', content: isRestart ? "Let's start over. What kind of game are you looking for?" : "Hello! I'm Game Scout. Describe the kind of game you want to play." };
    setMessages([welcomeMessage]);
  };

  // Load the initial welcome message on component mount
  useEffect(() => {
    startConversation();
  }, []);

  // --- NEW: CORE LOGIC TO HANDLE USER'S QUERY ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', content: input };
    const loadingMessage = { id: Date.now() + 1, type: 'bot', isSearching: true, content: "Scouting for games..." };
    
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    const currentQuery = input;
    setInput(''); // Clear the input field immediately

    try {
      const gameRecommendations = await invokeOpenAIFunction(currentQuery);
      
      // Replace the "loading" message with the final game results
      setMessages(prev => [...prev.slice(0, -1), {
        id: Date.now() + 2,
        type: 'bot',
        component: 'GameResults',
        props: { games: gameRecommendations.games || gameRecommendations, onRestart: () => startConversation(true) }
      }]);

    } catch (err) {
      // Replace the "loading" message with an error
      setMessages(prev => [...prev.slice(0, -1), {
        id: Date.now() + 2,
        type: 'bot',
        content: `I encountered an error: ${err.message}`,
        component: 'RestartButton',
        props: { onRestart: () => startConversation(true) }
      }]);
    }
  };
  
  // --- RETAINED UI SUB-COMPONENTS ---
  const GameResults = ({ games, onRestart }) => {
    if (!games || games.length === 0) {
      return (
        <div className="mt-3 text-center">
          <p className="text-gray-400 mb-3">No games found matching your request.</p>
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="mt-3 space-y-4">
        <p className="mb-2">Here are a few ideas based on your request:</p>
        {games.map((game, index) => (
          <div key={index} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
            <h4 className="font-bold text-white mb-1">{game.name} ({new Date(game.release_date).getFullYear()})</h4>
            <p className="text-gray-300 text-sm mb-2">{game.description}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {game.platforms?.map(platform => (
                <span key={platform} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                  {platform}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {game.store_links?.map(link => (
                <a href={link.url} target="_blank" rel="noopener noreferrer" key={link.store_name} className="px-2 py-1 bg-purple-900/50 rounded-full text-xs text-purple-300 hover:bg-purple-900/80">
                  {link.store_name}
                </a>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={onRestart}
          className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Start a New Search
        </button>
      </div>
    );
  };

  const RestartButton = ({ onRestart }) => (
    <button
      onClick={onRestart}
      className="mt-3 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
    >
      Start Over
    </button>
  );

  // --- MAIN APP RENDER ---
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-2rem)]">
        <header className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <SafeIcon icon={FiIcons.FiGamepad} className="text-purple-400 text-3xl" />
            <h1 className="text-3xl font-bold">Game Scout</h1>
          </div>
          <p className="text-gray-400">AI-Powered Game Recommendations</p>
        </header>
        
        <main className="flex-grow space-y-4 overflow-y-auto pr-2">
          {error && (
            <div className="bg-red-900/50 p-4 rounded-lg text-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {messages.map((msg) => {
              const componentToRender = () => {
                if (!msg.component) return null;
                switch (msg.component) {
                  case 'GameResults': return <GameResults {...msg.props} />;
                  case 'RestartButton': return <RestartButton {...msg.props} />;
                  default: return null;
                }
              };

              return (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-full lg:max-w-xl px-4 py-3 rounded-lg ${
                    msg.type === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-800 text-gray-100'
                  }`}>
                    {msg.content && <p>{msg.content}</p>}
                    {msg.isSearching && (
                      <div className="flex items-center gap-2">
                         <SafeIcon icon={FiIcons.FiLoader} className="animate-spin text-purple-40-400" />
                         <span>Searching...</span>
                      </div>
                    )}
                    {componentToRender()}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div ref={endOfMessagesRef} />
        </main>

        {/* --- NEW: CHAT INPUT FORM --- */}
        <footer className="mt-4">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center bg-gray-800 rounded-lg p-2 border border-gray-700 focus-within:border-purple-500 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., 'a cozy farming sim like stardew valley but with magic'"
                className="flex-grow bg-transparent text-white placeholder-gray-500 focus:outline-none px-2"
                disabled={isLoading}
              />
              <button type="submit" className="bg-purple-600 text-white rounded-lg p-3 hover:bg-purple-700 transition-colors disabled:bg-gray-600" disabled={isLoading || !input.trim()}>
                <SafeIcon icon={FiIcons.FiSend} />
              </button>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
}

export default App;