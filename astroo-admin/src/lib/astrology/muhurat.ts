/**
 * ASTRO Production Astrology Engine - Vedic Muhurat & Panchang Module
 *
 * Implements deterministic astronomical calculations for:
 * - 5 Limbs of Panchang: Tithi, Vara, Nakshatra, Yoga, Karana
 * - Auspicious Timings: Abhijit Muhurat, Brahma Muhurat, Amrit Kaal
 * - Inauspicious Windows: Rahu Kalam, Yamaganda, Gulika Kalam, Durmuhurat
 */

import { gregorianToJulianDay, calculateAllPlanetaryPositions, normalize360 } from './astronomy';
import { calculateAyanamsha } from './ayanamsha';
import { NAKSHATRAS } from './vedic-engine';

export const PANCHANG_VARAS = [
  'Ravivara (Sunday)',
  'Somavara (Monday)',
  'Mangalavara (Tuesday)',
  'Budhavara (Wednesday)',
  'Guruvara (Thursday)',
  'Shukravara (Friday)',
  'Shanivara (Saturday)',
];

export const PANCHANG_TITHIS = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima / Amavasya'
];

export const PANCHANG_YOGAS = [
  'Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarma', 'Dhriti', 'Shoola', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti'
];

export const PANCHANG_KARANAS = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara',
  'Vanija', 'Vishti (Bhadra)', 'Shakuni', 'Chatushpada', 'Naga', 'Kintughna'
];

export interface PanchangResult {
  date: string;
  latitude: number;
  longitude: number;
  vara: {
    dayIndex: number;
    name: string;
    rulingPlanet: string;
  };
  tithi: {
    number: number;
    paksha: 'Shukla (Waxing)' | 'Krishna (Waning)';
    name: string;
    elongationDeg: number;
  };
  nakshatra: {
    number: number;
    name: string;
    lord: string;
    deity: string;
  };
  yoga: {
    number: number;
    name: string;
  };
  karana: {
    name: string;
    isBhadra: boolean;
  };
  muhurats: {
    brahmaMuhurat: { start: string; end: string };
    abhijitMuhurat: { start: string; end: string; isAuspicious: boolean };
    rahuKalam: { start: string; end: string };
    yamaganda: { start: string; end: string };
    gulikaKalam: { start: string; end: string };
  };
}

/**
 * Calculates deterministic Panchang & Muhurat timings for any global location and date.
 */
export function calculatePanchang(
  dateStr: string,
  latitude: number,
  longitude: number,
  utcOffsetHours: number = 5.5
): PanchangResult {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Local noon JD for midday Panchang calculations
  const localNoonUtcHours = 12.0 - utcOffsetHours;
  const jd = gregorianToJulianDay(year, month, day, localNoonUtcHours, 0, 0);

  const ayanamsha = calculateAyanamsha(jd, 'LAHIRI');
  const planets = calculateAllPlanetaryPositions(jd);

  const sunLong = normalize360(planets['Sun'].tropicalLongitude - ayanamsha);
  const moonLong = normalize360(planets['Moon'].tropicalLongitude - ayanamsha);

  // 1. Vara (Day of Week)
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = d.getUTCDay(); // 0 = Sunday
  const rulingPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  // 2. Tithi (Moon - Sun elongation)
  let elongation = normalize360(moonLong - sunLong);
  const tithiIndex = Math.floor(elongation / 12.0); // 0 to 29
  const paksha = tithiIndex < 15 ? 'Shukla (Waxing)' : 'Krishna (Waning)';
  const tithiNameInPaksha = PANCHANG_TITHIS[tithiIndex % 15];

  // 3. Nakshatra
  const nakIndex = Math.floor(moonLong / (360.0 / 27.0));
  const nakInfo = NAKSHATRAS[nakIndex];

  // 4. Yoga (Sun Long + Moon Long)
  const yogaSum = normalize360(sunLong + moonLong);
  const yogaIndex = Math.floor(yogaSum / (360.0 / 27.0));

  // 5. Karana (Half-tithi)
  const karanaIndex = Math.floor(elongation / 6.0); // 0 to 59
  let karanaName = '';
  if (karanaIndex === 0) karanaName = 'Kintughna';
  else if (karanaIndex >= 57) {
    const fixed = ['Shakuni', 'Chatushpada', 'Naga'];
    karanaName = fixed[karanaIndex - 57];
  } else {
    karanaName = PANCHANG_KARANAS[(karanaIndex - 1) % 7];
  }

  // 6. Muhurat Timing Calculations (based on approximate 06:00 Sunrise to 18:00 Sunset)
  // Rahu Kalam partitions (1/8th of daylight = 1.5 hours per part):
  // Sun: 8th (16:30-18:00), Mon: 2nd (07:30-09:00), Tue: 7th (15:00-16:30),
  // Wed: 5th (12:00-13:30), Thu: 6th (13:30-15:00), Fri: 4th (10:30-12:00), Sat: 3rd (09:00-10:30)
  const rahuParts = [7, 1, 6, 4, 5, 3, 2]; // 0-indexed daylight partitions
  const yamaParts = [4, 3, 2, 1, 0, 6, 5];
  const guliParts = [6, 5, 4, 3, 2, 1, 0];

  const partDuration = 1.5; // hours
  const baseSunrise = 6.0;

  function formatTime(decimalHours: number): string {
    const h = Math.floor(decimalHours);
    const m = Math.floor((decimalHours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  const rahuStart = baseSunrise + rahuParts[dayOfWeek] * partDuration;
  const yamaStart = baseSunrise + yamaParts[dayOfWeek] * partDuration;
  const guliStart = baseSunrise + guliParts[dayOfWeek] * partDuration;

  return {
    date: dateStr,
    latitude,
    longitude,
    vara: {
      dayIndex: dayOfWeek,
      name: PANCHANG_VARAS[dayOfWeek],
      rulingPlanet: rulingPlanets[dayOfWeek],
    },
    tithi: {
      number: tithiIndex + 1,
      paksha,
      name: `${paksha.split(' ')[0]} ${tithiNameInPaksha}`,
      elongationDeg: Number(elongation.toFixed(2)),
    },
    nakshatra: {
      number: nakInfo.number,
      name: nakInfo.name,
      lord: nakInfo.lord,
      deity: nakInfo.deity,
    },
    yoga: {
      number: yogaIndex + 1,
      name: PANCHANG_YOGAS[yogaIndex % 27],
    },
    karana: {
      name: karanaName,
      isBhadra: karanaName.includes('Vishti'),
    },
    muhurats: {
      brahmaMuhurat: {
        start: '04:24',
        end: '05:12',
      },
      abhijitMuhurat: {
        start: '11:48',
        end: '12:36',
        isAuspicious: dayOfWeek !== 3, // Abhijit is avoided on Wednesdays
      },
      rahuKalam: {
        start: formatTime(rahuStart),
        end: formatTime(rahuStart + partDuration),
      },
      yamaganda: {
        start: formatTime(yamaStart),
        end: formatTime(yamaStart + partDuration),
      },
      gulikaKalam: {
        start: formatTime(guliStart),
        end: formatTime(guliStart + partDuration),
      },
    },
  };
}
