import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlobalIncomingCall from '../components/GlobalIncomingCall';

export const metadata: Metadata = {
  title: 'Astrowave — Live Vedic Astrology, Kundli, Tarot & Pooja Consultations',
  description: 'Connect live with certified Vedic Astrologers, Tarot Readers, and Pandits. 24x7 instant chat, voice call, video consultation, free Janam Kundli, and Shubh Muhurat.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
