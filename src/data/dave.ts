// Dave's demo scenario — one place for every preloaded value.
// Head custodian at a Pennsylvania public high school, married, two teens heading to college.
// Sources: PA district custodian posting (~$22/hr), PASSHE 2025-26 cost of attendance (~$22k/yr resident),
// PSERS Class T-G member contribution (8.25%).
import type { Assumptions, Profile } from "../lib/calc";

export const DAVE = {
  name: "Dave",
  role: "Head custodian at a Pennsylvania public high school",
  hourly: 22,
  davePay: 46_000, // ~$22/hr × 2,080 hrs
  spousePay: 18_000, // Linda, part-time school cafeteria
  household: 64_000,
  kids: [
    { name: "Emma", age: 17, grade: "senior" },
    { name: "Jake", age: 15, grade: "sophomore" },
  ],
  collegeCostToday: 22_000, // PA state university (PASSHE), tuition + fees + room & board
};

export const DAVE_PROFILE: Profile = {
  name: "Dave", ageRange: "45–55", age: 50, income: 64_000, expenses: 3_600, savings: 6_000, retirement: 22_000,
  goals: ["Save for a child's education", "Build an emergency fund", "Retire comfortably"], level: "Beginner", onboarded: false, scenario: "dave",
  job: "Head custodian, PA public high school", kids: [{ name: "Emma", age: 17 }, { name: "Jake", age: 15 }],
};

// Stand-ins: 8% ≈ PSERS member contribution; 2% ≈ employer share to his retirement account;
// 45% "Social Security" ≈ Social Security + PSERS pension combined.
export const DAVE_ASSUMPTIONS: Assumptions = {
  returnRate: 0.06, inflation: 0.04, contribPct: 0.08, matchPct: 0.02, retireAge: 67, ssReplacement: 0.45, salaryGrowth: 0.025, leftoverSaved: 0.5, scenario: "baseline",
  hsaAnnual: 0, cashRate: 0.005, accountType: "traditional", taxRate: 0.12,
};

export const CUSTOM_PROFILE: Profile = {
  name: "", ageRange: "35–45", age: 40, income: 60_000, expenses: 3_500, savings: 10_000, retirement: 40_000,
  goals: [], level: "Beginner", onboarded: false, scenario: "custom", job: "", kids: [],
};
export const CUSTOM_ASSUMPTIONS: Assumptions = {
  returnRate: 0.06, inflation: 0.04, contribPct: 0.06, matchPct: 0.03, retireAge: 67, ssReplacement: 0.35, salaryGrowth: 0.03, leftoverSaved: 0.5, scenario: "baseline",
  hsaAnnual: 0, cashRate: 0.005, accountType: "traditional", taxRate: 0.12,
};
export const isDaveProfile = (p: Profile) => p.scenario ? p.scenario === "dave" : p.name === "Dave";

// Preloaded simulator settings (keyed by module id). "Reset" returns to these.
export const DAVE_SIMS: Record<string, Record<string, unknown>> = {
  inflation: { item: "tuition", price: 22_000, rate: 4, years: 3 },
  life: { age: 50, family: 4, housing: 1_250, retireAge: 67, inflation: 3, paidOff: true, real: false, stage: 0 },
  saving: { start: 6_000, monthly: 150, sav: 0.5, inv: 6, inflation: 3, years: 17, real: true },
  bank: { checking: 2_000, savings: 4_000, apy: 0.5, month: 0, interest: 0, tx: [], hist: [{ m: 0, savings: 4_000, checking: 2_000 }] },
  k401: { age: 50, retireAge: 67, salary: 46_000, contrib: 8, matchRate: 100, matchCap: 2, ret: 6, growth: 2.5, balance: 22_000, inflation: 3 },
  accounts: { budget: 3_500, years: 17, ret: 6, now: 12, later: 12, match: 25 },
  hsa: { annual: 1_500, tax: 12, years: 15, ret: 5, medical: 1_200, payroll: true },
  college: { childAge: 15, collegeAge: 18, cost: 22_000, tInfl: 4, monthly: 150, ret: 4, balance: 0 },
  buckets: { short: 6_000, medium: 3_000, long: 22_000 },
  invest: { single: 0, several: 5, index: 50, bonds: 35, cash: 10, market: "crash", seed: 7, amount: 22_000 },
  debt: {
    bal: 3_200, apr: 22, pay: 100, extra: 100,
    d1b: 600, d1r: 25, d2b: 3_200, d2r: 22, d3b: 9_000, d3r: 7.5,
    limit: 8_000, used: 3_800, ess: 3_000, efMonths: 3, efSaved: 6_000, efMonthly: 150,
  },
};
