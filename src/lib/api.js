import supabase from './supabase';

export async function getGameRecommendations(requestBody) {
  try {
    if (!requestBody || typeof requestBody !== 'object') {
      throw new Error('Invalid request body format');
    }

    console.log('Calling Supabase function with body:', requestBody);
    
    // Use the exact body structure as provided in the debugging assistant
    const { data, error } = await supabase.functions.invoke('get-game-recommendations', {
      body: requestBody
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from function');
    }
    
    console.log('Received data from Supabase function:', data);
    return data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
}