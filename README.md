# REUNIFY — Smart Lost & Found Recovery Platform

> **"Lost Something? Let's Reunify."**  
> *Make campus recovery easier to navigate, safer to verify, and simpler to track.*

Reunify is a full-stack, enterprise-grade digital lost and found platform built for university campuses. It replaces fragmented social channels and paper notices with a centralized repository, deterministic smart matching, confidential ownership claim verification, and safe QR-assisted handovers at verified campus recovery desks.

---

## Engineering & Design Team

- **Aditya Gangarde** — Product Engineering & Full-Stack Development
- **Atharv Gandage** — Systems Architecture & Administrative Operations
- **Pranav Gawande** — Security Engineering & Physical Custody Protocol
- **Yash Wankhede** — Core Algorithms & Database Architecture

---

##  Target Campus Personas

1. **Students** — Fast reporting and discovery of personal electronics, airpods, backpacks, and dorm keys.
2. **Faculty & Staff** — Recovery of lecture accessories, eyewear, lab keys, and textbooks.
3. **Campus Security Officers** — Custodial inventory tracking, confidential claim examination, and physical handovers.
4. **University Administrators** — Campus-wide audit logging, resolution metrics, and lost-property compliance.

---

##  The 5-Step Recovery Journey

```
[ 01. REPORT ] ──> [ 02. MATCH ] ──> [ 03. CLAIM ] ──> [ 04. VERIFY ] ──> [ 05. RETURN ]
 Structured details    Rule-based engine     Private evidence     Security review     QR handover at
 & location photos     computes similarity   without leak         examines proof      designated desk
```

---

##  Technology Architecture

### Frontend
- **Framework**: React 19 + TypeScript (Strict Mode)
- **Tooling**: Vite
- **Styling**: Tailwind CSS with custom midnight navy and cyan/electric-blue design tokens
- **Routing**: React Router DOM (v7/v6)
- **Motion**: Framer Motion for natural transitions and entrance animations
- **Forms & Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **QR Engine**: `qrcode` with dynamic canvas generation
- **Micro-Delight**: `canvas-confetti` upon successful physical return

### Backend & Database (Supabase)
- **Database**: PostgreSQL 15+
- **Security**: Strict Row-Level Security (RLS) on all exposed tables
- **Authentication**: Supabase Auth (with session persistence and recovery)
- **Role Control**: Automatic database trigger `handle_new_user()` ensuring secure student defaults
- **Storage**: Segregated buckets (`item-photos` public, `claim-evidence` private)
- **Migrations**: Version-controlled SQL migrations located in `supabase/migrations/`

---

##  Smart Matching Engine (100 Point Explainable Formula)

Reunify utilizes a deterministic, transparent scoring engine that breaks down matching into five explainable criteria:

| Criterion | Max Points | Description |
|---|---|---|
| **Category Match** | 30 pts | Exact category match (different categories heavily penalized) |
| **Title Token Overlap** | 25 pts | Jaccard token similarity on normalized title keywords |
| **Location Proximity** | 20 pts | Specific room (20 pts), same building (16 pts), or same campus zone (10 pts) |
| **Temporal Proximity** | 15 pts | Discovered within 24h (15 pts), 3 days (12 pts), 1 week (8 pts), 2 weeks (4 pts) |
| **Description Traits** | 10 pts | Shared physical characteristics (color, brand, case, scratches) |

> **Explainability Notice**: A score indicates similarity—never proof of ownership. The engine never automatically approves claims.

---

##  Confidential Claims & Verification Lifecycle

```
[ Submitted ] ──> [ Under Review ] ──> [ Approved ] ──> [ Handover Pending ] ──> [ Returned ]
      │                  │
      └──────────────────┴─────────────> [ Rejected / Cancelled ]
```

1. **Claimant Submission**: Claimant enters private evidence (e.g., hidden serial numbers, lock-screen wallpaper, engraving).
2. **Access Security**: Private evidence is protected by PostgreSQL RLS. It is hidden from public listings and unprivileged users.
3. **Officer Review**: Campus security inspects private clues against custodian locker notes.
4. **Pass Generation**: Approved claims generate a cryptographically structured, time-limited QR token (`REUN-XXXX-SEC`).
5. **Two-Sided Handover**: Officer inspects token at the campus desk and confirms physical return.

---

## Repository Structure

```
reunify/
├── src/
│   ├── components/
│   │   ├── common/           # Badge, ItemCard, Logo, LoadingSkeleton, EmptyState, QRHandoverModal, Toast
│   │   └── layout/           # Navbar, Footer, SupabaseStatusBanner, ErrorBoundary
│   ├── context/
│   │   ├── AuthContext.tsx    # Supabase session + 4-persona quick switcher
│   │   └── ItemsContext.tsx   # Item state, claims, notifications, real-time feedback
│   ├── lib/
│   │   └── supabase.ts       # Supabase client + runtime credential detection
│   ├── pages/
│   │   ├── HomePage.tsx       # Signature landing experience
│   │   ├── ExplorePage.tsx    # Multi-criteria discovery with URL search params
│   │   ├── ReportLostPage.tsx # Lost item reporting with privacy field
│   │   ├── ReportFoundPage.tsx# Found item hand-in with custody location
│   │   ├── ItemDetailPage.tsx # Item profile, timeline preview, claim CTA
│   │   ├── MatchesPage.tsx    # Smart matching engine with explainable criteria
│   │   ├── MyCasesPage.tsx    # Personal hub for reports, claims & QR passes
│   │   ├── CaseDetailPage.tsx # Comprehensive audit trail timeline
│   │   ├── ClaimDetailPage.tsx# Private evidence inspection & approve/reject
│   │   ├── NotificationsPage.tsx # In-app notification stream
│   │   ├── AdminPage.tsx      # Security moderation & claim review queue
│   │   ├── ProfilePage.tsx    # Account credentials & role policy
│   │   ├── LoginPage.tsx      # Authentication + 1-click test personas
│   │   ├── RegisterPage.tsx   # Sign-up with secure role triggers
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── PrivacyPage.tsx    # Confidential data protection explanation
│   │   ├── TermsPage.tsx      # Honor code compliance & custody duties
│   │   └── NotFoundPage.tsx   # 404 handler
│   ├── services/
│   │   ├── itemsService.ts    # Database & local-first persistent storage
│   │   ├── matchingEngine.ts  # Deterministic similarity engine
│   │   └── matchingEngine.test.ts # Vitest unit test suite
│   ├── types/
│   │   └── index.ts          # Core TypeScript domain models
│   ├── App.tsx               # Route declarations & providers
│   ├── main.tsx              # Application entry point
│   └── index.css             # Tailwind base & glassmorphism tokens
├── supabase/
│   ├── migrations/
│   │   └── 20261024000001_initial_schema.sql # Complete PostgreSQL schema & RLS policies
│   └── seed.sql              # Realistic university campus lost & found dataset
├── .env.example              # Environment variables template
├── vercel.json               # SPA rewrites & security headers for Vercel
├── vite.config.ts            # Vite bundler configuration
└── package.json
```

---

## Quick Start & Development

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment
Copy `.env.example` to `.env` and provide your real Supabase project credentials:
```bash
cp .env.example .env
```
Populate `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*(If credentials are not yet configured, a clean configuration notice will be displayed, and listings will present an elegant empty state without any synthetic or mock reports).*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) in your browser.

### 4. Run Automated Tests
```bash
npx vitest run
```

### 5. Production Build
```bash
npm run build
```

---

##  Production Deployment Guide

### 1. Supabase Backend Setup
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Open the **SQL Editor** in the left sidebar.
3. Open `supabase/migrations/20261024000001_initial_schema.sql`, copy its entire content, paste it into the SQL editor, and click **Run**.
   - This creates all tables (`profiles`, `reports`, `claims`, `notifications`, `case_timeline_events`, and the `items` view).
   - This configures Row Level Security (RLS) on all tables.
   - This creates the `handle_new_user()` trigger for automated, secure student profile creation on sign-up.
   - This provisions the `report-photos` storage bucket with public read and authenticated upload policies.
4. (Optional) For development testing in a staging environment, you may execute `supabase/seed.sql` in the SQL editor to add initial test records.

### 2. Assigning Admin / Security Roles
For security, new users registering via the website always default to the `student` role, and client-side role escalation is strictly blocked by PostgreSQL RLS policies.
To grant an administrative or security officer role to a staff member:
1. In your Supabase Dashboard, navigate to **Table Editor** -> `profiles`.
2. Locate the user's row and set their `role` column to `campus_security` or `admin`.
3. The user can now access `/admin` and moderate reports, examine claims, and manage handovers.

### 3. Vercel / GitHub Deployment
1. Push your repository to GitHub.
2. In the Vercel dashboard, click **Add New Project** and import your repository.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon/Publishable Key.
4. Click **Deploy**.
5. (`vercel.json` is pre-configured with SPA rewrites to ensure deep routing and browser page refreshes like `/explore` and `/cases/:id` never return 404 errors).

