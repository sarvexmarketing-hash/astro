"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  Printer,
  Smartphone,
  Mic,
  Camera,
  Bell,
  MapPin,
  FileText,
  Mail,
  ExternalLink,
  CheckCircle2
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation / Header Actions */}
        <div className="flex items-center justify-between gap-4 mb-6 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#78350F] hover:text-[#B45309] bg-[#FEF3C7] hover:bg-[#FDE68A] px-3.5 py-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#57534E] hover:text-[#1C1917] bg-white border border-[#E7E5E4] px-3.5 py-2 rounded-full shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>

        {/* Main Document Card */}
        <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Top Compliance Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
              Google Play Developer Policy & Data Safety Compliant
            </span>
          </div>

          {/* Title & Metadata */}
          <div className="border-b border-[#F5F5F4] pb-6 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#78350F] tracking-tight">
              AstroWave — Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] font-medium">
              Effective Date: <span className="text-[#1C1917] font-semibold">November 21, 2026</span> | Last Updated: <span className="text-[#1C1917] font-semibold">November 21, 2026</span>
            </p>
          </div>

          {/* Welcome & Scope */}
          <div className="space-y-4 text-sm text-[#44403C] leading-relaxed">
            <p>
              Welcome to <strong>AstroWave</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), operated by{" "}
              <strong>Astrowave Spiritual Technologies Pvt. Ltd.</strong> This Privacy Policy governs your use of our mobile applications and services, specifically:
            </p>

            <ul className="space-y-2 pl-4 list-disc text-xs sm:text-sm text-[#57534E]">
              <li>
                <strong>AstroWave — Talk to Astrologers</strong> (Customer App, Application ID: <code className="text-[#B45309] bg-[#FEF3C7] px-1.5 py-0.5 rounded text-[11px] font-mono">Astro.wave_1</code>)
              </li>
              <li>
                <strong>AstroWave Astrologer Partner App</strong> (Practitioner App, Application ID: <code className="text-[#B45309] bg-[#FEF3C7] px-1.5 py-0.5 rounded text-[11px] font-mono">com.astro.astrologer</code>)
              </li>
              <li>
                Web platform and backend services located at{" "}
                <a
                  href="https://astrowavebackend-production.up.railway.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D97706] font-semibold hover:underline"
                >
                  astrowavebackend-production.up.railway.app
                </a>
              </li>
            </ul>

            <p>
              We are dedicated to safeguarding your privacy and personal data. This Privacy Policy transparently explains how we collect, use, process, share, retain, and protect your information in strict compliance with the <strong>Google Play Store Developer Program Policies</strong>, the <strong>Google Play Data Safety</strong> requirements, and applicable data protection regulations.
            </p>
          </div>

          {/* Section 1: Applications Covered by This Policy */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <span className="text-[#D97706]">1.</span> Applications Covered by This Policy
            </h2>
            <p className="text-sm text-[#44403C] leading-relaxed">
              This policy applies equally to users of our consumer application and our verified astrologer practitioners:
            </p>
            <ul className="space-y-2 pl-4 list-disc text-sm text-[#57534E]">
              <li>
                <strong>Seekers / Customers:</strong> Individuals seeking astrological consultations, Kundli chart analysis, tarot readings, and spiritual guidance.
              </li>
              <li>
                <strong>Astrologers / Practitioners:</strong> Independent Vedic scholars, tarot readers, and spiritual counselors who provide verified consultations on our platform.
              </li>
            </ul>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="space-y-4 pt-2">
            <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <span className="text-[#D97706]">2.</span> Information We Collect
            </h2>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#78350F] uppercase tracking-wider">
                A. Information You Provide Directly
              </h3>
              <ul className="space-y-2.5 pl-4 list-disc text-sm text-[#57534E]">
                <li>
                  <strong>Account Registration & Authentication:</strong> Mobile phone number (used for secure SMS OTP authentication) and optional Google Sign-in profile information (name and verified email address).
                </li>
                <li>
                  <strong>Astrological Profile Data:</strong> Full name, gender, date of birth, exact time of birth, and place of birth (city, state, country, latitude, and longitude). <em>This information is collected exclusively to compute accurate Vedic Kundli charts, planetary ephemeris alignments, and personalized horoscope forecasts.</em>
                </li>
                <li>
                  <strong>Consultation Communications:</strong> Real-time in-app chat messages, questions, and consultation notes exchanged between seekers and astrologers.
                </li>
                <li>
                  <strong>Vedic Pooja & Ritual Information:</strong> Gotra, nakshatra, and delivery address details provided voluntarily when booking Vedic Pooja ceremonies or physical samagri.
                </li>
                <li>
                  <strong>Astrologer Verification & Credentials (Partner App Only):</strong> Government-issued identity documentation (Aadhaar / PAN / Passport), academic certificates, gurukul qualifications, professional bio, consultation experience, and bank account / UPI details for earnings disbursements.
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-[#78350F] uppercase tracking-wider">
                B. Information Collected Automatically
              </h3>
              <ul className="space-y-2.5 pl-4 list-disc text-sm text-[#57534E]">
                <li>
                  <strong>Device & Network Identifiers:</strong> Operating system version, device manufacturer, device model, network state, IP address, and unique Firebase Cloud Messaging (FCM) tokens required to deliver high-priority consultation request and incoming call alerts.
                </li>
                <li>
                  <strong>App Performance & Diagnostics:</strong> Crash logs, latency metrics, and engagement statistics collected via Firebase Analytics to ensure system reliability and stability.
                </li>
                <li>
                  <strong>Transaction Records:</strong> Recharge amounts, billing timestamps, wallet balance adjustments, and gateway transaction IDs. <em>We never store credit card numbers, debit card numbers, or CVVs. All transactions are securely processed by PCI-DSS Level 1 compliant gateway partners (Razorpay) and Google Play In-App Billing.</em>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3: Sensitive Android Permissions & How They Are Used */}
          <section className="space-y-4 pt-2">
            <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <span className="text-[#D97706]">3.</span> Sensitive Android Permissions & How They Are Used
            </h2>
            <p className="text-sm text-[#44403C] leading-relaxed">
              Our applications request only the minimum Android runtime permissions essential for providing live consultations and core features:
            </p>

            <div className="rounded-2xl border border-[#E0E7FF] bg-[#F5F7FF] p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-[#3730A3]">
              <div className="flex items-start gap-3">
                <Mic className="w-5 h-5 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1E1B4B]">Microphone (RECORD_AUDIO):</strong> Required strictly during user-initiated live voice and video consultations between users and astrologers via WebRTC. Audio streams are encrypted end-to-end and transmitted in real-time. We do <strong>NOT</strong> record or eavesdrop on consultations without explicit mutual consent. Microphone access terminates immediately when the call ends.
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-[#E0E7FF]/80">
                <Camera className="w-5 h-5 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1E1B4B]">Camera (CAMERA):</strong> Required strictly during live video consultations (user-initiated) and when uploading astrologer verification documents or profile avatars. Camera access terminates immediately when the consultation or capture completes.
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-[#E0E7FF]/80">
                <Bell className="w-5 h-5 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1E1B4B]">Notifications (POST_NOTIFICATIONS):</strong> Required on Android 13+ to notify you of incoming calls from astrologers, consultation booking acceptances, chat messages, and important wallet updates. You can manage notification preferences at any time in system settings.
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-[#E0E7FF]/80">
                <MapPin className="w-5 h-5 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1E1B4B]">Location (ACCESS_COARSE_LOCATION / ACCESS_FINE_LOCATION):</strong> Used solely with user approval to automatically resolve geographic latitude, longitude, and timezone coordinates required for accurate Vedic Kundli planetary calculations. Location is never tracked continuously or used for advertising.
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Purpose and Legal Basis for Data Processing */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <span className="text-[#D97706]">4.</span> Purpose and Legal Basis for Data Processing
            </h2>
            <p className="text-sm text-[#44403C] leading-relaxed">
              We process personal information exclusively for the following lawful business and operational purposes:
            </p>
            <ul className="space-y-2 pl-4 list-disc text-sm text-[#57534E]">
              <li>To calculate individualized Vedic Kundli charts, Dasha timelines, Panchang data, and horoscope interpretations.</li>
              <li>To connect seekers and astrologers via encrypted real-time chat, voice, and video consultations.</li>
              <li>To manage user digital wallet balances and maintain transparent, authoritative per-minute consultation billing.</li>
              <li>To verify practitioner credentials, qualifications, and background before granting verified astrologer status.</li>
              <li>To deliver push notifications regarding consultation requests, appointment status, and service alerts.</li>
              <li>To prevent fraudulent transactions, spam, harassment, and violations of our User-Generated Content (UGC) safety policies.</li>
            </ul>
          </section>

          {/* Section 5: Third-Party Services & Data Sharing */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <span className="text-[#D97706]">5.</span> Third-Party Services & Data Sharing
            </h2>
            <p className="text-sm text-[#44403C] leading-relaxed">
              We never sell, rent, or trade your personal data. We disclose information only to vetted third-party service providers essential for platform operations:
            </p>
            <ul className="space-y-2 pl-4 list-disc text-sm text-[#57534E]">
              <li>
                <strong>Cloud & Database Hosting:</strong> Railway (backend application servers and managed PostgreSQL databases hosted in secure data centers).
              </li>
              <li>
                <strong>Authentication & Messaging:</strong> Google Identity Services (Google Sign-In) and Google Firebase (Authentication, FCM push notifications, Crashlytics diagnostics).
              </li>
              <li>
                <strong>Payment Processing:</strong> Razorpay and Google Play In-App Billing for processing wallet recharges under strict PCI-DSS Level 1 compliance.
              </li>
              <li>
                <strong>Real-Time Communications:</strong> WebRTC peer connections and STUN/TURN relays for real-time encrypted voice and video streaming.
              </li>
              <li>
                <strong>Legal Compliance:</strong> We may disclose records if strictly required by applicable law, court order, or governmental authority.
              </li>
            </ul>
          </section>

          {/* Section 6: Data Retention & Account Deletion */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <span className="text-[#D97706]">6.</span> Data Retention & Account Deletion (Google Play Data Safety)
            </h2>
            <p className="text-sm text-[#44403C] leading-relaxed">
              In full compliance with Google Play Store Data Safety requirements:
            </p>
            <ul className="space-y-2 pl-4 list-disc text-sm text-[#57534E]">
              <li>
                <strong>Retention Period:</strong> We retain user profile data and consultation history only as long as your account remains active or as needed to provide services and comply with financial auditing regulations.
              </li>
              <li>
                <strong>User Right to Deletion:</strong> You have the right to request permanent deletion of your account and all associated personal data (including profile information, Kundli charts, and chat history) at any time.
              </li>
              <li>
                <strong>How to Request Deletion:</strong> You can initiate account deletion directly within the mobile application settings (<em>Settings &gt; Account &gt; Delete Account</em>) or by emailing our Data Protection Officer at{" "}
                <a href="mailto:privacy@astrowave.app" className="text-[#D97706] font-semibold hover:underline">
                  privacy@astrowave.app
                </a>. Deletion requests are processed within 30 days.
              </li>
            </ul>
          </section>

          {/* Section 7: Data Security Measures */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <span className="text-[#D97706]">7.</span> Data Security Measures
            </h2>
            <p className="text-sm text-[#44403C] leading-relaxed">
              We employ rigorous industry-standard safeguards to protect your personal data:
            </p>
            <ul className="space-y-2 pl-4 list-disc text-sm text-[#57534E]">
              <li><strong>Encryption in Transit:</strong> All data transmitted between client applications and backend servers is secured via Transport Layer Security (TLS 1.3 / HTTPS).</li>
              <li><strong>Encryption at Rest:</strong> Sensitive database records, identity documents, and credentials are encrypted using AES-256 bit encryption.</li>
              <li><strong>Role-Based Access Control (RBAC):</strong> Strict internal access controls limit data visibility strictly to authorized personnel and verified practitioners.</li>
            </ul>
          </section>

          {/* Section 8: Children's Privacy */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <span className="text-[#D97706]">8.</span> Children&apos;s Privacy
            </h2>
            <p className="text-sm text-[#44403C] leading-relaxed">
              Our services are not directed to individuals under the age of 18 (&quot;Children&quot;). We do not knowingly collect personally identifiable information from children under 18. If a parent or guardian discovers that their child has provided us with personal information, please contact us immediately, and we will promptly delete the data.
            </p>
          </section>

          {/* Section 9: Changes to This Privacy Policy */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <span className="text-[#D97706]">9.</span> Changes to This Privacy Policy
            </h2>
            <p className="text-sm text-[#44403C] leading-relaxed">
              We may update our Privacy Policy periodically to reflect technological advancements, operational changes, or regulatory requirements. We will notify you of any material changes by posting the updated policy on this page with a revised &quot;Last Updated&quot; date and via an in-app notice.
            </p>
          </section>

          {/* Section 10: Contact Us & Grievance Officer */}
          <section className="space-y-4 pt-2 border-t border-[#F5F5F4]">
            <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <span className="text-[#D97706]">10.</span> Contact Us & Grievance Officer
            </h2>
            <p className="text-sm text-[#44403C] leading-relaxed">
              For any questions, concerns, or grievances regarding this Privacy Policy or your personal data rights, please contact our designated Grievance Officer:
            </p>

            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-[#78350F] space-y-2">
              <p className="font-bold text-sm sm:text-base text-[#92400E]">
                Astrowave Spiritual Technologies Pvt. Ltd.
              </p>
              <p>
                <strong>Attention:</strong> Grievance Officer / Data Protection Officer
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:privacy@astrowave.app" className="font-semibold underline">
                  privacy@astrowave.app
                </a>{" "}
                /{" "}
                <a href="mailto:support@astrowave.app" className="font-semibold underline">
                  support@astrowave.app
                </a>
              </p>
              <p>
                <strong>Official Portal:</strong>{" "}
                <a
                  href="https://astrowavebackend-production.up.railway.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  https://astrowavebackend-production.up.railway.app
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer info note */}
        <p className="text-center text-xs text-[#A8A29E] mt-6 print:hidden">
          © {new Date().getFullYear()} Astrowave Spiritual Technologies Pvt. Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
}
