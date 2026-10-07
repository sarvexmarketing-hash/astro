import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTables() {
  const tables = [
    'pandits', 'pooja_services', 'pooja_packages', 'pandit_services',
    'pandit_availability', 'pooja_bookings', 'pooja_booking_status_history',
    'pandit_reviews', 'pandit_payouts', 'pooja_locations'
  ];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table '${table}': ERROR - ${error.message}`);
    } else {
      console.log(`Table '${table}': EXISTS (${data.length} rows tested)`);
    }
  }
}

checkTables();
