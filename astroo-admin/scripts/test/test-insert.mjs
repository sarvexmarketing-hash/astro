import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  'https://gneylrgkqoesfhxzpvtm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZXlscmdrcW9lc2ZoeHpwdnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTk0NDUsImV4cCI6MjEwMzA3NTQ0NX0.utx6XPAMM0FYC8KInHvL-AVTdLjFvxUnLsDrUSJiRkA'
);

async function test() {
  const id = randomUUID();
  console.log('Testing insert for id:', id);

  const { data: pData, error: pErr } = await supabase.from('profiles').insert({
    id,
    full_name: 'Test Profile',
    email: 'test@example.com',
    role: 'astrologer',
    status: 'active'
  }).select();
  console.log('Profile insert:', { pData, pErr });

  const { data: wData, error: wErr } = await supabase.from('wallets').insert({
    user_id: id,
    balance: 0.00,
    currency: 'INR'
  }).select();
  console.log('Wallet insert:', { wData, wErr });

  const { data: aData, error: aErr } = await supabase.from('astrologer_profiles').insert({
    id,
    display_name: 'Test Astrologer',
    verification_status: 'pending'
  }).select();
  console.log('Astrologer profile insert:', { aData, aErr });
}

test();
