import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seedData() {
  console.log('Seeding Pooja Services...');
  const services = [
    {
      name: 'Ganesh Pooja',
      description: 'Invoking Lord Ganesha for removing obstacles, new beginnings, prosperity and peace before any auspicious venture.',
      category: 'Vedic',
      duration_minutes: 90,
      base_price: 1100,
      samagri_included: true,
      is_active: true
    },
    {
      name: 'Satyanarayan Pooja',
      description: 'Traditional Katha and rituals dedicated to Lord Vishnu for family harmony, well-being, success, and prosperity.',
      category: 'Vedic',
      duration_minutes: 120,
      base_price: 999,
      samagri_included: true,
      is_active: true
    },
    {
      name: 'Lakshmi Pooja',
      description: 'Divine pooja of Goddess Lakshmi for wealth, business expansion, abundance and financial stability.',
      category: 'Vedic',
      duration_minutes: 90,
      base_price: 1500,
      samagri_included: true,
      is_active: true
    },
    {
      name: 'Navagraha Pooja & Havan',
      description: 'Propitiation of all 9 planetary deities (Navagrahas) to reduce malefic planetary doshas and attract positive cosmic vibrations.',
      category: 'Vedic',
      duration_minutes: 150,
      base_price: 2100,
      samagri_included: true,
      is_active: true
    },
    {
      name: 'Rudrabhishekam',
      description: 'Sacred Vedic Shiva abhishekam with chanting of Sri Rudram and Chamakam for health, protection, and spiritual liberation.',
      category: 'South Indian',
      duration_minutes: 120,
      base_price: 1800,
      samagri_included: true,
      is_active: true
    },
    {
      name: 'Griha Pravesh & Vastu Shanti',
      description: 'Auspicious housewarming ritual with Vastu Shanti and Ganapati Havan before entering a new home to invite positive energy.',
      category: 'North Indian',
      duration_minutes: 180,
      base_price: 3100,
      samagri_included: true,
      is_active: true
    },
    {
      name: 'Durga Pooja & Chandi Path',
      description: 'Fierce and protective mantras dedicated to Maa Durga for victory over negative forces and supreme courage.',
      category: 'Vedic',
      duration_minutes: 120,
      base_price: 2500,
      samagri_included: true,
      is_active: true
    },
    {
      name: 'Hanuman Pooja & Sundarkand',
      description: 'Recitation of Sundarkand and Hanuman Chalisa with sindoor arpan for courage, physical health, and overcoming fears.',
      category: 'North Indian',
      duration_minutes: 120,
      base_price: 1200,
      samagri_included: true,
      is_active: true
    },
    {
      name: 'Ayushya Homam',
      description: 'Sacred fire ritual performed on birthdays or for longevity, health, and vitality seeking blessings of Ayur Devata.',
      category: 'South Indian',
      duration_minutes: 150,
      base_price: 2800,
      samagri_included: true,
      is_active: true
    },
    {
      name: 'Naming Ceremony (Namakaran)',
      description: 'Vedic naming ceremony for newborns, calculating auspicious starting letters according to Janma Nakshatra.',
      category: 'Vedic',
      duration_minutes: 90,
      base_price: 1500,
      samagri_included: true,
      is_active: true
    },
    {
      name: 'Wedding Pooja (Vivah Sanskar)',
      description: 'Complete Vedic Vivah rituals including Kanyadaan, Saptapadi, Mangalsutra dharanam, and Laja Homa.',
      category: 'Vedic',
      duration_minutes: 240,
      base_price: 5100,
      samagri_included: true,
      is_active: true
    }
  ];

  await supabase.from('pandit_services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('pooja_services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { data: insertedServices, error: sError } = await supabase
    .from('pooja_services')
    .insert(services)
    .select();

  if (sError) {
    console.error('Error inserting services:', sError);
    return;
  }
  console.log(`Inserted ${insertedServices.length} Pooja Services.`);

  console.log('Seeding Pandits...');
  const pandits = [
    {
      display_name: 'Pandit Ramesh Kumar',
      profile_image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      bio: 'Vedic scholar with 15+ years of experience conducting authentic North and South Indian rituals, Satyanarayan Katha, and Vastu Homa. Certified from Banaras Hindu University Sanskrit Vidyapeeth.',
      years_experience: 15,
      languages: ['English', 'Hindi', 'Telugu'],
      specializations: ['Vedic Pooja', 'Satyanarayan Pooja', 'Griha Pravesh', 'Navagraha Havan'],
      verification_status: 'verified',
      rating: 4.9,
      review_count: 248,
      completed_poojas: 412,
      is_online: true,
      is_active: true,
      starting_price: 999,
      availability_status: 'available_today'
    },
    {
      display_name: 'Acharya Vidhyadhar Shastri',
      profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      bio: 'Renowned expert in Rudrabhishekam, Sri Vidya, and South Indian Smartha traditions. 18 years of rigorous Vedic practice across major temples in Tamil Nadu & Karnataka.',
      years_experience: 18,
      languages: ['Tamil', 'Telugu', 'Sanskrit', 'English'],
      specializations: ['South Indian', 'Rudrabhishekam', 'Ayushya Homam', 'Navagraha Pooja'],
      verification_status: 'verified',
      rating: 5.0,
      review_count: 312,
      completed_poojas: 580,
      is_online: true,
      is_active: true,
      starting_price: 1800,
      availability_status: 'available_now'
    },
    {
      display_name: 'Pt. Devendra Nath Dwivedi',
      profile_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      bio: 'Specialist in Vastu Shanti, Griha Pravesh, and Grand Wedding Sanskars. Follows strict Shuklayajurveda Kramapatha traditions with clarity in mantra uccharan.',
      years_experience: 22,
      languages: ['Hindi', 'English', 'Sanskrit'],
      specializations: ['North Indian', 'Vedic', 'Wedding Pooja', 'Griha Pravesh', 'Vastu Pooja'],
      verification_status: 'verified',
      rating: 4.9,
      review_count: 420,
      completed_poojas: 750,
      is_online: true,
      is_active: true,
      starting_price: 2500,
      availability_status: 'available_now'
    },
    {
      display_name: 'Pandit Venkatachari',
      profile_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      bio: 'Expert in Tirupati Sri Vaishnava Agama rituals, Sudarshana Homam, and Lakshmi Pooja. Dedicated to delivering pure spiritual resonance in every household.',
      years_experience: 12,
      languages: ['Telugu', 'Tamil', 'Hindi', 'English'],
      specializations: ['South Indian', 'Lakshmi Pooja', 'Ganesh Pooja', 'Ayushya Homam'],
      verification_status: 'verified',
      rating: 4.8,
      review_count: 184,
      completed_poojas: 290,
      is_online: true,
      is_active: true,
      starting_price: 1200,
      availability_status: 'available_today'
    },
    {
      display_name: 'Pt. Shivkant Tripathi',
      profile_image_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
      bio: 'Devoted to Durga Saptashati Chandi Homam, Sundarkand, and Kaal Sarp Dosh Nivaran. Provides all authentic pooja materials and guided sankalp.',
      years_experience: 14,
      languages: ['Hindi', 'English'],
      specializations: ['Vedic', 'North Indian', 'Durga Pooja', 'Hanuman Pooja', 'Satyanarayan Pooja'],
      verification_status: 'verified',
      rating: 4.9,
      review_count: 196,
      completed_poojas: 340,
      is_online: true,
      is_active: true,
      starting_price: 1200,
      availability_status: 'available_tomorrow'
    },
    {
      display_name: 'Acharya Hariprasad Sharma',
      profile_image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      bio: 'Gold medalist in Jyotishya & Paurohitya from Sampurnanand Sanskrit University. Over 10 years guiding families on auspicious rituals and Namakaran.',
      years_experience: 10,
      languages: ['Hindi', 'English', 'Gujarati'],
      specializations: ['Vedic', 'Naming Ceremony', 'Ganesh Pooja', 'Satyanarayan Pooja'],
      verification_status: 'verified',
      rating: 4.8,
      review_count: 142,
      completed_poojas: 210,
      is_online: true,
      is_active: true,
      starting_price: 1100,
      availability_status: 'available_today'
    }
  ];

  await supabase.from('pandits').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { data: insertedPandits, error: pError } = await supabase
    .from('pandits')
    .insert(pandits)
    .select();

  if (pError) {
    console.error('Error inserting pandits:', pError);
    return;
  }
  console.log(`Inserted ${insertedPandits.length} Pandits.`);

  console.log('Seeding Pandit Services mappings...');
  const panditServices = [];
  for (const pandit of insertedPandits) {
    for (const service of insertedServices) {
      panditServices.push({
        pandit_id: pandit.id,
        pooja_service_id: service.id,
        price: service.base_price,
        duration_minutes: service.duration_minutes,
        is_available: true
      });
    }
  }

  const { error: psError } = await supabase
    .from('pandit_services')
    .upsert(panditServices, { onConflict: 'pandit_id,pooja_service_id' });

  if (psError) {
    console.error('Error inserting pandit services:', psError);
  } else {
    console.log(`Inserted ${panditServices.length} Pandit Services.`);
  }

  console.log('Seeding Pandit Availability slots for the next 7 days...');
  const timeSlots = [
    { start: '08:00:00', end: '10:00:00' },
    { start: '10:30:00', end: '12:30:00' },
    { start: '14:00:00', end: '16:00:00' },
    { start: '16:30:00', end: '18:30:00' },
    { start: '19:00:00', end: '21:00:00' }
  ];

  const availabilityList = [];
  const today = new Date();

  for (const pandit of insertedPandits) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + dayOffset);
      const dateStr = d.toISOString().split('T')[0];

      for (let i = 0; i < timeSlots.length; i++) {
        // Randomly leave some booked or available
        const isBooked = (dayOffset === 0 && i === 1) || (dayOffset === 1 && i === 3);
        availabilityList.push({
          pandit_id: pandit.id,
          date: dateStr,
          start_time: timeSlots[i].start,
          end_time: timeSlots[i].end,
          status: isBooked ? 'booked' : 'available'
        });
      }
    }
  }

  // Delete existing availability and insert fresh
  await supabase.from('pandit_availability').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: paError } = await supabase.from('pandit_availability').insert(availabilityList);
  if (paError) {
    console.error('Error inserting availability:', paError);
  } else {
    console.log(`Inserted ${availabilityList.length} Availability slots.`);
  }

  console.log('Seeding initial Pandit Reviews...');
  const reviews = [];
  for (const pandit of insertedPandits) {
    reviews.push(
      {
        pandit_id: pandit.id,
        user_id: 'user_sample_1',
        user_name: 'Anand Kumar',
        rating: 5,
        review_text: 'Pandit ji arrived on time with complete pooja samagri. The Satyanarayan Katha was explained so beautifully with full meaning. Highly recommended!'
      },
      {
        pandit_id: pandit.id,
        user_id: 'user_sample_2',
        user_name: 'Pooja Verma',
        rating: 5,
        review_text: 'Very knowledgeable and divine experience. Cleared all our doubts regarding Vastu and performed the Hawan with extreme devotion.'
      }
    );
  }

  await supabase.from('pandit_reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: prError } = await supabase.from('pandit_reviews').insert(reviews);
  if (prError) {
    console.error('Error inserting reviews:', prError);
  } else {
    console.log(`Inserted ${reviews.length} Pandit Reviews.`);
  }

  console.log('Seed completed successfully!');
}

seedData();
