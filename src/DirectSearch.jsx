import React, { useState } from 'react';
import { icon } from '../common/icon'; // Assuming this is your icon import
import ErrorDisplay from '../common/ErrorDisplay'; // Assuming this is your error component

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

    try {
      // 1. Define your Supabase function URL and public anon key
      const supabaseFunctionUrl = 'PASTE_YOUR_SUPABASE_EDGE_FUNCTION_URL_HERE';
      const supabaseAnonKey = 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE';

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

  // The rest of your component's return statement (JSX) would go here...
}