import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  const { data, error } = await supabase.from('service_categories').select('*').limit(1);

  if (error) {
    console.error('Connection failed! Error:', error.message);
  } else {
    console.log('Connection successful! Fetched service categories:', data);
  }
}

testConnection();
