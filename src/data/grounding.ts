// Real-world data that grounds every plan. Each table names its source; update yearly.
// Nothing here is a guess: values are copied from the sources listed in GROUNDING_SOURCES.

export type Filing = "single" | "married" | "head";

/* ── State income tax, 2026 (Tax Foundation, rates as of Jan 1, 2026; single-filer brackets) ──
   [code, name, standard deduction, personal exemption, [[bracket starts at, rate %], ...]]
   Exemptions given as tax credits are left out (small). Local income taxes are not included. */
type StateRow = [string, string, number, number, [number, number][]];
const S: StateRow[] = [
  ["AL", "Alabama", 3000, 1500, [[0, 2], [500, 4], [3000, 5]]],
  ["AK", "Alaska", 0, 0, []],
  ["AZ", "Arizona", 8350, 0, [[0, 2.5]]],
  ["AR", "Arkansas", 2470, 0, [[0, 2], [4600, 3.9]]],
  ["CA", "California", 5540, 0, [[0, 1], [11079, 2], [26264, 4], [41452, 6], [57542, 8], [72724, 9.3], [371479, 10.3], [445771, 11.3], [742953, 12.3], [1000000, 13.3]]],
  ["CO", "Colorado", 16100, 0, [[0, 4.4]]],
  ["CT", "Connecticut", 0, 15000, [[0, 2], [10000, 4.5], [50000, 5.5], [100000, 6], [200000, 6.5], [250000, 6.9], [500000, 6.99]]],
  ["DE", "Delaware", 3250, 0, [[2000, 2.2], [5000, 3.9], [10000, 4.8], [20000, 5.2], [25000, 5.55], [60000, 6.6]]],
  ["DC", "District of Columbia", 16100, 0, [[0, 4], [10000, 6], [40000, 6.5], [60000, 8.5], [250000, 9.25], [500000, 9.75], [1000000, 10.75]]],
  ["FL", "Florida", 0, 0, []],
  ["GA", "Georgia", 12000, 0, [[0, 5.19]]],
  ["HI", "Hawaii", 4400, 1144, [[0, 1.4], [9600, 3.2], [14400, 5.5], [19200, 6.4], [24000, 6.8], [36000, 7.2], [48000, 7.6], [125000, 7.9], [175000, 8.25], [225000, 9], [275000, 10], [325000, 11]]],
  ["ID", "Idaho", 16100, 0, [[4811, 5.3]]],
  ["IL", "Illinois", 0, 2925, [[0, 4.95]]],
  ["IN", "Indiana", 0, 1000, [[0, 2.95]]],
  ["IA", "Iowa", 16100, 0, [[0, 3.8]]],
  ["KS", "Kansas", 3605, 9160, [[0, 5.2], [23000, 5.58]]],
  ["KY", "Kentucky", 3360, 0, [[0, 3.5]]],
  ["LA", "Louisiana", 12875, 0, [[0, 3]]],
  ["ME", "Maine", 8350, 5300, [[0, 5.8], [27399, 6.75], [64849, 7.15]]],
  ["MD", "Maryland", 3350, 3200, [[0, 2], [1000, 3], [2000, 4], [3000, 4.75], [100000, 5], [125000, 5.25], [150000, 5.5], [250000, 5.75], [500000, 6.25], [1000000, 6.5]]],
  ["MA", "Massachusetts", 0, 4400, [[0, 5], [1083150, 9]]],
  ["MI", "Michigan", 0, 5900, [[0, 4.25]]],
  ["MN", "Minnesota", 15300, 0, [[0, 5.35], [33310, 6.8], [109430, 7.85], [203150, 9.85]]],
  ["MS", "Mississippi", 2300, 6000, [[10000, 4]]],
  ["MO", "Missouri", 16100, 0, [[1348, 2], [2696, 2.5], [4044, 3], [5392, 3.5], [6740, 4], [8088, 4.5], [9436, 4.7]]],
  ["MT", "Montana", 16100, 0, [[0, 4.7], [47500, 5.65]]],
  ["NE", "Nebraska", 8850, 0, [[0, 2.46], [4130, 3.51], [24760, 4.55]]],
  ["NV", "Nevada", 0, 0, []],
  ["NH", "New Hampshire", 0, 0, []],
  ["NJ", "New Jersey", 0, 1000, [[0, 1.4], [20000, 1.75], [35000, 3.5], [40000, 5.53], [75000, 6.37], [500000, 8.97], [1000000, 10.75]]],
  ["NM", "New Mexico", 16100, 0, [[0, 1.5], [5500, 3.2], [16500, 4.3], [33500, 4.7], [66500, 4.9], [210000, 5.9]]],
  ["NY", "New York", 8000, 0, [[0, 3.9], [8500, 4.4], [11700, 5.15], [13900, 5.4], [80650, 5.9], [215400, 6.85], [1077550, 9.65], [5000000, 10.3], [25000000, 10.9]]],
  ["NC", "North Carolina", 12750, 0, [[0, 3.99]]],
  ["ND", "North Dakota", 16100, 0, [[48475, 1.95], [244825, 2.5]]],
  ["OH", "Ohio", 0, 2400, [[26050, 2.75]]],
  ["OK", "Oklahoma", 6350, 1000, [[3750, 2.5], [4900, 3.5], [7200, 4.5]]],
  ["OR", "Oregon", 2910, 0, [[0, 4.75], [4550, 6.75], [11400, 8.75], [125000, 9.9]]],
  ["PA", "Pennsylvania", 0, 0, [[0, 3.07]]],
  ["RI", "Rhode Island", 11200, 5250, [[0, 3.75], [82050, 4.75], [186450, 5.99]]],
  ["SC", "South Carolina", 8350, 0, [[0, 0], [3640, 3], [18230, 6]]],
  ["SD", "South Dakota", 0, 0, []],
  ["TN", "Tennessee", 0, 0, []],
  ["TX", "Texas", 0, 0, []],
  ["UT", "Utah", 0, 0, [[0, 4.5]]],
  ["VT", "Vermont", 7650, 5300, [[0, 3.35], [49400, 6.6], [119700, 7.6], [249700, 8.75]]],
  ["VA", "Virginia", 8750, 930, [[0, 2], [3000, 3], [5000, 5], [17000, 5.75]]],
  ["WA", "Washington", 0, 0, []], // taxes capital gains only, not wages
  ["WV", "West Virginia", 0, 2000, [[0, 2.22], [10000, 2.96], [25000, 3.33], [40000, 4.44], [60000, 4.82]]],
  ["WI", "Wisconsin", 13960, 700, [[0, 3.5], [15110, 4.4], [51950, 5.3], [332720, 7.65]]],
  ["WY", "Wyoming", 0, 0, []],
];
export const STATES = S.map(([code, name, std, exemption, brackets]) => ({ code, name, std, exemption, brackets }));
export type StateInfo = (typeof STATES)[number];
export const stateByCode = (code?: string) => STATES.find((s) => s.code === code);

function progressive(taxable: number, brackets: [number, number][]) {
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const [lo, rate] = brackets[i];
    const hi = brackets[i + 1]?.[0] ?? Infinity;
    if (taxable > lo) tax += (Math.min(taxable, hi) - lo) * (rate / 100);
  }
  return tax;
}
function marginalOf(taxable: number, brackets: [number, number][]) {
  let r = 0;
  for (const [lo, rate] of brackets) if (taxable > lo) r = rate;
  return r / 100;
}

/** One-line description of a state's income tax, e.g. "flat 3.07%" or "1% to 13.3%". */
export function stateTaxLabel(s?: StateInfo) {
  if (!s || s.brackets.length === 0) return "no state income tax on wages";
  const rates = s.brackets.map((b) => b[1]).filter((r) => r > 0);
  return rates.length === 1 ? `flat ${rates[0]}% state income tax` : `state income tax from ${rates[0]}% to ${rates[rates.length - 1]}%`;
}

/* ── Federal income tax, 2026 (IRS inflation adjustments, Rev. Proc. 2025-32) ── */
const FED: Record<Filing, { std: number; brackets: [number, number][] }> = {
  single: { std: 16100, brackets: [[0, 10], [12400, 12], [50400, 22], [105700, 24], [201775, 32], [256225, 35], [640600, 37]] },
  married: { std: 32200, brackets: [[0, 10], [24800, 12], [100800, 22], [211400, 24], [403550, 32], [512450, 35], [768700, 37]] },
  // Head of household uses its own brackets; we approximate them with single brackets and the HoH deduction.
  head: { std: 24150, brackets: [[0, 10], [12400, 12], [50400, 22], [105700, 24], [201775, 32], [256225, 35], [640600, 37]] },
};
// Payroll (FICA): Social Security 6.2% up to the 2026 wage base, Medicare 1.45%.
const SS_WAGE_BASE = 184_500;

/** Yearly taxes on a household's pay, plus the marginal rate used for tax-advantaged savings. */
export function taxes(income: number, stateCode?: string, filing: Filing = "single") {
  const f = FED[filing];
  const fedTaxable = Math.max(0, income - f.std);
  const federal = progressive(fedTaxable, f.brackets);
  const st = stateByCode(stateCode);
  // State: married couples roughly double single brackets/deductions (true in most states)
  const k = filing === "married" ? 2 : 1;
  const stTaxable = st ? Math.max(0, income - (st.std + st.exemption) * k) : 0;
  const state = st ? progressive(stTaxable, st.brackets.map(([lo, r]) => [lo * k, r] as [number, number])) : 0;
  const payroll = Math.min(income, SS_WAGE_BASE * (filing === "married" ? 2 : 1)) * 0.062 + income * 0.0145;
  const total = federal + state + payroll;
  const marginal = marginalOf(fedTaxable, f.brackets) + (st ? marginalOf(stTaxable, st.brackets.map(([lo, r]) => [lo * k, r] as [number, number])) : 0);
  return { federal, state, payroll, total, takeHome: income - total, takeHomeShare: income > 0 ? (income - total) / income : 0.8, marginal, fedMarginal: marginalOf(fedTaxable, f.brackets) };
}

/* ── Typical pay by job: BLS Occupational Outlook Handbook, 2025 median pay (May 2025 OEWS) ──
   Two jobs marked * use the OEWS May 2025 median hourly wage × 2,080 hours. */
export type Job = { id: string; label: string; median: number; words: string[] };
export const JOBS: Job[] = [
  { id: "custodian", label: "Janitors and building cleaners", median: 36840, words: ["janitor", "custodian", "cleaner", "cleaning", "building clean", "porter"] },
  { id: "grounds", label: "Grounds maintenance workers", median: 40080, words: ["landscap", "groundskeep", "grounds", "lawn", "gardener", "tree trim"] },
  { id: "plumber", label: "Plumbers, pipefitters and steamfitters", median: 63800, words: ["plumb", "pipefit", "steamfit"] },
  { id: "electrician", label: "Electricians", median: 63190, words: ["electrician", "electrical"] },
  { id: "carpenter", label: "Carpenters", median: 60580, words: ["carpent", "framer", "cabinet"] },
  { id: "laborer", label: "Construction laborers and helpers", median: 46680, words: ["construction", "laborer", "labourer", "helper", "concrete"] },
  { id: "painter", label: "Painters, construction and maintenance", median: 49400, words: ["painter", "painting"] },
  { id: "roofer", label: "Roofers", median: 55440, words: ["roof"] },
  { id: "mason", label: "Masonry workers", median: 58270, words: ["mason", "brick", "stone"] },
  { id: "equip", label: "Construction equipment operators", median: 59600, words: ["equipment operator", "excavator", "crane", "bulldozer", "heavy equipment"] },
  { id: "hvac", label: "HVAC mechanics and installers", median: 61010, words: ["hvac", "heating", "air condition", "refrigeration", "furnace"] },
  { id: "mechanic", label: "Automotive service technicians and mechanics", median: 50620, words: ["mechanic", "auto tech", "automotive", "car repair", "lube"] },
  { id: "diesel", label: "Diesel service technicians and mechanics", median: 61770, words: ["diesel"] },
  { id: "maint", label: "General maintenance and repair workers", median: 49590, words: ["maintenance", "handyman", "repair", "facilities"] },
  { id: "welder", label: "Welders, cutters, solderers and brazers", median: 53750, words: ["weld", "solder", "brazer", "fabricat"] },
  { id: "machinist", label: "Machinists and tool and die makers", median: 59620, words: ["machinist", "tool and die", "cnc"] },
  { id: "assembler", label: "Assemblers and fabricators", median: 45450, words: ["assembl", "factory", "production", "manufactur", "line worker"] },
  { id: "trucker", label: "Heavy and tractor-trailer truck drivers", median: 58640, words: ["truck", "trucker", "cdl", "tractor-trailer", "semi", "big rig"] },
  { id: "delivery", label: "Delivery truck drivers", median: 43950, words: ["delivery", "courier", "driver sales", "ups", "fedex", "amazon driver"] },
  { id: "bus", label: "Bus drivers", median: 49390, words: ["bus driver", "bus"] },
  { id: "rideshare", label: "Taxi, shuttle and rideshare drivers", median: 37960, words: ["taxi", "uber", "lyft", "rideshare", "chauffeur", "shuttle"] },
  { id: "warehouse", label: "Hand laborers and material movers", median: 38220, words: ["warehouse", "mover", "stocker", "stock", "loader", "packer", "material handler", "freight"] },
  { id: "forklift", label: "Material moving machine operators", median: 46670, words: ["forklift", "machine operator"] },
  { id: "rn", label: "Registered nurses", median: 97550, words: ["registered nurse", "rn", "nurse"] },
  { id: "lpn", label: "Licensed practical and vocational nurses", median: 64400, words: ["lpn", "lvn", "practical nurse"] },
  { id: "cna", label: "Nursing assistants and orderlies", median: 41870, words: ["cna", "nursing assistant", "orderly", "patient care tech"] },
  { id: "hha", label: "Home health and personal care aides", median: 35800, words: ["home health", "personal care", "caregiver", "aide"] },
  { id: "medasst", label: "Medical assistants", median: 45690, words: ["medical assistant"] },
  { id: "dental", label: "Dental assistants", median: 48070, words: ["dental"] },
  { id: "pharmtech", label: "Pharmacy technicians", median: 45750, words: ["pharmacy"] },
  { id: "emt", label: "EMTs and paramedics", median: 48150, words: ["emt", "paramedic", "ambulance"] },
  { id: "teacher", label: "Kindergarten and elementary school teachers", median: 63820, words: ["teacher", "elementary", "kindergarten"] },
  { id: "hsteacher", label: "High school teachers", median: 72040, words: ["high school teacher"] },
  { id: "teachaide", label: "Teacher assistants", median: 36780, words: ["teacher's aide", "teachers aide", "teacher aide", "teacher assistant", "para", "paraprofessional"] },
  { id: "childcare", label: "Childcare workers*", median: 34990, words: ["childcare", "child care", "daycare", "day care", "nanny", "babysit"] },
  { id: "preschool", label: "Preschool teachers", median: 38140, words: ["preschool"] },
  { id: "cook", label: "Cooks", median: 36640, words: ["cook", "line cook", "kitchen"] },
  { id: "chef", label: "Chefs and head cooks", median: 62470, words: ["chef", "head cook"] },
  { id: "foodprep", label: "Food preparation workers", median: 35320, words: ["food prep", "dishwasher", "cafeteria"] },
  { id: "server", label: "Waiters and waitresses", median: 35230, words: ["waiter", "waitress", "server"] },
  { id: "bartender", label: "Bartenders", median: 34340, words: ["bartend"] },
  { id: "fastfood", label: "Food and beverage serving workers", median: 31710, words: ["fast food", "barista", "counter", "crew member"] },
  { id: "cashier", label: "Cashiers", median: 32880, words: ["cashier", "checkout"] },
  { id: "retail", label: "Retail sales workers", median: 35560, words: ["retail", "sales associate", "salesperson", "store"] },
  { id: "csr", label: "Customer service representatives", median: 44770, words: ["customer service", "call center", "csr", "support rep"] },
  { id: "clerk", label: "General office clerks", median: 45010, words: ["office clerk", "clerk", "office"] },
  { id: "admin", label: "Secretaries and administrative assistants", median: 48310, words: ["secretary", "admin", "administrative", "receptionist"] },
  { id: "bookkeeper", label: "Bookkeeping, accounting and auditing clerks", median: 50670, words: ["bookkeep", "accounting clerk", "payroll"] },
  { id: "teller", label: "Bank tellers", median: 43030, words: ["teller"] },
  { id: "postal", label: "Postal service workers", median: 59880, words: ["postal", "mail carrier", "letter carrier", "usps", "mailman"] },
  { id: "security", label: "Security guards", median: 38050, words: ["security", "guard"] },
  { id: "police", label: "Police officers and detectives", median: 77310, words: ["police", "officer", "detective", "deputy", "sheriff", "cop"] },
  { id: "corrections", label: "Correctional officers", median: 58850, words: ["correction", "jail", "prison", "bailiff"] },
  { id: "fire", label: "Firefighters", median: 59280, words: ["firefight", "fire fighter", "fireman"] },
  { id: "hair", label: "Hairdressers, hairstylists and cosmetologists*", median: 35800, words: ["hair", "stylist", "cosmetolog", "barber", "salon"] },
];
export const ALL_JOBS: Job = { id: "all", label: "All U.S. occupations*", median: 50980, words: [] }; // $24.51/hr median × 2,080

export function matchJob(text?: string): Job | undefined {
  const t = (text || "").toLowerCase().trim();
  if (t.length < 2) return undefined;
  const exact = JOBS.find((j) => j.label.toLowerCase() === t);
  if (exact) return exact;
  // longest matching keyword wins (so "high school teacher" beats "teacher")
  let best: Job | undefined, len = 0;
  for (const j of JOBS) for (const w of j.words) {
    const re = new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
    if (re.test(t) && w.length > len) { best = j; len = w.length; }
  }
  return best;
}

/* ── Typical savings by age: Federal Reserve 2025 Survey of Consumer Finances (2025 dollars) ──
   bank = median checking + savings + money market ("transaction accounts") for families that have them
   retirement = median 401(k)/IRA balance for families that have one; share = % of families that have one */
export const AGE_BANDS = [
  { id: "Under 35", age: 30, bank: 5000, retirement: 21000, share: 0.488, text: "Building a foundation" },
  { id: "35–44", age: 40, bank: 6800, retirement: 61000, share: 0.596, text: "Growing family & career" },
  { id: "45–54", age: 50, bank: 9400, retirement: 133000, share: 0.63, text: "Peak saving years" },
  { id: "55–64", age: 60, bank: 10000, retirement: 239000, share: 0.631, text: "Getting ready to retire" },
  { id: "65+", age: 67, bank: 10000, retirement: 257000, share: 0.49, text: "Retired or nearly there" },
];
export const bandForAge = (age: number) => (age < 35 ? AGE_BANDS[0] : age < 45 ? AGE_BANDS[1] : age < 55 ? AGE_BANDS[2] : age < 65 ? AGE_BANDS[3] : AGE_BANDS[4]);

/* ── Inflation: BLS CPI-U (U.S. city average, all items), annual averages ── */
export const INFLATION_HISTORY = { from: 1975, to: 2025, cpiFrom: 53.8, cpiTo: 322.2 };
export const HIST_INFLATION = Math.pow(INFLATION_HISTORY.cpiTo / INFLATION_HISTORY.cpiFrom, 1 / (INFLATION_HISTORY.to - INFLATION_HISTORY.from)) - 1; // ≈ 3.6%

export const GROUNDING_SOURCES = {
  stateTax: { label: "Tax Foundation: State Individual Income Tax Rates and Brackets, 2026", url: "https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/" },
  fedTax: { label: "IRS: 2026 tax inflation adjustments (brackets and standard deduction)", url: "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill" },
  payroll: { label: "SSA: 2026 Social Security wage base", url: "https://www.ssa.gov/oact/cola/cbb.html" },
  pay: { label: "BLS Occupational Outlook Handbook: 2025 median pay by occupation", url: "https://www.bls.gov/ooh/" },
  payOews: { label: "BLS: Occupational Employment and Wages, May 2025", url: "https://www.bls.gov/news.release/archives/ocwage_05152026.htm" },
  savings: { label: "Federal Reserve: 2025 Survey of Consumer Finances", url: "https://www.federalreserve.gov/econres/scfindex.htm" },
  inflation: { label: "BLS: Consumer Price Index (CPI-U), historical annual averages", url: "https://www.bls.gov/cpi/" },
};
