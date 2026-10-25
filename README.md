# 👣 Next Step
**See tomorrow before you spend today.**

Every money choice you make sends ripples into your future. Next Step shows you where they land, *before* you make them.

## Elevator pitch
Most people learn about money the hard way, years after the decision that mattered. Next Step lets you try before you live it. Slide your 401(k) from 5% to 10%, add a baby, survive a market crash, and watch your future change in front of you at 35, 45, 65 and 85, in today's dollars. **Next Step**, our AI coach, explains *why* in plain English using your own numbers. No bank logins, no jargon. It's a flight simulator for your financial life.

Built for HackPSU (October 2026).

## What's inside
Four simple sections: **Home · Learn · Ask Next Step · Progress**. Practical, safe money basics, no stock trading.

- **Two ways in**: **Start as Dave** (a worked example: PA school custodian, family of four) or **Use my own numbers** (e.g. Bob, a plumber earning $85k with three kids). Switch anytime from the top of Home.
- **Home answers one question:** *Will I have enough money to pay the bills after I retire?* It shows saving per month today, bills today vs. at retirement (with inflation), each retirement year's bills vs. pension + Social Security + savings, and the age savings run out.
- **Build your plan**: five smart moves, each taught by a lesson. See taxes saved, savings at retirement, and how long the money lasts, compared with where you started:
  🏦 high-yield savings · 🧭 retirement plan % · 🩺 HSA · ⚖️ Roth vs. Traditional · 📈 index-fund mix
- **Learn**: *Start here: 3 essentials* (Banking: emergency fund, FDIC, compounding · Roth IRA vs. Traditional IRA · Invest safely with index funds), then more lessons (inflation, 401(k), HSA, 529, debt…). Every lesson: the idea → a real-world simulation preloaded with Dave's (or your) numbers → **Add to my plan** → Ask Next Step → 3-question check.
- **Ask Next Step (AI coach)**: grounded in the computed numbers on screen (`src/lib/calc.ts`); a built-in explainer answers if the AI is offline.
- **Progress**: XP, badges, and **Download my plan (PDF)**.

## 3-minute demo script
1. **Start as Dave** → Home: "Not quite. Savings run out at age 73." Point to bills $3,600 → $7,012 at 67 and the bar chart.
2. **Learn → Banking** (emergency fund, FDIC, compounding) → **Add to my plan**.
3. **Learn → HSA** → **Add $1,500/yr HSA to my plan** → Home shows +$295 taxes saved, +$21k at 67, money lasts longer.
4. **Learn → Invest safely with index funds** → time buckets → **Use this index-fund mix**.
5. On Home, flip **Roth/Traditional** and the other moves; ask Next Step "What would help Dave the most?"
6. Tap **Use my own numbers** → enter Bob (plumber, $85k, 3 kids) → his own answer and plan.

Reset between judges: **Progress → Start over**. Dave's values live in `src/data/dave.ts`.

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
