# Astrowave Web Applications Documentation

This document describes the two production-ready web applications created for the **Astrowave** platform, converting the native Android Customer (`app/`) and Astrologer (`astroo-astrologer/`) apps into responsive Next.js web applications.

---

## 1. Project Directory Structure

```
astroo/
├── astroo-customer-web/       # Customer Web Application (Port 3001)
├── astroo-astrologer-web/     # Astrologer Portal Web Application (Port 3002)
├── astroo-admin/              # Existing Admin Portal (Port 3000)
├── backend/                   # Existing Express/Node.js API & Socket Server (Port 5001)
├── app/                       # Native Android Seeker App (Untouched & Preserved)
└── astroo-astrologer/         # Native Android Astrologer App (Untouched & Preserved)
```

---

## 2. Port Allocation & Local URLs

| Application | Environment Variable / Port | URL |
| :--- | :--- | :--- |
| **Backend API & WebSockets** | `PORT=5001` | `http://localhost:5001` |
| **Admin Portal** | `PORT=3000` | `http://localhost:3000` |
| **Customer Web App** | `PORT=3001` | `http://localhost:3001` |
| **Astrologer Web App** | `PORT=3002` | `http://localhost:3002` |

---

## 3. Technology Stack & Key Libraries

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark cosmic theme (`#030712`, `#0f172a`, amber/gold `#f59e0b` accents, glassmorphic cards, smooth gradients)
- **Icons**: `lucide-react`
- **Real-time WebSockets**: `socket.io-client` (chat, presence, consultation events, continuous billing ticks)
- **Voice & Video Calling**: WebRTC PeerConnection with STUN/TURN ICE negotiation through backend signaling
- **Payment Gateway**: Razorpay Checkout SDK dynamically loaded on the client side

---

## 4. Customer Web App (`astroo-customer-web`)

### Features Implemented:
1. **Homepage (`/`)**:
   - Cosmic hero banner with quick call-to-actions.
   - Quick action channels: Chat with Astrologer, Voice/Video Call, Janam Kundli, Shubh Muhurat, Vedic Pooja.
   - Live carousel of Online Astrologers with direct consultation triggers.
   - Daily Rashifal horoscope for all 12 zodiac signs.
   - Verified Pooja services catalog showcase.
   - Top-rated Vedic masters with client reviews.

2. **Astrologer Directory & Filtering (`/astrologers`)**:
   - Filter by Consultation Channel (Chat / Audio Call / Video Call).
   - Filter by Discipline (Vedic, Tarot, Numerology, Vastu, Palmistry, Nadi, KP, Prashna).
   - Filter by Language (Hindi, English, Sanskrit, Gujarati, Marathi, Bengali, Tamil, Telugu, etc.).
   - Filter by Live Status (Online Now).
   - Real-time search by name or specialization.
   - Sorting by Rating, Experience, and Rate (low to high / high to low).

3. **Astrologer Detail & Profile (`/astrologers/[id]`)**:
   - Astrologer biography, qualifications, verified badge, and consultation count.
   - Per-minute rate breakdown.
   - Real-time online/busy status indicator.
   - Action buttons to start Chat, Audio Call, or Video Call immediately.
   - Reviews and client testimonials list.

4. **Live Consultation Chat (`/chat/[id]`)**:
   - Connected directly to backend Socket.IO on port 5001 (`/chat` namespace).
   - Real-time two-way messaging with delivery timestamps.
   - Real-time session elapsed timer.
   - Continuous Authoritative Billing Tick listener (`consultation_tick` event).
   - "End Session" action with modal confirmation and automatic billing settlement.
   - Low wallet balance warning notifications.

5. **Live WebRTC Audio & Video Calling (`/call/[id]`)**:
   - Full WebRTC PeerConnection implementation with camera/microphone stream negotiation.
   - Audio mute/unmute, video camera toggle, and speaker controls.
   - Live call duration timer and server billing tick updates.
   - In-call End Call button notifying backend consultation state machine (`ENDED`).

6. **Wallet & Recharge (`/wallet`)**:
   - Real-time available balance fetched from backend wallet API.
   - Quick recharge recharge packs (₹100, ₹250, ₹500, ₹1,000, ₹2,000, ₹5,000) with bonus credits.
   - Razorpay payment modal with order creation on backend.
   - Double-entry ledger transaction history (recharges, consultation deductions, refunds).

7. **Vedic Astrology Engines (`/kundli`, `/muhurat`)**:
   - **Janam Kundli (`/kundli`)**: Birth details input form (date, time, latitude/longitude, timezone). Generates full North-Indian Vedic Chart (SVG), Planetary Degrees (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu), and Dosha analysis (Manglik, Kalsarpa, Sade Sati).
   - **Shubh Muhurat (`/muhurat`)**: Daily Auspicious & Inauspicious timings calculator (Abhijit Muhurat, Rahu Kaal, Yamaganda, Gulika Kaal).

8. **Vedic Pooja Services (`/pooja`)**:
   - Catalog of authentic pujas (Maha Mrityunjaya, Kaal Sarp Dosh Nivaran, Rudrabhishek, Navgrah Shanti, Lakshmi Kuber, etc.).
   - Pooja booking modal collecting Gotra, Sankalp, devotee names, and preferred date.

9. **Consultation & Pooja Bookings (`/bookings`)**:
   - History of all past chat, voice, and video consultations with duration and billed amount.
   - Pooja booking status tracking.

10. **Global Incoming Call Notification (`GlobalIncomingCall`)**:
    - Embedded into root layout to pop up an interactive incoming audio/video call modal anywhere across the customer website.

---

## 5. Astrologer Web App (`astroo-astrologer-web`)

### Features Implemented:
1. **Role Enforcement & Authentication (`/login`, `/register`)**:
   - Dedicated astrologer login and registration requiring role `astrologer`.
   - Protects all astrologer routes from unauthorized seeker access.

2. **Dashboard (`/dashboard`)**:
   - Live broadcasting status toggle (Online / Offline).
   - Metric cards: Today's Earned Revenue, Available Balance, Pending Session Requests, Total Completed Consultations.
   - Real-time incoming consultation requests queue with 1-click Accept / Decline.
   - Recent consultations list.

3. **Consultation Requests Queue (`/requests`)**:
   - Instant notification and audio chime on `consultation_requested` Socket.IO event.
   - Customer profile snippet, preferred channel (Chat / Audio / Video), and rate per minute.
   - Accept redirects astrologer directly into active chat or call room.

4. **Astrologer Live Chat (`/chat/[id]`)**:
   - Real-time consultation chat room with customer.
   - Shows live elapsed timer and per-minute revenue counter.
   - Astrologer "End Session" control with confirmation dialog.

5. **Astrologer WebRTC Calling (`/call/[id]`)**:
   - Full WebRTC voice and video consultation room.
   - Local and remote media streams with mic and camera toggles.
   - Synchronized session timer and server billing tick listener.

6. **Earnings & Ledger (`/earnings`)**:
   - Breakdown of Gross Revenue, 20% Astrowave Platform Fee, and 80% Net Astrologer Earnings.
   - Itemized commission ledger per consultation.

7. **Withdrawals & Bank Accounts (`/payouts`)**:
   - View Available Balance and Total Withdrawn.
   - Request Payout withdrawal form with minimum threshold check.
   - Bank Account and UPI ID registration and verification management.
   - Withdrawal history table with status badges (Pending, Processing, Completed, Rejected).

8. **Availability & Pricing (`/availability`)**:
   - Instant Online/Offline broadcast toggle.
   - Per-minute rate configuration (₹1 to ₹1,000/min) with live preview of net 80% earnings.
   - Astrology disciplines selector (Vedic, Tarot, Palmistry, Vastu, etc.).
   - Languages spoken selector.

9. **Astrologer Profile & Credentials (`/profile`)**:
   - Account info and rating badge.
   - Experience years counter.
   - Public astrological biography and philosophy.
   - Verification status badge.

10. **Astrologer Notifications (`/notifications`)**:
    - Live notifications list for session requests, payouts, and system alerts.

---

## 6. How to Run Locally

### Prerequisites
- Node.js 18+ (verified on Node v25.9.0)
- Backend running on `http://localhost:5001`

### Running Backend:
```bash
cd backend
npm run dev
```

### Running Customer Web App:
```bash
cd astroo-customer-web
npm run dev -p 3001
# Open http://localhost:3001 in your browser
```

### Running Astrologer Web App:
```bash
cd astroo-astrologer-web
npm run dev -p 3002
# Open http://localhost:3002 in your browser
```

### Running Production Builds:
```bash
# Customer Web:
cd astroo-customer-web
npm run build
npm start -- -p 3001

# Astrologer Web:
cd astroo-astrologer-web
npm run build
npm start -- -p 3002
```

---

## 7. Backend & Security Modifications

1. **CORS & Allowed Origins (`backend/src/app.ts` & `backend/.env`)**:
   - Added `http://localhost:3001` (Customer Web) and `http://localhost:3002` (Astrologer Web) to `localWebOrigins` and `CORS_ORIGINS`.
   - Enabled credentialed requests for JWT session cookies and authorization headers.
   - Safe HTTP methods (GET, HEAD, OPTIONS) bypass CSRF checking, while mutations (POST, PUT, DELETE) match trusted origin headers.

2. **Authoritative Continuous Billing Architecture**:
   - Continuous billing is strictly enforced by the backend scheduler (`BillingService.startBillingScheduler` running every 5 seconds) which executes the atomic PostgreSQL stored procedure `bill_consultation_minute_tick_atomic`.
   - The web frontends strictly consume `consultation_tick`, `wallet_updated`, and `insufficient_balance` WebSocket events, ensuring zero possibility of client-side billing tampering.
