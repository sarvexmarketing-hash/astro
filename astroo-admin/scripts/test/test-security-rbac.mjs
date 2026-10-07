import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  'https://gneylrgkqoesfhxzpvtm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZXlscmdrcW9lc2ZoeHpwdnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTk0NDUsImV4cCI6MjEwMzA3NTQ0NX0.utx6XPAMM0FYC8KInHvL-AVTdLjFvxUnLsDrUSJiRkA'
);

async function runSecurityAuditTests() {
  console.log('====================================================');
  console.log('ASTRO Security & RBAC Automated Verification Suite');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Unauthenticated Client Cannot Directly Modify Wallets
  totalTests++;
  console.log('Test 1: Testing direct client INSERT on wallets table...');
  const fakeUserId = randomUUID();
  const { data: walletData, error: walletErr } = await supabase.from('wallets').insert({
    user_id: fakeUserId,
    balance: 99999.00
  }).select();

  if (walletErr) {
    console.log('✅ PASSED: Direct wallet modification blocked by RLS/Trigger:', walletErr.message);
    passedTests++;
  } else {
    console.warn('❌ FAILED: Direct wallet modification succeeded without authorization!');
  }

  // Test 2: Unauthenticated Client Cannot Directly Modify Wallet Transactions
  totalTests++;
  console.log('\nTest 2: Testing direct client INSERT on wallet_transactions table...');
  const { data: txData, error: txErr } = await supabase.from('wallet_transactions').insert({
    wallet_id: randomUUID(),
    amount: 5000.00,
    balance_after: 5000.00,
    transaction_type: 'credit',
    reference_type: 'hack'
  }).select();

  if (txErr) {
    console.log('✅ PASSED: Direct wallet transaction creation blocked by RLS:', txErr.message);
    passedTests++;
  } else {
    console.warn('❌ FAILED: Direct wallet transaction succeeded without authorization!');
  }

  // Test 3: Public Can Access Active Pooja Services Catalog
  totalTests++;
  console.log('\nTest 3: Testing public access to active Pooja services catalog...');
  const { data: services, error: sErr } = await supabase.from('pooja_services').select('id, name, base_price').limit(3);
  if (!sErr && services && services.length > 0) {
    console.log(`✅ PASSED: Public Pooja services accessible (${services.length} items returned)`);
    passedTests++;
  } else if (!sErr) {
    console.log('✅ PASSED: Public query allowed (table currently empty)');
    passedTests++;
  } else {
    console.warn('❌ FAILED: Public service query failed:', sErr);
  }

  // Test 4: Public Cannot Access Private Audit Logs
  totalTests++;
  console.log('\nTest 4: Testing unauthenticated access to audit_logs...');
  const { data: auditData, error: aErr } = await supabase.from('audit_logs').select('*');
  if (aErr || (auditData && auditData.length === 0)) {
    console.log('✅ PASSED: Audit logs protected from public access');
    passedTests++;
  } else {
    console.warn('❌ FAILED: Audit logs exposed to public:', auditData);
  }

  // Test 5: Check Active Pandits Directory
  totalTests++;
  console.log('\nTest 5: Testing public Pandits directory...');
  const { data: pandits, error: pErr } = await supabase.from('pandits').select('id, display_name, verification_status').limit(3);
  if (!pErr) {
    console.log(`✅ PASSED: Pandit directory query allowed by RLS (${pandits?.length || 0} pandits)`);
    passedTests++;
  } else {
    console.warn('❌ FAILED: Pandit query error:', pErr);
  }

  console.log('\n====================================================');
  console.log(`Security Test Summary: ${passedTests}/${totalTests} Tests Passed`);
  console.log('====================================================\n');
}

runSecurityAuditTests();
