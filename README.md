# 📈 Next Step
**See tomorrow before you spend today.**

Live: https://nextstep-beta.up.railway.app

Every money choice you make sends ripples into your future. Next Step shows you where they land, *before* you make them.

## Elevator pitch
People have more financial information than ever, but at the moments that matter (a raise, open enrollment, a surprise bill, a kid heading to college) they still don't know what to trust or what to do next. **Next Step** turns information into action in four moves:

1. **Understanding**: short, plain-English lessons on the essentials (emergency fund, FDIC, compounding, Roth vs. Traditional, HSAs, index funds), each with a real-world simulation already filled in.
2. **Confidence**: one honest answer to *"Will I have enough to pay the bills after I retire?"*, plus a plan builder that shows exactly how each smart move changes taxes, savings and how long the money lasts.
3. **Trust**: every number comes from fixed, tested formulas and official sources (IRS, FDIC, SSA). No AI, no API keys, no bank logins: everything runs in the browser and stays on your device.
4. **Action**: a personal next-steps checklist with exact dollar amounts, how-to steps, "automate it" tips, calendar reminders and verify-it links, plus a downloadable plan.

We show it through **Dave**, a Pennsylvania school custodian with two teens heading to college, so anyone (like **Bob**, a plumber with three kids) can see how it works and then plug in their own numbers.

## How it works
Three simple sections: **About · Try it now · Learn** (with Progress under Learn). No AI, no API keys, no bank logins.

- **About:** what Next Step is (my HackPSU entry: information → understanding → confidence → action), where it's going, and about me.
- **Try it now:** pick **Dave's scenario** (PA school custodian, 50, two teens) or **your own numbers**, then:
  1. **Life moments:** surprise bill · medical insurance going up · kid heading to college · the market dropped · retiring soon. Pick any; college and retiring soon are picked automatically from the scenario.
  2. **Your plan:** built automatically: where each month's savings should live (emergency fund, HSA, college fund, retirement, a balanced index-fund mix).
  3. **Next steps:** each action with how-to steps, a calendar reminder and a link to the matching First National Bank product.
  4. **The answer:** one graph of savings by age without vs. with the plan, then how long the money lasts.
  Download the whole plan as a PDF.
- **Learn:** ten short lessons, each in four parts: the idea · a simulator (sliders left, numbers written on the chart) · what it means · a 3-question check.

## Demo script
1. Open the site → About the app → **Try it now** → **Explore Dave's scenario**.
2. Life moments: college and retiring soon are already picked. Add **Medical insurance going up**.
3. **Build my plan** → see where the money lives.
4. **Next steps** → open a step → FNB product link, reminder. Download the PDF.
5. **The answer** → without the plan vs. with it.
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
