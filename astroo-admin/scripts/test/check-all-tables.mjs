import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gneylrgkqoesfhxzpvtm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZXlscmdrcW9lc2ZoeHpwdnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTk0NDUsImV4cCI6MjEwMzA3NTQ0NX0.utx6XPAMM0FYC8KInHvL-AVTdLjFvxUnLsDrUSJiRkA'
);

async function check() {
  const tables = [
    'profiles',
    'astrologer_profiles',
    'astrologer_documents',
    'pandits',
    'pandit_services',
    'pooja_services',
    'pooja_bookings',
    'services',
    'service_categories'
  ];

  for (const t of tables) {
    const { data, error, count } = await supabase.from(t).select('*', { count: 'exact' });
    console.log(`Table "${t}": count=${count}, rows=${data?.length}, error=${error?.message || 'none'}`);
    if (data && data.length > 0) {
      console.log(`  Sample row:`, JSON.stringify(data[0]));
    }
  }
}

check();
