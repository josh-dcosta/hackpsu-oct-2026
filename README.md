# 👣 Next Step
**See tomorrow before you spend today.**

Every money choice you make sends ripples into your future. Next Step shows you where they land, *before* you make them.

## Elevator pitch
People have more financial information than ever, but at the moments that matter (a raise, open enrollment, a surprise bill, a kid heading to college) they still don't know what to trust or what to do next. **Next Step** turns information into action in four moves:

1. **Understanding**: short, plain-English lessons on the essentials (emergency fund, FDIC, compounding, Roth vs. Traditional, HSAs, index funds), each with a real-world simulation already filled in.
2. **Confidence**: one honest answer to *"Will I have enough to pay the bills after I retire?"*, plus a plan builder that shows exactly how each smart move changes taxes, savings and how long the money lasts.
3. **Trust**: every number comes from fixed, tested formulas and official sources (IRS, FDIC, SSA). The AI coach explains those numbers in plain English; it never makes them up.
4. **Action**: a personal next-steps checklist with exact dollar amounts, how-to steps, "automate it" tips, calendar reminders and verify-it links, plus a downloadable plan.

We show it through **Dave**, a Pennsylvania school custodian with two teens heading to college, so anyone (like **Bob**, a plumber with three kids) can see how it works and then plug in their own numbers.

## Built on behavioral science
- **Relatable story (Dave):** people learn faster from a person like them than from abstract rules.
- **Loss framing:** "Savings run out at 73" motivates more than "you could have $207k."
- **Just-in-time help:** life-moment buttons meet people when the decision is actually in front of them.
- **Small, concrete steps:** each action has an exact amount, a deadline ("this month", "next open enrollment") and a reminder.
- **Automation & defaults:** every step suggests a set-it-and-forget-it version (auto-transfers, auto-escalation, payroll HSA).
- **Commitment & progress:** checking off steps, progress bars and badges reward doing, never risk-taking.

## What's inside
Four simple sections: **Home · Learn · Ask Next Step · Progress**. Practical, safe money basics, no stock trading.

- **Every visit opens on the welcome page** ("See tomorrow before you spend today") with two choices: **Dave's demo scenario** or **your own numbers**. Your own numbers are saved on your device ("Welcome back, Bob"), and trying the demo never erases them.
- **Two ways in**: **Start as Dave** (a worked example: PA school custodian, family of four) or **Use my own numbers** (e.g. Bob, a plumber earning $85k with three kids). Switch anytime from the top of Home.
- **Life moments:** *I got a raise · Open enrollment · Surprise bill · Kid heading to college · The market dropped · Retiring soon*, each with guidance using your numbers and a one-tap plan change.
- **Home answers one question:** *Will I have enough money to pay the bills after I retire?* It shows saving per month today, bills today vs. at retirement (with inflation), each retirement year's bills vs. pension + Social Security + savings, and the age savings run out.
- **Build your plan**: five smart moves, each taught by a lesson. See taxes saved, savings at retirement, and how long the money lasts, compared with where you started:
  🏦 high-yield savings · 🧭 retirement plan % · 🩺 HSA · ⚖️ Roth vs. Traditional · 📈 index-fund mix
- **Learn**: *Start here: 3 essentials* (Banking: emergency fund, FDIC, compounding · Roth IRA vs. Traditional IRA · Invest safely with index funds), then more lessons (inflation, 401(k), HSA, 529, debt…). Every lesson: the idea → a real-world simulation preloaded with Dave's (or your) numbers → **Add to my plan** → Ask Next Step → 3-question check.
- **Ask Next Step (AI coach)**: grounded in the computed numbers on screen (`src/lib/calc.ts`); a built-in explainer answers if the AI is offline.
- **My next steps**: a checklist built from your plan, with amounts, how-to, automation tips, calendar reminders (.ics) and official verify-it links. Included in the PDF.
- **How we calculate this**: every assumption and source shown on Home; AI answers say they use only the page's calculated numbers.
- **Progress**: XP, badges, and **Download my plan (PDF)**.

## 3-minute demo script
1. Open the site → **Explore Dave's demo** → Home: *"Not quite. Savings run out at age 73."* Bills go from $3,600 to $7,012 a month at 67 (4% inflation). Point to ✓ *Calculated by Next Step*.
2. **The moments that matter → Open enrollment** → *Add a $1,500/yr HSA* → the plan shows taxes saved and money lasting longer.
3. **I got a raise** → *Raise my retirement savings* → see the impact.
4. **Dave's next steps**: open a step → exact amount, how-to, *Automate it*, **Add a reminder**, **Verify** link. Check one off.
5. **Learn → the 3 essentials** (banking, Roth vs. Traditional, index funds). Each has a ready simulation and *Add to my plan*.
6. Ask Next Step *"What would help Dave the most?"*. Note the trust line under the answer.
7. **Use my own numbers** → Bob (plumber, $85k, 3 kids) → his own answer, moments and next steps → **Download PDF**.

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
