# 👣 Next Step
**See tomorrow before you spend today.**

Every money choice you make sends ripples into your future. Next Step shows you where they land, *before* you make them.

## Elevator pitch
Most people learn about money the hard way, years after the decision that mattered. Next Step lets you try before you live it. Slide your 401(k) from 5% to 10%, add a baby, survive a market crash, and watch your future change in front of you at 35, 45, 65 and 85, in today's dollars. **Next Step**, our AI coach, explains *why* in plain English using your own numbers. No bank logins, no jargon. It's a flight simulator for your financial life.

Built for HackPSU (October 2026).

## What's inside
- **Onboarding**: 8 friendly, skippable questions (or one-tap demo profile). No sensitive info needed.
- **Dashboard**: Financial Future Timeline (ages 35 → 85), future dollars vs. today's buying power, pessimistic/baseline/optimistic scenarios, live sliders.
- **Choose Your Financial Future**: a 10-decision life game (savings habit, 401(k), emergency fund, investment mix, roof repair, raise, market crash, baby/529, inflation spike, retirement age), then a side-by-side "Two Futures" comparison you can remix.
- **10 lessons**, each with an idea, a working simulator, live charts, Next Step's explanation, real-life examples, a 3-question quiz and a takeaway:
  Inflation Time Machine · Life Expense Simulator · Savings vs. Investing · Virtual Bank · 401(k) · Roth vs. Traditional Lab · HSA · 529 · Virtual Portfolio · Debt, Credit & Emergency Fund.
- **Ask Next Step (AI coach)**: grounded in the current simulation's computed numbers. All math comes from deterministic functions in `src/lib/calc.ts`. The AI only explains. If the AI is unavailable, a built-in explainer answers instead.
- **Gamification**: XP, levels, 9 badges, unlockable milestones, learning roadmap. XP rewards learning, never risk-taking.
- **Download my plan (PDF)**: personal snapshot, projections, both story paths, takeaways.
- **Accessibility**: big touch targets, Simple/Detailed toggle, large-text mode, keyboard focus styles, labeled controls, reduced-motion support. Mobile bottom tabs + desktop sidebar.

## 3–5 minute demo script: Dave's scenario (preloaded)
**Dave, 50**, head custodian at a Pennsylvania public high school (~$22/hr). Household income $64,000 with his wife Linda's part-time job, $6,000 saved, $22,000 for retirement plus a PSERS pension. Emma (17) and Jake (15) head to college soon. All of Dave's values live in `src/data/dave.ts`.

1. Open the site → **Start as Dave** (or **Walk through Dave's answers** to show onboarding).
2. **Dashboard**: "At 67, you could have $304k" (≈ $184k in today's money). Point to **Big costs ahead: college**: Emma ≈ $97k, Jake ≈ $105k for 4 years. Switch to **😟 Rough**: money runs short around 77.
3. **Learn → Inflation**: a PA state university year: $22,000 → ~$24,700 by Jake's freshman year.
4. **Learn → College**: tap **Emma**, then **Jake**, then **"If Dave had started when Jake was 2"**.
5. **Virtual Bank**: emergency fund ($9,000 goal), FDIC, compounding: slide APY 0.5% → 4% and tap **+5 years**.
6. **Choose Your Financial Future**: Dave's 10 decisions (savings, extra 457(b), bank vs. high-yield, mix, Emma's & Jake's college paths, furnace, union raise, market drop, retirement age) → **Two possible futures** → ask Next Step to compare → **Download my plan (PDF)**.

To reset the demo between judges: **Progress → Start over**.

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
Educational estimates with fictional money. Not financial, tax, legal or investment advice. Next Step never asks for passwords, account numbers or Social Security numbers.
