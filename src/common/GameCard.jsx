import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './SafeIcon';

const GameCard = ({ game, index }) => {
  // Safety check - if game is null or not an object, return null
  if (!game || typeof game !== 'object') {
    return (
      <div className="bg-gray-800/50 p-4 rounded-lg">
        <p className="text-gray-400">Game information unavailable</p>
      </div>
    );
  }
  
  // Safely access game properties with fallbacks
  const {
    name = 'Unknown Game',
    description_preview = null,
    genres = [],
    details = 'No details available',
    slug = null,
    rating = null
  } = game;
  
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-purple-400 font-mono">{index + 1}.</span>
        <div className="space-y-2 flex-1">
          <h4 className="text-lg font-medium text-white">{name}</h4>
          
          {description_preview && (
            <p className="text-gray-400 text-sm">{description_preview}</p>
          )}
          
          {Array.isArray(genres) && genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {genres.map((genre, i) => (
                <span 
                  key={`${genre}-${i}`} 
                  className="px-2 py-1 bg-purple-900/30 rounded-full text-xs text-purple-300"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
          
          <div className="text-sm text-gray-500">{details}</div>
          
          {slug && (
            <a
              href={`https://rawg.io/games/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm mt-2"
            >
              <SafeIcon icon={FiIcons.FiExternalLink} className="text-xs" />
              Find it on RAWG
            </a>
          )}
        </div>
        
        {rating && (
          <div className="flex items-center gap-1 text-yellow-400">
            <SafeIcon icon={FiIcons.FiStar} className="text-xs" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;