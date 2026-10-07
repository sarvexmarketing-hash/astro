import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  'https://gneylrgkqoesfhxzpvtm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZXlscmdrcW9lc2ZoeHpwdnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTk0NDUsImV4cCI6MjEwMzA3NTQ0NX0.utx6XPAMM0FYC8KInHvL-AVTdLjFvxUnLsDrUSJiRkA'
);

async function test() {
  const id = randomUUID();
  console.log('Inserting pandit with id:', id);

  const { data, error } = await supabase.from('pandits').insert({
    id,
    display_name: 'Acharya Javed Sharma',
    bio: 'Expert Vedic Astrologer with 10+ years experience in Kundli Matching and Muhurat calculations.',
    years_experience: 10,
    languages: ['Hindi', 'English', 'Sanskrit'],
    specializations: ['Vedic Astrology', 'Kundli', 'Muhurat'],
    verification_status: 'pending',
    is_online: false,
    is_active: false,
    starting_price: 25,
    availability_status: 'offline'
  }).select();

  console.log('Insert result:', { data, error });
}

test();
