import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlobalIncomingCall from '../components/GlobalIncomingCall';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://astrowave.in'),
  title: 'Astrowave — Live Vedic Astrology, Kundli, Tarot & Pooja Consultations',
  description: 'Connect live with certified Vedic Astrologers, Tarot Readers, and Pandits. 24x7 instant chat, voice call, video consultation, free Janam Kundli, and Shubh Muhurat.',
  keywords: 'astrology, vedic astrology, kundli, tarot, horoscope, rashifal, astrologers, online pooja, muhurat',
  authors: [{ name: 'Astrowave' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/app_logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/images/app_logo.png',
  },
  openGraph: {
    title: 'Astrowave — Live Vedic Astrology Consultations',
    description: 'Instant chat, audio & video consultation with top verified Vedic masters.',
    url: 'https://astrowave.in',
    siteName: 'Astrowave',
    images: [
      {
        url: '/images/app_logo.png',
        width: 512,
        height: 512,
        alt: 'Astrowave Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/app_logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/app_logo.png" />
      </head>
      <body className="bg-[#FFFDF7] text-[#18181B] min-h-screen flex flex-col antialiased selection:bg-[#F7C93E] selection:text-[#18181B]">
        <AuthProvider>
          <SocketProvider>
            <Navbar />
            <main className="flex-1 w-full">
              {children}
            </main>
            <Footer />
            <GlobalIncomingCall />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
