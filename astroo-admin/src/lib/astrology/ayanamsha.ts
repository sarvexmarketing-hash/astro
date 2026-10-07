/**
 * ASTRO Production Astrology Engine - Ayanamsha Module
 *
 * Implements high-precision Sidereal Ayanamsha algorithms.
 * Default: N.C. Lahiri (Chitra Paksha) as officially adopted by the Calendar Reform Committee of India.
 * Supports configurable KP (Krishnamurti), Raman, and Sri Yukteshwar ayanamshas.
 */

export type AyanamshaSystem = 'LAHIRI' | 'KP' | 'RAMAN' | 'YUKTESHWAR';

/**
 * Calculates Ayanamsha in degrees for a given Julian Day in Universal Time.
 * Reference Epoch: J2000.0 (JD 2451545.0 = 2000-01-01 12:00:00 UTC)
 *
 * @param julianDay - Julian Day in UT
 * @param system - Ayanamsha system ('LAHIRI' by default)
 * @returns Ayanamsha value in decimal degrees
 */
export function calculateAyanamsha(
  julianDay: number,
  system: AyanamshaSystem = 'LAHIRI'
): number {
  // Time in Julian Centuries from J2000.0
  const T = (julianDay - 2451545.0) / 36525.0;

  // Base precession angle (IAU precession model)
  // P = 5029.0966" * T + 1.11113" * T^2 - 0.000006" * T^3 (in arcseconds)
  const precessionArcsec = 5029.0966 * T + 1.11113 * T * T - 0.000006 * T * T * T;
  const precessionDeg = precessionArcsec / 3600.0;

  switch (system) {
    case 'LAHIRI':
      // Lahiri Ayanamsha at J2000.0 = 23° 51' 25.53" = 23.85709167°
      // General formula: 23.85709167° + Precession
      return 23.85709167 + precessionDeg;

    case 'KP':
      // Krishnamurti Paddhati Ayanamsha is approximately Lahiri - 0° 05' 56" = Lahiri - 0.098889°
      return 23.75820278 + precessionDeg;

    case 'RAMAN':
      // B.V. Raman Ayanamsha at J2000.0 is approximately 22° 24' 36" = 22.410000°
      return 22.41 + precessionDeg;

    case 'YUKTESHWAR':
      // Sri Yukteshwar Ayanamsha (Holy Science)
      return 21.03333333 + precessionDeg;

    default:
      return 23.85709167 + precessionDeg;
  }
}
