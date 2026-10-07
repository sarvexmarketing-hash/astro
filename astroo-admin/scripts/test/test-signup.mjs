import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gneylrgkqoesfhxzpvtm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZXlscmdrcW9lc2ZoeHpwdnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTk0NDUsImV4cCI6MjEwMzA3NTQ0NX0.utx6XPAMM0FYC8KInHvL-AVTdLjFvxUnLsDrUSJiRkA'
);

async function test() {
  const email = `test_astrologer_${Date.now()}@gmail.com`;
  console.log('Attempting signup for:', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: {
        full_name: 'Test Astrologer',
        role: 'astrologer'
      }
    }
  });

  console.log('Result:', { data, error });
}

test();
