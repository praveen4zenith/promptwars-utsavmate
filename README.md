# 🪔 UtsavMate AI (उत्सव मेट)
> **Full-Stack Indian Celebration & Event Planner**  
> Built for PromptWars Virtual Challenge 05: Celebration & Event Planner.  
> **Repository**: [https://github.com/praveen4zenith/promptwars-utsavmate](https://github.com/praveen4zenith/promptwars-utsavmate)

UtsavMate AI helps hosts, families, and community organizers plan Indian weddings, milestone birthdays, and community festivals with deterministic INR budgets, personalized cultural themes, preparation roadmaps, vendor interview checklists, and hour-by-hour day-of itineraries.

---

## 🌟 Highlights & Core Features

1. **Cultural Indian Celebration Engine**:
   - Specialized planning for **Weddings & Vivah** (Baraat, Varmala, Vedic Pheras), **Milestone Birthdays** (1st Birthday / Annaprashan, 50th Jubilee), **Community Festivals** (Deepotsav, Garba, Society Utsav), and **Sangeet & Mehendi nights**.
   - Dedicated **Celebrant / Couple / Host Name(s)** field: Event titles can now be creative and independent (e.g., *"Explore Roblox World"* or *"Royal Starlit Symphony"*) while the celebrant/couple (e.g., *"Kabir"* or *"Priya & Amit"*) is uniquely honored and referenced throughout the plan, tasks, and itineraries.
   - Tailored dietary preferences: Pure Vegetarian, dedicated Jain counters, live Chaat stalls, multi-cuisine banquets, and traditional Mithai bars.
   - City context (Jaipur, Mumbai, Delhi NCR, Bengaluru, Hyderabad, Kolkata, Pune, Goa, etc.).

2. **Strictly Deterministic Budget Arithmetic**:
   - **Never trusted to AI arithmetic**: All budget calculations, allocations, category percentages, surplus reserves, and overrun alerts are executed in pure, deterministic TypeScript functions (`budgetEngine.ts`).
   - 7 Core Categories: Venue & Accommodation, Catering & Beverages, Decoration & Florals, Photography & Video, Entertainment & DJ, Miscellaneous & Gifts, and Contingency Reserve.
   - Immediate live recalculation upon category slider adjustments or budget revisions.
   - Overrun banner alerts with exact deficit values when allocations exceed the target ceiling.

3. **AI Savings Suggestions**:
   - Instant cost-reduction tips tailored to Indian celebration realities (e.g., swapping imported orchids for seasonal marigolds, consolidating photo crews, negotiating off-peak slots).
   - One-click application of savings suggestions directly into category allocations.

4. **Preparation Milestones & Day-of Itinerary**:
   - Multi-phase preparation roadmap (6 Months, 3 Months, 1 Month, 1 Week, Event Day).
   - Hour-by-hour run sheet with assigned point persons (Pandit Ji, Emcee, Uncle/Sibling).
   - Add custom items, remove, or edit slots in real time.

5. **Interactive Task Checklist**:
   - Filter by status (Pending, Done), timeline phase, and priority (High, Medium, Low).
   - Milestone progress bar with confetti celebrations upon completion.

6. **Vendor Interview Questionnaires**:
   - Curated list of critical questions for Indian venue managers, master caterers, florists, and cinematographers (e.g., generator backup switchover time, buffer plate policy, sound curfews).
   - Status tracker (`Not Contacted` ➔ `Shortlisted` ➔ `Contract Finalized`) and notes.

7. **Contingency Protocols**:
   - Pre-planned solutions for Indian event contingencies: unseasonal rain/weather, power generator failures, guest turnout overruns (+10-15%), and residential noise curfews.

8. **Printable Executive Brief & Local Storage**:
   - One-click print / PDF export formatted with clean `@media print` typography.
   - Auto-saves all changes in browser `localStorage`.
   - Export and import JSON backups anytime.

9. **Instant Demo Presets**:
   - 👑 **Royal Jaipur Wedding**: 350 Guests, ₹35,00,000 (Ananya & Rohan)
   - 🎂 **1st Birthday & Annaprashan**: 80 Guests, ₹2,50,000 (Aarav)
   - 🪔 **Diwali Milan Community Utsav**: 200 Guests, ₹6,00,000 (Gokuldham Society)

> *Notice: Sample costs are calibrated planning estimates based on Indian city market averages, not live binding vendor quotes.*

---

## 🛠️ Architecture & Tech Stack

```
                        +------------------------------------------+
                        |        UtsavMate AI (Next.js 14/15)      |
                        +------------------------------------------+
                                             |
           +---------------------------------+---------------------------------+
           |                                                                   |
  +--------------------------+                                       +--------------------------+
  |       Client Side        |                                       |       Server Side        |
  | - React 18/19            |                                       | - /api/generate-plan     |
  | - TypeScript             |                                       | - /api/savings-tips      |
  | - Tailwind CSS           |                                       | - Secure GEMINI_API_KEY  |
  | - LocalStorage Sync      |                                       | - Response Validation    |
  | - Print-friendly View    |                                       | - Offline Fallback Engine|
  +--------------------------+                                       +--------------------------+
           |                                                                   |
           +---> [Deterministic Budget Arithmetic Engine] <--------------------+
                 - Validates ranges, prevents negative numbers
                 - Calculates category allocations, surplus, and deficits
                 - Never trusts AI for mathematical calculations
```

- **Framework**: Next.js App Router (React, TypeScript)
- **Styling**: Tailwind CSS with custom Indian festive palette (Marigold, Kumkum Ruby, Saffron, Peacock Teal)
- **AI Integration**: Google Gemini API via secure server-side route handlers (`/api/generate-plan`, `/api/savings-tips`)
- **Deterministic Engine**: `src/lib/budgetEngine.ts` (100% test-covered arithmetic)
- **State & Persistence**: Browser `localStorage` with JSON export/import
- **Icons**: Lucide React
- **Testing**: Vitest unit test suite

---

## 🔐 Security & Server-Side Credentials

The Gemini API key is **never exposed to client-side JavaScript**. All AI generation passes through server-side Next.js route handlers.

### Configuring Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and add your Google Gemini API key:
   ```env
   # Google Gemini API Key from Google AI Studio (https://aistudio.google.com/)
   GEMINI_API_KEY=your_actual_gemini_api_key_here

   # Optional model (default: gemini-2.5-flash)
   GEMINI_MODEL=gemini-2.5-flash
   ```

> **Important**: Whenever you add or update your `GEMINI_API_KEY` in `.env.local`, restart your local Next.js server (`npm run dev`) so the new environment variables take effect.

### Resilient Demo / Offline Fallback Mode
If `GEMINI_API_KEY` is not provided or if the API experiences rate limits/quota exhaustion, UtsavMate AI **automatically and gracefully activates its Offline Intelligence Fallback Engine**. It synthesizes customized plans and realistic INR budget breakdowns based on the user's exact inputs (including dynamic celebrant/host name substitution) without failing.

---

## 🚀 Local Development Instructions

### Prerequisites
- Node.js 18.x or newer (Tested on Node v20+ / v26)
- npm or yarn
- Git

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/praveen4zenith/promptwars-utsavmate.git
cd promptwars-utsavmate
npm install
```

### 2. Run Deterministic Unit Tests
```bash
npm test
```
Runs 11 Vitest tests covering:
- Deterministic budget calculations
- Overrun and surplus detection
- Bounds checking and negative number prevention
- Exact sum reconciliation
- Indian Rupee comma formatting (`₹15,00,000` / `₹1.5 Lakh`)
- Form input validation rules (including host/celebrant validation)

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## ☁️ Deployment Guide (Vercel)

This application is built with standard Next.js App Router, making it 100% zero-config compatible with Vercel:

1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `promptwars-utsavmate` repository.
4. In the **Environment Variables** section, add:
   - `GEMINI_API_KEY`: Your Gemini API key from Google AI Studio
   - `GEMINI_MODEL`: `gemini-2.5-flash` *(optional)*
5. Click **Deploy**. Vercel will automatically build the Next.js app and serve it globally.

---

## 📁 Project Directory Structure

```
UtsavMateAI/
├── .env.example              # Server environment variable documentation
├── .env.local                # Local environment variables (GEMINI_API_KEY)
├── package.json              # Scripts & dependencies
├── tsconfig.json             # TypeScript configuration
├── next.config.mjs           # Next.js configuration
├── tailwind.config.ts        # Tailwind festive palette configuration
├── postcss.config.mjs        # PostCSS configuration
├── vitest.config.ts          # Vitest testing setup
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with festive styling
│   │   ├── page.tsx          # Main orchestrator & dashboard
│   │   ├── globals.css       # Festive Tailwind directives & print CSS
│   │   └── api/
│   │       ├── generate-plan/
│   │       │   └── route.ts  # Secure Gemini plan generation endpoint
│   │       └── savings-tips/
│   │           └── route.ts  # Contextual AI budget savings endpoint
│   ├── components/
│   │   ├── Navbar.tsx        # Top navigation, presets, export & print
│   │   ├── EventForm.tsx     # Celebration form with host/celebrant field, validation & presets
│   │   ├── BudgetDashboard.tsx # Deterministic budget arithmetic & overruns
│   │   ├── SavingsTipsModal.tsx# AI savings recommendations modal
│   │   ├── TaskList.tsx      # Interactive task checklist with filters
│   │   ├── TimelineView.tsx  # Preparation milestones & day-of schedule
│   │   ├── VendorGuide.tsx   # Indian vendor questions & status tracker
│   │   ├── ContingencyCard.tsx# Rain, generator & guest surge protocols
│   │   └── PrintSummary.tsx  # Print-ready executive event brief
│   ├── lib/
│   │   ├── types.ts          # Complete TypeScript interfaces (EventFormData with hostName)
│   │   ├── budgetEngine.ts   # Pure deterministic math & validation logic
│   │   ├── presets.ts        # Realistic Wedding, Birthday & Community presets
│   │   ├── gemini.ts         # Server-side Gemini API client & dynamic fallback engine
│   │   └── storage.ts        # LocalStorage helpers with type safety
│   └── __tests__/
│       ├── budgetEngine.test.ts # Budget math, overruns, and formatting tests
│       └── validation.test.ts   # Form input validation unit tests
└── README.md
```

---

## 📜 License
MIT License. Created for PromptWars Challenge 05.
