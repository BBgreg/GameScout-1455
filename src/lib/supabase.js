import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://afmtcpfxjrqmgjmygwez.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbXRjcGZ4anJxbWdqbXlnd2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTg0MzAsImV4cCI6MjA2ODI3NDQzMH0.6C4RrzICwweg1ovLfSVJOiSGTEAvQiVh0Xl3KihzduU';

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