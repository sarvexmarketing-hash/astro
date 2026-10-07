import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gneylrgkqoesfhxzpvtm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZXlscmdrcW9lc2ZoeHpwdnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTk0NDUsImV4cCI6MjEwMzA3NTQ0NX0.utx6XPAMM0FYC8KInHvL-AVTdLjFvxUnLsDrUSJiRkA'
);

async function test() {
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log('Buckets:', { buckets, bErr });

  const testBuffer = Buffer.from('PDF Mock Document Content for Astrologer KYC Verification', 'utf-8');
  const path = `astrologers/17edfe9b-ba58-46ec-b37f-b377dd982279/identity_proof.pdf`;

  const { data: uploadData, error: uErr } = await supabase.storage
    .from('documents')
    .upload(path, testBuffer, { upsert: true, contentType: 'application/pdf' });
  console.log('Upload result:', { uploadData, uErr });

  const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
  console.log('Public URL:', urlData.publicUrl);
}

test();
