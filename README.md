# AstroWave — Web Portals Monorepo

Welcome to the **AstroWave Web Portals** repository. This repository houses the three modern Next.js web applications powering the AstroWave platform:

| Application | Directory | Default Port | Technology |
| :--- | :--- | :--- | :--- |
| **Customer Web Portal** | [`astroo-customer-web/`](./astroo-customer-web) | `3001` | Next.js 16 (App Router), Tailwind CSS, Socket.IO, WebRTC, Razorpay |
| **Astrologer Web Portal** | [`astroo-astrologer-web/`](./astroo-astrologer-web) | `3002` | Next.js 16 (App Router), Tailwind CSS, Socket.IO, WebRTC |
| **Admin Management Portal** | [`astroo-admin/`](./astroo-admin) | `3000` | Next.js 15 (App Router), Tailwind CSS, Lucide |

---

## 🌟 Applications Overview

### 1. Customer Web Portal (`astroo-customer-web`)
The consumer-facing web application for seeking astrology services.
- **Vedic Astrology & Calculations**: Janam Kundli charts, Shubh Muhurat timing, Panchang, and Daily Rashifal.
- **Consultations**: Live chat, WebRTC audio and video calling with astrologers.
- **E-Commerce & Services**: Verified Vedic Pooja booking and spiritual remedies store.
- **Payments & Wallet**: Integrated Razorpay checkout with live recharge and wallet balance tracking.

### 2. Astrologer Web Portal (`astroo-astrologer-web`)
The dedicated practitioner workbench for certified astrologers.
- **Queue & Availability**: Real-time consultation queue management and online/offline presence toggles.
- **Live Consultation Tools**: Integrated chat console, WebRTC voice/video calls, and Kundli inspector.
- **Earnings & Analytics**: Earnings breakdown, call logs, performance ratings, and client histories.

### 3. Admin Management Portal (`astroo-admin`)
The centralized platform administration dashboard.
- **User & Astrologer Management**: Onboarding verification, status moderation, and profile controls.
- **Financial Controls**: Wallet ledger, consultation transaction logs, and payout reviews.
- **Service & Product Catalog**: Pooja catalog, astrology services management, and platform analytics.

---

## 🚀 Quick Start & Development

### Prerequisites
- **Node.js**: v20 or higher
- **npm** or **pnpm** / **yarn**

### 1. Customer Web Application
```bash
cd astroo-customer-web
npm install
cp .env.example .env.local
npm run dev
# Running on http://localhost:3001
```

### 2. Astrologer Web Application
```bash
cd astroo-astrologer-web
npm install
cp .env.example .env.local
npm run dev
# Running on http://localhost:3002
```

### 3. Admin Management Portal
```bash
cd astroo-admin
npm install
cp .env.example .env.local
npm run dev
# Running on http://localhost:3000
```

---

## 📖 Additional Documentation
For detailed architecture, component breakdown, and configuration instructions, see [`WEB_APPLICATIONS.md`](./WEB_APPLICATIONS.md).
