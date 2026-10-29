# 📈 Next Step
**See tomorrow before you spend today.**

Live: https://nextstep-beta.up.railway.app

Every money choice you make sends ripples into your future. Next Step shows you where they land, *before* you make them.

## Grounded in real data

The questions (job, age range, state, filing status) pull typical values from published sources, and the plan math uses them (`src/data/grounding.ts`):

- **State income tax:** Tax Foundation, 2026 state rates and brackets (all 50 states + DC)
- **Federal income tax:** IRS 2026 brackets and standard deduction; Social Security (2026 wage base $184,500) + Medicare
- **Typical pay by job:** BLS Occupational Outlook Handbook, 2025 median pay (May 2025 OEWS)
- **Typical savings by age:** Federal Reserve 2025 Survey of Consumer Finances (median checking + savings; median retirement balance)
- **Inflation:** BLS CPI-U, 1975–2025 average ≈ 3.6% a year. The projection starts at 3% and the user can change it.

Money questions have no maximum: type any amount, or slide and the scale doubles at the end.

## Elevator pitch
People have more financial information than ever, but at the moments that matter (a raise, open enrollment, a surprise bill, a kid heading to college) they still don't know what to trust or what to do next. **Next Step** turns information into action in four moves:

1. **Understanding**: short, plain-English lessons on the essentials (emergency fund, FDIC, compounding, Roth vs. Traditional, HSAs, index funds), each with a real-world simulation already filled in.
2. **Confidence**: one honest answer to *"Will I have enough to pay the bills after I retire?"*, plus a plan builder that shows exactly how each smart move changes taxes, savings and how long the money lasts.
3. **Trust**: every number comes from fixed, tested formulas and official sources (IRS, FDIC, SSA). No AI, no API keys, no bank logins: everything runs in the browser and stays on your device.
4. **Action**: a personal next-steps checklist with exact dollar amounts, how-to steps, "automate it" tips, calendar reminders and verify-it links, plus a downloadable plan.

Anyone (like a plumber with three kids, or a school custodian with two teens) can plug in their own numbers in about two minutes.

## How it works
Three simple sections: **Try it now · Learn · About** (Learn shows every lesson and your progress in one place). No AI, no API keys, no bank logins.

- **About:** what Next Step is (my HackPSU entry: information → understanding → confidence → action), where it's going, and about me.
- **Try it now:** enter **your own numbers** (about 2 minutes; saved only on your device), then:
  1. **Life moments:** surprise bill · medical insurance going up · kid heading to college · the market dropped · retiring soon. Pick any; college and retiring soon are picked automatically from the scenario.
  2. **Your plan:** built automatically: where each month's savings should live, and for each action how to do it, a calendar reminder, a checkbox and the matching Valley Bank product.
  3. **Your future:** one graph of savings by age without vs. with the plan, then how long the money lasts.
  Download the whole plan as a PDF.
- **Learn:** ten short lessons, each in four parts: the idea · a simulator (sliders left, numbers written on the chart) · what it means · a 3-question check.

## Demo script
1. Open the site → The App → **Try it now** → answer the questions (e.g. 50, two teens, $64,000, $3,600 bills, $6,000 saved).
2. Life moments: college and retiring soon are picked automatically. Add **Medical insurance going up**.
3. **Build my plan** → see where the money lives.
4. On a plan card → **How to do it**, a Valley Bank product link, a reminder. Download the PDF.
5. **Your future** → without the plan vs. with it.
6. **Learn** → the 401(k) lesson simulator.

## Tech
React + TypeScript + Vite · Tailwind · Recharts · Framer Motion · Lucide · jsPDF · a tiny Express server that serves the app · localStorage for progress. All math lives in `src/lib/calc.ts` and `src/lib/plan.ts`.

2026 contribution limits live in one dated config file (`src/lib/rules.ts`) with IRS/FDIC sources.

## Run locally
Requires Node 20+.

```bash
npm install
npm run build
npm start   # http://localhost:3000
npm test                               # formula sanity checks
```

For live-reload development, run `npm run dev`.

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No | Server port (default 3000; Railway sets it). |

## Deploy on Railway
1. Railway → **New Project → Deploy from GitHub repo** → pick this repo.
2. **Settings → Networking → Generate Domain**. `railway.json` already sets the build step (Railway installs packages itself), start command and `/api/health` health check.

## What's next
- **Partners:** bring Next Step to credit unions, local workers' unions and local churches, and demo it in person where people already gather.
- **More languages**, so families can learn in the language they're most comfortable with.

## Responsible use
Educational estimates with fictional money. Not financial, tax, legal or investment advice. Next Step never asks for passwords, account numbers or Social Security numbers.
