# 📈 Next Step
**Build a better future.**

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
Three simple sections: **Try it now · Learn · About** (Learn lists every lesson; nothing is tracked). No AI, no API keys, no bank logins.

- **About:** one swipeable carousel: the app, what's inside, future plans, me, then Try it now.
- **Try it now:** a short questionnaire (name and work, age range and when you'd like to retire, state, kids, income, spending, savings, comfort with money, then **what you'd like to work on**: the life moments), then:
  1. **Your plan:** where your money will live and what to do, with how-to steps, a reminder and the matching Valley Bank product for each action.
  2. **Your future:** savings by age without vs. with the plan, how long the money lasts; change the retirement age or inflation right there. Download the plan as a PDF.
  **Edit my plan** reopens the questionnaire with your answers kept.
- **Learn:** ten short lessons, each in four parts: the idea · a simulator (sliders left, numbers written on the chart) · what it means · a 3-question check.

## Demo script
1. Open the site → **Try it now** → answer the questions (e.g. Josh, custodian, 45–54, retire at 62, Pennsylvania, $36,840).
2. **What would you like to work on?** → pick Surprise bill and Medical insurance going up → **Show my plan**.
3. On a plan card → **How to do it**, a Valley Bank product link, a reminder.
4. **Your future** → without the plan vs. with it; try retiring at 67 instead; download the PDF.

## Tech
React + TypeScript + Vite · Tailwind · Recharts · Framer Motion · Lucide · jsPDF · a tiny Express server that serves the app · localStorage for your numbers. All math lives in `src/lib/calc.ts` and `src/lib/plan.ts`.

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
