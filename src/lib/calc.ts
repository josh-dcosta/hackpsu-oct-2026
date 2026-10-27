// Deterministic financial calculators. Every number shown in Next Step
// comes from these functions. Pure functions, no side effects.
import { k401Limit, RULES } from "./rules";

const pw = Math.pow;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ---------------- Inflation ---------------- */
export const futureCost = (present: number, rate: number, years: number) => present * pw(1 + rate, years);
export const todaysDollars = (nominal: number, inflation: number, years: number) => nominal / pw(1 + inflation, years);

/* ---------------- Monthly compounding growth ---------------- */
export type GrowRow = { year: number; balance: number; contributed: number; real: number; interest: number };
export function growMonthly(o: { start: number; monthly: number; annualRate: number; years: number; inflation?: number }): GrowRow[] {
  const inf = o.inflation ?? 0;
  const r = o.annualRate / 12;
  let b = o.start, c = o.start;
  const rows: GrowRow[] = [{ year: 0, balance: b, contributed: c, real: b, interest: 0 }];
  for (let y = 1; y <= o.years; y++) {
    for (let m = 0; m < 12; m++) { b = b * (1 + r) + o.monthly; c += o.monthly; }
    rows.push({ year: y, balance: b, contributed: c, real: b / pw(1 + inf, y), interest: b - c });
  }
  return rows;
}
export const apyFromApr = (apr: number, periods = 12) => pw(1 + apr / periods, periods) - 1;

/* ---------------- Savings vs Investing ---------------- */
export function savingsVsInvesting(o: { start: number; monthly: number; savingsRate: number; investRate: number; inflation: number; years: number }) {
  const cash = growMonthly({ ...o, annualRate: 0 });
  const hysa = growMonthly({ ...o, annualRate: o.savingsRate });
  const inv = growMonthly({ ...o, annualRate: o.investRate });
  // A rough "bad luck" band for investing: 3 points lower return, to show uncertainty
  const invLow = growMonthly({ ...o, annualRate: Math.max(-0.02, o.investRate - 0.03) });
  return cash.map((row, i) => ({
    year: row.year,
    cash: row.balance, hysa: hysa[i].balance, invest: inv[i].balance, investLow: invLow[i].balance,
    cashReal: row.real, hysaReal: hysa[i].real, investReal: inv[i].real,
    contributed: row.contributed,
  }));
}

/* ---------------- 401(k) ---------------- */
export type K401Input = {
  age: number; retireAge: number; salary: number; contribPct: number;
  matchRate: number; matchCapPct: number; // e.g. 50% match on the first 6% of pay
  returnRate: number; salaryGrowth: number; balance: number; inflation: number;
};
export type K401Row = { age: number; balance: number; real: number; employee: number; employer: number; growth: number; salary: number };
export function simulate401k(i: K401Input) {
  const r = i.returnRate;
  let bal = i.balance, totE = 0, totM = 0, totG = 0, limitYears = 0;
  const rows: K401Row[] = [{ age: i.age, balance: bal, real: bal, employee: 0, employer: 0, growth: 0, salary: i.salary }];
  const years = Math.max(0, i.retireAge - i.age);
  for (let y = 0; y < years; y++) {
    const age = i.age + y;
    const salary = i.salary * pw(1 + i.salaryGrowth, y);
    const limit = k401Limit(age) * pw(1 + i.inflation, y); // limits assumed to rise with inflation
    let emp = salary * i.contribPct;
    if (emp > limit) { emp = limit; limitYears++; }
    const match = salary * Math.min(i.contribPct, i.matchCapPct) * i.matchRate;
    const growth = bal * r + (emp + match) * (r / 2); // contributions arrive through the year
    bal += emp + match + growth;
    totE += emp; totM += match; totG += growth;
    rows.push({ age: age + 1, balance: bal, real: bal / pw(1 + i.inflation, y + 1), employee: totE, employer: totM, growth: totG + i.balance, salary });
  }
  return {
    rows, final: bal, finalReal: years ? bal / pw(1 + i.inflation, years) : bal,
    totalEmployee: totE, totalEmployer: totM, totalGrowth: totG, startBalance: i.balance, limitYears, years,
    firstYearEmployee: i.salary * i.contribPct, firstYearMatch: i.salary * Math.min(i.contribPct, i.matchCapPct) * i.matchRate,
  };
}

/* ---------------- IRA / 401(k) comparison ---------------- */
export function compareAccounts(o: { budget: number; years: number; returnRate: number; taxNow: number; taxLater: number; matchPct: number }) {
  const r = o.returnRate, n = o.years;
  // Contributions at the start of each year
  const F = r === 0 ? n : ((pw(1 + r, n) - 1) / r) * (1 + r);
  const match = o.budget * o.matchPct;
  const tradIRA = { name: "Traditional IRA", invested: o.budget, gross: o.budget * F, afterTax: o.budget * F * (1 - o.taxLater) };
  const rothIRA = { name: "Roth IRA", invested: o.budget * (1 - o.taxNow), gross: o.budget * (1 - o.taxNow) * F, afterTax: o.budget * (1 - o.taxNow) * F };
  const trad401 = { name: "Traditional 401(k)", invested: o.budget + match, gross: (o.budget + match) * F, afterTax: (o.budget + match) * F * (1 - o.taxLater) };
  const roth401 = {
    name: "Roth 401(k)", invested: o.budget * (1 - o.taxNow) + match,
    gross: (o.budget * (1 - o.taxNow) + match) * F,
    afterTax: o.budget * (1 - o.taxNow) * F + match * F * (1 - o.taxLater), // employer match is taxed on the way out
  };
  const list = [tradIRA, rothIRA, trad401, roth401].map((a) => ({
    ...a, contributions: a.invested * n, growth: a.gross - a.invested * n, taxes: a.gross - a.afterTax,
  }));
  return { list, factor: F };
}

/* ---------------- HSA ---------------- */
export function simulateHSA(o: { annual: number; taxRate: number; payroll: boolean; years: number; returnRate: number; medical: number; savingsRate: number }) {
  const fica = o.payroll ? 0.0765 : 0;
  const taxSavedPerYear = o.annual * (o.taxRate + fica);
  let hsa = 0, sav = 0;
  const rows = [{ year: 0, hsa: 0, savings: 0 }];
  for (let y = 1; y <= o.years; y++) {
    hsa = Math.max(0, (hsa + o.annual - o.medical)) * (1 + o.returnRate);
    sav = Math.max(0, (sav + o.annual * (1 - o.taxRate - fica) - o.medical)) * (1 + o.savingsRate);
    rows.push({ year: y, hsa, savings: sav });
  }
  return { rows, taxSavedPerYear, totalTaxSaved: taxSavedPerYear * o.years, hsaFinal: hsa, savingsFinal: sav };
}

/* ---------------- 529 ---------------- */
export function monthlyNeeded(target: number, years: number, annualRate: number, startBalance = 0) {
  if (years <= 0) return Math.max(0, target - startBalance);
  const r = annualRate / 12, n = years * 12;
  const fvStart = startBalance * pw(1 + r, n);
  const need = Math.max(0, target - fvStart);
  return r === 0 ? need / n : (need * r) / (pw(1 + r, n) - 1);
}
export function simulate529(o: { childAge: number; collegeAge: number; costNow: number; tuitionInflation: number; monthly: number; returnRate: number; balance: number }) {
  const years = Math.max(0, o.collegeAge - o.childAge);
  const yearCosts = [0, 1, 2, 3].map((k) => futureCost(o.costNow, o.tuitionInflation, years + k));
  const totalCost = yearCosts.reduce((a, b) => a + b, 0);
  const growth = growMonthly({ start: o.balance, monthly: o.monthly, annualRate: o.returnRate, years });
  const saved = growth[growth.length - 1].balance;
  const rows = growth.map((g) => ({ age: o.childAge + g.year, saved: g.balance, contributed: g.contributed, target: totalCost }));
  return {
    years, totalCost, todayCost: o.costNow * 4, saved, coverage: totalCost ? saved / totalCost : 0, rows,
    neededNow: monthlyNeeded(totalCost, years, o.returnRate, o.balance),
    neededIfWait5: monthlyNeeded(totalCost, years - 5, o.returnRate, o.balance),
  };
}

/* ---------------- Debt ---------------- */
export function payoff(o: { balance: number; apr: number; payment: number }) {
  const r = o.apr / 12;
  let b = o.balance, months = 0, interest = 0;
  const series = [{ month: 0, balance: b }];
  if (o.payment <= b * r + 0.01) return { months: Infinity, totalInterest: Infinity, never: true, series };
  while (b > 0.005 && months < 1200) {
    const int = b * r; interest += int; b = b + int - o.payment; months++;
    if (b < 0) b = 0;
    series.push({ month: months, balance: b });
  }
  return { months, totalInterest: interest, never: false, series };
}
export type Debt = { name: string; balance: number; apr: number; min: number };
export function multiDebt(debts: Debt[], extra: number, strategy: "avalanche" | "snowball" | "minimum") {
  const ds = debts.map((d) => ({ ...d }));
  let month = 0, interest = 0;
  const series: { month: number; total: number }[] = [{ month: 0, total: ds.reduce((a, d) => a + d.balance, 0) }];
  const order: string[] = [];
  const budget = ds.reduce((a, d) => a + d.min, 0) + (strategy === "minimum" ? 0 : extra);
  while (ds.some((d) => d.balance > 0.005) && month < 1200) {
    month++;
    ds.forEach((d) => { if (d.balance > 0) { const i = d.balance * d.apr / 12; d.balance += i; interest += i; } });
    let pool = budget;
    ds.forEach((d) => { if (d.balance > 0) { const p = Math.min(d.min, d.balance); d.balance -= p; pool -= p; } });
    const targets = ds.filter((d) => d.balance > 0.005).sort((a, b) => strategy === "snowball" ? a.balance - b.balance : b.apr - a.apr);
    for (const t of targets) { if (pool <= 0) break; const p = Math.min(pool, t.balance); t.balance -= p; pool -= p; }
    ds.forEach((d) => { if (d.balance <= 0.005 && !order.includes(d.name)) { d.balance = 0; order.push(d.name); } });
    if (month % 1 === 0) series.push({ month, total: ds.reduce((a, d) => a + d.balance, 0) });
    if (month > 600 && series[series.length - 1].total >= series[0].total) return { months: Infinity, totalInterest: Infinity, series, order };
  }
  return { months: month, totalInterest: interest, series, order };
}
export function emergencyFund(o: { essentials: number; targetMonths: number; saved: number; monthlySave: number }) {
  const target = o.essentials * o.targetMonths;
  const gap = Math.max(0, target - o.saved);
  return { target, gap, months: gap === 0 ? 0 : o.monthlySave > 0 ? Math.ceil(gap / o.monthlySave) : Infinity, progress: target ? clamp(o.saved / target, 0, 1) : 1 };
}

/* ---------------- Portfolio (hypothetical market paths) ---------------- */
export function rng(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const gauss = (r: () => number) => { const u = Math.max(1e-9, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

export const MARKETS = {
  steady: { label: "Steady growth", stock: [8, 10, 6, 11, -4, 9, 12, 7, 9, 8], bond: [4, 4, 3, 5, 5, 4, 3, 4, 4, 4], note: "Ordinary years with one small dip. Real markets are rarely this smooth." },
  crash: { label: "Crash & recovery", stock: [11, 9, -37, 26, 15, 2, 16, 32, 13, 1], bond: [4, 7, 5, 6, 8, 4, 2, -2, 6, 1], note: "Loosely shaped like 2006–2015: a 2008-style crash, then a long recovery." },
  lost: { label: "Lost decade", stock: [-9, -12, -22, 28, 11, 5, 16, 5, -37, 26], bond: [12, 8, 10, 4, 4, 2, 4, 7, 5, 6], note: "Loosely shaped like 2000–2009: two crashes, little stock growth for ten years." },
  boom: { label: "Boom years", stock: [21, 23, 33, 28, 21, -9, -12, 18, 26, 14], bond: [9, 3, 9, -1, 9, 11, 8, 10, 4, 8], note: "Loosely shaped like the late-1990s boom, ending in a bust." },
} as const;
export type MarketKey = keyof typeof MARKETS;
export type Alloc = { single: number; several: number; index: number; bonds: number; cash: number };
const VOL = { single: 0.42, several: 0.14, index: 0, bonds: 0.02, cash: 0 };

export function marketPaths(market: MarketKey, seed: number) {
  const m = MARKETS[market], r = rng(seed);
  // single fictional stock: amplified market moves plus its own luck (can be great or terrible)
  const single = m.stock.map((s) => clamp(s / 100 * 1.3 + 0.01 + gauss(r) * VOL.single, -0.85, 1.8));
  const several = m.stock.map((s) => clamp(s / 100 * 1.1 + gauss(r) * VOL.several, -0.7, 1.2));
  const index = m.stock.map((s) => s / 100);
  const bonds = m.bond.map((b) => b / 100);
  const cash = m.stock.map(() => 0.03);
  return { single, several, index, bonds, cash };
}
export function runPortfolio(alloc: Alloc, amount: number, market: MarketKey, seed: number) {
  const paths = marketPaths(market, seed);
  const total = Object.values(alloc).reduce((a, b) => a + b, 0) || 1;
  const w = Object.fromEntries(Object.entries(alloc).map(([k, v]) => [k, v / total])) as Alloc;
  const strat = (weights: Partial<Alloc>) => {
    let v = amount, peak = amount, maxDD = 0;
    const vals = [amount];
    for (let y = 0; y < 10; y++) {
      // annual rebalance to target weights
      let ret = 0;
      (Object.keys(weights) as (keyof Alloc)[]).forEach((k) => { ret += (weights[k] || 0) * paths[k][y]; });
      v = v * (1 + ret); vals.push(v);
      peak = Math.max(peak, v); maxDD = Math.min(maxDD, v / peak - 1);
    }
    return { vals, final: v, maxDD };
  };
  const mine = strat(w);
  const comps = {
    single: strat({ single: 1 }), several: strat({ several: 1 }), index: strat({ index: 1 }), mix: strat({ index: 0.6, bonds: 0.4 }),
  };
  const years = Array.from({ length: 11 }, (_, y) => ({
    year: y, mine: mine.vals[y], single: comps.single.vals[y], several: comps.several.vals[y], index: comps.index.vals[y], mix: comps.mix.vals[y],
  }));
  // educational risk score 1–10 from weighted typical volatility
  const typVol = w.single * 0.45 + w.several * 0.24 + w.index * 0.16 + w.bonds * 0.06 + w.cash * 0.005;
  const risk = clamp(Math.round(typVol / 0.045), 1, 10);
  return { years, mine, comps, risk, weights: w };
}

/* ---------------- Life expenses ---------------- */
export const EXPENSE_CATS = [
  { key: "housing", label: "Housing", color: "#00377B" },
  { key: "food", label: "Food & utilities", color: "#10B981" },
  { key: "family", label: "Childcare & family", color: "#F59E0B" },
  { key: "health", label: "Healthcare", color: "#F97361" },
  { key: "transport", label: "Transportation", color: "#38BDF8" },
  { key: "education", label: "Education", color: "#8B5CF6" },
  { key: "fun", label: "Fun & other", color: "#94A3B8" },
] as const;
export function lifeExpenses(o: { age: number; familySize: number; housing: number; retireAge: number; inflation: number; mortgagePaidOff: boolean; showReal: boolean }) {
  const adults = Math.min(2, o.familySize), kids = Math.max(0, o.familySize - adults);
  const healthAge = (a: number) => (a < 35 ? 1 : a < 45 ? 1.25 : a < 55 ? 1.6 : a < 65 ? 2.2 : a < 75 ? 2.1 : 2.6);
  const stages = [25, 35, 45, 55, 65, 75, 85].filter((a) => a >= Math.floor(o.age / 10) * 10 - 5 || a === 85);
  return stages.map((a) => {
    const yrs = Math.max(0, a - o.age);
    const retired = a >= o.retireAge;
    const kidsHome = kids > 0 && a >= 30 && a < 55;
    const base = {
      housing: retired && o.mortgagePaidOff ? o.housing * 0.4 : o.housing,
      food: 420 * adults + 260 * (kidsHome ? kids : 0) + 180,
      family: kidsHome ? (a < 45 ? 850 : 350) * kids : 0,
      health: 280 * adults * healthAge(a) + (kidsHome ? 90 * kids : 0),
      transport: retired ? 330 : 520 + (kidsHome ? 120 : 0),
      education: kids > 0 && a >= 45 && a < 55 ? 650 * kids : 0,
      fun: (retired && a < 75 ? 520 : retired ? 300 : 380) * adults / 2 + 120,
    };
    const inflate = (k: string, v: number) => {
      if (o.showReal) return v;
      const rate = k === "health" ? o.inflation + 0.015 : k === "education" ? o.inflation + 0.01 : o.inflation;
      return v * pw(1 + rate, yrs);
    };
    const row: Record<string, number | string> = { stage: `${a}`, age: a };
    let total = 0;
    for (const c of EXPENSE_CATS) { const v = inflate(c.key, (base as Record<string, number>)[c.key]); row[c.key] = Math.round(v); total += v; }
    row.total = Math.round(total);
    row.retired = retired ? 1 : 0;
    return row;
  });
}

/* ---------------- Personal life projection (dashboard) ---------------- */
export type Profile = {
  name?: string; ageRange: string; age: number; income: number; expenses: number; savings: number; retirement: number;
  goals: string[]; level: "Beginner" | "Intermediate" | "Advanced"; onboarded: boolean;
  scenario?: "dave" | "custom";
  job?: string;
  kids?: { name: string; age: number }[];
};
export type Assumptions = {
  returnRate: number; inflation: number; contribPct: number; matchPct: number; retireAge: number; ssReplacement: number; salaryGrowth: number; leftoverSaved: number; scenario: "pessimistic" | "baseline" | "optimistic";
  // Plan levers (each taught by a lesson)
  hsaAnnual?: number; // HSA contributions per year (pre-tax, invested)
  cashRate?: number; // interest on savings account (regular bank ~0.5%, high-yield ~4%)
  accountType?: "traditional" | "roth"; // retirement contributions: tax break now vs. tax-free later
  taxRate?: number; // federal income tax bracket, now and in retirement
};
export const DEFAULT_ASSUMPTIONS: Assumptions = { returnRate: 0.06, inflation: 0.03, contribPct: 0.06, matchPct: 0.03, retireAge: 67, ssReplacement: 0.35, salaryGrowth: 0.03, leftoverSaved: 0.5, scenario: "baseline", hsaAnnual: 0, cashRate: 0.005, accountType: "traditional", taxRate: 0.12 };

export type YearFlow = {
  age: number; retired: boolean;
  expensesMonthly: number; // what monthly bills cost at this age (prices rise with inflation)
  savingMonthly: number; // working years: added to savings per month (negative = dipping into savings)
  incomeMonthly: number; // retirement: Social Security + pension per month
  fromSavingsMonthly: number; // retirement: pulled from savings per month
  shortfallMonthly: number; // retirement: bills not covered by anything
  balanceEnd: number;
};
// Life moments that change the money picture (see lib/plan.ts)
export type LifeEvents = {
  costs?: { age: number; amount: number }[]; // one-time costs at an age, in future dollars (surprise bill, college)
  extraMonthly?: number; // added to monthly bills from now on, in today's dollars (e.g. higher insurance)
  marketDrop?: { drop: number; panic: boolean }; // investments fall this year; panic = sell and sit in cash for 3 years
};
export function projectLife(p: Profile, a: Assumptions, ev: LifeEvents = {}) {
  const adj = a.scenario === "optimistic" ? { r: 0.015, i: -0.005 } : a.scenario === "pessimistic" ? { r: -0.02, i: 0.01 } : { r: 0, i: 0 };
  const ret = a.returnRate + adj.r, inf = Math.max(0, a.inflation + adj.i), cashRate = a.cashRate ?? 0.035;
  const tax = a.taxRate ?? 0.12, roth = a.accountType === "roth", hsa = a.hsaAnnual ?? 0;
  let taxSavedTotal = 0;
  const taxSavedNow = (roth ? 0 : p.income * a.contribPct * tax) + hsa * (tax + 0.0765);
  const takeHomeRate = 0.78; // rough after-tax share of pay (assumption)
  let cash = p.savings, invested = p.retirement, salary = p.income;
  let depletedAge: number | null = null;
  const rows: { age: number; nominal: number; real: number; cash: number; invested: number; expensesMonthly: number; retired: boolean }[] = [];
  const flows: YearFlow[] = [];
  rows.push({ age: p.age, nominal: cash + invested, real: cash + invested, cash, invested, expensesMonthly: p.expenses + (ev.extraMonthly ?? 0), retired: p.age >= a.retireAge });
  for (let age = p.age; age < 90; age++) {
    const y = age - p.age;
    const prices = pw(1 + inf, y);
    const expensesYear = (p.expenses + (ev.extraMonthly ?? 0)) * 12 * prices;
    // one-time costs come out of cash first, then investments
    const oneTime = (ev.costs ?? []).filter((c) => c.age === age).reduce((t, c) => t + c.amount, 0);
    if (oneTime > 0) { const fromCash = Math.min(cash, oneTime); cash -= fromCash; invested -= oneTime - fromCash; }
    // a market drop this year, then 3 recovery years. Panic-selling misses the recovery.
    const md = ev.marketDrop;
    const yr = md ? (y === 0 ? -md.drop : y <= 3 ? (md.panic ? cashRate : ret + 0.08) : ret) : ret;
    const f: YearFlow = { age, retired: age >= a.retireAge, expensesMonthly: expensesYear / 12, savingMonthly: 0, incomeMonthly: 0, fromSavingsMonthly: 0, shortfallMonthly: 0, balanceEnd: 0 };
    if (age < a.retireAge) {
      const hsaY = hsa * pw(1 + inf, y); // HSA contributions rise with prices
      const contrib = salary * a.contribPct + salary * a.matchPct + hsaY;
      // Traditional: contributions skip income tax now. Roth: paid from after-tax pay. HSA: skips income + payroll tax.
      const takeHome = (roth ? salary * takeHomeRate - salary * a.contribPct : salary * (1 - a.contribPct) * takeHomeRate) - hsaY * (1 - tax - 0.0765);
      taxSavedTotal += (roth ? 0 : salary * a.contribPct * tax) + hsaY * (tax + 0.0765);
      const surplus = takeHome - expensesYear > 0 ? (takeHome - expensesYear) * a.leftoverSaved : takeHome - expensesYear;
      f.savingMonthly = (contrib + surplus) / 12;
      invested = invested * (1 + yr) + contrib * (1 + yr / 2);
      cash = cash * (1 + cashRate);
      if (surplus >= 0) {
        const efTarget = (expensesYear / 12) * 6;
        const toCash = Math.max(0, Math.min(surplus, efTarget - cash));
        cash += toCash; invested += (surplus - toCash) * (1 + ret / 2);
      } else {
        cash += surplus; if (cash < 0) { invested += cash; cash = 0; }
      }
      salary *= 1 + a.salaryGrowth;
    } else {
      const need = expensesYear; // same lifestyle, at future prices
      const ss = Math.min(need, p.income * a.ssReplacement * pw(1 + inf, y)); // Social Security + pension (rough, rises with prices)
      let gap = need - ss;
      invested = invested * (1 + (md && y <= 3 ? yr : ret - 0.01)); // a bit more conservative in retirement
      cash = cash * (1 + cashRate);
      // Traditional withdrawals are taxed as income; Roth (and HSA for medical) come out tax-free
      const keep = roth ? 1 : 1 - tax;
      const grossInv = Math.min(gap / keep, invested); invested -= grossInv; const fromInv = grossInv * keep; gap -= fromInv;
      const fromCash = Math.min(gap, cash); cash -= fromCash; gap -= fromCash;
      f.incomeMonthly = ss / 12; f.fromSavingsMonthly = (fromInv + fromCash) / 12; f.shortfallMonthly = Math.max(0, gap) / 12;
      if (gap > 1 && depletedAge === null) depletedAge = age;
    }
    const nominal = Math.max(0, cash + invested);
    f.balanceEnd = nominal; flows.push(f);
    rows.push({ age: age + 1, nominal, real: nominal / pw(1 + inf, y + 1), cash, invested, expensesMonthly: (p.expenses + (ev.extraMonthly ?? 0)) * pw(1 + inf, y + 1), retired: age + 1 >= a.retireAge });
  }
  const at = (age: number) => rows.find((r) => r.age === age) || rows[rows.length - 1];
  const milestones = [35, 45, 55, 65, 75, 85].filter((m) => m >= p.age).map((m) => ({ ...at(m) }));
  const atRetire = at(a.retireAge);
  const firstRetire = flows.find((f) => f.retired);
  return { rows, flows, milestones, atRetire, depletedAge, inflation: inf, returnRate: ret, firstRetire, savingToday: flows[0]?.savingMonthly ?? 0, taxSavedNow, taxSavedTotal };
}

export const LIMITS_NOTE = `Contribution limits use ${RULES.year} IRS figures and assume they rise with inflation in later years.`;
