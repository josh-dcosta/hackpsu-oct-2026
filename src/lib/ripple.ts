// Client for the Next Step AI coach. Calls our server (which holds the key).
// If AI is unavailable, falls back to a built-in explainer that uses the same calculated numbers.
import type { Profile } from "./calc";

export type RippleContext = { page?: string; module?: string; inputs?: Record<string, unknown>; results?: Record<string, unknown>; insights?: string[] };

const GLOSSARY: [RegExp, string][] = [
  [/inflation|price|purchas/i, "Inflation means prices slowly rise, so each dollar buys a little less every year. It compounds: 3% a year doubles prices in about 24 years."],
  [/compound|interest grow|snowball/i, "Compound growth means you earn returns on your past returns, not just on what you put in. It starts slowly, then speeds up. That's why time matters so much."],
  [/match|employer/i, "An employer match is extra money your employer adds when you save in your 401(k). If they match 50% up to 6% of your pay, contributing less than 6% leaves part of that money unclaimed."],
  [/roth|traditional|ira/i, "Traditional accounts give you a tax break now and you pay tax later. Roth accounts are taxed now and qualified withdrawals are tax-free later. Which is better depends on whether your tax rate is higher now or in retirement. Nobody knows that for sure."],
  [/hsa|health savings/i, "An HSA, if you have a qualifying high-deductible health plan, can be triple tax-advantaged. Contributions lower your taxable income, growth isn't taxed, and qualified medical withdrawals aren't taxed."],
  [/529|college/i, "A 529 plan lets college savings grow without federal tax. Withdrawals for qualified education expenses are tax-free. Starting early means much smaller monthly amounts."],
  [/diversif|index|stock|etf|fund/i, "Diversification means spreading money across many investments so one bad company can't sink you. An index fund does this automatically by holding hundreds of companies."],
  [/debt|credit|loan|avalanche|snowball/i, "With debt, the interest rate is the enemy. Avalanche pays the highest-rate debt first and usually saves the most money. Snowball pays the smallest balance first and gives you quick wins for motivation."],
  [/emergency|cushion|rainy/i, "An emergency fund is money set aside for surprises, often 3–6 months of essential expenses, kept somewhere safe and easy to reach like a high-yield savings account."],
  [/apy|apr/i, "APR is the yearly rate before compounding. APY includes compounding, so it's the rate you actually earn on savings in a year. For loans, compare APRs. For savings, compare APYs."],
  [/fdic|insur/i, "FDIC insurance protects deposits at member banks up to $250,000 per depositor, per bank, per ownership category, if the bank fails. Investments like stocks aren't covered."],
];

export function builtInAnswer(q: string, ctx: RippleContext, profile?: Profile) {
  const lines: string[] = [];
  const concept = GLOSSARY.find(([re]) => re.test(q))?.[1];
  if (ctx.insights?.length) lines.push(ctx.insights.slice(0, 3).join(" "));
  if (concept) lines.push(concept);
  if (!lines.length) lines.push("Good question! Next Step can explain any lesson or simulation in plain English. Open one of the simulators, move a slider, and ask me why the numbers changed. I'll walk you through it using your own results.");
  lines.push("These are educational estimates, not advice. Real results will differ.");
  lines.push(profile?.level === "Advanced" ? "Try: switch the scenario to pessimistic and see how sensitive the result is." : "Try: move one slider a little and watch what changes.");
  return lines.join("\n\n");
}

export async function askRipple(question: string, ctx: RippleContext, profile: Profile, history: { role: string; text: string }[] = []) {
  const prof = { ageRange: profile.ageRange, age: profile.age, level: profile.level, goals: profile.goals };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 28_000);
    const r = await fetch("/api/ripple", {
      method: "POST", headers: { "content-type": "application/json" }, signal: ctrl.signal,
      body: JSON.stringify({ question, context: ctx, profile: prof, history }),
    });
    clearTimeout(t);
    if (!r.ok) throw new Error(String(r.status));
    const d = await r.json();
    if (!d.answer) throw new Error("empty");
    return { text: d.answer as string, source: "ai" as const };
  } catch {
    return { text: builtInAnswer(question, ctx, profile), source: "built-in" as const };
  }
}
