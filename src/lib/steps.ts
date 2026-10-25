// Turns a person's plan + situation into concrete next steps: what to do, how, how much, and where to verify it.
import { projectLife, type Assumptions, type Profile } from "./calc";
import { RULES } from "./rules";
import { money } from "./format";

export type Source = { label: string; url: string };
export type Step = {
  id: string; emoji: string; title: string;
  why: string; // the number that makes it matter
  how: string[]; // plain steps to actually do it
  automate?: string; // set-it-and-forget-it tip
  source?: Source;
  lesson: string;
  inPlan: boolean; // true = part of the user's plan; false = suggested
  when: "this week" | "this month" | "next open enrollment" | "this fall" | "this year";
};

const PAYCHECKS = 26; // every two weeks

export function buildSteps(p: Profile, a: Assumptions, start: Assumptions): Step[] {
  const proj = projectLife(p, a);
  const tax = a.taxRate ?? 0.12;
  const steps: Step[] = [];
  const essentials = Math.round(p.expenses * 0.85);
  const efGoal = essentials * 3;
  const hysa = (a.cashRate ?? 0) >= 0.03;

  // 1. Emergency fund — always first if short
  if (p.savings < efGoal) {
    const gap = efGoal - p.savings;
    steps.push({
      id: "ef", emoji: "🛟", title: `Grow your emergency fund to ${money(efGoal)}`,
      why: `That's 3 months of essential bills. You have ${money(p.savings)}, so ${money(gap)} to go. At $150 a month that's about ${Math.ceil(gap / 150)} months.`,
      how: ["Pick a payday transfer amount you won't miss (even $50 helps).", "Keep this money separate from checking so it's only for surprises."],
      automate: "Set an automatic transfer to savings for the day after each payday.",
      lesson: "#/learn/bank", inPlan: true, when: "this week",
    });
  }

  // 2. High-yield savings
  const extraInterest = p.savings * (0.04 - 0.005);
  steps.push({
    id: "hysa", emoji: "🏦", title: `Move your ${money(p.savings)} cushion to a high-yield savings account`,
    why: `At about 4% instead of 0.5%, it earns roughly ${money(extraInterest)} more a year with the same FDIC protection.`,
    how: ["Compare savings rates (APY) at banks and credit unions, including your own bank.", "Confirm it says \"Member FDIC\" (or NCUA for credit unions).", "Open the account online and transfer your cushion."],
    automate: "Point your emergency-fund auto-transfer at the new account.",
    source: { label: "FDIC: Is my bank insured? (BankFind)", url: "https://banks.data.fdic.gov/bankfind-suite/bankfind" },
    lesson: "#/learn/bank", inPlan: hysa, when: "this month",
  });

  // 3. Retirement contribution
  const raised = a.contribPct > start.contribPct + 0.0001;
  const pctNow = Math.round(a.contribPct * 100), pctStart = Math.round(start.contribPct * 100);
  const extraYear = p.income * (a.contribPct - start.contribPct);
  steps.push({
    id: "retire", emoji: "🧭",
    title: raised ? `Raise your retirement savings from ${pctStart}% to ${pctNow}% of pay` : `Raise your retirement savings by 1–2% of pay`,
    why: raised
      ? `That's about ${money(extraYear / PAYCHECKS)} more per paycheck. ${a.accountType === "roth" ? "As a Roth, withdrawals in retirement can be tax-free." : `Because it's pre-tax, your take-home only drops about ${money((extraYear * (1 - tax)) / PAYCHECKS)}.`} Your money now lasts until ${proj.depletedAge ? `age ${proj.depletedAge}` : "past 90"}.`
      : `Each extra 1% is about ${money((p.income * 0.01) / PAYCHECKS)} per paycheck, and it compounds for ${Math.max(1, a.retireAge - p.age)} years.`,
    how: ["Log in to your employer's benefits site or ask HR/payroll.", "Find your 401(k), 403(b) or 457(b) contribution and change the percentage.", "Make sure you contribute at least enough to get any employer match."],
    automate: "Turn on automatic increases (1% a year), or raise it every time you get a raise.",
    source: { label: `IRS: ${RULES.year} retirement plan limits`, url: "https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500" },
    lesson: "#/learn/k401", inPlan: raised, when: "this month",
  });

  // 4. Roth vs Traditional
  steps.push({
    id: "rothtrad", emoji: "⚖️", title: a.accountType === "roth" ? "Choose Roth for your retirement contributions" : "Choose Traditional (pre-tax) for your retirement contributions",
    why: a.accountType === "roth"
      ? "You pay tax now, and qualified withdrawals in retirement are tax-free. That helps if your tax rate later could be higher."
      : `You save about ${money(p.income * a.contribPct * tax)} in federal tax this year. That helps if your tax rate in retirement will be lower.`,
    how: ["In your benefits site, look for a Roth option next to your contribution.", "Not sure? Splitting between both is a common way to hedge."],
    source: { label: "IRS: Roth comparison chart", url: "https://www.irs.gov/node/4253" },
    lesson: "#/learn/accounts", inPlan: a.accountType !== start.accountType, when: "this month",
  });

  // 5. HSA
  const hsa = a.hsaAnnual ?? 0;
  steps.push({
    id: "hsa", emoji: "🩺", title: hsa > 0 ? `Put ${money(hsa)} a year into an HSA` : "Check if an HSA makes sense at open enrollment",
    why: hsa > 0
      ? `About ${money(hsa / PAYCHECKS)} per paycheck. It saves about ${money(hsa * (tax + 0.0765))} a year in income and payroll tax, and grows tax-free for medical costs.`
      : `If you're eligible, every ${money(1000)} in an HSA saves about ${money(1000 * (tax + 0.0765))} in tax.`,
    how: ["At open enrollment, compare the high-deductible health plan (HDHP) with your current plan.", `Only HSA-qualifying HDHPs work (${RULES.year}: deductible of at least ${money(RULES.hsa.hdhpMinDeductibleSelf)} self / ${money(RULES.hsa.hdhpMinDeductibleFamily)} family).`, "Choose payroll contributions so they also skip payroll tax."],
    automate: "Payroll HSA contributions happen automatically every paycheck.",
    source: { label: "IRS Publication 969 (HSAs)", url: "https://www.irs.gov/publications/p969" },
    lesson: "#/learn/hsa", inPlan: hsa > 0, when: "next open enrollment",
  });

  // 6. Index funds
  const mix = a.returnRate >= 0.065 ? "Growth (about 90% stock index funds)" : a.returnRate <= 0.05 ? "Safer (mostly bond index funds)" : "Balanced (about 60% stock / 40% bond index funds)";
  steps.push({
    id: "index", emoji: "📈", title: "Pick low-cost index funds for your long-term money",
    why: `Your plan uses a ${mix} mix. Index funds own thousands of companies, so you don't have to pick stocks.`,
    how: ["In your retirement account, look for a target-date fund for your retirement year, or broad index funds (U.S. stock, international stock, bonds).", "Check the expense ratio. Lower is better (many are under 0.20%).", "Then leave it alone. Don't sell when the market drops."],
    automate: "New contributions buy the same funds automatically every paycheck.",
    source: { label: "Investor.gov: Index funds", url: "https://www.investor.gov/introduction-investing/investing-basics/glossary/index-funds" },
    lesson: "#/learn/invest", inPlan: Math.abs(a.returnRate - start.returnRate) > 0.0001, when: "this month",
  });

  // 7. College (kids 14–18)
  const soon = (p.kids || []).filter((k) => k.age >= 14 && k.age < 19);
  if (soon.length) {
    steps.push({
      id: "fafsa", emoji: "🎓", title: `File the FAFSA for ${soon.map((k) => k.name).join(" and ")}`,
      why: "It's free and unlocks federal Pell Grants, state grants (like the PA State Grant) and college aid. Most families qualify for something.",
      how: ["Create FSA IDs for you and your student at studentaid.gov.", "File as soon as the FAFSA opens in the fall. Some aid is first-come, first-served.", "Check your state's grant deadline (for PA, see pheaa.org)."],
      source: { label: "Federal Student Aid: FAFSA", url: "https://studentaid.gov/h/apply-for-aid/fafsa" },
      lesson: "#/learn/college", inPlan: true, when: "this fall",
    });
  }

  // 8. Verify Social Security
  steps.push({
    id: "ssa", emoji: "🧾", title: "Check your real Social Security estimate",
    why: `Your plan assumes pension + Social Security replace about ${Math.round(a.ssReplacement * 100)}% of pay. Your real number makes the plan more accurate.`,
    how: ["Create a free my Social Security account at ssa.gov.", "Note your estimated benefit at 62, 67 and 70.", "On Home, adjust \"Pension + Social Security\" to match."],
    source: { label: "SSA: my Social Security", url: "https://www.ssa.gov/myaccount/" },
    lesson: "#/", inPlan: true, when: "this year",
  });

  // Plan items first, then suggestions
  return [...steps.filter((s) => s.inPlan), ...steps.filter((s) => !s.inPlan)];
}

/** Downloads a calendar reminder (.ics) for a step, next Monday at 9am local. */
export function downloadReminder(step: Step) {
  const d = new Date(); d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7)); d.setHours(9, 0, 0, 0);
  const end = new Date(d.getTime() + 30 * 60_000);
  const f = (x: Date) => `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, "0")}${String(x.getDate()).padStart(2, "0")}T${String(x.getHours()).padStart(2, "0")}${String(x.getMinutes()).padStart(2, "0")}00`;
  const esc = (t: string) => t.replace(/[\\,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
  const desc = [step.why, "", ...step.how.map((h, i) => `${i + 1}. ${h}`), step.automate ? `\nAutomate it: ${step.automate}` : "", step.source ? `\nVerify: ${step.source.url}` : ""].join("\n");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Next Step//EN", "BEGIN:VEVENT", `UID:${step.id}-${Date.now()}@nextstep`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(d)}`, `DTEND:${f(end)}`,
    `SUMMARY:${esc("Next Step: " + step.title)}`, `DESCRIPTION:${esc(desc)}`, "BEGIN:VALARM", "TRIGGER:-PT15M", "ACTION:DISPLAY", "DESCRIPTION:Next Step reminder", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const el = document.createElement("a"); el.href = url; el.download = `next-step-${step.id}.ics`; el.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
