# 🌊 Ripple
**See tomorrow before you spend today.**

Every money choice you make sends ripples into your future. Ripple shows you where they land, *before* you make them.

## Elevator pitch
Most people learn about money the hard way, years after the decision that mattered. Ripple lets you try before you live it. Slide your 401(k) from 5% to 10%, add a baby, survive a market crash, and watch your future change in front of you at 35, 45, 65 and 85, in today's dollars. **Ripple**, our AI coach, explains *why* in plain English using your own numbers. No bank logins, no jargon. It's a flight simulator for your financial life.

Built for HackPSU (October 2026).

## What's inside
- **Onboarding**: 8 friendly, skippable questions (or one-tap demo profile). No sensitive info needed.
- **Dashboard**: Financial Future Timeline (ages 35 → 85), future dollars vs. today's buying power, pessimistic/baseline/optimistic scenarios, live sliders.
- **Choose Your Financial Future**: a 10-decision life game (savings habit, 401(k), emergency fund, investment mix, roof repair, raise, market crash, baby/529, inflation spike, retirement age), then a side-by-side "Two Futures" comparison you can remix.
- **10 lessons**, each with an idea, a working simulator, live charts, Ripple's explanation, real-life examples, a 3-question quiz and a takeaway:
  Inflation Time Machine · Life Expense Simulator · Savings vs. Investing · Virtual Bank · 401(k) · Roth vs. Traditional Lab · HSA · 529 · Virtual Portfolio · Debt, Credit & Emergency Fund.
- **Ask Ripple (AI coach)**: grounded in the current simulation's computed numbers. All math comes from deterministic functions in `src/lib/calc.ts`. The AI only explains. If the AI is unavailable, a built-in explainer answers instead.
- **Gamification**: XP, levels, 9 badges, unlockable milestones, learning roadmap. XP rewards learning, never risk-taking.
- **Download my plan (PDF)**: personal snapshot, projections, both story paths, takeaways.
- **Accessibility**: big touch targets, Simple/Detailed toggle, large-text mode, keyboard focus styles, labeled controls, reduced-motion support. Mobile bottom tabs + desktop sidebar.

## 3–5 minute demo script
1. Open the site → **Try a demo profile** (or answer the 8 questions).
2. Dashboard: drag **401(k) contribution** and **Retirement age**, toggle **Future $ / Today's $**.
3. **Learn → Inflation**: pick "Year of college", slide to 2056, watch $100 shrink.
4. **Learn → 401(k)**: move 5% → 10%, tap **"Why does going from 5% to 10% make such a big difference?"**
5. **Choose Your Financial Future**: make the 10 choices, then see **Two possible futures**, remix Path B, ask Ripple to compare, download the PDF.

## Tech
React + TypeScript + Vite · Tailwind · Recharts · Framer Motion · Lucide · jsPDF · Express (serves the app + `/api/ripple`) · Anthropic Claude API (server-side only) · localStorage for progress.

2026 contribution limits live in one dated config file (`src/lib/rules.ts`) with IRS/FDIC sources.

## Run locally
```bash
npm install
cp .env.example .env   # add your ANTHROPIC_API_KEY (optional — fallback works without it)
npm run build && npm start   # http://localhost:3000
npm test                     # formula sanity checks
```

## Deploy on Railway
1. Railway → **New Project → Deploy from GitHub repo** → pick this repo.
2. **Variables** tab → add `ANTHROPIC_API_KEY` (never commit it).
3. **Settings → Networking → Generate Domain**. `railway.json` already sets the build step (Railway installs packages itself), start command and `/api/health` health check.

## Responsible use
Educational estimates with fictional money. Not financial, tax, legal or investment advice. Ripple never asks for passwords, account numbers or Social Security numbers.
