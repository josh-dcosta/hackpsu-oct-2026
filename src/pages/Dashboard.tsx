import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, GraduationCap, CheckCircle2, AlertTriangle, ChevronDown, Target, BarChart3, Zap, Compass, ListChecks, HelpCircle } from "lucide-react";
import { WorkerIcon } from "../components/Brand";
import { useStore } from "../lib/store";
import { projectLife, simulate529 } from "../lib/calc";
import { money, compact, pct, axisMoney } from "../lib/format";
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

function Lever({ title, learn, children, note, hl }: { title: string; learn: string; children: React.ReactNode; note?: React.ReactNode; hl?: boolean }) {
  return (
    <motion.div animate={hl ? { scale: [1, 1.03, 1] } : { scale: 1 }} transition={{ duration: 0.6, repeat: hl ? 2 : 0 }}
      className={"rounded-2xl p-4 transition-colors " + (hl ? "bg-amber-soft ring-2 ring-amber shadow-lg shadow-amber/20" : "bg-slate-50")}>
      {hl && <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber px-2.5 py-0.5 text-[12px] font-bold text-navy">✨ Just changed</div>}
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold">{title}</div>
        <a href={learn} className="text-[13px] font-semibold text-emerald-700 hover:underline">Learn →</a>
      </div>
      <div className="mt-2">{children}</div>
      {note && <div className="mt-1 text-[13px] text-slate-500">{note}</div>}
    </motion.div>
  );
}

function Delta({ v, fmt, good = true }: { v: number; fmt: (n: number) => string; good?: boolean }) {
  if (Math.abs(v) < 0.5) return <span className="text-slate-400">no change</span>;
  const up = v > 0;
  return <span className={(up === good ? "text-emerald-300" : "text-orange-300") + " font-semibold"}>{up ? "+" : "−"}{fmt(Math.abs(v))}</span>;
}

function PlanBuilder() {
  const { profile: p, assumptions: a, set, highlight } = useStore();
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
          <Lever hl={highlight === "savings"} title="🏦 Where savings live" learn="#/learn/bank" note={(a.cashRate ?? 0) >= 0.03 ? "Same FDIC safety, about 8× the interest." : "Earning less than inflation."}>
            <Segmented label="Savings account" value={(a.cashRate ?? 0) >= 0.03 ? "hysa" : "bank"} onChange={(v) => setA({ cashRate: v === "hysa" ? 0.04 : 0.005 })} options={[{ value: "bank", label: "Regular 0.5%" }, { value: "hysa", label: "High-yield 4%" }]} />
          </Lever>
          <Lever hl={highlight === "retire"} title="🧭 Retirement plan" learn="#/learn/k401" note={a.accountType === "roth" ? `Roth: no tax break now; tax-free later.` : `Saves about ${money(p.income * a.contribPct * tax)} in federal tax this year.`}>
            <Slider id="plan-401k" label="From each paycheck" value={Math.round(a.contribPct * 100)} min={0} max={20} onChange={(v) => setA({ contribPct: v / 100 })} format={(v) => v + "% of pay"} />
          </Lever>
          <Lever hl={highlight === "hsa"} title="🩺 HSA" learn="#/learn/hsa" note={(a.hsaAnnual ?? 0) > 0 ? `Saves about ${money((a.hsaAnnual ?? 0) * (tax + 0.0765))} in tax this year. Needs a qualifying high-deductible health plan.` : "Needs a qualifying high-deductible health plan."}>
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
        <div className={"rounded-3xl hero-dark p-5 text-white lg:col-span-2 transition " + (highlight ? "ring-4 ring-amber" : "")}>
          {highlight === "age" && <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-amber px-2.5 py-0.5 text-[12px] font-bold text-navy">✨ Retirement age changed to {a.retireAge}</div>}
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
  const TABS = [
    { id: "answer", label: "The answer", icon: Target },
    { id: "money", label: "Where the money comes from", icon: BarChart3 },
    { id: "moments", label: "Life moments", icon: Zap },
    { id: "plan", label: "Build the plan", icon: Compass },
    { id: "steps", label: "Next steps", icon: ListChecks },
    ...((p.kids || []).some((k) => k.age < 18) ? [{ id: "college", label: "College", icon: GraduationCap }] : []),
  ];
  const [tab, setTab] = useState("answer");
  const tabsRef = useRef<HTMLDivElement>(null);
  const go = (id: string) => {
    setTab(id);
    // If we've scrolled past the tabs, bring the top of the new section into view
    const mark = tabsRef.current;
    if (!mark) return;
    const header = window.innerWidth >= 768 ? 64 : 104;
    const y = mark.getBoundingClientRect().top + window.scrollY - header;
    if (window.scrollY > y) window.scrollTo({ top: y, behavior: "smooth" });
  };
  // Life moments can send people to the plan tab to see what changed
  useEffect(() => {
    const on = (e: Event) => go((e as CustomEvent<string>).detail);
    window.addEventListener("ns-tab", on);
    return () => window.removeEventListener("ns-tab", on);
  }, []);
  const nextTab = TABS[TABS.findIndex((t) => t.id === tab) + 1];
  const kids = (p.kids || []).filter((k) => k.age < 18).map((k) => ({ ...k, r: simulate529({ childAge: k.age, collegeAge: 18, costNow: DAVE.collegeCostToday, tuitionInflation: 0.04, monthly: 0, returnRate: 0.04, balance: 0 }) }));

  // The one question: after retirement, are the monthly bills covered?
  const first = proj.firstRetire;
  const billsAtRetire = first?.expensesMonthly ?? p.expenses;
  const incomeAtRetire = first?.incomeMonthly ?? 0;
  const savedAtRetire = proj.atRetire.nominal;
  const runsOut = proj.depletedAge;
  const shortAt = runsOut ? proj.flows.find((f) => f.age === runsOut + 1) : null;
  const ok = !runsOut;
  const retireFlows = proj.flows.filter((f) => f.retired).map((f) => ({
    age: f.age, "Monthly bills": Math.round(f.expensesMonthly), "Pension + Social Security": Math.round(f.incomeMonthly),
    Savings: Math.round(f.fromSavingsMonthly), "Not covered": Math.round(f.shortfallMonthly),
  }));
  const years = Math.max(1, 90 - a.retireAge);
  const coveredYears = runsOut ? Math.max(0, runsOut - a.retireAge) : years;

  const insights = [
    `${who} saves about ${money(proj.savingToday)} a month today and could have about ${compact(savedAtRetire)} saved by age ${a.retireAge}.`,
    `Prices rise ${pct(proj.inflation)} a year, so ${his} ${money(p.expenses)} of monthly bills could cost about ${money(billsAtRetire)} a month at ${a.retireAge}. Pension + Social Security cover about ${money(incomeAtRetire)}; savings must cover the other ${money(billsAtRetire - incomeAtRetire)}.`,
    runsOut ? `At that pace, savings run out around age ${runsOut}. After that, about ${money(shortAt?.shortfallMonthly ?? 0)} a month of bills would not be covered.` : `At that pace, savings last past age 90.`,
  ];

  return (
    <div>
      {/* Who this is: the scenario at a glance */}
      <div className={"mb-4 rounded-3xl p-5 sm:p-6 shadow-card ring-1 " + (isDave ? "bg-gradient-to-br from-emerald-50 via-white to-amber-50 ring-emerald-200" : "bg-white ring-slate-200")}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {isDave ? <WorkerIcon size={64} /> : <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-navy text-3xl">🙋</span>}
            <div>
              <div className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">{isDave ? "You're viewing the demo scenario" : "You're viewing your own numbers"}</div>
              <div className="font-display text-2xl sm:text-3xl font-semibold">{isDave ? "Meet Dave" : p.name ? `${p.name}'s plan` : "Your plan"}</div>
              <p className="mt-1 max-w-2xl text-[15px] text-slate-600">{isDave
                ? `Head custodian at a Pennsylvania public high school, earning about $${DAVE.hourly} an hour. His wife Linda works part-time. Every number below is Dave's, already filled in.`
                : `${p.job ? p.job + ". " : ""}Every number below comes from the answers you gave. Change them anytime.`}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={isDave ? "#/welcome" : "#/welcome?edit"} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50"><Pencil size={14} /> {isDave ? "Use my own numbers" : "Edit my numbers"}</a>
            {!isDave && <a href="#/welcome" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"><UserRound size={14} /> Try the demo</a>}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["Age", `${p.age}`],
            ["Household income", `${money(p.income)}/yr`],
            ["Monthly bills", money(p.expenses)],
            ["Savings", money(p.savings)],
            ["Retirement savings", money(p.retirement)],
            ...((p.kids || []).length ? [[(p.kids || []).length === 1 ? "Child" : "Children", (p.kids || []).map((k) => `${k.name} ${k.age}`).join(", ")]] : []),
          ].map(([k, v]) => (
            <span key={k} className="rounded-xl bg-white px-3 py-1.5 text-[14px] ring-1 ring-slate-200"><span className="text-slate-500">{k} </span><b className="num text-navy">{v}</b></span>
          ))}
        </div>
      </div>

      {/* Section tabs */}
      <div ref={tabsRef} />
      <div className="sticky top-[104px] md:top-16 z-20 -mx-4 mb-4 scroll-mt-28 bg-paper/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <div role="tablist" aria-label="Dashboard sections" className="flex gap-1.5 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-card ring-1 ring-slate-200 [scrollbar-width:none]">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => go(t.id)}
              className={"inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-[14px] font-semibold transition " + (tab === t.id ? "bg-navy text-white" : "text-slate-600 hover:bg-slate-100")}>
              <t.icon size={16} className={tab === t.id ? "text-emerald-400" : ""} />{t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "answer" && <>
      {/* Hero: the answer, in one picture */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hero-dark rounded-[2rem] p-6 sm:p-8 text-white overflow-hidden">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30"><HelpCircle size={14} /> The big question</div>
        <h1 className="mt-3 font-display text-3xl sm:text-5xl font-semibold leading-tight">Will {isDave ? "Dave" : "you"} have enough money to pay the bills after retiring at {a.retireAge}?</h1>
        <p className="mt-2 text-[15px] text-slate-400">This panel follows {isDave ? "Dave's" : "your"} savings from today to age 90 and checks every year of retirement.</p>
        <div className={"mt-4 inline-flex items-start gap-2.5 rounded-2xl px-4 py-3 ring-1 " + (ok ? "bg-emerald-400/10 ring-emerald-400/30" : "bg-amber/10 ring-amber/30")}>
          {ok ? <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" /> : <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber" />}
          <span className="text-xl sm:text-2xl font-semibold"><span className="text-slate-300">Answer: </span>{ok ? <>Yes. The money lasts past age 90.</> : <>Not quite. Savings run out at <span className="text-amber">age {runsOut}</span>.</>}</span>
        </div>

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
            <div className="mt-3">
              <div className="flex items-center justify-between text-[13px]">
                <label htmlFor="hero-inflation" className="text-slate-300">Prices rise each year (inflation)</label>
                <span className="num rounded-lg bg-white/10 px-2 py-0.5 font-bold text-white">{(a.inflation * 100).toFixed(1).replace(/\.0$/, "")}%</span>
              </div>
              <input id="hero-inflation" type="range" className="rs" min={0} max={8} step={0.5} value={a.inflation * 100}
                style={{ ["--p" as string]: `${(a.inflation * 100 / 8) * 100}%` }}
                onChange={(e) => setA({ inflation: Number(e.target.value) / 100 })} aria-valuetext={`${a.inflation * 100}% a year`} />
              <div className="-mt-1 flex flex-wrap gap-1.5">
                {[2, 3, 4, 5, 6].map((v) => (
                  <button key={v} onClick={() => setA({ inflation: v / 100 })} aria-pressed={Math.abs(a.inflation * 100 - v) < 0.01}
                    className={"rounded-lg px-2.5 py-1 text-[12px] font-semibold " + (Math.abs(a.inflation * 100 - v) < 0.01 ? "bg-orange-300 text-navy" : "bg-white/10 text-slate-200 hover:bg-white/20")}>{v}%</button>
                ))}
                <span className="self-center text-[11px] text-slate-400">U.S. long-run average ≈ 3%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3"><Verified dark source="fixed formulas, not AI guesses" /></div>
      </motion.div>
      </>}

      {/* Where the monthly bill money comes from */}
      {tab === "money" && <Card>
        <h2 className="font-display text-2xl font-semibold">Where {isDave ? "Dave's" : "your"} monthly bill money comes from</h2>
        <div className="mt-3 flex flex-wrap gap-4 text-[14px]">
          <span className="flex items-center gap-2"><i className="h-3.5 w-3.5 rounded bg-navy" /> Pension + Social Security</span>
          <span className="flex items-center gap-2"><i className="h-3.5 w-3.5 rounded bg-emerald-500" /> Savings</span>
          <span className="flex items-center gap-2"><i className="h-3.5 w-3.5 rounded bg-coral" /> Not covered</span>
        </div>
        <p className="mt-2 text-[14px] text-slate-500">Each bar is one year of retirement. The orange line is what the monthly bills cost that year, rising with inflation.</p>
        <div className="mt-3 h-72 sm:h-80">
          <ResponsiveContainer>
            <ComposedChart data={retireFlows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="age" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Age ${l} · per month`} formatter={(v, n) => [money(Number(v)), n]} />
              <Bar dataKey="Pension + Social Security" stackId="a" fill="#0F172A" animationDuration={600} />
              <Bar dataKey="Savings" stackId="a" fill="#10B981" animationDuration={600} />
              <Bar dataKey="Not covered" stackId="a" fill="#F97361" radius={[6, 6, 0, 0]} animationDuration={600} />
              <Line dataKey="Monthly bills" stroke="#F59E0B" strokeWidth={3} dot={false} type="monotone" animationDuration={600} />
              {runsOut && <ReferenceLine x={runsOut} stroke="#F97361" strokeDasharray="4 4" label={{ value: "Savings run out", position: "insideTopLeft", fill: "#C2410C", fontSize: 12 }} />}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-[13px] text-slate-600"><span className="flex items-center gap-2"><i className="h-0.5 w-5 bg-amber" /> Monthly bills</span></div>
        <div className="mt-6 text-[13px] font-bold uppercase tracking-wider text-slate-500">Up close</div>
        <div className="mt-3 space-y-5">
          <MoneyBar label={`At ${a.retireAge}, when ${isDave ? "Dave retires" : "you retire"}`} bills={billsAtRetire} income={incomeAtRetire} savings={first?.fromSavingsMonthly ?? 0} gap={first?.shortfallMonthly ?? 0} />
          {shortAt && <MoneyBar label={`At ${shortAt.age}, after savings run out`} bills={shortAt.expensesMonthly} income={shortAt.incomeMonthly} savings={shortAt.fromSavingsMonthly} gap={shortAt.shortfallMonthly} />}
        </div>

        <button onClick={() => setShowAssume(!showAssume)} aria-expanded={showAssume} className="mt-6 flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left font-semibold ring-1 ring-slate-200">
          Change the assumptions <ChevronDown size={18} className={showAssume ? "rotate-180 transition" : "transition"} />
        </button>
        {showAssume && (
          <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
            <Slider label="Retirement age" value={a.retireAge} min={Math.max(55, p.age + 1)} max={75} onChange={(v) => setA({ retireAge: v })} format={(v) => "Age " + v} />
            <Slider label="Pension + Social Security (rough % of pay)" value={Math.round(a.ssReplacement * 100)} min={0} max={80} onChange={(v) => setA({ ssReplacement: v / 100 })} format={(v) => v + "%"} help="Social Security alone is often 35–40%. Check yours at ssa.gov." />
            <Slider label="Monthly bills today" value={p.expenses} min={500} max={15000} step={100} onChange={(v) => set((s) => ({ profile: { ...s.profile, expenses: v } }))} format={money} />
            <div className="sm:col-span-2 flex justify-end"><ResetButton onClick={() => set({ assumptions: isDave ? { ...DAVE_ASSUMPTIONS } : { ...CUSTOM_ASSUMPTIONS } })} /></div>
          </div>
        )}
        <HowWeCalculate />
      </Card>}

      {tab === "moments" && <div className="-mt-5"><Moments /></div>}
      {tab === "plan" && <div className="-mt-5"><PlanBuilder /></div>}
      {tab === "steps" && <div className="-mt-5"><NextSteps /></div>}

      {tab === "college" && kids.length > 0 && (
        <Card>
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

      {/* Next section */}
      {nextTab && (
        <div className="mt-5 flex justify-center">
          <button onClick={() => go(nextTab.id)} className="inline-flex items-center gap-2 rounded-2xl bg-navy px-5 py-3 font-semibold text-white hover:bg-navy-800">Next: {nextTab.label} <ArrowRight size={17} /></button>
        </div>
      )}

    </div>
  );
}
