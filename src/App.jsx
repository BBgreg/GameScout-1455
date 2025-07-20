import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';

function App() {
  const [input, setInput] = useState('');
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Assuming 'input' is the state variable for your search bar
    const searchQuery = input.trim(); 
    if (!searchQuery) return;

    setIsLoading(true);
    setError(null);
    setGames([]); // Or whatever your state setter for results is

    try {
      // 1. Define your Supabase function URL and public anon key
      const supabaseFunctionUrl = 'https://afmtcpfxjrqmgjmygwez.supabase.co/functions/v1/get-game-recommendations';
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbXRjcGZ4anJxbWdqbXlnd2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTg2NzgsImV4cCI6MjA2ODI5NDY3OH0.XhDlabjTxfM788yXuOzmY6a29NontTWUg4o572XQcMs';

      // 2. Call your Supabase function
      const response = await fetch(`${supabaseFunctionUrl}?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.results && Array.isArray(data.results)) {
        const formattedGames = data.results.map(game => ({
          id: game.id,
          name: game.name || 'Unknown Game',
          released: game.released || 'Unknown release date',
          rating: game.rating || 0,
          genres: (game.genres || []).map(g => g.name),
          image: game.background_image
        }));
        setGames(formattedGames);
      } else {
        setGames([]);
      }
      setHasSearched(true);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to get game recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <SafeIcon icon={FiIcons.FiGamepad} className="text-purple-400 text-xl" />
          <h1 className="text-2xl font-bold">Game Scout</h1>
        </div>

        {!hasSearched && (
          <div className="mb-6 text-lg text-gray-300">
            What kind of game are you looking for? (e.g., rpg, cyberpunk, puzzle)
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Enter search term (e.g., rpg, cyberpunk, puzzle)"
              className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-purple-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 transition-colors rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <SafeIcon icon={FiIcons.FiLoader} className="animate-spin" />
                  Searching...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <SafeIcon icon={FiIcons.FiSearch} />
                  Find Games
                </span>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-900/50 p-4 rounded mb-4">
            <div className="flex gap-2 items-center mb-2">
              <SafeIcon icon={FiIcons.FiAlertTriangle} className="text-red-400" />
              <h2 className="text-red-300 font-medium">Error</h2>
            </div>
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {hasSearched && games.length === 0 && !error && !isLoading && (
          <div className="text-gray-300 text-center p-6">
            No games found matching that term. Please try another search.
          </div>
        )}

        {games.length > 0 && (
          <div>
            <h3 className="text-lg text-purple-300 mb-4">
              Based on your search for "{input}", here are some games you might enjoy:
            </h3>
            <div className="space-y-4">
              {games.map((game, index) => (
                <div
                  key={game.id || index}
                  className="bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex gap-3">
                    <span className="text-purple-400 font-mono">{index + 1}.</span>
                    <div className="space-y-2 flex-1">
                      <h4 className="text-lg font-medium text-white">{game.name}</h4>
                      {game.genres && game.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {game.genres.map((genre, i) => (
                            <span
                              key={`${genre}-${i}`}
                              className="px-2 py-1 bg-purple-900/30 rounded-full text-xs text-purple-300"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        Released: {game.released}
                      </div>
                    </div>
                    {game.rating > 0 && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <SafeIcon icon={FiIcons.FiStar} className="text-xs" />
                        <span className="text-sm font-medium">{game.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasSearched && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setInput('');
                setGames([]);
                setError(null);
                setHasSearched(false);
              }}
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1 mx-auto"
            >
              <SafeIcon icon={FiIcons.FiRefreshCw} className="text-sm" />
              Try another search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;