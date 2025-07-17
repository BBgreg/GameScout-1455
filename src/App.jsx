import React, { useState } from 'react';
import { getGameRecommendations } from './lib/api';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bodyPreview, setBodyPreview] = useState(null);
  const [hasAttemptedCall, setHasAttemptedCall] = useState(false);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setHasAttemptedCall(false);
  };

  const handleShowDebugInfo = () => {
    // Show the body preview without making the actual call
    const requestBody = {
      genres: input,
      tags: "",
      excluded_tags: ""
    };
    
    setBodyPreview(JSON.stringify(requestBody, null, 2));
    setHasAttemptedCall(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Construct the JSON body as per the debugging assistant requirements
    const requestBody = {
      genres: input,
      tags: "",
      excluded_tags: ""
    };

    // Show the constructed body for debugging
    setBodyPreview(JSON.stringify(requestBody, null, 2));

    try {
      const response = await getGameRecommendations(requestBody);
      setResult(JSON.stringify(response, null, 2));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <SafeIcon icon={FiIcons.FiSearch} className="text-purple-400 text-xl" />
          <h1 className="text-2xl font-bold">Game Scout Debugging Assistant</h1>
        </div>
        
        <div className="bg-gray-800/50 p-4 rounded mb-6">
          <p className="text-gray-300">Enter a single game genre to test the function call.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Enter genre"
              className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-purple-500"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              type="button"
              onClick={handleShowDebugInfo}
              disabled={!input.trim() || isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                <SafeIcon icon={FiIcons.FiInfo} />
                Show JSON Body
              </span>
            </button>
            
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 transition-colors rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <SafeIcon icon={FiIcons.FiLoader} className="animate-spin" />
                  Calling Function...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <SafeIcon icon={FiIcons.FiPlay} />
                  Call Function
                </span>
              )}
            </button>
          </div>
        </form>

        {bodyPreview && (
          <div className="bg-gray-800/50 p-4 rounded mb-4">
            <h2 className="text-sm text-gray-400 mb-2 font-mono">
              {hasAttemptedCall && !result && !isLoading ? (
                "I will now attempt to call the get-game-recommendations function with the following JSON body:"
              ) : (
                "Request Body:"
              )}
            </h2>
            <pre className="text-xs whitespace-pre-wrap overflow-auto bg-gray-900 p-3 rounded">{bodyPreview}</pre>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 p-4 rounded mb-4">
            <div className="flex gap-2 items-center mb-2">
              <SafeIcon icon={FiIcons.FiAlertTriangle} className="text-red-400" />
              <h2 className="text-red-300 font-medium">Error</h2>
            </div>
            <pre className="whitespace-pre-wrap text-red-200">{error}</pre>
          </div>
        )}

        {result && (
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-sm text-gray-400 mb-2 font-mono">Response:</h2>
            <pre className="whitespace-pre-wrap overflow-auto bg-gray-900 p-3 rounded text-xs">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;