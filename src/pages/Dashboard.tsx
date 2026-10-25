import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, GraduationCap, CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react";
import { useStore } from "../lib/store";
import { projectLife, simulate529 } from "../lib/calc";
import { money, compact, pct } from "../lib/format";
import { AskRipple, Card, EstimateTag, ResetButton, Segmented, Slider, Stat, tooltipStyle } from "../components/ui";
import { MODULES, moduleHref, nextLessonFor } from "../data/modules";
import { Moments, NextSteps, HowWeCalculate, Verified } from "../components/Action";
import { DAVE, DAVE_ASSUMPTIONS, CUSTOM_ASSUMPTIONS, isDaveProfile } from "../data/dave";
import { UserRound, Pencil } from "lucide-react";

const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

const MIXES = [
  { id: "safe", label: "🐢 Safer", sub: "Mostly bond index", r: 0.045 },
  { id: "balanced", label: "⚖️ Balanced", sub: "60% stock / 40% bond index", r: 0.06 },
  { id: "growth", label: "🌳 Growth", sub: "90% stock index (U.S. + intl)", r: 0.068 },
];

function Lever({ title, learn, children, note }: { title: string; learn: string; children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold">{title}</div>
        <a href={learn} className="text-[13px] font-semibold text-emerald-700 hover:underline">Learn →</a>
      </div>
      <div className="mt-2">{children}</div>
      {note && <div className="mt-1 text-[13px] text-slate-500">{note}</div>}
    </div>
  );
}

function Delta({ v, fmt, good = true }: { v: number; fmt: (n: number) => string; good?: boolean }) {
  if (Math.abs(v) < 0.5) return <span className="text-slate-400">no change</span>;
  const up = v > 0;
  return <span className={(up === good ? "text-emerald-300" : "text-orange-300") + " font-semibold"}>{up ? "+" : "−"}{fmt(Math.abs(v))}</span>;
}

function PlanBuilder() {
  const { profile: p, assumptions: a, set } = useStore();
  const isDave = isDaveProfile(p);
  const start = isDave ? DAVE_ASSUMPTIONS : CUSTOM_ASSUMPTIONS;
  const base = useMemo(() => projectLife(p, { ...a, contribPct: start.contribPct, hsaAnnual: start.hsaAnnual, cashRate: start.cashRate, accountType: start.accountType, returnRate: start.returnRate }), [p, a, start]);
  const now = useMemo(() => projectLife(p, a), [p, a]);
  const setA = (x: Partial<typeof a>) => set((s) => ({ assumptions: { ...s.assumptions, ...x } }));
  const tax = a.taxRate ?? 0.12;
  const mix = MIXES.reduce((best, m) => (Math.abs(m.r - a.returnRate) < Math.abs(best.r - a.returnRate) ? m : best), MIXES[1]);
  const lastAge = (r: typeof now) => r.depletedAge ?? 90;
  return (
    <Card className="mt-5 scroll-mt-20" id="plan">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">Build {isDave ? "Dave's" : "your"} plan</div>
          <h2 className="font-display text-2xl font-semibold">Five smart moves. See what each one changes.</h2>
          <p className="text-slate-500">Each move has a lesson. Try it here, or tap "Add to my plan" inside the lesson.</p>
        </div>
        <ResetButton onClick={() => setA({ contribPct: start.contribPct, hsaAnnual: start.hsaAnnual, cashRate: start.cashRate, accountType: start.accountType, returnRate: start.returnRate })} />
      </div>
      <div className="mt-4 grid gap-5 lg:grid-cols-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-3">
          <Lever title="🏦 Where savings live" learn="#/learn/bank" note={(a.cashRate ?? 0) >= 0.03 ? "Same FDIC safety, about 8× the interest." : "Earning less than inflation."}>
            <Segmented label="Savings account" value={(a.cashRate ?? 0) >= 0.03 ? "hysa" : "bank"} onChange={(v) => setA({ cashRate: v === "hysa" ? 0.04 : 0.005 })} options={[{ value: "bank", label: "Regular 0.5%" }, { value: "hysa", label: "High-yield 4%" }]} />
          </Lever>
          <Lever title="🧭 Retirement plan" learn="#/learn/k401" note={a.accountType === "roth" ? `Roth: no tax break now; tax-free later.` : `Saves about ${money(p.income * a.contribPct * tax)} in federal tax this year.`}>
            <Slider id="plan-401k" label="From each paycheck" value={Math.round(a.contribPct * 100)} min={0} max={20} onChange={(v) => setA({ contribPct: v / 100 })} format={(v) => v + "% of pay"} />
          </Lever>
          <Lever title="🩺 HSA" learn="#/learn/hsa" note={(a.hsaAnnual ?? 0) > 0 ? `Saves about ${money((a.hsaAnnual ?? 0) * (tax + 0.0765))} in tax this year. Needs a qualifying high-deductible health plan.` : "Needs a qualifying high-deductible health plan."}>
            <Slider id="plan-hsa" label="Per year" value={a.hsaAnnual ?? 0} min={0} max={8750} step={250} onChange={(v) => setA({ hsaAnnual: v })} format={money} />
          </Lever>
          <Lever title="⚖️ Roth or Traditional" learn="#/learn/accounts" note={a.accountType === "roth" ? "Pay tax now, withdraw tax-free." : "Tax break now, pay tax on withdrawals."}>
            <Segmented label="Account type" value={a.accountType ?? "traditional"} onChange={(v) => setA({ accountType: v })} options={[{ value: "traditional", label: "Traditional" }, { value: "roth", label: "Roth" }]} />
          </Lever>
          <div className="sm:col-span-2">
            <Lever title="📈 Index-fund mix for long-term money" learn="#/learn/invest" note={mix.sub + ". No stock-picking."}>
              <Segmented label="Investment mix" value={mix.id} onChange={(v) => setA({ returnRate: MIXES.find((m) => m.id === v)!.r })} options={MIXES.map((m) => ({ value: m.id, label: m.label }))} />
            </Lever>
          </div>
        </div>
        <div className="rounded-3xl hero-dark p-5 text-white lg:col-span-2">
          <div className="text-[13px] font-bold uppercase tracking-wider text-emerald-300">Your plan vs. where {isDave ? "Dave" : "you"} started</div>
          <div className="mt-4 space-y-4">
            <div><div className="text-[13px] text-slate-300">Taxes saved this year</div><div className="num text-2xl font-bold">{money(now.taxSavedNow)} <span className="text-base"><Delta v={now.taxSavedNow - base.taxSavedNow} fmt={money} /></span></div></div>
            <div><div className="text-[13px] text-slate-300">Saving each month now</div><div className="num text-2xl font-bold">{money(now.savingToday)} <span className="text-base"><Delta v={now.savingToday - base.savingToday} fmt={money} /></span></div></div>
            <div><div className="text-[13px] text-slate-300">Savings at {a.retireAge}</div><div className="num text-2xl font-bold">{compact(now.atRetire.nominal)} <span className="text-base"><Delta v={now.atRetire.nominal - base.atRetire.nominal} fmt={compact} /></span></div></div>
            <Verified dark source="IRS 2026 limits" />
            <div><div className="text-[13px] text-slate-300">Money lasts until</div><div className="num text-2xl font-bold">{now.depletedAge ? `Age ${now.depletedAge}` : "Past 90"} <span className="text-base"><Delta v={lastAge(now) - lastAge(base)} fmt={(n) => `${n} yr${n === 1 ? "" : "s"}`} /></span></div></div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MoneyBar({ label, bills, income, savings, gap }: { label: string; bills: number; income: number; savings: number; gap: number }) {
  const w = (v: number) => `${Math.max(0, (v / bills) * 100)}%`;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold">{label}</span>
        <span className="text-[14px] text-slate-500">Monthly bills <b className="num text-navy">{money(bills)}</b></span>
      </div>
      <div className="mt-2 flex h-12 overflow-hidden rounded-2xl bg-slate-100 text-[13px] font-bold text-white">
        {income > 0 && <motion.div initial={{ width: 0 }} animate={{ width: w(income) }} className="flex items-center justify-center bg-navy px-1" title="Pension + Social Security">{income / bills > 0.18 && money(income)}</motion.div>}
        {savings > 0 && <motion.div initial={{ width: 0 }} animate={{ width: w(savings) }} className="flex items-center justify-center bg-emerald-500 px-1" title="From savings">{savings / bills > 0.12 && money(savings)}</motion.div>}
        {gap > 0 && <motion.div initial={{ width: 0 }} animate={{ width: w(gap) }} className="flex items-center justify-center bg-coral px-1" title="Not covered">{gap / bills > 0.12 && money(gap)}</motion.div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile: p, assumptions: a, set, done } = useStore();
  const proj = useMemo(() => projectLife(p, a), [p, a]);
  const setA = (x: Partial<typeof a>) => set((s) => ({ assumptions: { ...s.assumptions, ...x } }));
  const [showAssume, setShowAssume] = useState(false);
  const who = p.name || "You";
  const his = p.name ? `${p.name}'s` : "your";
  const nextLesson = nextLessonFor(done);
  const isDave = isDaveProfile(p);
  const kids = (p.kids || []).filter((k) => k.age < 18).map((k) => ({ ...k, r: simulate529({ childAge: k.age, collegeAge: 18, costNow: DAVE.collegeCostToday, tuitionInflation: 0.04, monthly: 0, returnRate: 0.04, balance: 0 }) }));

  // The one question: after retirement, are the monthly bills covered?
  const first = proj.firstRetire;
  const billsAtRetire = first?.expensesMonthly ?? p.expenses;
  const incomeAtRetire = first?.incomeMonthly ?? 0;
  const savedAtRetire = proj.atRetire.nominal;
  const runsOut = proj.depletedAge;
  const shortAt = runsOut ? proj.flows.find((f) => f.age === runsOut + 1) : null;
  const ok = !runsOut;
  const years = Math.max(1, 90 - a.retireAge);
  const coveredYears = runsOut ? Math.max(0, runsOut - a.retireAge) : years;

  const insights = [
    `${who} saves about ${money(proj.savingToday)} a month today and could have about ${compact(savedAtRetire)} saved by age ${a.retireAge}.`,
    `Prices rise ${pct(proj.inflation)} a year, so ${his} ${money(p.expenses)} of monthly bills could cost about ${money(billsAtRetire)} a month at ${a.retireAge}. Pension + Social Security cover about ${money(incomeAtRetire)}; savings must cover the other ${money(billsAtRetire - incomeAtRetire)}.`,
    runsOut ? `At that pace, savings run out around age ${runsOut}. After that, about ${money(shortAt?.shortfallMonthly ?? 0)} a month of bills would not be covered.` : `At that pace, savings last past age 90.`,
  ];

  return (
    <div>
      {/* Scenario switcher */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-card ring-1 ring-slate-200">
        <div className="flex items-center gap-2 text-[15px]">
          <span className="text-xl">{isDave ? "🧹" : "🙋"}</span>
          <span>Viewing <b>{isDave ? "Dave's demo scenario" : `${p.name ? p.name + "'s" : "your"} own numbers`}</b></span>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={isDave ? "#/welcome" : "#/welcome?edit"} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50"><Pencil size={14} /> {isDave ? "Use my own numbers" : "Edit my numbers"}</a>
          {!isDave && <a href="#/welcome" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"><UserRound size={14} /> Try Dave's demo</a>}
        </div>
      </div>

      {/* Hero: the answer, in one picture */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hero-dark rounded-[2rem] p-6 sm:p-8 text-white overflow-hidden">
        <div className="text-lg text-slate-300">Will {isDave ? "Dave" : "you"} have enough money to pay the bills after retiring at {a.retireAge}?</div>
        <h1 className="mt-1 flex items-start gap-3 font-display text-3xl sm:text-5xl font-semibold leading-tight">
          {ok ? <CheckCircle2 className="mt-1 h-9 w-9 shrink-0 text-emerald-400" /> : <AlertTriangle className="mt-1 h-9 w-9 shrink-0 text-amber" />}
          <span>{ok ? <>Yes. The money lasts past age 90.</> : <>Not quite. Savings run out at <span className="text-amber">age {runsOut}</span>.</>}</span>
        </h1>

        {/* Retirement years: covered vs not */}
        <div className="mt-6">
          <div className="flex h-14 overflow-hidden rounded-2xl ring-1 ring-white/10">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(coveredYears / years) * 100}%` }} transition={{ duration: 0.8 }} className="flex items-center justify-center bg-emerald-500 font-semibold">
              {coveredYears / years > 0.18 && `✓ Bills covered · ${a.retireAge}–${runsOut ?? 90}`}
            </motion.div>
            {!ok && <div className="flex flex-1 items-center justify-center bg-coral font-semibold">{(years - coveredYears) / years > 0.2 && `✗ Not enough · ${runsOut}–90`}</div>}
          </div>
          <div className="mt-1.5 flex justify-between text-[13px] text-slate-400"><span>Retire at {a.retireAge}</span><span>Age 90</span></div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/[.07] p-4 ring-1 ring-white/10">
            <div className="text-[13px] font-semibold uppercase tracking-wider text-emerald-300">💰 Saving now</div>
            <div className="mt-1 flex flex-wrap items-baseline gap-2"><span className="num text-2xl font-bold">{money(proj.savingToday)}/mo</span><ArrowRight size={16} className="text-slate-400" /><span className="num text-2xl font-bold">{compact(savedAtRetire)}</span><span className="text-slate-300">by {a.retireAge}</span></div>
          </div>
          <div className="rounded-2xl bg-white/[.07] p-4 ring-1 ring-white/10">
            <div className="text-[13px] font-semibold uppercase tracking-wider text-orange-300">🧾 Monthly bills</div>
            <div className="mt-1 flex flex-wrap items-baseline gap-2"><span className="num text-2xl font-bold">{money(p.expenses)}</span><span className="text-slate-300">today</span><ArrowRight size={16} className="text-slate-400" /><span className="num text-2xl font-bold">{money(billsAtRetire)}</span><span className="text-slate-300">at {a.retireAge}</span></div>
            <div className="mt-1 text-[13px] text-slate-400">Prices rise about {pct(proj.inflation)} a year</div>
          </div>
        </div>
        <div className="mt-3"><Verified dark source="fixed formulas, not AI guesses" /></div>
      </motion.div>

      <Moments />
      <PlanBuilder />
      <NextSteps />

      {/* Where the monthly bill money comes from */}
      <Card className="mt-5">
        <h2 className="font-display text-2xl font-semibold">Where {isDave ? "Dave's" : "your"} monthly bill money comes from</h2>
        <div className="mt-3 flex flex-wrap gap-4 text-[14px]">
          <span className="flex items-center gap-2"><i className="h-3.5 w-3.5 rounded bg-navy" /> Pension + Social Security</span>
          <span className="flex items-center gap-2"><i className="h-3.5 w-3.5 rounded bg-emerald-500" /> Savings</span>
          <span className="flex items-center gap-2"><i className="h-3.5 w-3.5 rounded bg-coral" /> Not covered</span>
        </div>
        <div className="mt-5 space-y-5">
          <MoneyBar label={`At ${a.retireAge}, when ${isDave ? "Dave retires" : "you retire"}`} bills={billsAtRetire} income={incomeAtRetire} savings={first?.fromSavingsMonthly ?? 0} gap={first?.shortfallMonthly ?? 0} />
          {shortAt && <MoneyBar label={`At ${shortAt.age}, after savings run out`} bills={shortAt.expensesMonthly} income={shortAt.incomeMonthly} savings={shortAt.fromSavingsMonthly} gap={shortAt.shortfallMonthly} />}
        </div>

        <button onClick={() => setShowAssume(!showAssume)} aria-expanded={showAssume} className="mt-6 flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left font-semibold ring-1 ring-slate-200">
          Change the assumptions <ChevronDown size={18} className={showAssume ? "rotate-180 transition" : "transition"} />
        </button>
        {showAssume && (
          <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
            <Slider label="Retirement age" value={a.retireAge} min={Math.max(55, p.age + 1)} max={75} onChange={(v) => setA({ retireAge: v })} format={(v) => "Age " + v} />
            <Slider label="Prices rise each year (inflation)" value={Math.round(a.inflation * 1000) / 10} min={0} max={8} step={0.5} onChange={(v) => setA({ inflation: v / 100 })} format={(v) => v + "%"} />
            <Slider label="Pension + Social Security (rough % of pay)" value={Math.round(a.ssReplacement * 100)} min={0} max={80} onChange={(v) => setA({ ssReplacement: v / 100 })} format={(v) => v + "%"} help="Social Security alone is often 35–40%. Check yours at ssa.gov." />
            <Slider label="Monthly bills today" value={p.expenses} min={500} max={15000} step={100} onChange={(v) => set((s) => ({ profile: { ...s.profile, expenses: v } }))} format={money} />
            <div className="sm:col-span-2 flex justify-end"><ResetButton onClick={() => set({ assumptions: isDave ? { ...DAVE_ASSUMPTIONS } : { ...CUSTOM_ASSUMPTIONS } })} /></div>
          </div>
        )}
        <HowWeCalculate />
      </Card>

      {kids.length > 0 && (
        <Card className="mt-5">
          <div className="flex items-center gap-2 font-semibold"><GraduationCap className="text-sky-600" /> Big costs ahead: college</div>
          <p className="text-[14px] text-slate-500">A public in-state university costs about {money(DAVE.collegeCostToday)} a year today, before financial aid, and prices rise about 4% a year.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {kids.map((k, i) => (
              <div key={k.name + i} className="rounded-2xl bg-sky-soft p-4">
                <div className="text-[13px] font-semibold text-sky-800">{k.name} starts in {k.r.years} {k.r.years === 1 ? "year" : "years"}</div>
                <div className="num font-display text-2xl font-semibold text-navy">{compact(k.r.totalCost)}</div>
                <div className="text-[13px] text-slate-600">for 4 years</div>
              </div>
            ))}
          </div>
          <a href="#/learn/college" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Plan for it in the College lesson <ArrowRight size={14} /></a>
        </Card>
      )}

      <a href={moduleHref(nextLesson.id)} className="group mt-5 flex items-center gap-4 rounded-3xl bg-emerald-500 p-5 text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 text-3xl">{nextLesson.emoji}</span>
        <span className="flex-1">
          <span className="block text-[13px] font-bold uppercase tracking-wider text-emerald-100">{done.length ? `Continue learning · ${done.length} of ${MODULES.length} lessons done` : "Start learning"} <BookOpen size={13} className="inline" /></span>
          <span className="block font-display text-xl sm:text-2xl font-semibold">{nextLesson.title}</span>
          <span className="text-emerald-50">Learn the idea, then try it on a real-world simulation ready for you.</span>
        </span>
        <ArrowRight className="transition group-hover:translate-x-1" />
      </a>

      <div className="mt-5">
        <AskRipple
          ctx={{ page: "dashboard", module: "Retirement check: will savings cover the bills?", inputs: { age: p.age, income: p.income, monthlyBillsToday: p.expenses, savings: p.savings, retirementSaved: p.retirement, ...a }, results: { savingPerMonthToday: Math.round(proj.savingToday), savedByRetirement: Math.round(savedAtRetire), monthlyBillsAtRetirement: Math.round(billsAtRetire), pensionPlusSocialSecurityMonthlyAtRetirement: Math.round(incomeAtRetire), gapFromSavingsMonthly: Math.round(billsAtRetire - incomeAtRetire), savingsRunOutAtAge: runsOut, uncoveredMonthlyAfterThat: shortAt ? Math.round(shortAt.shortfallMonthly) : 0 }, insights }}
          prompts={isDave ? ["Will Dave have enough to retire?", "Why do his bills almost double?", "What would help the most?"] : ["Will I have enough to retire?", "Why do my bills grow so much?", "What would help me the most?"]}
          title="Ask Next Step" />
      </div>
    </div>
  );
}
