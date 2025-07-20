import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import ErrorDisplay from './common/ErrorDisplay';

// This is a fallback direct search component that will be used if the webhook fails
function DirectSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
  // 1. Define your Supabase function URL and public anon key
const supabaseFunctionUrl = 'https://afmtcpfxjrqmgjmygwez.supabase.co/functions/v1/get-game-recommendations';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbXRjcGZ4anJxbWdqbXlnd2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTg2NzgsImV4cCI6MjA2ODI5NDY3OH0.XhDlabjTxfM788yXuOzmY6a29NontTWUg4o572XQcMs';

// 2. Call your Supabase function instead of the RAWG API
const response = await fetch(`${supabaseFunctionUrl}?query=${encodeURIComponent(query)}`, {
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`
  }
});
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-lg font-medium text-purple-300 mb-3">Direct Game Search</h2>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games directly..."
            className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-3 py-2 bg-purple-600 rounded disabled:opacity-50"
          >
            {isLoading ? (
              <SafeIcon icon={FiIcons.FiLoader} className="animate-spin" />
            ) : (
              <SafeIcon icon={FiIcons.FiSearch} />
            )}
          </button>
        </div>
      </form>
      
      {error && <ErrorDisplay error={error} />}
      
      {result && (
        <div className="text-sm text-gray-300">
          Found {result.count} results
        </div>
      )}
    </div>
  );
}

export default DirectSearch;
