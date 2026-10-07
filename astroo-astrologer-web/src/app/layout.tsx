'use client';

import React from 'react';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import PortalGuard from '../components/PortalGuard';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Astrowave Practitioner Portal — Consultations, Earnings & Payouts</title>
        <meta name="description" content="Dedicated practitioner dashboard for verified Vedic Astrologers on Astrowave." />
      </head>
      <body className="bg-[#FFFDF7] text-[#18181B] min-h-screen selection:bg-[#F7C93E] selection:text-[#18181B]">
        <AuthProvider>
          <SocketProvider>
            <PortalGuard>
              {children}
            </PortalGuard>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
