import supabase from './supabase';

export async function getGameRecommendations(requestBody) {
  try {
    // Use the exact body structure as provided in the debugging assistant
    const { data, error } = await supabase.functions.invoke('get-game-recommendations', {
      body: requestBody
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
}