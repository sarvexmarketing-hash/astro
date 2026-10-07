/**
 * ASTRO Production Astrology Engine - Vedic Computation Core
 *
 * Implements deterministic Vedic astrology algorithms for:
 * - Lagna & Grahas in Sidereal Zodiac (Nirayana)
 * - Rashis & 27 Nakshatras with 108 Padas
 * - 12 Bhavas (Whole Sign & Equal House)
 * - Divisional Charts (D1 Rasi, D9 Navamsha)
 * - 120-Year Vimshottari Mahadasha & Antardasha date engine
 * - Planetary states (Exaltation, Debilitation, Combustion, Retrograde)
 * - Vedic Dosha rules (Mangal Dosha, Kaal Sarp Dosha, Pitra Dosha)
 */

import {
  gregorianToJulianDay,
  getObliquityOfEcliptic,
  getGreenwichMeanSiderealTime,
  getLocalSiderealTime,
  calculateAscendant,
  calculateAllPlanetaryPositions,
  normalize360,
} from './astronomy';
import { calculateAyanamsha, AyanamshaSystem } from './ayanamsha';

export interface BirthData {
  name: string;
  gender: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm or HH:mm:ss
  birthPlace: string;
  latitude: number; // decimal degrees
  longitude: number; // decimal degrees
  timezone: string; // e.g. "Asia/Kolkata"
  utcOffsetHours?: number; // e.g. 5.5
}

export interface DMS {
  degrees: number;
  minutes: number;
  seconds: number;
  formatted: string;
}

export function decimalToDMS(deg: number): DMS {
  const normalized = normalize360(deg);
  const degrees = Math.floor(normalized);
  const minFloat = (normalized - degrees) * 60.0;
  const minutes = Math.floor(minFloat);
  const seconds = Math.floor((minFloat - minutes) * 60.0);
  const formatted = `${degrees}° ${minutes}' ${seconds}"`;
  return { degrees, minutes, seconds, formatted };
}

// -------------------------------------------------------------
// RASHIS (12 Zodiac Signs)
// -------------------------------------------------------------
export interface RashiInfo {
  number: number;
  sanskritName: string;
  englishName: string;
  lord: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  gender: 'Male' | 'Female';
}

export const RASHIS: Record<number, RashiInfo> = {
  1: { number: 1, sanskritName: 'Mesha', englishName: 'Aries', lord: 'Mars', element: 'Fire', gender: 'Male' },
  2: { number: 2, sanskritName: 'Vrishabha', englishName: 'Taurus', lord: 'Venus', element: 'Earth', gender: 'Female' },
  3: { number: 3, sanskritName: 'Mithuna', englishName: 'Gemini', lord: 'Mercury', element: 'Air', gender: 'Male' },
  4: { number: 4, sanskritName: 'Karka', englishName: 'Cancer', lord: 'Moon', element: 'Water', gender: 'Female' },
  5: { number: 5, sanskritName: 'Simha', englishName: 'Leo', lord: 'Sun', element: 'Fire', gender: 'Male' },
  6: { number: 6, sanskritName: 'Kanya', englishName: 'Virgo', lord: 'Mercury', element: 'Earth', gender: 'Female' },
  7: { number: 7, sanskritName: 'Tula', englishName: 'Libra', lord: 'Venus', element: 'Air', gender: 'Male' },
  8: { number: 8, sanskritName: 'Vrishchika', englishName: 'Scorpio', lord: 'Mars', element: 'Water', gender: 'Female' },
  9: { number: 9, sanskritName: 'Dhanu', englishName: 'Sagittarius', lord: 'Jupiter', element: 'Fire', gender: 'Male' },
  10: { number: 10, sanskritName: 'Makara', englishName: 'Capricorn', lord: 'Saturn', element: 'Earth', gender: 'Female' },
  11: { number: 11, sanskritName: 'Kumbha', englishName: 'Aquarius', lord: 'Saturn', element: 'Air', gender: 'Male' },
  12: { number: 12, sanskritName: 'Meena', englishName: 'Pisces', lord: 'Jupiter', element: 'Water', gender: 'Female' },
};

// -------------------------------------------------------------
// NAKSHATRAS (27 Lunar Mansions)
// -------------------------------------------------------------
export interface NakshatraInfo {
  number: number;
  name: string;
  lord: string;
  deity: string;
}

export const NAKSHATRAS: NakshatraInfo[] = [
  { number: 1, name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras' },
  { number: 2, name: 'Bharani', lord: 'Venus', deity: 'Yama' },
  { number: 3, name: 'Krittika', lord: 'Sun', deity: 'Agni' },
  { number: 4, name: 'Rohini', lord: 'Moon', deity: 'Brahma' },
  { number: 5, name: 'Mrigashira', lord: 'Mars', deity: 'Soma' },
  { number: 6, name: 'Ardra', lord: 'Rahu', deity: 'Rudra' },
  { number: 7, name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi' },
  { number: 8, name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati' },
  { number: 9, name: 'Ashlesha', lord: 'Mercury', deity: 'Nagas' },
  { number: 10, name: 'Magha', lord: 'Ketu', deity: 'Pitras' },
  { number: 11, name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga' },
  { number: 12, name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman' },
  { number: 13, name: 'Hasta', lord: 'Moon', deity: 'Savitar' },
  { number: 14, name: 'Chitra', lord: 'Mars', deity: 'Tvashtar' },
  { number: 15, name: 'Swati', lord: 'Rahu', deity: 'Vayu' },
  { number: 16, name: 'Vishakha', lord: 'Jupiter', deity: 'Indragni' },
  { number: 17, name: 'Anuradha', lord: 'Saturn', deity: 'Mitra' },
  { number: 18, name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra' },
  { number: 19, name: 'Mula', lord: 'Ketu', deity: 'Nirriti' },
  { number: 20, name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas' },
  { number: 21, name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishvadevas' },
  { number: 22, name: 'Shravana', lord: 'Moon', deity: 'Vishnu' },
  { number: 23, name: 'Dhanishta', lord: 'Mars', deity: 'Vasus' },
  { number: 24, name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna' },
  { number: 25, name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada' },
  { number: 26, name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahirbudhnya' },
  { number: 27, name: 'Revati', lord: 'Mercury', deity: 'Pushan' },
];

// -------------------------------------------------------------
// VIMSHOTTARI DASHA CYCLE (120 Years)
// -------------------------------------------------------------
export const DASHA_LORDS: { planet: string; years: number }[] = [
  { planet: 'Ketu', years: 7 },
  { planet: 'Venus', years: 20 },
  { planet: 'Sun', years: 6 },
  { planet: 'Moon', years: 10 },
  { planet: 'Mars', years: 7 },
  { planet: 'Rahu', years: 18 },
  { planet: 'Jupiter', years: 16 },
  { planet: 'Saturn', years: 19 },
  { planet: 'Mercury', years: 17 },
];

export interface ComputedPlanet {
  name: string;
  siderealLongitude: number;
  rashiNumber: number;
  rashiSanskrit: string;
  rashiEnglish: string;
  degreeInRashi: DMS;
  house: number;
  nakshatra: string;
  nakshatraNumber: number;
  nakshatraLord: string;
  pada: number;
  isRetrograde: boolean;
  isCombust: boolean;
  state: 'Exalted' | 'Debilitated' | 'Own Sign' | 'Friendly Sign' | 'Enemy Sign' | 'Neutral';
  navamshaRashi: string;
}

export interface ComputedHouse {
  houseNumber: number;
  signNumber: number;
  signSanskrit: string;
  signEnglish: string;
  lord: string;
  occupants: string[];
}

export interface DashaPeriod {
  lord: string;
  startDate: string;
  endDate: string;
  durationYears: number;
  antardashas?: DashaPeriod[];
}

export interface KundliResult {
  birthData: BirthData;
  engineVersion: string;
  ayanamshaSystem: string;
  ayanamshaValue: number;
  julianDay: number;
  lagna: {
    siderealLongitude: number;
    rashiNumber: number;
    rashiSanskrit: string;
    rashiEnglish: string;
    degreeInRashi: DMS;
    lord: string;
    nakshatra: string;
    pada: number;
  };
  moonDetails: {
    rashiNumber: number;
    rashiSanskrit: string;
    rashiEnglish: string;
    nakshatra: string;
    nakshatraNumber: number;
    pada: number;
    nakshatraLord: string;
  };
  planets: Record<string, ComputedPlanet>;
  houses: ComputedHouse[];
  charts: {
    d1: Record<number, string[]>; // Rasi chart: Sign number -> Planets inside
    d9: Record<number, string[]>; // Navamsha chart: Sign number -> Planets inside
  };
  dashas: {
    balanceAtBirthYears: number;
    startingMahadasha: string;
    mahadashas: DashaPeriod[];
  };
  doshas: {
    mangalDosha: {
      isManglik: boolean;
      severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
      description: string;
      cancellation: string | null;
    };
    kaalSarpDosha: {
      hasDosha: boolean;
      type: string | null;
      description: string;
    };
    pitraDosha: {
      hasDosha: boolean;
      description: string;
    };
  };
  generatedAt: string;
}

/**
 * Calculates Navamsha (D9) Sign number (1 to 12) from Sidereal Longitude.
 */
export function calculateNavamshaSign(siderealLong: number): number {
  const normLong = normalize360(siderealLong);
  const signIndex = Math.floor(normLong / 30.0); // 0 to 11 (Aries = 0)
  const degInSign = normLong % 30.0;
  const navamshaPart = Math.floor(degInSign / (30.0 / 9.0)); // 0 to 8

  // Vedic Navamsha Rule:
  // Fire signs (0, 4, 8) start from Aries (1)
  // Earth signs (1, 5, 9) start from Capricorn (10)
  // Air signs (2, 6, 10) start from Libra (7)
  // Water signs (3, 7, 11) start from Cancer (4)
  let baseSign = 1;
  if (signIndex % 4 === 0) baseSign = 1; // Fire
  else if (signIndex % 4 === 1) baseSign = 10; // Earth
  else if (signIndex % 4 === 2) baseSign = 7; // Air
  else if (signIndex % 4 === 3) baseSign = 4; // Water

  let navSign = (baseSign + navamshaPart - 1) % 12 + 1;
  return navSign;
}

/**
 * Evaluates Planetary Dignity / State (Exalted, Debilitated, Own Sign, Friendly, Enemy).
 */
export function evaluatePlanetaryState(
  planet: string,
  rashiNum: number
): 'Exalted' | 'Debilitated' | 'Own Sign' | 'Friendly Sign' | 'Enemy Sign' | 'Neutral' {
  switch (planet) {
    case 'Sun':
      if (rashiNum === 1) return 'Exalted';
      if (rashiNum === 7) return 'Debilitated';
      if (rashiNum === 5) return 'Own Sign';
      if ([4, 8, 9, 12].includes(rashiNum)) return 'Friendly Sign';
      if ([2, 6, 10, 11].includes(rashiNum)) return 'Enemy Sign';
      return 'Neutral';

    case 'Moon':
      if (rashiNum === 2) return 'Exalted';
      if (rashiNum === 8) return 'Debilitated';
      if (rashiNum === 4) return 'Own Sign';
      if ([1, 5, 3, 6].includes(rashiNum)) return 'Friendly Sign';
      if ([10, 11].includes(rashiNum)) return 'Enemy Sign';
      return 'Neutral';

    case 'Mars':
      if (rashiNum === 10) return 'Exalted';
      if (rashiNum === 4) return 'Debilitated';
      if ([1, 8].includes(rashiNum)) return 'Own Sign';
      if ([5, 9, 12].includes(rashiNum)) return 'Friendly Sign';
      if ([3, 6].includes(rashiNum)) return 'Enemy Sign';
      return 'Neutral';

    case 'Mercury':
      if (rashiNum === 6) return 'Exalted';
      if (rashiNum === 12) return 'Debilitated';
      if ([3, 6].includes(rashiNum)) return 'Own Sign';
      if ([1, 5, 7].includes(rashiNum)) return 'Friendly Sign';
      if ([4].includes(rashiNum)) return 'Enemy Sign';
      return 'Neutral';

    case 'Jupiter':
      if (rashiNum === 4) return 'Exalted';
      if (rashiNum === 10) return 'Debilitated';
      if ([9, 12].includes(rashiNum)) return 'Own Sign';
      if ([1, 5, 8].includes(rashiNum)) return 'Friendly Sign';
      if ([3, 6, 2, 7].includes(rashiNum)) return 'Enemy Sign';
      return 'Neutral';

    case 'Venus':
      if (rashiNum === 12) return 'Exalted';
      if (rashiNum === 6) return 'Debilitated';
      if ([2, 7].includes(rashiNum)) return 'Own Sign';
      if ([3, 10, 11].includes(rashiNum)) return 'Friendly Sign';
      if ([1, 5, 8].includes(rashiNum)) return 'Enemy Sign';
      return 'Neutral';

    case 'Saturn':
      if (rashiNum === 7) return 'Exalted';
      if (rashiNum === 1) return 'Debilitated';
      if ([10, 11].includes(rashiNum)) return 'Own Sign';
      if ([2, 3, 6, 7].includes(rashiNum)) return 'Friendly Sign';
      if ([1, 4, 5, 8].includes(rashiNum)) return 'Enemy Sign';
      return 'Neutral';

    case 'Rahu':
      if ([2, 3].includes(rashiNum)) return 'Exalted';
      if ([8, 9].includes(rashiNum)) return 'Debilitated';
      if (rashiNum === 11) return 'Own Sign';
      return 'Neutral';

    case 'Ketu':
      if ([8, 9].includes(rashiNum)) return 'Exalted';
      if ([2, 3].includes(rashiNum)) return 'Debilitated';
      if (rashiNum === 8) return 'Own Sign';
      return 'Neutral';

    default:
      return 'Neutral';
  }
}

/**
 * Checks combustion against Sun's proximity.
 */
export function checkCombustion(
  planetName: string,
  planetLong: number,
  sunLong: number
): boolean {
  if (planetName === 'Sun' || planetName === 'Rahu' || planetName === 'Ketu') return false;

  let diff = Math.abs(planetLong - sunLong);
  if (diff > 180) diff = 360 - diff;

  const combustionOrbs: Record<string, number> = {
    Moon: 12.0,
    Mars: 17.0,
    Mercury: 14.0,
    Jupiter: 11.0,
    Venus: 10.0,
    Saturn: 15.0,
  };

  const orb = combustionOrbs[planetName] || 10.0;
  return diff <= orb;
}

/**
 * Master Kundli Calculation Function
 */
export function calculateKundli(
  birthData: BirthData,
  ayanamshaSystem: AyanamshaSystem = 'LAHIRI'
): KundliResult {
  // 1. Parse Date and Time
  const [yearStr, monthStr, dayStr] = birthData.birthDate.split('-');
  const timeParts = birthData.birthTime.split(':');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10);
  const second = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

  // UTC offset in hours (default to India Standard Time +5.5 if unspecified)
  const offsetHours = birthData.utcOffsetHours ?? 5.5;
  const utcTotalHours = hour + minute / 60.0 + second / 3600.0 - offsetHours;

  // 2. Julian Day & Astronomical Foundation
  const jd = gregorianToJulianDay(year, month, day, utcTotalHours, 0, 0);
  const T = (jd - 2451545.0) / 36525.0;
  const obliquity = getObliquityOfEcliptic(T);
  const gmst = getGreenwichMeanSiderealTime(jd);
  const lst = getLocalSiderealTime(gmst, birthData.longitude);

  // 3. Ayanamsha & Ascendant
  const ayanamsha = calculateAyanamsha(jd, ayanamshaSystem);
  const tropicalAsc = calculateAscendant(lst, birthData.latitude, obliquity);
  const siderealAsc = normalize360(tropicalAsc - ayanamsha);

  const lagnaRashiNum = Math.floor(siderealAsc / 30.0) + 1;
  const lagnaDegInRashi = siderealAsc % 30.0;
  const lagnaNakIndex = Math.floor(siderealAsc / (360.0 / 27.0));
  const lagnaPada = Math.floor((siderealAsc % (360.0 / 27.0)) / (360.0 / 108.0)) + 1;

  // 4. Calculate Planetary Positions
  const rawPlanets = calculateAllPlanetaryPositions(jd);
  const sunTropical = rawPlanets['Sun'].tropicalLongitude;
  const sunSidereal = normalize360(sunTropical - ayanamsha);

  const computedPlanets: Record<string, ComputedPlanet> = {};
  const d1Chart: Record<number, string[]> = {};
  const d9Chart: Record<number, string[]> = {};
  for (let i = 1; i <= 12; i++) {
    d1Chart[i] = [];
    d9Chart[i] = [];
  }

  for (const [pName, rawPos] of Object.entries(rawPlanets)) {
    const siderealLong = normalize360(rawPos.tropicalLongitude - ayanamsha);
    const rashiNum = Math.floor(siderealLong / 30.0) + 1;
    const degInRashi = siderealLong % 30.0;
    const nakIndex = Math.floor(siderealLong / (360.0 / 27.0));
    const pada = Math.floor((siderealLong % (360.0 / 27.0)) / (360.0 / 108.0)) + 1;

    // Vedic Whole Sign House calculation:
    // House = (Planet Rashi - Lagna Rashi + 12) % 12 + 1
    const house = ((rashiNum - lagnaRashiNum + 12) % 12) + 1;

    const navSign = calculateNavamshaSign(siderealLong);

    d1Chart[rashiNum].push(pName);
    d9Chart[navSign].push(pName);

    computedPlanets[pName] = {
      name: pName,
      siderealLongitude: siderealLong,
      rashiNumber: rashiNum,
      rashiSanskrit: RASHIS[rashiNum].sanskritName,
      rashiEnglish: RASHIS[rashiNum].englishName,
      degreeInRashi: decimalToDMS(degInRashi),
      house,
      nakshatra: NAKSHATRAS[nakIndex].name,
      nakshatraNumber: NAKSHATRAS[nakIndex].number,
      nakshatraLord: NAKSHATRAS[nakIndex].lord,
      pada,
      isRetrograde: rawPos.isRetrograde,
      isCombust: checkCombustion(pName, siderealLong, sunSidereal),
      state: evaluatePlanetaryState(pName, rashiNum),
      navamshaRashi: RASHIS[navSign].sanskritName,
    };
  }

  // 5. Calculate 12 Bhavas
  const computedHouses: ComputedHouse[] = [];
  for (let h = 1; h <= 12; h++) {
    const signNum = ((lagnaRashiNum + h - 2) % 12) + 1;
    const signInfo = RASHIS[signNum];
    const occupants = Object.values(computedPlanets)
      .filter((p) => p.house === h)
      .map((p) => p.name);

    computedHouses.push({
      houseNumber: h,
      signNumber: signNum,
      signSanskrit: signInfo.sanskritName,
      signEnglish: signInfo.englishName,
      lord: signInfo.lord,
      occupants,
    });
  }

  // 6. Moon Details & Vimshottari Dashas
  const moon = computedPlanets['Moon'];
  const moonNakSpan = 360.0 / 27.0; // 13.333333°
  const moonDegInNak = moon.siderealLongitude % moonNakSpan;
  const spentFraction = moonDegInNak / moonNakSpan;
  const remainingFraction = 1.0 - spentFraction;

  const startingDashaIndex = DASHA_LORDS.findIndex((d) => d.planet === moon.nakshatraLord);
  const birthLordInfo = DASHA_LORDS[startingDashaIndex >= 0 ? startingDashaIndex : 0];
  const balanceAtBirthYears = remainingFraction * birthLordInfo.years;

  // Build full 120-year Dasha Timeline
  const birthEpochDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  let currentStart = new Date(birthEpochDate.getTime());

  const mahadashas: DashaPeriod[] = [];
  for (let i = 0; i < 9; i++) {
    const dashaIdx = (startingDashaIndex + i) % 9;
    const dLord = DASHA_LORDS[dashaIdx];
    const durationY = i === 0 ? balanceAtBirthYears : dLord.years;

    const msInYear = 365.2425 * 24 * 60 * 60 * 1000;
    const currentEnd = new Date(currentStart.getTime() + durationY * msInYear);

    // Compute 9 Antardashas for this Mahadasha
    const antardashas: DashaPeriod[] = [];
    let antarStart = new Date(currentStart.getTime());
    for (let j = 0; j < 9; j++) {
      const antarIdx = (dashaIdx + j) % 9;
      const antarLord = DASHA_LORDS[antarIdx];
      const subFraction = antarLord.years / 120.0;
      const antarDurationY = durationY * subFraction;
      const antarEnd = new Date(antarStart.getTime() + antarDurationY * msInYear);

      antardashas.push({
        lord: `${dLord.planet} - ${antarLord.planet}`,
        startDate: antarStart.toISOString().split('T')[0],
        endDate: antarEnd.toISOString().split('T')[0],
        durationYears: Number(antarDurationY.toFixed(2)),
      });
      antarStart = antarEnd;
    }

    mahadashas.push({
      lord: dLord.planet,
      startDate: currentStart.toISOString().split('T')[0],
      endDate: currentEnd.toISOString().split('T')[0],
      durationYears: Number(durationY.toFixed(2)),
      antardashas,
    });

    currentStart = currentEnd;
  }

  // 7. Vedic Dosha Analysis
  // Mangal Dosha (Mars in 1st, 2nd, 4th, 7th, 8th, or 12th from Lagna or Moon)
  const marsHouse = computedPlanets['Mars'].house;
  const isManglikByLagna = [1, 2, 4, 7, 8, 12].includes(marsHouse);
  let mangalCancellation = null;
  if (computedPlanets['Mars'].rashiNumber === 1 || computedPlanets['Mars'].rashiNumber === 8) {
    mangalCancellation = 'Mars in own sign (Mesha/Vrishchika) nullifies affliction';
  } else if (computedPlanets['Jupiter'].house === marsHouse || [5, 7, 9].includes(((marsHouse - computedPlanets['Jupiter'].house + 12) % 12) + 1)) {
    mangalCancellation = 'Benefic aspect of Jupiter relieves Mangal Dosha';
  }

  // Kaal Sarp Dosha (All 7 planets hemmed between Rahu and Ketu)
  const rahuLong = computedPlanets['Rahu'].siderealLongitude;
  const ketuLong = computedPlanets['Ketu'].siderealLongitude;
  let allBetween = true;
  const main7 = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  for (const p of main7) {
    const pLong = computedPlanets[p].siderealLongitude;
    const inArc1 = (rahuLong < ketuLong && pLong >= rahuLong && pLong <= ketuLong) ||
                   (rahuLong > ketuLong && (pLong >= rahuLong || pLong <= ketuLong));
    if (!inArc1) {
      allBetween = false;
      break;
    }
  }

  return {
    birthData,
    engineVersion: 'ASTRO-VEDIC-v2.1.0',
    ayanamshaSystem,
    ayanamshaValue: Number(ayanamsha.toFixed(6)),
    julianDay: Number(jd.toFixed(5)),
    lagna: {
      siderealLongitude: Number(siderealAsc.toFixed(6)),
      rashiNumber: lagnaRashiNum,
      rashiSanskrit: RASHIS[lagnaRashiNum].sanskritName,
      rashiEnglish: RASHIS[lagnaRashiNum].englishName,
      degreeInRashi: decimalToDMS(lagnaDegInRashi),
      lord: RASHIS[lagnaRashiNum].lord,
      nakshatra: NAKSHATRAS[lagnaNakIndex].name,
      pada: lagnaPada,
    },
    moonDetails: {
      rashiNumber: moon.rashiNumber,
      rashiSanskrit: moon.rashiSanskrit,
      rashiEnglish: moon.rashiEnglish,
      nakshatra: moon.nakshatra,
      nakshatraNumber: moon.nakshatraNumber,
      pada: moon.pada,
      nakshatraLord: moon.nakshatraLord,
    },
    planets: computedPlanets,
    houses: computedHouses,
    charts: {
      d1: d1Chart,
      d9: d9Chart,
    },
    dashas: {
      balanceAtBirthYears: Number(balanceAtBirthYears.toFixed(2)),
      startingMahadasha: birthLordInfo.planet,
      mahadashas,
    },
    doshas: {
      mangalDosha: {
        isManglik: isManglikByLagna,
        severity: isManglikByLagna && !mangalCancellation ? 'HIGH' : isManglikByLagna ? 'LOW' : 'NONE',
        description: isManglikByLagna
          ? `Mars is positioned in House ${marsHouse} in ${computedPlanets['Mars'].rashiSanskrit}.`
          : 'Mars is placed in an auspicious house with no Manglik affliction.',
        cancellation: mangalCancellation,
      },
      kaalSarpDosha: {
        hasDosha: allBetween,
        type: allBetween ? 'Anant Kaal Sarp Yoga' : null,
        description: allBetween
          ? 'All 7 celestial grahas are situated within the Rahu-Ketu nodal axis.'
          : 'Planets are distributed across both nodal hemispheres; Kaal Sarp is absent.',
      },
      pitraDosha: {
        hasDosha: [9, 10].includes(computedPlanets['Rahu'].house) || [9, 10].includes(computedPlanets['Ketu'].house),
        description: [9, 10].includes(computedPlanets['Rahu'].house)
          ? 'Nodal axis influences the 9th/10th house of ancestors and father.'
          : 'No adverse planetary combinations for Pitra Dosha detected.',
      },
    },
    generatedAt: new Date().toISOString(),
  };
}
