import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gneylrgkqoesfhxzpvtm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZXlscmdrcW9lc2ZoeHpwdnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTk0NDUsImV4cCI6MjEwMzA3NTQ0NX0.utx6XPAMM0FYC8KInHvL-AVTdLjFvxUnLsDrUSJiRkA'
);

async function test() {
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').limit(5);
  console.log('Profiles:', { profiles, pErr });

  const { data: wallets, error: wErr } = await supabase.from('wallets').select('*').limit(5);
  console.log('Wallets:', { wallets, wErr });

  const { data: astros, error: aErr } = await supabase.from('astrologer_profiles').select('*').limit(5);
  console.log('Astrologer Profiles:', { astros, aErr });
}

test();
