import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import ErrorDisplay from './common/ErrorDisplay';
import GameCard from './common/GameCard';
import supabase from './lib/supabase';

function GameScout() {
  const [query, setQuery] = useState('');
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setGames([]);
    
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('get-game-recommendations', {
        body: { 
          vibe: query, 
          likes: query,
          dislikes: '',
          searchType: 'primary'
        }
      });
      
      if (error) throw error;
      
      if (data && data.games && Array.isArray(data.games)) {
        setGames(data.games);
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
        
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search term (e.g., rpg, cyberpunk, puzzle)"
              className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-purple-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
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
          <ErrorDisplay 
            error={error} 
            title="Error" 
            icon={FiIcons.FiAlertTriangle}
          />
        )}
        
        {hasSearched && games.length === 0 && !error && !isLoading && (
          <div className="text-gray-300 text-center p-6">
            I couldn't find any games matching that search. Please try another term!
          </div>
        )}
        
        {games.length > 0 && (
          <div>
            <h3 className="text-lg text-purple-300 mb-4">
              Based on your search for "{query}", here are a few games I found:
            </h3>
            <div className="space-y-4">
              {games.map((game, index) => (
                <GameCard key={game.slug || index} game={game} index={index} />
              ))}
            </div>
          </div>
        )}
        
        {hasSearched && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setQuery('');
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

export default GameScout;