# PROJECT_CONTEXT.md — Project-77
## AI-Powered Citizen Services Super-Platform for Bharat
### Hackathon: AI ASCEND 2026 — AWS & Kyndryl @ Saveetha Engineering College

---

## Last Updated: 2026-02-27
## Active Branch: main
## Current Phase: COMPLETE — Full frontend built, all pages functional

---

## WHAT EXISTS RIGHT NOW

```
/frontend/             — React + Vite app (FULLY BUILT)
  src/
    index.css          — Cosmic Bharat design system (CSS variables, glassmorphism)
    App.jsx            — React Router v6 with role-based protected routes
    App.css            — Minimal app-level styles
    context/
      AuthContext.jsx  — Auth context (login/logout, localStorage persistence)
    layouts/
      AdminLayout.jsx  — Collapsible sidebar + topbar + Ashoka Chakra logo
      AdminLayout.css
      CitizenLayout.jsx — Sticky topbar nav + mobile drawer
      CitizenLayout.css
    pages/
      admin/
        AdminDashboard.jsx     ✅ KPI cards, impact banner, area chart, pie chart, activity feed, resolution ring
        AdminDashboard.css
        GrievanceManagement.jsx ✅ Paginated table, search/filter, edit modal, sentiment bars
        SentimentPanel.jsx      ✅ Distress trend chart, AI-flagged cards, filter tabs
        IndiaHeatmap.jsx        ✅ Interactive grid map, state rankings, click-to-select
        SchemeManagement.jsx    ✅ Card grid, add/edit modal, coverage progress bars
        NotificationsPanel.jsx  ✅ Type-coded cards, mark-read, filter tabs
        FraudDetection.jsx      ✅ AI reasoning, similarity scores, confirm/dismiss actions
        Analytics.jsx           ✅ Area chart, horizontal bar, state bar chart, stacked sentiment, table
      auth/
        LoginPage.jsx     ✅ Ashoka Chakra logo, quick demo buttons, role-based redirect
        RegisterPage.jsx  ✅ Full registration form, state dropdown
        AuthPages.css
      citizen/
        HomePage.jsx       ✅ Full landing page with nav, ticker, hero, stats, features, CTA
        HomePage.css
        CitizenDashboard.jsx ✅ Personalized welcome, stats, quick actions, grievances, matched schemes
        SchemeDiscovery.jsx  ✅ AI Match toggle, search/filter, expandable cards
        GrievanceFiling.jsx  ✅ Form validation, voice input, file upload, success screen with tracking ID
        GrievanceTracking.jsx ✅ Track by ID, status timeline, my grievances list
        AIChatbot.jsx        ✅ Chat UI, typing indicator, language selector (10 langs), voice input, quick questions
        ProfilePage.jsx      ✅ Editable form, activity stats, data privacy section
    mock/
      mockData.js       ✅ 120 grievances, 12 schemes, heatmap, analytics, notifications, fraud data
    services/
      api.service.js    ✅ Full API layer (all mock, swap-ready for Surya's backend)
/PROJECT_CONTEXT.md    — this file
/README.md             — project readme
```

---

## TEAM

| Person | Role |
|--------|------|
| Tharun | Frontend (React/Vite) — COMPLETED |
| Surya | Backend (separate dev) |
| Sai Darshan & Adithya | Presentation / PPT / Demo |

---

## TECH STACK (Frontend)

- **Framework**: React 18 + Vite 7
- **Routing**: React Router v6
- **Styling**: Vanilla CSS (custom "Cosmic Bharat" design system)
- **Charts**: Recharts (area, bar, pie, radar charts)
- **Icons**: React Icons (react-icons/md)
- **Mock Data**: `/frontend/src/mock/mockData.js`
- **API Service**: `/frontend/src/services/api.service.js`

---

## ADMIN SIDE FEATURES

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Admin Dashboard | ✅ Complete | KPI cards, impact banner, area/pie charts, live feed, resolution ring |
| 2 | Grievance Management | ✅ Complete | 120 grievances, search/filter, paginated, edit modal |
| 3 | Sentiment Intelligence Panel | ✅ Complete | Trend chart, distress cards, filter tabs |
| 4 | India Heatmap | ✅ Complete | Interactive grid, state rankings, click detail |
| 5 | Scheme Management | ✅ Complete | Cards, add/edit modal, coverage bars |
| 6 | Notifications Panel | ✅ Complete | Type-coded, mark-read, filter |
| 7 | Fraud & Duplicate Detection | ✅ Complete | AI reasoning, similarity score, confirm/dismiss |
| 8 | Analytics & Reports | ✅ Complete | 4 charts + state performance table |

---

## CITIZEN SIDE FEATURES

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Homepage | ✅ Complete | Full landing page, language ticker, features grid |
| 2 | Login | ✅ Complete | Quick demo logins, role-based redirect |
| 3 | Register | ✅ Complete | Full form with state dropdown |
| 4 | Citizen Dashboard | ✅ Complete | Stats, quick actions, grievances, matched schemes |
| 5 | Scheme Discovery | ✅ Complete | AI Match toggle, search/filter, expandable cards |
| 6 | Grievance Filing | ✅ Complete | Form, voice input, file upload, tracking ID |
| 7 | Grievance Tracking | ✅ Complete | Track by ID, timeline, my grievances |
| 8 | AI Chatbot | ✅ Complete | Chat UI, typing indicator, 10 languages, voice input |
| 9 | Profile Page | ✅ Complete | Editable, activity stats, privacy section |

---

## AUTH

| Feature | Status |
|---------|--------|
| Login Page | ✅ Complete |
| Register Page | ✅ Complete |
| Role-based redirect (citizen vs admin) | ✅ Complete |
| Admin demo credentials | admin@gov.in / admin123 |
| Citizen demo credentials | ramesh@gmail.com / ramesh123 |

---

## DEMO CREDENTIALS

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gov.in | admin123 |
| Citizen | ramesh@gmail.com | ramesh123 |

---

## BUILD STATUS

✅ `npm run build` — PASSES (vite build, 4.47s, no errors)
✅ `npm run dev` — Dev server runs on http://localhost:5173

---

## DESIGN SYSTEM

**Theme**: "Cosmic Bharat" — deep space dark background, saffron/white/green India tricolor accents, Ashoka Chakra SVG motif, glassmorphism cards, gradient text.

**Colors**:
- Background: `#050b1a` (deep space)
- Primary: `#FF6B2C` (saffron)
- Secondary: `#00C896` (teal/India green)
- Text: `#E8EDF5`
- Glass card: `rgba(255,255,255,0.04)` + `backdrop-filter: blur(12px)`

---

## NEXT STEPS (for Surya's API integration)

1. Replace each function in `api.service.js` with real Axios/fetch calls to Surya's endpoints
2. The function signatures stay the same — just swap mock data for real async calls
3. Auth: Replace `apiLogin`/`apiRegister` with JWT token calls
4. Use the token from `apiLogin` to set Authorization headers

---

## SESSION NOTES

### 2026-02-27 (UI/UX Overhaul & Cinematic Polish)
- **Intelligence Terminal Replacement**: Completely rewrote the homepage features section into a split-screen "Intelligence Terminal" layout with a Process Index and a cinematic Feature Viewport featuring 21 custom SVG/CSS mini-visualizations.
- **Operation Briefing**: Redesigned the "How it Works" section into a staggered drawer-pull component with live indicator animations.
- **Vite Build Fix**: Resolved a namespace collision and syntax error in `TerminalViz.jsx` that caused a Production 500 blank page crash.
- **Global Contrast Script**: Wrote and executed a Python script to bump global UI contrast (Surfaces: `0.04` &rarr; `0.06`, Borders: `0.06` &rarr; `0.12`, Text: `#94A3B8` &rarr; `#B8C5D6`, minimum font sizes increased).
- **Holographic India Map**: Specifically targeted `IndiaMap.jsx` with intense aesthetic updates: Cyan (`#00FFEE`) borders with `10px` drop-shadows, larger distress dots, thicker PreSeva arcs, improved radar sweep, and faint containment border strips, achieving a vivid "projected hologram" look.
- Build passes: `npm run build` ✅
