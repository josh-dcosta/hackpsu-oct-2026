// Dated, configurable rules. Update these each year from the IRS/FDIC sources listed.
// Everything else in the app reads from here — nothing is hardcoded elsewhere.
export const RULES = {
  year: 2026,
  verifiedOn: "2026-10-24",
  k401: {
    employeeLimit: 24_500, // IRS Notice 2025-67
    catchUp50: 8_000, // age 50+
    superCatchUp60to63: 11_250, // ages 60–63 (SECURE 2.0)
    note: "Starting 2026, catch-up contributions for people who earned over $150,000 in FICA wages the prior year must go into a Roth (after-tax) account.",
  },
  ira: {
    limit: 7_500,
    catchUp50: 1_100,
    rothPhaseOutSingle: [153_000, 168_000] as [number, number],
    rothPhaseOutJoint: [242_000, 252_000] as [number, number],
  },
  hsa: {
    selfOnly: 4_400,
    family: 8_750,
    catchUp55: 1_000,
    hdhpMinDeductibleSelf: 1_700,
    hdhpMinDeductibleFamily: 3_400,
  },
  fdic: { insuredPerDepositorPerBankPerCategory: 250_000 },
  sources: [
    { label: "IRS — IRA contribution limits", url: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-ira-contribution-limits" },
    { label: "IRS — Amount of Roth IRA contributions you can make", url: "https://www.irs.gov/retirement-plans/amount-of-roth-ira-contributions-that-you-can-make-for-2026" },
    { label: "IRS — Retirement topics: contribution limits", url: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits" },
    { label: "IRS — Health Savings Accounts (Pub. 969)", url: "https://www.irs.gov/publications/p969" },
    { label: "FDIC — Deposit insurance", url: "https://www.fdic.gov/resources/deposit-insurance" },
  ],
};

export function k401Limit(age: number) {
  const r = RULES.k401;
  if (age >= 60 && age <= 63) return r.employeeLimit + r.superCatchUp60to63;
  if (age >= 50) return r.employeeLimit + r.catchUp50;
  return r.employeeLimit;
}
