'use client';

import React from 'react';

interface KundliChartProps {
  houses?: Record<number, string[]>;
  lagnaRashi?: string;
  title?: string;
}

export default function KundliChart({
  houses = {},
  lagnaRashi = 'Aries',
  title = 'Lagna Chart (D1)',
}: KundliChartProps) {
  // SVG coordinates for North Indian chart (400x400)
  // House 1 is top-center diamond
  // House 2 is top-left triangle
  // House 3 is left-top triangle
  // House 4 is left-center diamond
  // etc.
  return (
    <div className="flex flex-col items-center">
      {title && <h4 className="text-sm font-bold text-amber-300 mb-2">{title}</h4>}
      <div className="relative w-full max-w-[360px] aspect-square bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-2 shadow-xl shadow-amber-500/5">
        <svg viewBox="0 0 400 400" className="w-full h-full stroke-amber-500/60 stroke-[1.5] fill-none">
          {/* Outer Border */}
          <rect x="0" y="0" width="400" height="400" />
          
          {/* Diagonals */}
          <line x1="0" y1="0" x2="400" y2="400" />
          <line x1="400" y1="0" x2="0" y2="400" />
          
          {/* Inner Diamond */}
          <polygon points="200,0 400,200 200,400 0,200" />
        </svg>

        {/* House Content Overlays */}
        {/* House 1 (Top Center Diamond) */}
        <div className="absolute top-[12%] left-[38%] w-[24%] h-[24%] flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-amber-500/70 font-mono">1</span>
          <span className="text-[11px] font-bold text-amber-300">{lagnaRashi}</span>
          <span className="text-[10px] text-emerald-400 font-semibold">{houses[1]?.join(' ') || 'Asc'}</span>
        </div>

        {/* House 2 (Top Left) */}
        <div className="absolute top-[5%] left-[12%] w-[20%] h-[15%] flex flex-col items-center justify-center text-center">
          <span className="text-[9px] text-amber-500/70 font-mono">2</span>
          <span className="text-[10px] text-white font-medium">{houses[2]?.join(' ') || ''}</span>
        </div>

        {/* House 3 (Left Top) */}
        <div className="absolute top-[20%] left-[4%] w-[15%] h-[20%] flex flex-col items-center justify-center text-center">
          <span className="text-[9px] text-amber-500/70 font-mono">3</span>
          <span className="text-[10px] text-white font-medium">{houses[3]?.join(' ') || ''}</span>
        </div>

        {/* House 4 (Left Center Diamond) */}
        <div className="absolute top-[38%] left-[12%] w-[24%] h-[24%] flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-amber-500/70 font-mono">4</span>
          <span className="text-[10px] text-amber-200 font-medium">{houses[4]?.join(' ') || 'Mo'}</span>
        </div>

        {/* House 5 (Left Bottom) */}
        <div className="absolute bottom-[20%] left-[4%] w-[15%] h-[20%] flex flex-col items-center justify-center text-center">
          <span className="text-[9px] text-amber-500/70 font-mono">5</span>
          <span className="text-[10px] text-white font-medium">{houses[5]?.join(' ') || ''}</span>
        </div>

        {/* House 6 (Bottom Left) */}
        <div className="absolute bottom-[5%] left-[12%] w-[20%] h-[15%] flex flex-col items-center justify-center text-center">
          <span className="text-[9px] text-amber-500/70 font-mono">6</span>
          <span className="text-[10px] text-white font-medium">{houses[6]?.join(' ') || ''}</span>
        </div>

        {/* House 7 (Bottom Center Diamond) */}
        <div className="absolute bottom-[12%] left-[38%] w-[24%] h-[24%] flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-amber-500/70 font-mono">7</span>
          <span className="text-[10px] text-amber-200 font-medium">{houses[7]?.join(' ') || 'Ve'}</span>
        </div>

        {/* House 8 (Bottom Right) */}
        <div className="absolute bottom-[5%] right-[12%] w-[20%] h-[15%] flex flex-col items-center justify-center text-center">
          <span className="text-[9px] text-amber-500/70 font-mono">8</span>
          <span className="text-[10px] text-white font-medium">{houses[8]?.join(' ') || ''}</span>
        </div>

        {/* House 9 (Right Bottom) */}
        <div className="absolute bottom-[20%] right-[4%] w-[15%] h-[20%] flex flex-col items-center justify-center text-center">
          <span className="text-[9px] text-amber-500/70 font-mono">9</span>
          <span className="text-[10px] text-white font-medium">{houses[9]?.join(' ') || 'Ju'}</span>
        </div>

        {/* House 10 (Right Center Diamond) */}
        <div className="absolute top-[38%] right-[12%] w-[24%] h-[24%] flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-amber-500/70 font-mono">10</span>
          <span className="text-[10px] text-amber-200 font-medium">{houses[10]?.join(' ') || 'Su'}</span>
        </div>

        {/* House 11 (Right Top) */}
        <div className="absolute top-[20%] right-[4%] w-[15%] h-[20%] flex flex-col items-center justify-center text-center">
          <span className="text-[9px] text-amber-500/70 font-mono">11</span>
          <span className="text-[10px] text-white font-medium">{houses[11]?.join(' ') || 'Me'}</span>
        </div>

        {/* House 12 (Top Right) */}
        <div className="absolute top-[5%] right-[12%] w-[20%] h-[15%] flex flex-col items-center justify-center text-center">
          <span className="text-[9px] text-amber-500/70 font-mono">12</span>
          <span className="text-[10px] text-white font-medium">{houses[12]?.join(' ') || 'Ma'}</span>
        </div>
      </div>
    </div>
  );
}
