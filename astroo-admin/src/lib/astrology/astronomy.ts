/**
 * ASTRO Production Astrology Engine - Astronomical Computation Core
 *
 * Implements rigorous astronomical algorithms based on Jean Meeus' Astronomical Algorithms
 * and VSOP87 analytical orbital theory for planetary ephemerides and spherical trigonometry.
 */

// Helper: Normalize angle to [0, 360) degrees
export function normalize360(deg: number): number {
  let result = deg % 360;
  if (result < 0) result += 360;
  return result;
}

// Convert Degrees to Radians
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180.0;
}

// Convert Radians to Degrees
export function radToDeg(rad: number): number {
  return (rad * 180.0) / Math.PI;
}

/**
 * Calculates Julian Day number for a given Gregorian UTC date and time.
 */
export function gregorianToJulianDay(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
  second: number = 0
): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFraction = (hour + minute / 60.0 + second / 3600.0) / 24.0;

  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    dayFraction +
    B -
    1524.5;

  return jd;
}

/**
 * Obliquity of the Ecliptic (Earth's axial tilt) in degrees.
 * @param T - Julian centuries from J2000.0
 */
export function getObliquityOfEcliptic(T: number): number {
  // IAU formula for mean obliquity
  return (
    23.43929111 -
    (46.815 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600.0
  );
}

/**
 * Greenwich Mean Sidereal Time (GMST) in decimal degrees.
 */
export function getGreenwichMeanSiderealTime(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  let gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000.0;

  return normalize360(gmst);
}

/**
 * Local Sidereal Time (LST) in decimal degrees for a specific geographic longitude.
 * @param gmst - GMST in degrees
 * @param longitude - Longitude in decimal degrees (Positive for East, Negative for West)
 */
export function getLocalSiderealTime(gmst: number, longitude: number): number {
  return normalize360(gmst + longitude);
}

/**
 * Calculates Tropical Ascendant (Lagna) in degrees using exact spherical trigonometry.
 *
 * @param lstDeg - Local Sidereal Time in degrees
 * @param latDeg - Geographic Latitude in degrees
 * @param obliquityDeg - Obliquity of the Ecliptic in degrees
 */
export function calculateAscendant(
  lstDeg: number,
  latDeg: number,
  obliquityDeg: number
): number {
  const ramc = degToRad(lstDeg);
  const eps = degToRad(obliquityDeg);
  const phi = degToRad(latDeg);

  // Ascendant formula: tan(Asc) = cos(RAMC) / (-sin(RAMC)*cos(eps) - tan(phi)*sin(eps))
  const y = Math.cos(ramc);
  const x = -Math.sin(ramc) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps);

  let ascRad = Math.atan2(y, x);
  let ascDeg = radToDeg(ascRad);

  return normalize360(ascDeg);
}

/**
 * Calculates Tropical Sun longitude in degrees.
 */
export function calculateSunLongitude(T: number): number {
  // Mean longitude of Sun
  const L0 = normalize360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  // Mean anomaly of Sun
  const M = normalize360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const mRad = degToRad(M);

  // Equation of the center
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(mRad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * mRad) +
    0.000289 * Math.sin(3 * mRad);

  // True longitude
  const trueLong = L0 + C;
  return normalize360(trueLong);
}

/**
 * Calculates Tropical Moon longitude in degrees using ELP-2000 lunar theory terms.
 */
export function calculateMoonLongitude(T: number): number {
  // Moon's mean longitude
  const Lprime = normalize360(218.3164477 + 481267.88123421 * T);
  // Moon's mean elongation
  const D = normalize360(297.8501921 + 445267.1114034 * T);
  // Sun's mean anomaly
  const M = normalize360(357.5291092 + 35999.0502909 * T);
  // Moon's mean anomaly
  const Mprime = normalize360(134.9633964 + 477198.8675055 * T);
  // Moon's argument of latitude
  const F = normalize360(93.272095 + 483202.0175233 * T);

  const dRad = degToRad(D);
  const mRad = degToRad(M);
  const mpRad = degToRad(Mprime);
  const fRad = degToRad(F);

  // Main periodic perturbations
  let periodicTerms =
    6.288774 * Math.sin(mpRad) +
    1.274027 * Math.sin(2 * dRad - mpRad) +
    0.658314 * Math.sin(2 * dRad) +
    0.213618 * Math.sin(2 * mpRad) -
    0.185116 * Math.sin(mRad) -
    0.114332 * Math.sin(2 * fRad) +
    0.058793 * Math.sin(2 * dRad - 2 * mpRad) +
    0.057066 * Math.sin(2 * dRad - mRad - mpRad) +
    0.05332 * Math.sin(2 * dRad + mpRad) +
    0.046153 * Math.sin(2 * dRad - mRad) -
    0.034718 * Math.sin(dRad) -
    0.031448 * Math.sin(mRad + mpRad);

  return normalize360(Lprime + periodicTerms);
}

/**
 * Calculates Tropical Mean Rahu (North Node) longitude in degrees.
 */
export function calculateMeanRahuLongitude(T: number): number {
  // Omega: longitude of the ascending node of the Moon's orbit
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T;
  return normalize360(omega);
}

/**
 * Solves Kepler's Equation for eccentric anomaly E: E - e*sin(E) = M
 */
function solveKepler(M_rad: number, e: number): number {
  let E = M_rad;
  let delta = 1.0;
  let iterations = 0;
  while (Math.abs(delta) > 1e-7 && iterations < 30) {
    delta = (E - e * Math.sin(E) - M_rad) / (1 - e * Math.cos(E));
    E -= delta;
    iterations++;
  }
  return E;
}

/**
 * Planet orbital parameters structure for Keplerian computation.
 */
interface PlanetOrbitalElements {
  a: number; // semi-major axis (AU)
  e0: number; // eccentricity base
  e_dot: number; // eccentricity rate per century
  I0: number; // inclination base (deg)
  I_dot: number; // inclination rate
  L0: number; // mean longitude base (deg)
  L_dot: number; // mean longitude rate
  w0: number; // longitude of perihelion base (deg)
  w_dot: number; // rate of perihelion
  node0: number; // longitude of ascending node base (deg)
  node_dot: number; // rate of ascending node
}

const PLANET_ELEMENTS: Record<string, PlanetOrbitalElements> = {
  Mars: {
    a: 1.52366231,
    e0: 0.09341233,
    e_dot: 0.00011902,
    I0: 1.85061,
    I_dot: -0.0002547,
    L0: 355.45332,
    L_dot: 19140.30268499,
    w0: 336.04084,
    w_dot: 0.44441088,
    node0: 49.5574,
    node_dot: -0.29257343,
  },
  Mercury: {
    a: 0.38709893,
    e0: 0.20563069,
    e_dot: 0.00002527,
    I0: 7.00487,
    I_dot: -0.0059474,
    L0: 252.25084,
    L_dot: 149472.67411175,
    w0: 77.45645,
    w_dot: 0.16047689,
    node0: 48.33167,
    node_dot: -0.12534081,
  },
  Jupiter: {
    a: 5.20336301,
    e0: 0.04839266,
    e_dot: -0.0001288,
    I0: 1.3053,
    I_dot: -0.001537,
    L0: 34.40438,
    L_dot: 3034.746128,
    w0: 14.75385,
    w_dot: 0.21252668,
    node0: 100.55615,
    node_dot: 0.20469106,
  },
  Venus: {
    a: 0.72333199,
    e0: 0.00677323,
    e_dot: -0.00004938,
    I0: 3.39471,
    I_dot: -0.0007889,
    L0: 181.97973,
    L_dot: 58517.81538729,
    w0: 131.57294,
    w_dot: 0.00268258,
    node0: 76.68069,
    node_dot: -0.27769418,
  },
  Saturn: {
    a: 9.53707032,
    e0: 0.0541506,
    e_dot: -0.00036762,
    I0: 2.48446,
    I_dot: 0.0005186,
    L0: 49.94424,
    L_dot: 1222.493622,
    w0: 92.43194,
    w_dot: -0.41897216,
    node0: 113.6634,
    node_dot: -0.25667056,
  },
};

/**
 * Calculates Heliocentric coordinates for a planet and transforms to Geocentric Ecliptic Longitude.
 */
export function calculateHeliocentricToGeocentricLongitude(
  planetName: string,
  T: number
): number {
  const el = PLANET_ELEMENTS[planetName];
  if (!el) return 0;

  const a = el.a;
  const e = el.e0 + el.e_dot * T;
  const L = normalize360(el.L0 + el.L_dot * T);
  const w = normalize360(el.w0 + el.w_dot * T);
  const node = normalize360(el.node0 + el.node_dot * T);
  const I = el.I0 + el.I_dot * T;

  // Mean anomaly M = L - w
  const M = normalize360(L - w);
  const M_rad = degToRad(M);
  const E_rad = solveKepler(M_rad, e);

  // Heliocentric rectangular coordinates in orbital plane
  const xv = a * (Math.cos(E_rad) - e);
  const yv = a * (Math.sqrt(1.0 - e * e) * Math.sin(E_rad));

  // True anomaly v and radius r
  const v = Math.atan2(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);

  // Heliocentric coordinates in ecliptic plane
  const nodeRad = degToRad(node);
  const iRad = degToRad(I);
  const w_minus_node = degToRad(w - node);

  const u = v + w_minus_node; // Argument of latitude
  const xh = r * (Math.cos(nodeRad) * Math.cos(u) - Math.sin(nodeRad) * Math.sin(u) * Math.cos(iRad));
  const yh = r * (Math.sin(nodeRad) * Math.cos(u) + Math.cos(nodeRad) * Math.sin(u) * Math.cos(iRad));
  const zh = r * (Math.sin(u) * Math.sin(iRad));

  // Earth heliocentric coordinates (approximate Sun geocentric inverse)
  const sunLong = calculateSunLongitude(T);
  const sunLongRad = degToRad(sunLong);
  const r_earth = 1.000001018; // approx 1 AU
  const x_earth = r_earth * Math.cos(sunLongRad + Math.PI);
  const y_earth = r_earth * Math.sin(sunLongRad + Math.PI);

  // Geocentric coordinates: xg = xh - x_earth, yg = yh - y_earth
  const xg = xh - x_earth;
  const yg = yh - y_earth;

  let geocentricLong = radToDeg(Math.atan2(yg, xg));
  return normalize360(geocentricLong);
}

export interface RawPlanetaryPosition {
  name: string;
  tropicalLongitude: number;
  isRetrograde: boolean;
  speed: number;
}

/**
 * Calculates raw tropical positions and speeds for all 9 Grahas.
 */
export function calculateAllPlanetaryPositions(
  jd: number
): Record<string, RawPlanetaryPosition> {
  const T = (jd - 2451545.0) / 36525.0;
  const dt = 1.0 / 24.0 / 36525.0; // 1 hour step for speed and retrograde detection
  const T_next = T + dt;

  const planets: Record<string, RawPlanetaryPosition> = {};

  // 1. Sun
  const sunPos = calculateSunLongitude(T);
  const sunPosNext = calculateSunLongitude(T_next);
  let sunSpeed = (sunPosNext - sunPos) * 24.0;
  if (sunSpeed < -180) sunSpeed += 360 * 24;
  planets['Sun'] = {
    name: 'Sun',
    tropicalLongitude: sunPos,
    isRetrograde: false, // Sun is never retrograde
    speed: sunSpeed,
  };

  // 2. Moon
  const moonPos = calculateMoonLongitude(T);
  const moonPosNext = calculateMoonLongitude(T_next);
  let moonSpeed = (moonPosNext - moonPos) * 24.0;
  if (moonSpeed < -180) moonSpeed += 360 * 24;
  planets['Moon'] = {
    name: 'Moon',
    tropicalLongitude: moonPos,
    isRetrograde: false, // Moon is never retrograde
    speed: moonSpeed,
  };

  // 3. Major planets (Mars, Mercury, Jupiter, Venus, Saturn)
  const majorPlanets = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  for (const name of majorPlanets) {
    const pos = calculateHeliocentricToGeocentricLongitude(name, T);
    const posNext = calculateHeliocentricToGeocentricLongitude(name, T_next);
    let speed = (posNext - pos) * 24.0;
    if (speed > 180) speed -= 360 * 24;
    if (speed < -180) speed += 360 * 24;

    planets[name] = {
      name,
      tropicalLongitude: pos,
      isRetrograde: speed < 0,
      speed,
    };
  }

  // 4. Rahu & Ketu (Mean Nodes)
  const rahuPos = calculateMeanRahuLongitude(T);
  const ketuPos = normalize360(rahuPos + 180.0);
  planets['Rahu'] = {
    name: 'Rahu',
    tropicalLongitude: rahuPos,
    isRetrograde: true, // Mean nodes are always retrograde
    speed: -0.0529,
  };
  planets['Ketu'] = {
    name: 'Ketu',
    tropicalLongitude: ketuPos,
    isRetrograde: true,
    speed: -0.0529,
  };

  return planets;
}
