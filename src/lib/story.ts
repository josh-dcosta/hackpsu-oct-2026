// "Choose Your Financial Future" — a deterministic life simulator driven by choices.
const pw = Math.pow;

export type Option = { id: string; label: string; detail: string; emoji: string };
export type Decision = { id: string; year: number; kind: "plan" | "event"; title: string; story: string; options: Option[]; def: string; alt: Record<string, string>; lesson: string };

export const DECISIONS: Decision[] = [
  {
    id: "save", year: 0, kind: "plan", title: "Your monthly savings habit",
    story: "Payday! After bills, how much do you set aside each month for your future?",
    options: [
      { id: "low", label: "$150 / month", detail: "Enjoy more today", emoji: "🛍️" },
      { id: "mid", label: "$400 / month", detail: "A steady middle path", emoji: "⚖️" },
      { id: "high", label: "$750 / month", detail: "Future-you first", emoji: "🌱" },
    ], def: "mid", alt: { low: "high", mid: "low", high: "low" },
    lesson: "Small monthly amounts become large over decades because growth earns its own growth.",
  },
  {
    id: "k401", year: 0, kind: "plan", title: "Your 401(k) contribution",
    story: "Your employer adds 50 cents for every $1 you save, up to 6% of your pay. How much do you contribute?",
    options: [
      { id: "3", label: "3% of pay", detail: "Leaves half the match unclaimed", emoji: "🥉" },
      { id: "6", label: "6% of pay", detail: "Gets the full employer match", emoji: "🎯" },
      { id: "10", label: "10% of pay", detail: "Full match plus extra", emoji: "🚀" },
    ], def: "6", alt: { "3": "10", "6": "3", "10": "3" },
    lesson: "An employer match is part of your pay. Contributing too little can leave it unclaimed.",
  },
  {
    id: "ef", year: 0, kind: "plan", title: "Your safety cushion",
    story: "You have $15,000 saved. How many months of expenses do you keep in a high-yield savings account? The rest gets invested.",
    options: [
      { id: "1", label: "1 month", detail: "Invest almost everything", emoji: "🎲" },
      { id: "3", label: "3 months", detail: "A common starting goal", emoji: "🛟" },
      { id: "6", label: "6 months", detail: "Extra peace of mind", emoji: "🏰" },
    ], def: "3", alt: { "1": "6", "3": "1", "6": "1" },
    lesson: "An emergency fund isn't about growth. It keeps a surprise bill from becoming expensive debt.",
  },
  {
    id: "mix", year: 0, kind: "plan", title: "Your investment mix",
    story: "How should your invested money be split between stocks (growth, bumpy) and bonds (steadier)?",
    options: [
      { id: "safe", label: "Mostly bonds", detail: "Smoother ride, slower growth", emoji: "🐢" },
      { id: "balanced", label: "60% stocks / 40% bonds", detail: "A classic balance", emoji: "⚖️" },
      { id: "growth", label: "90% stocks", detail: "More growth, bigger drops", emoji: "🐎" },
    ], def: "balanced", alt: { safe: "growth", balanced: "growth", growth: "safe" },
    lesson: "More stocks has historically meant more long-run growth AND bigger, scarier drops. Neither is free.",
  },
  {
    id: "roof", year: 2, kind: "event", title: "Surprise! The roof is leaking",
    story: "Year 2: a $9,000 repair can't wait. How do you pay for it?",
    options: [
      { id: "cash", label: "Use savings", detail: "Then rebuild the cushion", emoji: "🛟" },
      { id: "card", label: "Credit card", detail: "24% APR, paid over 3 years", emoji: "💳" },
    ], def: "cash", alt: { cash: "card", card: "cash" },
    lesson: "Paying 24% interest costs you money. Using an emergency fund avoids paying interest.",
  },
  {
    id: "raise", year: 3, kind: "event", title: "You got a 10% raise! 🎉",
    story: "Year 3: your paycheck grows. What happens to the extra money?",
    options: [
      { id: "spend", label: "Upgrade my lifestyle", detail: "Nicer car, more dinners out", emoji: "🚗" },
      { id: "half", label: "Save half of it", detail: "Enjoy some, grow some", emoji: "✌️" },
    ], def: "half", alt: { spend: "half", half: "spend" },
    lesson: "Saving part of every raise grows your savings without cutting your current lifestyle.",
  },
  {
    id: "crash", year: 5, kind: "event", title: "The market drops sharply 📉",
    story: "Year 5: stocks fall hard and the news is scary. What do you do with your investments?",
    options: [
      { id: "hold", label: "Stay the course", detail: "Keep investing as planned", emoji: "🧘" },
      { id: "sell", label: "Sell and wait in cash", detail: "Get back in after 3 years", emoji: "🏃" },
    ], def: "hold", alt: { hold: "sell", sell: "hold" },
    lesson: "Historically, some of the best days came right after the worst. Selling after a drop can lock in the loss, though nothing is guaranteed.",
  },
  {
    id: "baby", year: 6, kind: "event", title: "A baby arrives 👶",
    story: "Year 6: childcare adds about $700/month to the budget for 5 years. Do you also start a 529 college fund at $150/month?",
    options: [
      { id: "529", label: "Start a 529", detail: "$150/month, invested for college", emoji: "🎓" },
      { id: "skip", label: "Not now", detail: "Pay for college later", emoji: "⏳" },
    ], def: "529", alt: { "529": "skip", skip: "529" },
    lesson: "Starting a college fund early gives growth 18 years to work, so you need less each month.",
  },
  {
    id: "inflation", year: 12, kind: "event", title: "Prices jump 🛒",
    story: "Year 12: inflation runs at 6% for three years. Everything costs more. How do you respond?",
    options: [
      { id: "trim", label: "Trim spending", detail: "Keep saving the same", emoji: "✂️" },
      { id: "pause", label: "Pause saving", detail: "For 3 years", emoji: "⏸️" },
    ], def: "trim", alt: { trim: "pause", pause: "trim" },
    lesson: "Inflation quietly shrinks money. Pausing saving during high inflation leaves a gap that compounding can't fill later.",
  },
  {
    id: "retire", year: 30, kind: "plan", title: "When do you retire?",
    story: "Last choice: at what age would you like to stop working?",
    options: [
      { id: "62", label: "Age 62", detail: "More free years, fewer saving years", emoji: "🏖️" },
      { id: "67", label: "Age 67", detail: "Full Social Security age for most", emoji: "📅" },
      { id: "70", label: "Age 70", detail: "More saving years, larger checks", emoji: "⛰️" },
    ], def: "67", alt: { "62": "70", "67": "62", "70": "62" },
    lesson: "Each extra working year adds savings, gives growth more time, and leaves one less year to fund.",
  },
];

export type Choices = Record<string, string>;
export const defaultChoices = (): Choices => Object.fromEntries(DECISIONS.map((d) => [d.id, d.def]));
export const altChoices = (c: Choices): Choices => Object.fromEntries(DECISIONS.map((d) => [d.id, d.alt[c[d.id] ?? d.def]]));

export type StoryStart = { age: number; salary: number; savings: number; retirement: number; expenses: number };
export const STORY_START: StoryStart = { age: 30, salary: 75_000, savings: 15_000, retirement: 12_000, expenses: 3_600 };

export type StoryRow = { year: number; age: number; netWorth: number; real: number; invested: number; cash: number; debt: number; college: number };

export function simulateStory(c0: Choices, start: StoryStart = STORY_START) {
  const c = { ...defaultChoices(), ...c0 };
  const retireAge = Number(c.retire);
  const horizon = Math.max(30, retireAge - start.age);
  const mixRet = { safe: 0.045, balanced: 0.06, growth: 0.07 }[c.mix as "safe" | "balanced" | "growth"];
  const crashDrop = { safe: 0.1, balanced: 0.22, growth: 0.32 }[c.mix as "safe" | "balanced" | "growth"];
  const rebound = { safe: 0.08, balanced: 0.15, growth: 0.22 }[c.mix as "safe" | "balanced" | "growth"];
  const monthlySave = { low: 150, mid: 400, high: 750 }[c.save as "low" | "mid" | "high"];
  const pct = Number(c.k401) / 100;
  const efTargetMonths = Number(c.ef);

  let salary = start.salary;
  let cash = Math.min(start.savings, start.expenses * efTargetMonths);
  let invested = start.retirement + (start.savings - cash);
  let debt = 0, college = 0, interestPaid = 0, missedMatch = 0, prices = 1;
  const rows: StoryRow[] = [{ year: 0, age: start.age, netWorth: cash + invested, real: cash + invested, invested, cash, debt, college }];
  const cardMonthly = (9000 * (0.02)) / (1 - pw(1.02, -36)); // 24% APR over 36 months

  for (let y = 0; y < horizon; y++) {
    const age = start.age + y;
    const working = age < retireAge;
    const inflation = c.inflation && y >= 12 && y < 15 ? 0.06 : 0.03;
    // --- income side
    if (y === 3) salary *= 1.1;
    let save = working ? monthlySave * 12 * pw(1.03, y) : 0;
    if (working && y >= 3 && c.raise === "half") save += (start.salary * 0.1 * 0.78) / 2 * pw(1.03, y - 3);
    if (c.inflation === "pause" && y >= 12 && y < 15) save = 0;
    const k401 = working ? salary * pct + salary * Math.min(pct, 0.06) * 0.5 : 0;
    if (working) missedMatch += salary * Math.max(0, 0.06 - pct) * 0.5;

    // --- events
    if (y === 2) {
      if (c.roof === "cash") { const fromCash = Math.min(cash, 9000); cash -= fromCash; debt += 9000 - fromCash; }
      else debt += 9000;
    }
    if (debt > 0) { // pay the card
      const pay = Math.min(debt * 1.24, cardMonthly * 12);
      const interest = Math.min(debt * 0.24 * 0.55, pay); // approx avg balance through year
      interestPaid += interest; debt = Math.max(0, debt + interest - pay); save -= pay;
    }
    let childcare = 0;
    if (y >= 6 && y < 11) childcare = 700 * 12 * pw(1.03, y);
    save -= childcare;
    if (c.baby === "529" && y >= 6 && y < 24) college = college * 1.06 + 150 * 12;
    else college *= 1.04;

    // --- returns
    let r = mixRet;
    if (y === 5) r = -crashDrop;
    if ((y === 6 || y === 7)) r = rebound;
    if (c.crash === "sell" && y >= 5 && y < 8) {
      if (y === 5) { invested *= 1 - crashDrop * 0.85; } // sold partway down
      r = 0.03; // sits in cash, misses the rebound
      invested = invested * (1 + r);
    } else {
      invested = invested * (1 + (working ? r : r - 0.01));
    }
    cash *= 1.04;

    // --- put this year's savings to work: refill emergency fund first, then invest
    invested += k401;
    const efTarget = start.expenses * efTargetMonths * prices;
    if (save >= 0) { const toCash = Math.max(0, Math.min(save, efTarget - cash)); cash += toCash; invested += save - toCash; }
    else { cash += save; if (cash < 0) { invested += cash; cash = 0; } }

    // --- college years (child born year 6, college at 18 → years 24–27)
    if (y >= 24 && y < 28) {
      let bill = 0.5 * 28_000 * pw(1.045, y); // family's share (~half) of a public-college year
      const from529 = Math.min(college, bill); college -= from529; bill -= from529;
      const fromInv = Math.min(invested, bill); invested -= fromInv; bill -= fromInv;
    }
    // --- retirement withdrawals (simple: 4% of portfolio)
    if (!working) invested *= 0.96;

    prices *= 1 + inflation;
    const nw = cash + invested + college - debt;
    rows.push({ year: y + 1, age: age + 1, netWorth: nw, real: nw / prices, invested, cash, debt, college });
  }
  const at = (yr: number) => rows[Math.min(yr, rows.length - 1)];
  const retireRow = rows.find((r) => r.age === retireAge) || rows[rows.length - 1];
  return { rows, y10: at(10), y20: at(20), y30: at(30), retireRow, retireAge, interestPaid, missedMatch, choices: c };
}

export function describeChoices(c: Choices) {
  return DECISIONS.map((d) => ({ decision: d.title, choice: d.options.find((o) => o.id === c[d.id])?.label ?? "" }));
}
