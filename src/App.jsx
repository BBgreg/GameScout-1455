import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';

// A small, safe component to render icons
function SafeIcon({ icon: Icon, ...props }) {
  if (!Icon) return null;
  return <Icon {...props} />;
}

// The main App component
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
    const searchQuery = input.trim();
    if (!searchQuery) return;

    setIsLoading(true);
    setError(null);
    setGames([]);
    setHasSearched(true);

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

      // --- THIS IS THE CORRECTED LOGIC ---
      // Check if 'data' itself is an array
      if (data && Array.isArray(data)) {
        const formattedGames = data.map(game => ({
          id: game.id,
          name: game.name || 'Unknown Game',
          released: game.released || 'Unknown release date',
          rating: game.rating || 0,
          genres: (game.genres || []).map(g => g.name),
          slug: game.slug, // Include the slug for the link
        }));
        setGames(formattedGames);
      } else {
        // This handles cases where the function returns an error object or unexpected data
        if (data && data.error) {
          throw new Error(data.error);
        }
        setGames([]);
      }
      // --- END OF CORRECTED LOGIC ---

    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to get game recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center gap-2 mb-6">
          <SafeIcon icon={FiIcons.FiGamepad} className="text-purple-400 text-2xl" />
          <h1 className="text-3xl font-bold">Game Scout</h1>
        </header>

        <main>
          {!hasSearched && (
            <p className="mb-6 text-lg text-gray-300">
              What kind of game are you looking for? (e.g., rpg, cyberpunk, puzzle)
            </p>
          )}

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Enter a genre, tag, or keyword..."
                className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 transition-colors rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

          {isLoading && (
            <div className="text-center p-6">
              <SafeIcon icon={FiIcons.FiLoader} className="animate-spin text-purple-400 text-4xl mx-auto" />
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 p-4 rounded-lg mb-4 text-center">
              <div className="flex gap-2 items-center justify-center mb-2">
                <SafeIcon icon={FiIcons.FiAlertTriangle} className="text-red-400" />
                <h2 className="text-red-300 font-medium">Error</h2>
              </div>
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {hasSearched && !isLoading && games.length === 0 && !error && (
            <div className="text-gray-400 text-center p-6 bg-gray-800/50 rounded-lg">
              <p className="text-lg">No games found matching that term.</p>
              <p>Please try another search.</p>
            </div>
          )}

          {games.length > 0 && !isLoading && (
            <div>
              <h3 className="text-xl text-purple-300 mb-4">
                Based on your search for "{input}", here are some games you might enjoy:
              </h3>
              <div className="space-y-4">
                {games.map((game, index) => (
                  <a
                    key={game.id || index}
                    href={`https://rawg.io/games/${game.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/80 hover:ring-2 hover:ring-purple-500 transition-all"
                  >
                    <div className="flex gap-3">
                      <span className="text-purple-400 font-mono text-lg pt-1">{index + 1}.</span>
                      <div className="space-y-2 flex-1">
                        <h4 className="text-lg font-medium text-white">{game.name}</h4>
                        {game.genres && game.genres.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {game.genres.map((genre, i) => (
                              <span
                                key={`${genre}-${i}`}
                                className="px-2 py-1 bg-purple-900/50 rounded-full text-xs text-purple-300"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="text-sm text-gray-400">
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
                  </a>
                ))}
              </div>
            </div>
          )}

          {hasSearched && !isLoading && (
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
        </main>
      </div>
    </div>
  );
}

export default App;