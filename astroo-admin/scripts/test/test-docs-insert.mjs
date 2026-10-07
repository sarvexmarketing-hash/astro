import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  'https://gneylrgkqoesfhxzpvtm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZXlscmdrcW9lc2ZoeHpwdnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTk0NDUsImV4cCI6MjEwMzA3NTQ0NX0.utx6XPAMM0FYC8KInHvL-AVTdLjFvxUnLsDrUSJiRkA'
);

async function test() {
  const panditId = '17edfe9b-ba58-46ec-b37f-b377dd982279'; // Acharya Javed Sharma

  const docs = [
    {
      id: randomUUID(),
      astrologer_id: panditId,
      document_type: 'identity_proof',
      file_path: `astrologers/${panditId}/aadhaar_verified_proof.pdf`,
      status: 'pending'
    },
    {
      id: randomUUID(),
      astrologer_id: panditId,
      document_type: 'pan_card',
      file_path: `astrologers/${panditId}/pan_card_document.jpg`,
      status: 'pending'
    },
    {
      id: randomUUID(),
      astrologer_id: panditId,
      document_type: 'astrology_certificate',
      file_path: `astrologers/${panditId}/sampurnanand_jyotish_degree.pdf`,
      status: 'pending'
    }
  ];

  const { data, error } = await supabase.from('astrologer_documents').insert(docs).select();
  console.log('Insert result:', { data, error });
}

test();
