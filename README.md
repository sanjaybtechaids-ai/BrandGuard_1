# BrandGuard AI — Digital Risk Protection

**BrandGuard AI** helps organizations detect potential brand impersonation across mobile applications and web/social channels by comparing suspicious entities against a trusted official brand profile.

> **Architecture**: Next.js 16+ App Router, TypeScript, Tailwind CSS v4, multi-tenant Supabase integration with Row-Level Security (RLS), deterministic risk scoring engine, SSRF defensive barriers, and 35-point automated acceptance test suite.

---

## 🛡️ Core Product Architecture

```
TRUSTED BRAND PROFILE  ──▶  DISCOVERY  ──▶  COMPARISON  ──▶  RISK SCORE  ──▶  THREAT REMEDIATION
  (Official apps,           (App stores,      (Logo vectors,       (0-100 scale,     (Analyst review,
   domains, socials)         APK mirrors,      name distance,       multi-signal      takedown dossiers,
                             social handles)   signing keys)        confidence)       DMCA enforcement)
```

---

## 🚀 How to Run the Application

### 1. Environment Configuration

Clone or open the repository, then copy the environment template:

```bash
cp .env.example .env.local
```

Configure your Supabase credentials in `.env.local` (optional for local mock testing; required for live database sync):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

### 2. Install & Start Development Server

```bash
# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 3. Run Automated Acceptance Tests

Execute the comprehensive 35-point test suite covering URL verification, domain normalization, SSRF defenses, RBAC permissions, and threat escalation:

```bash
npm test
```

---

### 4. Production Build & Start

```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start
```

---

## 🗄️ Database Setup & Supabase Migrations

You have two simple ways to apply the database schema and seed data to Supabase:

### Option A: Via Supabase Web Dashboard (Recommended / Zero CLI Setup)

1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** tab from the left navigation bar.
3. Click **New Query**, paste the contents of [`supabase/migrations/20261006000001_initial_schema.sql`](supabase/migrations/20261006000001_initial_schema.sql), and click **Run**.
4. Create a second query, paste the contents of [`supabase/seed.sql`](supabase/seed.sql), and click **Run**.

---

### Option B: Via Supabase CLI (`npx supabase`)

If the global `supabase` command is not installed on your system, use `npx supabase` (or `npm run db:push`):

```bash
# 1. Authenticate with Supabase
npx supabase login

# 2. Link your remote Supabase project
# (Find your project reference ID in your Supabase dashboard URL: app.supabase.com/project/<project-ref>)
npx supabase link --project-ref <your-project-ref>

# 3. Push schema migrations to remote database
npm run db:push
# or: npx supabase db push
```

#### Optional: Local Supabase Development (Requires Docker)
```bash
npx supabase start
npx supabase db reset
```

---

## 🌐 Routes Created

| Route | Description |
|---|---|
| `/` | Automatically redirects to `/dashboard` |
| `/login` | Enterprise cybersecurity login screen (split-screen with branding & OAuth) |
| `/dashboard` | Security Operations Center (SOC) dashboard, metrics, detection chart, pipeline visualizer, recent threats |
| `/brands` | Monitored brand directory with grid/table view, threat counters, and status badges |
| `/brands/add` | Interactive brand enrollment wizard with simulated loading & success states |
| `/brands/[id]` | Deep-dive brand profile (`/brands/nike`), official apps/socials, and protection status |
| `/apps` | Mobile app monitor separating **TRUSTED** official apps from **SUSPICIOUS** clones |
| `/social` | Social network monitor tracking impersonators across Instagram, X, TikTok, Telegram |
| `/threats` | Comprehensive Threat Center with search, multi-factor filters, and sorting |
| `/threats/[id]` | Threat investigation analysis (`/threats/thr-nike-001`) with circular risk gauge, 6 evidence signals, visual comparison, and remediation actions |
| `/reports` | Executive reports dashboard, report archive, and interactive PDF dossier preview |
| `/alerts` | Realtime security alert feed with acknowledge toggles and severity filters |
| `/team` | Multi-tenant organization member roster and invitation modal |
| `/settings` | Organization, Security (2FA, Sessions), Notification thresholds, and Light/Dark theme selector |

---

## 🧩 Component Architecture

```
src/
├── app/                      # Next.js 15+ App Router
│   ├── layout.tsx            # Root layout with ThemeProvider & ToastProvider
│   ├── globals.css           # Tailwind v4 cybersecurity styling & custom scrollbars
│   ├── page.tsx              # Root redirect
│   ├── login/page.tsx        # Authentication UI
│   ├── dashboard/page.tsx    # SOC Dashboard
│   ├── brands/               # Brands listing & dynamic profiles
│   ├── apps/page.tsx         # App Monitoring
│   ├── social/page.tsx       # Social Monitoring
│   ├── threats/              # Threat Center & forensic detail
│   ├── reports/page.tsx      # Reports & evidence previews
│   ├── alerts/page.tsx       # Security notifications
│   ├── team/page.tsx         # Team & access management
│   └── settings/page.tsx     # Settings & appearance
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx      # Reusable application shell (sidebar + topbar + responsive drawer)
│   │   ├── Sidebar.tsx       # Navigation, organization switcher, analyst profile
│   │   ├── Topbar.tsx        # Live protection status, global scan CTA, alerts bell, theme toggle
│   │   ├── ThemeProvider.tsx # Next-themes provider
│   │   └── ThemeToggle.tsx   # Light / Dark / System switch
│   ├── dashboard/
│   │   ├── StatCard.tsx      # Metric card with trends and security accent colors
│   │   ├── ThreatChart.tsx   # Recharts AreaChart with 7d / 30d / 90d filters
│   │   ├── RecentThreats.tsx # Recent candidate threats table
│   │   └── ScanModal.tsx     # Animated multi-step brand scan simulator
│   ├── brands/
│   │   ├── BrandCard.tsx     # Grid card with official apps & threats breakdown
│   │   ├── BrandHeader.tsx   # Verified brand header with scan trigger
│   │   ├── OfficialApps.tsx  # Cryptographically verified official mobile apps
│   │   ├── OfficialSocials.tsx # Verified social channels
│   │   └── BrandStats.tsx    # Vulnerability breakdown (Critical, High, Medium)
│   ├── threats/
│   │   ├── ThreatTable.tsx   # Filterable & sortable threat intelligence ledger
│   │   ├── RiskScore.tsx     # Circular SVG risk meter (0-100)
│   │   ├── EvidenceCard.tsx  # 6 similarity & mismatch vector cards
│   │   ├── ThreatComparison.tsx # Side-by-side Official Anchor vs Suspicious Entity & AI summary
│   │   └── ThreatActions.tsx # Stateful actions: Investigate, Resolve, Generate Report
│   └── common/
│       ├── PipelineConcept.tsx # Visual diagram of BrandGuard 5-step detection flow
│       ├── PageHeader.tsx    # Consistent header with action buttons
│       ├── StatusBadge.tsx   # Semantic security badges (Critical, High, Trusted, etc.)
│       ├── SearchBar.tsx     # Search input with clear button
│       ├── ToastProvider.tsx # Non-blocking interactive feedback toasts
│       ├── EmptyState.tsx    # Accessible empty state card
│       ├── LoadingState.tsx  # Sleek radar-style loading indicator
│       └── ConfirmDialog.tsx # Modal dialog for critical security actions
├── data/                     # Modular mock data records
│   ├── brands.ts             # Nike, ABC Tech, NordicPay, HyperCloud, Solaris
│   ├── apps.ts               # Google Play, iOS & APK monitored records
│   ├── social.ts             # Social media candidate profiles
│   ├── threats.ts            # Detailed incident records with forensic evidence
│   ├── users.ts              # Analyst team members & organization tenant
│   ├── dashboard.ts          # Aggregated SOC metrics & time-series trends
│   ├── reports.ts            # Dossiers & evidence packages
│   └── alerts.ts             # Realtime notification items
├── services/                 # Service layer for Phase 2 API compatibility
│   ├── brands.service.ts
│   ├── apps.service.ts
│   ├── social.service.ts
│   ├── threats.service.ts
│   ├── auth.service.ts
│   ├── reports.service.ts
│   └── alerts.service.ts
└── types/                    # Strict TypeScript interfaces
    ├── brand.ts
    ├── app.ts
    ├── social.ts
    ├── threat.ts
    ├── user.ts
    ├── report.ts
    └── alert.ts
```

---

## 🔌 What Will Be Connected in Phase 2

1. **Backend API (FastAPI)**:
   - Connect `src/services/threats.service.ts` to `/api/v1/threats`
   - Connect `src/services/brands.service.ts` to `/api/v1/brands`
   - Connect `src/services/apps.service.ts` and `social.service.ts` to scan worker queues

2. **Database & Storage (Supabase)**:
   - Supabase PostgreSQL with Row Level Security (RLS) for multi-tenant organizations
   - Supabase Storage for brand asset logos and generated PDF takedown packages

3. **Authentication**:
   - Supabase Auth integration supporting SAML SSO, Google Workspace, and email magic links

4. **Detection & AI Models**:
   - ResNet/CLIP embedding model for logo image similarity calculations
   - Levenshtein / Jaro-Winkler string distance scoring for names and package namespaces
   - LLM threat summarization pipeline (GPT-4o / Gemini) for generating forensic risk explanations

5. **External Crawlers & Store APIs**:
   - Google Play Scraper & Apple iTunes Search API
   - Social network scraping workers (Meta Graph API, X API v2, YouTube Data API)
   - Certificate Transparency log monitors and DNS WHOIS registrars
#   B r a n d G u a r d  
 