import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gneylrgkqoesfhxzpvtm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZXlscmdrcW9lc2ZoeHpwdnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTk0NDUsImV4cCI6MjEwMzA3NTQ0NX0.utx6XPAMM0FYC8KInHvL-AVTdLjFvxUnLsDrUSJiRkA'
);

async function check() {
  const pandits = await supabase.from('pandits').select('id, display_name');
  console.log('Pandits in db:', pandits.data);
}

check();
