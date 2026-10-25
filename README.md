# 👣 Next Step
**See tomorrow before you spend today.**

Every money choice you make sends ripples into your future. Next Step shows you where they land, *before* you make them.

## Elevator pitch
Most people learn about money the hard way, years after the decision that mattered. Next Step lets you try before you live it. Slide your 401(k) from 5% to 10%, add a baby, survive a market crash, and watch your future change in front of you at 35, 45, 65 and 85, in today's dollars. **Next Step**, our AI coach, explains *why* in plain English using your own numbers. No bank logins, no jargon. It's a flight simulator for your financial life.

Built for HackPSU (October 2026).

## What's inside
Four simple sections: **Home · Learn · Ask Next Step · Progress**.

- **Onboarding**: 8 friendly, skippable questions, preloaded with Dave's answers, or one tap: **Start as Dave**.
- **Home (dashboard)**: Dave's family, college costs ahead, and his Financial Future Timeline (future dollars vs. today's buying power) with simple sliders and Rough/Baseline/Good scenarios.
- **Learn**: 10 short lessons, each with one simple pattern:
  1. **The idea**, in plain English
  2. **A real-world simulation, ready for you**, preloaded with Dave's numbers. Tweak any slider to fit your own life; **Reset** returns to Dave.
  3. **Ask Next Step** about the numbers on screen
  4. **A 3-question check**, then the takeaway

  Lessons: Inflation · Life Stages · Saving vs. Investing · Banking (emergency fund, FDIC, compounding) · 401(k) · Roth vs. Traditional · HSA · 529 College · Investing & Diversification · Debt & Emergency Fund.
- **Ask Next Step (AI coach)**: grounded in the current simulation's computed numbers. All math comes from deterministic functions in `src/lib/calc.ts`. The AI only explains, and a built-in explainer answers if the AI is offline.
- **Progress**: XP, badges, milestones, and **Download my plan (PDF)**.
- **Accessibility**: big touch targets, Simple/Detailed toggle, large-text mode, keyboard focus, reduced motion. Mobile tabs + desktop sidebar.

## 3-minute demo script: Dave's scenario (preloaded)
**Dave, 50**, head custodian at a Pennsylvania public high school (~$22/hr). Household $64,000 with his wife Linda's part-time job, $6,000 saved, $22,000 for retirement plus a PSERS pension. Emma (17) and Jake (15) head to college soon. All of Dave's values live in `src/data/dave.ts`.

1. **Start as Dave** (or **Walk through Dave's answers** to show onboarding).
2. **Home**: "At 67, you could have $304k" (≈ $184k in today's money). Point to **college costs ahead**: Emma ≈ $97k, Jake ≈ $105k. Switch to **😟 Rough**: money runs short around 77.
3. **Learn → Inflation**: Dave's PA state university year: $22,000 → ~$24,700 by Jake's freshman year. Ask Next Step a question.
4. **Learn → College**: tap **Emma**, **Jake**, then **"If Dave had started when Jake was 2."**
5. **Learn → Banking**: emergency fund, FDIC, compounding: slide APY 0.5% → 4% and tap **+5 years**.
6. **Progress → Download my plan (PDF)**.

Reset between judges: **Progress → Start over**.

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
