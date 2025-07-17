import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RAWG_API_KEY = Deno.env.get('RAWG_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  try {
    const { vibe, likes, dislikes, searchType = 'primary' } = await req.json()
    
    let searchParams
    let games = []

    if (searchType === 'primary') {
      // Primary search: More specific parameters
      searchParams = new URLSearchParams({
        key: RAWG_API_KEY,
        page_size: '20',
        ordering: '-rating',
        search: likes,
      })
      
      // Add genre filtering based on vibe
      const vibeGenres = extractGenresFromVibe(vibe)
      if (vibeGenres.length > 0) {
        searchParams.append('genres', vibeGenres.join(','))
      }
    } else {
      // Fallback search: Broader parameters
      searchParams = new URLSearchParams({
        key: RAWG_API_KEY,
        page_size: '20',
        ordering: '-rating',
        search: extractMainKeywords(likes),
      })
    }

    // Fetch games from RAWG
    const response = await fetch(`https://api.rawg.io/api/games?${searchParams}`)
    const data = await response.json()

    if (data.results && data.results.length > 0) {
      // Process and filter results
      games = data.results
        .filter(game => {
          if (searchType === 'primary') {
            // Strict filtering for primary search
            const dislikedTerms = dislikes.toLowerCase().split(/[\s,]+/)
            return !dislikedTerms.some(term => 
              term.length > 2 && (
                game.genres?.some(genre => genre.name.toLowerCase().includes(term)) ||
                game.tags?.some(tag => tag.name.toLowerCase().includes(term)) ||
                game.name.toLowerCase().includes(term)
              )
            )
          } else {
            // Looser filtering for fallback search
            const majorDislikedTerms = dislikes.toLowerCase().split(/[\s,]+/).filter(term => term.length > 4)
            return !majorDislikedTerms.some(term => 
              game.name.toLowerCase().includes(term) ||
              game.genres?.some(genre => genre.name.toLowerCase().includes(term))
            )
          }
        })
        .slice(0, 3) // Get top 3 matches
        .map(game => ({
          name: game.name,
          slug: game.slug,
          description_preview: game.description_raw?.slice(0, 200) + '...' || 
                              `${game.name} is a ${game.genres?.map(g => g.name).join(', ') || 'great'} game that offers an engaging experience.`,
          genres: game.genres?.map(g => g.name) || [],
          rating: game.rating,
          details: `Released ${game.released || 'recently'}, rated ${game.rating || 'highly'}/5 with ${game.ratings_count || 'many'} reviews`
        }))
    }

    // Log search attempt
    await supabase.from('search_logs_v4').insert([
      {
        vibe,
        likes,
        dislikes,
        search_type: searchType,
        results_count: games.length,
        timestamp: new Date().toISOString()
      }
    ])

    return new Response(
      JSON.stringify({ 
        games,
        searchType,
        totalFound: games.length 
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to get recommendations', games: [] }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

// Helper function to extract genres from vibe description
function extractGenresFromVibe(vibe) {
  const genreMap = {
    'action': 'action',
    'adventure': 'adventure',
    'rpg': 'role-playing-games-rpg',
    'strategy': 'strategy',
    'simulation': 'simulation',
    'racing': 'racing',
    'sports': 'sports',
    'puzzle': 'puzzle',
    'horror': 'horror',
    'shooter': 'shooter',
    'fighting': 'fighting',
    'platformer': 'platformer',
    'casual': 'casual',
    'indie': 'indie',
    'relaxing': 'casual',
    'chill': 'casual',
    'story': 'adventure',
    'narrative': 'adventure',
    'competitive': 'multiplayer',
    'multiplayer': 'multiplayer',
    'retro': 'indie'
  }
  
  const vibeWords = vibe.toLowerCase().split(/[\s,]+/)
  const genres = []
  
  for (const word of vibeWords) {
    for (const [key, value] of Object.entries(genreMap)) {
      if (word.includes(key)) {
        genres.push(value)
      }
    }
  }
  
  return [...new Set(genres)] // Remove duplicates
}

// Helper function to extract main keywords from likes
function extractMainKeywords(likes) {
  // Extract game titles and main keywords, remove common words
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'game', 'games', 'like', 'love', 'enjoy', 'played', 'really']
  const words = likes.toLowerCase().split(/[\s,]+/)
  const keywords = words.filter(word => word.length > 3 && !commonWords.includes(word))
  
  return keywords.slice(0, 3).join(' ') // Take first 3 meaningful keywords
}