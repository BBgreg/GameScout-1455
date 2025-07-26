import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://afmtcpfxjrqmgjmygwez.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbXRjcGZ4anJxbWdqbXlnd2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTg2NzgsImV4cCI6MjA2ODI5NDY3OH0.XhDlabjTxfM788yXuOzmY6a29NontTWUg4o572XQcMs';

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export default supabase;

// Helper functions for the conversational flow
export async function getSupabaseCredentials() {
  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
  };
}

export async function runSupabaseQuery({ query }) {
  try {
    const { data, error } = await supabase.rpc('execute_sql', { query_text: query });
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error running Supabase query:', error);
    throw error;
  }
}