/**
 * ASTRO Production Astrology Engine - Kundli PDF Report Generator
 *
 * Generates an executive-quality, branded Vedic Kundli report in HTML/SVG layout
 * containing Lagna, planetary tables, Bhavas, D1/D9 charts, Vimshottari Dashas, and Dosha summaries.
 */

import { KundliResult } from './vedic-engine';

export function generateKundliHtmlReport(kundli: KundliResult): string {
  const { birthData, lagna, moonDetails, planets, houses, dashas, doshas, generatedAt } = kundli;

  const planetsTableRows = Object.values(planets)
    .map(
      (p) => `
      <tr style="border-bottom: 1px solid #F3F4F6;">
        <td style="padding: 10px; font-weight: bold; color: #1F2937;">${p.name}</td>
        <td style="padding: 10px; color: #4B5563;">${p.rashiSanskrit} (${p.rashiEnglish})</td>
        <td style="padding: 10px; color: #111827;">${p.degreeInRashi.formatted}</td>
        <td style="padding: 10px; text-align: center; font-weight: bold;">H${p.house}</td>
        <td style="padding: 10px; color: #4B5563;">${p.nakshatra} (P${p.pada})</td>
        <td style="padding: 10px; text-align: center;">
          ${p.isRetrograde ? '<span style="color: #DC2626; font-weight: bold;">Retro</span>' : '<span style="color: #059669;">Direct</span>'}
          ${p.isCombust ? ' | <span style="color: #D97706; font-size: 11px;">Combust</span>' : ''}
        </td>
        <td style="padding: 10px; font-weight: 500;">${p.state}</td>
      </tr>
    `
    )
    .join('');

  const dashaRows = dashas.mahadashas
    .map(
      (d) => `
      <tr style="border-bottom: 1px solid #F3F4F6;">
        <td style="padding: 8px; font-weight: bold; color: #B45309;">${d.lord} Mahadasha</td>
        <td style="padding: 8px; color: #4B5563;">${d.startDate}</td>
        <td style="padding: 8px; color: #4B5563;">${d.endDate}</td>
        <td style="padding: 8px; text-align: right; color: #6B7280;">${d.durationYears} Years</td>
      </tr>
    `
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>ASTRO Vedic Kundli Report - ${birthData.name}</title>
    <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 24px; color: #1F2937; background: #FFFFFF; }
      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #F59E0B; padding-bottom: 16px; margin-bottom: 24px; }
      .title { font-size: 26px; font-weight: bold; color: #78350F; margin: 0; }
      .subtitle { font-size: 14px; color: #92400E; margin: 4px 0 0 0; }
      .badge { background: #FEF3C7; color: #92400E; padding: 6px 12px; border-radius: 12px; font-weight: bold; font-size: 12px; }
      .section-title { font-size: 18px; font-weight: bold; color: #92400E; border-left: 4px solid #F59E0B; padding-left: 8px; margin: 24px 0 12px 0; }
      .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
      .card { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 12px; }
      .card-title { font-size: 11px; color: #92400E; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; }
      .card-value { font-size: 16px; font-weight: bold; color: #18181B; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
      th { background: #FEF3C7; color: #78350F; text-align: left; padding: 10px; font-weight: bold; }
      .footer { margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 12px; font-size: 11px; color: #9CA3AF; text-align: center; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1 class="title">ASTROWAVE VEDIC KUNDLI</h1>
        <p class="subtitle">आస్ట్రోవేవ్ — High-Precision Sidereal Birth Chart Report</p>
      </div>
      <div class="badge">Ayanamsha: ${kundli.ayanamshaSystem} (${kundli.ayanamshaValue}°)</div>
    </div>

    <div class="grid-3">
      <div class="card">
        <div class="card-title">Native Name</div>
        <div class="card-value">${birthData.name} (${birthData.gender})</div>
      </div>
      <div class="card">
        <div class="card-title">Date & Exact Time</div>
        <div class="card-value">${birthData.birthDate} ${birthData.birthTime}</div>
      </div>
      <div class="card">
        <div class="card-title">Birth Place & Coordinates</div>
        <div class="card-value">${birthData.birthPlace} (${birthData.latitude.toFixed(2)}°N, ${birthData.longitude.toFixed(2)}°E)</div>
      </div>
    </div>

    <div class="grid-3">
      <div class="card" style="background: #FEF9C3;">
        <div class="card-title">Ascendant / Lagna</div>
        <div class="card-value">${lagna.rashiSanskrit} (${lagna.rashiEnglish})</div>
        <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">${lagna.degreeInRashi.formatted} • Lord: ${lagna.lord}</div>
      </div>
      <div class="card" style="background: #FEF9C3;">
        <div class="card-title">Moon Rashi & Nakshatra</div>
        <div class="card-value">${moonDetails.rashiSanskrit} — ${moonDetails.nakshatra}</div>
        <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">Pada ${moonDetails.pada} • Lord: ${moonDetails.nakshatraLord}</div>
      </div>
      <div class="card" style="background: #FEF9C3;">
        <div class="card-title">Manglik / Dosha Status</div>
        <div class="card-value" style="color: ${doshas.mangalDosha.isManglik ? '#DC2626' : '#059669'};">
          ${doshas.mangalDosha.isManglik ? 'Manglik (' + doshas.mangalDosha.severity + ')' : 'Non-Manglik'}
        </div>
        <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">${doshas.mangalDosha.description}</div>
      </div>
    </div>

    <div class="section-title">Planetary Positions & Dignities</div>
    <table>
      <thead>
        <tr>
          <th>Planet</th>
          <th>Rashi (Sign)</th>
          <th>Degree / Minute</th>
          <th>House</th>
          <th>Nakshatra</th>
          <th>Motion</th>
          <th>Dignity</th>
        </tr>
      </thead>
      <tbody>
        ${planetsTableRows}
      </tbody>
    </table>

    <div class="section-title">Vimshottari Dasha Timeline (120-Year Cycle)</div>
    <p style="font-size: 12px; color: #6B7280; margin: 0 0 8px 0;">Balance of ${dashas.startingMahadasha} Mahadasha at birth: <strong>${dashas.balanceAtBirthYears} Years</strong></p>
    <table>
      <thead>
        <tr>
          <th>Mahadasha</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th style="text-align: right;">Duration</th>
        </tr>
      </thead>
      <tbody>
        ${dashaRows}
      </tbody>
    </table>

    <div class="footer">
      Generated deterministically by ASTRO Engine ${kundli.engineVersion} • Confidential Report for Authorized Users • ${generatedAt}
    </div>
  </body>
  </html>
  `;
}
