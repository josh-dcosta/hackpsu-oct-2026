export type ModuleMeta = { id: string; letter: string; title: string; sim: string; emoji: string; blurb: string; minutes: number; stages: string[]; badge?: string; color: string; core?: number };
export const MODULES: ModuleMeta[] = [
  { id: "inflation", letter: "A", title: "Understanding Inflation", sim: "Inflation Time Machine", emoji: "⏳", blurb: "Why $100 buys less every year, and what that means for you.", minutes: 4, stages: ["25–35", "35–45", "45–55", "55–65"], badge: "inflation", color: "#F59E0B" },
  { id: "life", letter: "B", title: "Life Stages & Rising Expenses", sim: "Life Expense Simulator", emoji: "🏡", blurb: "How costs change from first apartment to retirement.", minutes: 4, stages: ["25–35", "35–45", "45–55"], color: "#0EA5E9" },
  { id: "saving", letter: "C", title: "Saving vs. Investing", sim: "Savings vs. Investing Simulator", emoji: "🌱", blurb: "Why a bank account alone may not keep up.", minutes: 4, stages: ["25–35", "35–45"], badge: "compound", color: "#10B981" },
  { id: "bank", letter: "D", title: "Emergency Fund, FDIC & Compounding", sim: "Compounding", emoji: "🏦", blurb: "How big your emergency fund should be, how it's protected, and how it grows.", minutes: 5, stages: ["25–35", "35–45", "45–55", "55–65"], badge: "compound", color: "#6366F1", core: 1 },
  { id: "k401", letter: "E", title: "401(k) Retirement Planning", sim: "401(k) Growth Simulator", emoji: "🧭", blurb: "Employer match, compounding, and the power of starting early.", minutes: 5, stages: ["25–35", "35–45", "45–55", "55–65"], badge: "retirement", color: "#10B981" },
  { id: "accounts", letter: "F", title: "Roth IRA vs. Traditional IRA", sim: "Retirement Account Simulator", emoji: "⚖️", blurb: "Pay taxes now or later? Pick the right account for your retirement savings.", minutes: 5, stages: ["25–35", "35–45", "45–55", "55–65"], color: "#8B5CF6", core: 2 },
  { id: "hsa", letter: "G", title: "Health Savings Accounts", sim: "HSA Triple Tax Simulator", emoji: "🩺", blurb: "The account with three possible tax breaks.", minutes: 4, stages: ["35–45", "45–55", "55–65"], color: "#F97361" },
  { id: "college", letter: "H", title: "529 College Savings", sim: "College Savings Simulator", emoji: "🎓", blurb: "How much to save each month for a child's education.", minutes: 4, stages: ["25–35", "35–45"], color: "#0EA5E9" },
  { id: "invest", letter: "I", title: "Invest Safely with Index Funds", sim: "One stock vs. index funds", emoji: "📈", blurb: "Skip stock-picking. Grow long-term money with low-cost, diversified index funds.", minutes: 5, stages: ["25–35", "35–45", "45–55", "55–65"], badge: "diversify", color: "#00377B", core: 3 },
  { id: "debt", letter: "J", title: "Paying Off Debt", sim: "Debt Payoff Simulator", emoji: "🔨", blurb: "Credit cards, store cards and car loans: pay them off faster for less.", minutes: 5, stages: ["25–35", "35–45", "45–55", "55–65"], badge: "debt", color: "#F97361" },
];
export const CORE = MODULES.filter((m) => m.core).sort((a, b) => (a.core ?? 0) - (b.core ?? 0));
export const EXTRA = MODULES.filter((m) => !m.core);
export const nextLessonFor = (done: string[]) => CORE.find((m) => !done.includes(m.id)) || EXTRA.find((m) => !done.includes(m.id)) || CORE[0];
export const moduleHref = (id: string) => `#/learn/${id}`;
