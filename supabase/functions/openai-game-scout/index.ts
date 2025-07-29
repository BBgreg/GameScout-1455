import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  try {
    const { query } = await req.json()
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a game recommendation expert. Based on the user's description, recommend 3-5 games that match their request. 

Return your response as a JSON array of game objects with this exact structure:
[
  {
    "name": "Game Title",
    "description": "A compelling 2-3 sentence description that explains why this game fits their request",
    "release_date": "YYYY-MM-DD",
    "platforms": ["PC", "PlayStation 5", "Xbox Series X/S", "Nintendo Switch"],
    "store_links": [
      {"name": "Steam", "url": "https://store.steampowered.com/app/..."},
      {"name": "Epic Games", "url": "https://store.epicgames.com/..."}
    ]
  }
]

Important guidelines:
- Only include real games that actually exist
- Provide accurate release dates
- Include realistic store links (you can use placeholder URLs if exact links aren't known)
- Make descriptions engaging and explain why each game fits the user's request
- Prioritize well-known, highly-rated games
- If the request is vague, recommend popular games from different genres`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    // Parse the JSON response
    let games
    try {
      games = JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content)
      throw new Error('Invalid response format from AI')
    }

    // Validate the response structure
    if (!Array.isArray(games)) {
      throw new Error('Response is not an array')
    }

    // Return the games array
    return new Response(
      JSON.stringify(games),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to get game recommendations' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})