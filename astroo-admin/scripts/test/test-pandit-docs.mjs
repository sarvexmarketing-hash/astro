import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gneylrgkqoesfhxzpvtm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZXlscmdrcW9lc2ZoeHpwdnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTk0NDUsImV4cCI6MjEwMzA3NTQ0NX0.utx6XPAMM0FYC8KInHvL-AVTdLjFvxUnLsDrUSJiRkA'
);

async function test() {
  const panditId = '17edfe9b-ba58-46ec-b37f-b377dd982279';

  const documents = [
    {
      id: 'doc-aadhaar-01',
      type: 'Identity Proof (Aadhaar / Passport)',
      filename: 'aadhaar_card_acharya_javed.pdf',
      fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
      uploadedAt: new Date().toISOString(),
      status: 'pending'
    },
    {
      id: 'doc-pan-02',
      type: 'PAN Card (Tax & Payout Verification)',
      filename: 'pan_card_javed.jpg',
      fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
      uploadedAt: new Date().toISOString(),
      status: 'pending'
    },
    {
      id: 'doc-cert-03',
      type: 'Astrology / Pandit Certification',
      filename: 'sampurnanand_jyotish_acharya_degree.pdf',
      fileUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
      uploadedAt: new Date().toISOString(),
      status: 'pending'
    }
  ];

  const bioWithDocs = JSON.stringify({
    about: 'Expert Vedic Astrologer with 10+ years experience in Kundli Matching and Muhurat calculations.',
    documents: documents
  });

  const { data, error } = await supabase
    .from('pandits')
    .update({ bio: bioWithDocs })
    .eq('id', panditId)
    .select();

  console.log('Update bio result:', { data, error });
}

test();
