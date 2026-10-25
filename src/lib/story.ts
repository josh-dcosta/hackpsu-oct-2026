// "Choose Your Financial Future" — Dave's story. A deterministic life simulator driven by choices.
// Dave, 50, head custodian at a PA high school. Household income $64k (Dave $46k + Linda $18k part-time).
// $6,000 saved, $22,000 in retirement investments, plus a PSERS pension (not counted in net worth).
const pw = Math.pow;

export type Option = { id: string; label: string; detail: string; emoji: string };
export type Decision = { id: string; year: number; kind: "plan" | "event"; title: string; story: string; options: Option[]; def: string; alt: Record<string, string>; lesson: string };

export const DECISIONS: Decision[] = [
  {
    id: "save", year: 0, kind: "plan", title: "Your monthly savings habit",
    story: "After the mortgage, groceries and bills, money is tight. How much do you set aside each month?",
    options: [
      { id: "low", label: "$50 / month", detail: "Whatever's left over", emoji: "🪙" },
      { id: "mid", label: "$150 / month", detail: "A steady habit", emoji: "⚖️" },
      { id: "high", label: "$300 / month", detail: "Trim cable, takeout & extras", emoji: "🌱" },
    ], def: "mid", alt: { low: "high", mid: "low", high: "low" },
    lesson: "Even small, automatic amounts add up, and they keep surprise bills from turning into debt.",
  },
  {
    id: "k457", year: 0, kind: "plan", title: "Extra retirement savings",
    story: "Your PSERS pension contribution comes out automatically. Your district also offers a 457(b)/403(b). Do you add extra from Dave's paycheck?",
    options: [
      { id: "0", label: "Nothing extra", detail: "Rely on pension + Social Security", emoji: "🛑" },
      { id: "3", label: "3% of Dave's pay", detail: "About $115 / month", emoji: "🎯" },
      { id: "6", label: "6% of Dave's pay", detail: "About $230 / month", emoji: "🚀" },
    ], def: "3", alt: { "0": "6", "3": "0", "6": "0" },
    lesson: "With 15+ working years left, extra savings still have time to grow, and age 50+ catch-up limits allow more.",
  },
  {
    id: "bank", year: 0, kind: "plan", title: "Where your $6,000 lives",
    story: "Your $6,000 cushion sits in a regular bank account earning 0.5%. Inflation is about 3%. Do you move it?",
    options: [
      { id: "regular", label: "Leave it at the bank", detail: "0.5% interest", emoji: "🏦" },
      { id: "hysa", label: "Move to high-yield savings", detail: "~4% interest, FDIC-insured", emoji: "📈" },
    ], def: "hysa", alt: { regular: "hysa", hysa: "regular" },
    lesson: "Money earning less than inflation quietly loses buying power. Same safety, better rate, about 15 minutes of paperwork.",
  },
  {
    id: "mix", year: 0, kind: "plan", title: "Your retirement investment mix",
    story: "Your $22,000 in retirement investments needs a mix. Retirement is roughly 15 years away.",
    options: [
      { id: "safe", label: "Mostly bonds", detail: "Smoother ride, slower growth", emoji: "🐢" },
      { id: "balanced", label: "60% stocks / 40% bonds", detail: "A classic balance", emoji: "⚖️" },
      { id: "growth", label: "90% stocks", detail: "More growth, bigger drops", emoji: "🐎" },
    ], def: "balanced", alt: { safe: "growth", balanced: "growth", growth: "safe" },
    lesson: "Closer to retirement, a big drop has less time to recover. Many people slowly add bonds as they near it.",
  },
  {
    id: "emma", year: 1, kind: "event", title: "Emma heads to college 🎓",
    story: "Year 1: Emma graduates high school. After financial aid (Pell & PA State Grant) and her own federal loan, what will your family's share be?",
    options: [
      { id: "state", label: "PA state university", detail: "Family share ≈ $9,000 / yr", emoji: "🏫" },
      { id: "cc", label: "Community college → state", detail: "≈ $2,500 / yr, then $9,000 / yr", emoji: "🔁" },
      { id: "private", label: "Private college", detail: "Family share ≈ $18,000 / yr", emoji: "🏛️" },
    ], def: "state", alt: { state: "private", cc: "private", private: "cc" },
    lesson: "Where a degree is earned changes the price far more than most other choices. Always compare net price after aid.",
  },
  {
    id: "furnace", year: 2, kind: "event", title: "The furnace quits in January 🥶",
    story: "Year 2: a Pennsylvania winter and a $7,000 furnace replacement. How do you pay?",
    options: [
      { id: "cash", label: "Use savings", detail: "Then rebuild the cushion", emoji: "🛟" },
      { id: "card", label: "Credit card", detail: "22% APR, paid over 3 years", emoji: "💳" },
    ], def: "cash", alt: { cash: "card", card: "cash" },
    lesson: "Using an emergency fund avoids paying 22% interest. That's exactly what the cushion is for.",
  },
  {
    id: "raise", year: 3, kind: "event", title: "New union contract: +4% raise 🎉",
    story: "Year 3: the support-staff contract comes through. What happens to the extra money?",
    options: [
      { id: "spend", label: "Spend it", detail: "Things have been tight", emoji: "🛒" },
      { id: "half", label: "Save half of it", detail: "Enjoy some, grow some", emoji: "✌️" },
    ], def: "half", alt: { spend: "half", half: "spend" },
    lesson: "Saving part of every raise grows savings without cutting today's lifestyle.",
  },
  {
    id: "jake", year: 3, kind: "event", title: "Jake's turn 🧰",
    story: "Year 3: Jake graduates. He loves fixing things. What path does he take?",
    options: [
      { id: "trade", label: "Trade / technical school", detail: "2 years, family share ≈ $6,000 / yr", emoji: "🔧" },
      { id: "state", label: "PA state university", detail: "Family share ≈ $9,000 / yr", emoji: "🏫" },
      { id: "private", label: "Private college", detail: "Family share ≈ $18,000 / yr", emoji: "🏛️" },
    ], def: "trade", alt: { trade: "private", state: "private", private: "trade" },
    lesson: "Skilled trades can lead to good careers with less debt. The right path depends on the kid, not just the price.",
  },
  {
    id: "crash", year: 5, kind: "event", title: "The market drops sharply 📉",
    story: "Year 5: stocks fall hard and the news is scary. You're 55. What do you do with your retirement investments?",
    options: [
      { id: "hold", label: "Stay the course", detail: "Keep investing as planned", emoji: "🧘" },
      { id: "sell", label: "Sell and wait in cash", detail: "Get back in after 3 years", emoji: "🏃" },
    ], def: "hold", alt: { hold: "sell", sell: "hold" },
    lesson: "Historically, some of the best days came right after the worst. Selling after a drop can lock in the loss, though nothing is guaranteed.",
  },
  {
    id: "retire", year: 30, kind: "plan", title: "When does Dave retire?",
    story: "Last choice: PSERS and Social Security both pay more the longer you work. When do you stop?",
    options: [
      { id: "62", label: "Age 62", detail: "More free years, smaller checks", emoji: "🏖️" },
      { id: "65", label: "Age 65", detail: "Medicare starts", emoji: "🩺" },
      { id: "67", label: "Age 67", detail: "Full Social Security age", emoji: "📅" },
    ], def: "65", alt: { "62": "67", "65": "62", "67": "62" },
    lesson: "Each extra working year adds savings, gives growth more time, and leaves one less year to fund. Pension and Social Security checks also grow.",
  },
];

export type Choices = Record<string, string>;
export const defaultChoices = (): Choices => Object.fromEntries(DECISIONS.map((d) => [d.id, d.def]));
export const altChoices = (c: Choices): Choices => Object.fromEntries(DECISIONS.map((d) => [d.id, d.alt[c[d.id] ?? d.def]]));

export type StoryStart = { age: number; salary: number; davePay: number; savings: number; retirement: number; expenses: number };
export const STORY_START: StoryStart = { age: 50, salary: 64_000, davePay: 46_000, savings: 6_000, retirement: 22_000, expenses: 3_600 };
export const STORY_CHARACTER = "Dave, 50, head custodian at a PA high school. Household income $64,000 (Dave $46,000 + Linda $18,000 part-time). $6,000 saved, $22,000 invested for retirement, plus a PSERS pension (not counted). Kids Emma (17) and Jake (15).";

export type StoryRow = { year: number; age: number; netWorth: number; real: number; invested: number; cash: number; debt: number; college: number };

// Family's yearly out-of-pocket college share in today's dollars, by year from now
function collegeBill(c: Choices, y: number) {
  let bill = 0;
  const e = y - 1; // Emma: years 1–4
  if (e >= 0 && e < 4) bill += c.emma === "private" ? 18_000 : c.emma === "cc" ? (e < 2 ? 2_500 : 9_000) : 9_000;
  const j = y - 3; // Jake: years 3–6 (trade: 2 years)
  if (j >= 0 && j < 4) bill += c.jake === "private" ? 18_000 : c.jake === "state" ? 9_000 : j < 2 ? 6_000 : 0;
  return bill * pw(1.04, y); // college costs rise ~4%/yr
}

export function simulateStory(c0: Choices, start: StoryStart = STORY_START) {
  const c = { ...defaultChoices(), ...c0 };
  const retireAge = Number(c.retire);
  const horizon = 30;
  const mixRet = { safe: 0.045, balanced: 0.06, growth: 0.07 }[c.mix as "safe" | "balanced" | "growth"];
  const crashDrop = { safe: 0.1, balanced: 0.22, growth: 0.32 }[c.mix as "safe" | "balanced" | "growth"];
  const rebound = { safe: 0.08, balanced: 0.15, growth: 0.22 }[c.mix as "safe" | "balanced" | "growth"];
  const monthlySave = { low: 50, mid: 150, high: 300 }[c.save as "low" | "mid" | "high"];
  const pct = Number(c.k457) / 100;
  const cashRate = c.bank === "hysa" ? 0.04 : 0.005;

  let salary = start.salary, davePay = start.davePay;
  let cash = start.savings, invested = start.retirement;
  let card = 0, loans = 0, interestPaid = 0, collegePaid = 0, prices = 1;
  const rows: StoryRow[] = [{ year: 0, age: start.age, netWorth: cash + invested, real: cash + invested, invested, cash, debt: 0, college: 0 }];
  const cardYearly = ((7000 * 0.22 / 12) / (1 - pw(1 + 0.22 / 12, -36))) * 12;

  for (let y = 0; y < horizon; y++) {
    const age = start.age + y;
    const working = age < retireAge;
    if (y === 3) { salary *= 1.04; davePay *= 1.04; }
    let save = working ? monthlySave * 12 * pw(1.025, y) : 0;
    if (working && y >= 3 && c.raise === "half") save += (start.salary * 0.04 * 0.78) / 2 * pw(1.025, y - 3);
    const extra = working ? davePay * pct : 0;

    // returns on what's already invested
    let r = mixRet;
    if (y === 5) r = -crashDrop;
    if (y === 6 || y === 7) r = rebound;
    if (c.crash === "sell" && y >= 5 && y < 8) { if (y === 5) invested *= 1 - crashDrop * 0.85; invested *= 1.03; }
    else invested *= 1 + (working ? r : r - 0.01);
    cash *= 1 + cashRate;
    invested += extra;

    // pay a bill: from this year's savings, then the cash cushion, then investments; optionally borrow the rest
    let avail = save;
    const pay = (amt: number, canBorrow: boolean) => {
      const a = Math.min(avail, amt); avail -= a; amt -= a;
      const b = Math.min(cash, amt); cash -= b; amt -= b;
      if (amt > 0 && canBorrow) { loans += amt; return 0; }
      const i = Math.min(invested, amt); invested -= i; amt -= i;
      return amt; // unpaid
    };
    // furnace
    if (y === 2) {
      if (c.furnace === "cash") { const fromCash = Math.min(cash, 7000); cash -= fromCash; card += 7000 - fromCash; }
      else card += 7000;
    }
    if (card > 0) { const int = card * 0.22 * 0.55; interestPaid += int; const due = Math.min(card + int, cardYearly); const unpaid = pay(due, false); card = Math.max(0, card + int - (due - unpaid)); }
    // college: family's share, borrowed (Parent PLUS, ~9%) if savings run out
    const bill = collegeBill(c, y); collegePaid += bill; if (bill) pay(bill, true);
    if (loans > 0) { const int = loans * 0.09; interestPaid += int; const due = Math.min(loans + int, loans * 0.156); loans = loans + int - due; } // payments squeeze the monthly budget

    // whatever's left of this year's savings: refill a 3-month cushion first, then invest
    if (avail > 0) { const efTarget = start.expenses * 3 * prices; const toCash = Math.max(0, Math.min(avail, efTarget - cash)); cash += toCash; invested += avail - toCash; }

    if (!working) invested *= 0.96; // retirement withdrawals (~4%/yr); pension & Social Security cover the rest
    prices *= 1.03;
    const nw = cash + invested - card - loans;
    rows.push({ year: y + 1, age: age + 1, netWorth: nw, real: nw / prices, invested, cash, debt: card + loans, college: collegePaid });
  }
  const at = (yr: number) => rows[Math.min(yr, rows.length - 1)];
  const retireRow = rows.find((r) => r.age === retireAge) || rows[rows.length - 1];
  return { rows, y10: at(10), y20: at(20), y30: at(30), retireRow, retireAge, interestPaid, collegePaid, choices: c };
}

export function describeChoices(c: Choices) {
  return DECISIONS.map((d) => ({ decision: d.title, choice: d.options.find((o) => o.id === c[d.id])?.label ?? "" }));
}
