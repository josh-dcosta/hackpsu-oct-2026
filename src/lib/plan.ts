// Life moments → an automatic plan → next steps (with Valley Bank products) → the answer.
// Every number here comes from fixed formulas in calc.ts. Assumptions are listed in PLAN_ASSUMPTIONS.
import { projectLife, type Assumptions, type LifeEvents, type Profile } from "./calc";
import { taxes } from "../data/grounding";

export type MomentId = "surprise" | "college" | "market" | "retire" | "medical" | "vacation" | "car";
export const MOMENTS: { id: MomentId; emoji: string; title: string; sub: string }[] = [
  { id: "surprise", emoji: "🔧", title: "Surprise bill", sub: "A $2,500 car or furnace repair this year" },
  { id: "medical", emoji: "🩺", title: "Medical insurance going up", sub: "Premiums and copays up about $150 a month" },
  { id: "college", emoji: "🎓", title: "Kid heading to college", sub: "Four years of college costs for each teen" },
  { id: "market", emoji: "📉", title: "The market dropped", sub: "Investments fall 25% this year" },
  { id: "retire", emoji: "🧭", title: "Retiring soon", sub: "The last working years before retirement" },
  { id: "vacation", emoji: "🏖️", title: "Family vacation", sub: "A $3,000 trip next year" },
  { id: "car", emoji: "🚗", title: "Buying a car", sub: "A $25,000 car this year" },
];

const kidsForCollege = (p: Profile) => (p.kids || []).filter((k) => k.age >= 13 && k.age < 18);
/** Moments that apply automatically from the scenario itself. */
export function autoMoments(p: Profile): MomentId[] {
  const out: MomentId[] = [];
  if (kidsForCollege(p).length) out.push("college");
  if (p.age >= 50) out.push("retire");
  return out;
}
export function whyAuto(p: Profile, id: MomentId) {
  if (id === "college") { const k = kidsForCollege(p); return `${k.map((x) => `${x.name} is ${x.age}`).join(", ")}`; }
  if (id === "retire") return `${p.name || "You"} ${p.name ? "is" : "are"} ${p.age}`;
  return "";
}

export const BANK = {
  moneyMarket: { name: "Valley Tiered Money Market", url: "https://www.valley.com/personal/savings/tiered-money-market" },
  savings: { name: "Valley All Access Savings", url: "https://www.valley.com/personal/savings/all-access-savings" },
  cds: { name: "Valley CDs", url: "https://www.valley.com/personal/savings/cds" },
  auto: { name: "Valley Auto Loans", url: "https://www.valley.com/personal/loans/auto-loans" },
  ira: { name: "Valley IRAs", url: "https://www.valley.com/personal/savings/IRAs" },
  planning: { name: "Valley Wealth Management", url: "https://www.valley.com/personal/financial-services" },
  wealth: { name: "Valley Wealth Management", url: "https://www.valley.com/wealth" },
};
type Link = { name: string; url: string };

export type PlanItem = {
  id: string; emoji: string; title: string; where: string; amount: string; why: string; moment?: MomentId;
  how: string[]; when: string; products: Link[]; also?: Link[]; color: string; monthly: number;
};

// Model assumptions used for life moments (shown in "How we calculate this")
export const PLAN_ASSUMPTIONS = {
  surpriseBill: 2_500,
  medicalMonthly: 150,
  marketDrop: 0.25,
  collegeShareNoAid: 9_000, // what the family pays per year per student without filing the FAFSA (today's dollars)
  collegeShareWithAid: 5_000, // after typical grants (Pell, PA State Grant) when the FAFSA is filed
  collegeInflation: 0.04,
  savingsRateWithPlan: 0.03, // a higher-rate money market instead of a 0.5% account (rates vary; check the bank)
  extraRetirementPct: 0.02,
  vacationCost: 3_000,
  vacationCardInterest: 360, // paying a $3,000 trip off over a year on a 22% credit card
  carPrice: 25_000,
  carNoPlan: { down: 0, apr: 0.09, months: 72 }, // 0-down dealer financing
  carPlan: { down: 2_500, apr: 0.065, months: 60 }, // 10% down, bank auto loan, shorter term
  leftoverSavedWithPlan: 0.9, // automatic payday transfers save 90% of what's left after bills (vs. about half without a plan)
};

const r25 = (v: number) => Math.max(25, Math.round(v / 25) * 25);
export function carLoan(price: number, o: { down: number; apr: number; months: number }) {
  const P = price - o.down, r = o.apr / 12;
  const pmt = r ? (P * r) / (1 - Math.pow(1 + r, -o.months)) : P / o.months;
  return { pmt, total: pmt * o.months + o.down, interest: pmt * o.months - P };
}
// Down payment now, then a year of loan payments at each age until it's paid off
const carCosts = (age: number, price: number, o: { down: number; apr: number; months: number }) => {
  const { pmt } = carLoan(price, o);
  const out = o.down ? [{ age, amount: o.down }] : [];
  for (let m = 0, y = 0; m < o.months; m += 12, y++) out.push({ age: age + y, amount: pmt * Math.min(12, o.months - m) });
  return out;
};

export function buildPlan(p: Profile, a: Assumptions, moments: MomentId[]) {
  const has = (m: MomentId) => moments.includes(m);
  const A = PLAN_ASSUMPTIONS;
  const kids = (p.kids || []).filter((k) => k.age < 18 && (has("college") ? true : false));

  // Events that happen either way
  const collegeCosts = (share: number) => kids.flatMap((k) => [0, 1, 2, 3].map((n) => {
    const yearsAway = Math.max(0, 18 - k.age) + n;
    return { age: p.age + yearsAway, amount: share * Math.pow(1 + A.collegeInflation, yearsAway) };
  }));
  const base: LifeEvents = {
    costs: [...(has("surprise") ? [{ age: p.age, amount: A.surpriseBill }] : [])],
    extraMonthly: has("medical") ? A.medicalMonthly : 0,
  };
  const extraNo = [...(has("vacation") ? [{ age: p.age + 1, amount: A.vacationCost + A.vacationCardInterest }] : []), ...(has("car") ? carCosts(p.age, A.carPrice, A.carNoPlan) : [])];
  const extraPlan = [...(has("vacation") ? [{ age: p.age + 1, amount: A.vacationCost }] : []), ...(has("car") ? carCosts(p.age, A.carPrice, A.carPlan) : [])];
  const noPlanEv: LifeEvents = { ...base, costs: [...(base.costs ?? []), ...extraNo, ...collegeCosts(A.collegeShareNoAid)], marketDrop: has("market") ? { drop: A.marketDrop, panic: true } : undefined };
  const planEv: LifeEvents = { ...base, costs: [...(base.costs ?? []), ...extraPlan, ...collegeCosts(A.collegeShareWithAid)], marketDrop: has("market") ? { drop: A.marketDrop, panic: false } : undefined };

  // The plan's changes to the numbers
  // Automating transfers on payday saves most of the leftover instead of about half of it
  const planA: Assumptions = { ...a, cashRate: Math.max(a.cashRate ?? 0, A.savingsRateWithPlan), leftoverSaved: Math.max(a.leftoverSaved, A.leftoverSavedWithPlan) };
  if (has("retire")) planA.contribPct = Math.min(0.2, a.contribPct + A.extraRetirementPct);
  if (has("medical")) planA.hsaAnnual = Math.max(a.hsaAnnual ?? 0, A.medicalMonthly * 12);
  if (has("market") || has("retire")) planA.returnRate = 0.06; // balanced index-fund mix

  const without = projectLife(p, a, noPlanEv);
  const withPlan = projectLife(p, planA, planEv);

  // Monthly amounts: where the money lives
  const tax = p.state ? taxes(p.income, p.state, p.filing).marginal : a.taxRate ?? 0.12;
  const essentials = Math.round((p.expenses * 0.85) / 100) * 100;
  const efTarget = essentials * 3;
  const efGap = Math.max(0, efTarget - p.savings + (has("surprise") ? A.surpriseBill : 0));
  const retireMonthly = (p.income * planA.contribPct) / 12, matchMonthly = (p.income * a.matchPct) / 12;
  const hsaMonthly = (planA.hsaAnnual ?? 0) / 12;
  const spare = Math.max(0, withPlan.savingToday - retireMonthly - matchMonthly - hsaMonthly);
  const efMonthly = efGap > 0 ? r25(Math.min(spare, efGap / 12)) : 0;
  const collegeMonthly = kids.length ? r25(Math.max(0, spare - efMonthly)) : 0;
  const who = p.name || "you";
  const his = p.name ? `${p.name}'s` : "your";

  const items: PlanItem[] = [];
  items.push({
    id: "ef", emoji: "🛟", color: "#38BDF8", title: "Emergency fund", where: "A higher-rate, FDIC-insured money market account",
    monthly: efMonthly,
    amount: efGap > 0 ? `${money0(efMonthly)}/mo until it reaches ${money0(efTarget)}` : `Keep ${money0(efTarget)} ready`,
    why: has("surprise") ? `Covers the ${money0(A.surpriseBill)} surprise bill without a credit card, then refills to 3 months of essential bills (${money0(efTarget)}).` : `3 months of ${his} essential bills (${money0(essentials)}/mo) for surprises.`,
    moment: has("surprise") ? "surprise" : undefined,
    how: ["Open the account and move the emergency money out of checking.", `Set an automatic transfer of ${money0(efMonthly || 50)} the day after each payday.`, "Use it only for true surprises, then refill it."],
    when: "This week", products: [BANK.moneyMarket, BANK.savings],
  });
  if (has("medical")) items.push({
    id: "hsa", emoji: "🩺", color: "#F97361", title: "Health Savings Account", where: "An HSA, paid through payroll before taxes",
    monthly: hsaMonthly, amount: `${money0(hsaMonthly)}/mo (${money0(planA.hsaAnnual ?? 0)}/yr)`,
    why: `Pays the higher medical costs with pre-tax money, saving about ${money0((planA.hsaAnnual ?? 0) * (tax + 0.0765))} a year in taxes.`,
    moment: "medical", how: ["At open enrollment, check whether an HSA-qualifying high-deductible plan costs less overall.", "If it does, open the HSA offered with that health plan and contribute through payroll.", "Pay medical bills from the HSA card."],
    when: "Next open enrollment", products: [], also: [{ name: "HSA rules (IRS Publication 969)", url: "https://www.irs.gov/publications/p969" }],
  });
  if (kids.length) items.push({
    id: "college", emoji: "🎓", color: "#8B5CF6", title: "College fund + FAFSA", where: "A savings CD for near-term college bills",
    monthly: collegeMonthly, amount: `${money0(collegeMonthly)}/mo, plus file the FAFSA every year`,
    why: `The FAFSA unlocks grants like Pell and the PA State Grant, cutting the family's share from about ${money0(A.collegeShareNoAid)} to ${money0(A.collegeShareWithAid)} a year per student in this estimate.`,
    moment: "college", how: [`File the FAFSA for ${kids.map((k) => k.name).join(" and ")} at studentaid.gov (it opens Oct 1).`, "Put college savings in a CD timed to each tuition bill: money needed in 1–3 years shouldn't be in stocks.", "Compare aid offers before choosing a school."],
    when: "This fall", products: [BANK.cds], also: [{ name: "File the FAFSA (studentaid.gov)", url: "https://studentaid.gov/h/apply-for-aid/fafsa" }],
  });
  if (has("vacation")) items.push({
    id: "vacation", emoji: "🏖️", color: "#F59E0B", title: "Vacation fund", where: "A separate savings account, just for the trip",
    monthly: A.vacationCost / 12, amount: `${money0(A.vacationCost / 12)}/mo for 12 months`,
    why: `Pays cash for the ${money0(A.vacationCost)} trip instead of putting it on a 22% credit card, which would add about ${money0(A.vacationCardInterest)} in interest.`,
    moment: "vacation", how: ["Open a separate savings account and name it \"Vacation\".", `Set an automatic transfer of ${money0(A.vacationCost / 12)} each month.`, "Book the trip when the fund is full, not before."],
    when: "This month", products: [BANK.savings],
  });
  if (has("car")) {
    const bad = carLoan(A.carPrice, A.carNoPlan), good = carLoan(A.carPrice, A.carPlan);
    items.push({
      id: "car", emoji: "🚗", color: "#64748B", title: "Car loan, shopped smart", where: "A bank auto loan with a down payment and a shorter term",
      monthly: 0, amount: `${money0(A.carPlan.down)} down + about ${money0(good.pmt)}/mo for ${A.carPlan.months / 12} years`,
      why: `Compared with $0 down at ${Math.round(A.carNoPlan.apr * 100)}% for ${A.carNoPlan.months / 12} years at the dealer, this saves about ${money0(bad.total - good.total)} and is paid off a year sooner.`,
      moment: "car", how: ["Get pre-approved by a bank before visiting the dealer.", "Compare the APR and total cost, not just the monthly payment.", `Put about 10% down and keep the loan to ${A.carPlan.months / 12} years or less.`],
      when: "Before you shop", products: [BANK.auto],
    });
  }
  items.push({
    id: "retire", emoji: "🧭", color: "#F5C000", title: "Retirement savings", where: has("retire") ? "Workplace plan + an IRA for the extra" : "Workplace retirement plan",
    monthly: retireMonthly + matchMonthly,
    amount: `${Math.round(planA.contribPct * 100)}% of pay (${money0(retireMonthly)}/mo) + ${money0(matchMonthly)}/mo from the employer`,
    why: has("retire") ? `Retirement is close, so every extra dollar counts: ${Math.round(A.extraRetirementPct * 100)}% more of pay goes toward retirement, about ${money0((p.income * A.extraRetirementPct) / 12)} a month.` : "Keeps the full employer match and steady growth.",
    moment: has("retire") ? "retire" : undefined,
    how: has("retire") ? [`Raise retirement savings by ${Math.round(A.extraRetirementPct * 100)}% of pay (workplace plan, or an IRA if the plan is capped).`, "Check the real Social Security estimate at ssa.gov.", "Meet with a planner about a retirement income plan."] : ["Contribute at least enough to get the full employer match.", "Turn on automatic yearly increases if offered."],
    when: "This month", products: has("retire") ? [BANK.ira, BANK.planning] : [BANK.ira], also: has("retire") ? [{ name: "My Social Security estimate (ssa.gov)", url: "https://www.ssa.gov/myaccount/" }] : undefined,
  });
  if (has("market") || has("retire")) items.push({
    id: "invest", emoji: "📈", color: "#0B2A45", title: "Stay invested in index funds", where: "A balanced mix: about 60% stock index funds, 40% bonds",
    monthly: 0, amount: "No new money: just don't sell",
    why: has("market") ? `Selling after a 25% drop locks in the loss and misses the recovery. Staying invested is the single biggest difference in ${his} plan.` : "A balanced, low-cost mix keeps risk in check as retirement gets close.",
    moment: has("market") ? "market" : undefined,
    how: ["Don't sell during a drop. Keep the regular contributions going.", "Hold a simple, low-cost mix of stock and bond index funds.", "Keep about 1 year of retirement withdrawals in CDs so you never have to sell low."],
    when: "Before the next drop", products: [BANK.wealth, BANK.ira],
  });

  return { items, without, withPlan, planA, noPlanEv, planEv, efTarget, essentials, who };
}

const money0 = (v: number) => "$" + Math.round(v).toLocaleString("en-US");
