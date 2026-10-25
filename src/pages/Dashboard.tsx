import { useMemo } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, BookOpen, GraduationCap, PlayCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { useStore } from "../lib/store";
import { projectLife, simulate529 } from "../lib/calc";
import { money, compact, axisMoney, pct } from "../lib/format";
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

export default function Dashboard() {
  const { profile: p, assumptions: a, set, done, xp, simple } = useStore();
  const proj = useMemo(() => projectLife(p, a), [p, a]);
  const setA = (x: Partial<typeof a>) => set((s) => ({ assumptions: { ...s.assumptions, ...x } }));
  const who = p.name || "You";
  const his = p.name ? `${p.name}'s` : "your";
  const nextLesson = nextLessonFor(done);
  const recs = MODULES.filter((m) => m.stages.includes(p.ageRange) && !done.includes(m.id)).slice(0, 3);
  const isDave = isDaveProfile(p);
  const kids = (p.kids || []).filter((k) => k.age < 18).map((k) => ({ ...k, r: simulate529({ childAge: k.age, collegeAge: 18, costNow: DAVE.collegeCostToday, tuitionInflation: 0.04, monthly: 0, returnRate: 0.04, balance: 0 }) }));

  // The one question: after retirement, are the monthly bills covered?
  const first = proj.firstRetire;
  const billsAtRetire = first?.expensesMonthly ?? p.expenses;
  const incomeAtRetire = first?.incomeMonthly ?? 0;
  const savedAtRetire = proj.atRetire.nominal;
  const runsOut = proj.depletedAge;
  const lastsYears = runsOut ? runsOut - a.retireAge : null;
  const shortAt = runsOut ? proj.flows.find((f) => f.age === runsOut + 1) : null;
  const retireFlows = proj.flows.filter((f) => f.retired).map((f) => ({
    age: f.age, "Monthly bills": Math.round(f.expensesMonthly), "Pension + Social Security": Math.round(f.incomeMonthly),
    "From savings": Math.round(f.fromSavingsMonthly), "Not covered": Math.round(f.shortfallMonthly),
  }));
  const balance = [{ age: p.age, balance: p.savings + p.retirement }, ...proj.flows.map((f) => ({ age: f.age + 1, balance: Math.round(f.balanceEnd) }))].filter((r) => r.age <= 90);
  const ok = !runsOut;

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
          <span>Viewing <b>{isDave ? "Dave's scenario" : `${p.name ? p.name + "'s" : "your"} own numbers`}</b></span>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={isDave ? "#/welcome" : "#/welcome?edit"} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50"><Pencil size={14} /> {isDave ? "Use my own numbers" : "Edit my numbers"}</a>
          {!isDave && <a href="#/welcome" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"><UserRound size={14} /> Try Dave's scenario</a>}
        </div>
      </div>

      {/* Hero: the answer */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hero-dark rounded-[2rem] p-6 sm:p-8 text-white overflow-hidden">
        <div className="text-emerald-300 font-semibold">{greeting()}{p.name ? `, ${p.name}` : ""} 👋</div>
        <div className="mt-2 text-lg text-slate-300">Will {isDave ? "Dave" : "you"} have enough money to pay the bills after retiring at {a.retireAge}?</div>
        <h1 className="mt-1 flex items-start gap-3 font-display text-3xl sm:text-5xl font-semibold leading-tight">
          {ok ? <CheckCircle2 className="mt-1 h-9 w-9 shrink-0 text-emerald-400" /> : <AlertTriangle className="mt-1 h-9 w-9 shrink-0 text-amber" />}
          <span>{ok ? <>Yes. The money lasts past age 90.</> : <>Not quite. Savings run out at <span className="text-amber">age {runsOut}</span>.</>}</span>
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-slate-300">
          {ok ? `Saving at today's pace, ${his} savings plus pension and Social Security cover the bills every year.` :
            `That's ${lastsYears} ${lastsYears === 1 ? "year" : "years"} into retirement. After that, pension and Social Security alone leave about ${money(shortAt?.shortfallMonthly ?? 0)} a month of bills unpaid.`}
        </p>
        <div className="mt-2"><Verified dark source="fixed formulas, not AI guesses" /></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/[.07] p-4 ring-1 ring-white/10">
            <div className="text-[13px] font-semibold uppercase tracking-wider text-emerald-300">💰 Saving</div>
            <div className="mt-1 flex items-baseline gap-2 flex-wrap"><span className="num text-2xl font-bold">{money(proj.savingToday)}/mo</span><span className="text-slate-300">today</span><ArrowRight size={16} className="text-slate-400" /><span className="num text-2xl font-bold">{compact(savedAtRetire)}</span><span className="text-slate-300">saved by {a.retireAge}</span></div>
          </div>
          <div className="rounded-2xl bg-white/[.07] p-4 ring-1 ring-white/10">
            <div className="text-[13px] font-semibold uppercase tracking-wider text-orange-300">🧾 Monthly bills ({pct(proj.inflation)} inflation)</div>
            <div className="mt-1 flex items-baseline gap-2 flex-wrap"><span className="num text-2xl font-bold">{money(p.expenses)}</span><span className="text-slate-300">today</span><ArrowRight size={16} className="text-slate-400" /><span className="num text-2xl font-bold">{money(billsAtRetire)}</span><span className="text-slate-300">at {a.retireAge}</span></div>
          </div>
        </div>
      </motion.div>

      <Moments />
      <PlanBuilder />
      <NextSteps />

      {/* Chart 1: bills vs money coming in, each year of retirement */}
      <Card className="mt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold">After retirement: can {isDave ? "Dave" : "you"} pay the monthly bills?</h2>
            <p className="text-slate-500">Each bar is one year. The orange line is what the bills cost that year. <EstimateTag /></p>
          </div>
        </div>
        <div className="mt-4 h-72 sm:h-80">
          <ResponsiveContainer>
            <ComposedChart data={retireFlows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="age" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
              <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Age ${l} · per month`} formatter={(v, n) => [money(Number(v)), n]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Pension + Social Security" stackId="a" fill="#0F172A" animationDuration={600} />
              <Bar dataKey="From savings" stackId="a" fill="#10B981" animationDuration={600} />
              <Bar dataKey="Not covered" stackId="a" fill="#F97361" radius={[6, 6, 0, 0]} animationDuration={600} />
              <Line dataKey="Monthly bills" stroke="#F59E0B" strokeWidth={3} dot={false} type="monotone" animationDuration={600} />
              {runsOut && <ReferenceLine x={runsOut} stroke="#F97361" strokeDasharray="4 4" label={{ value: "Savings run out", position: "insideTopLeft", fill: "#C2410C", fontSize: 12 }} />}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Stat label={`Bills at ${a.retireAge}`} value={`${money(billsAtRetire)}/mo`} tone="coral" sub={`were ${money(p.expenses)}/mo today`} />
          <Stat label="Pension + Social Security" value={`${money(incomeAtRetire)}/mo`} tone="navy" sub="rises with prices" />
          <Stat label="Paid from savings" value={`${money(Math.max(0, billsAtRetire - incomeAtRetire))}/mo`} tone="green" sub={runsOut ? `until age ${runsOut}` : "covered through 90"} />
        </div>
        <HowWeCalculate />
      </Card>

      {/* Chart 2: savings build up, then get spent */}
      <Card className="mt-5">
        <h2 className="font-display text-2xl font-semibold">{isDave ? "Dave's" : "Your"} savings: building up, then spending down</h2>
        <p className="text-slate-500">Saving {money(proj.savingToday)}/month now (retirement plan + leftover pay). Bills rise {pct(proj.inflation)} a year while pay rises {pct(a.salaryGrowth)}, so saving gets harder each year.</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <AreaChart data={balance} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs><linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#10B981" stopOpacity={0.35} /><stop offset="1" stopColor="#10B981" stopOpacity={0.03} /></linearGradient></defs>
              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="age" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Age ${l}`} formatter={(v) => [money(Number(v)), "Total savings"]} />
              <ReferenceLine x={a.retireAge} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: `Retire at ${a.retireAge}`, position: "insideTopRight", fill: "#B45309", fontSize: 12 }} />
              <Area type="monotone" dataKey="balance" stroke="#10B981" strokeWidth={3} fill="url(#gB)" animationDuration={600} />
              <ReferenceDot x={a.retireAge} y={Math.round(savedAtRetire)} r={6} fill="#10B981" stroke="#fff" strokeWidth={2} />
              {runsOut && <ReferenceDot x={runsOut + 1} y={0} r={7} fill="#F97361" stroke="#fff" strokeWidth={2} label={{ value: `Empty at ${runsOut}`, position: "top", fill: "#C2410C", fontSize: 12 }} />}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* What if */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-semibold">Other assumptions</div>
            <div className="flex items-center gap-2">
              <Segmented label="Scenario" value={a.scenario} onChange={(v) => setA({ scenario: v })} options={[{ value: "pessimistic", label: "😟 Rough" }, { value: "baseline", label: "Baseline" }, { value: "optimistic", label: "😊 Good" }]} />
              <ResetButton onClick={() => set({ assumptions: isDave ? { ...DAVE_ASSUMPTIONS } : { ...CUSTOM_ASSUMPTIONS } })} />
            </div>
          </div>
          <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
            <Slider label="Retirement age" value={a.retireAge} min={Math.max(55, p.age + 1)} max={75} onChange={(v) => setA({ retireAge: v })} format={(v) => "Age " + v} />
            <Slider label="Inflation (prices rise each year)" value={Math.round(a.inflation * 1000) / 10} min={0} max={8} step={0.5} onChange={(v) => setA({ inflation: v / 100 })} format={(v) => v + "%"} />
            <Slider label="Pension + Social Security (rough % of pay)" value={Math.round(a.ssReplacement * 100)} min={0} max={80} onChange={(v) => setA({ ssReplacement: v / 100 })} format={(v) => v + "%"} help="Rough guide: Social Security alone ≈ 35–40%; with a pension, more. Check ssa.gov/myaccount." />
            <Slider label="Monthly bills in retirement" value={p.expenses} min={500} max={15000} step={100} onChange={(v) => set((s) => ({ profile: { ...s.profile, expenses: v } }))} format={(v) => money(v) + " today"} />
            {!simple && <>
              <Slider label="Investment growth (yearly average)" value={Math.round(a.returnRate * 1000) / 10} min={2} max={10} step={0.5} onChange={(v) => setA({ returnRate: v / 100 })} format={(v) => v + "%"} help="Set by the investment mix above; fine-tune here. Real markets go up and down." />
              <Slider label="Federal tax bracket" value={Math.round((a.taxRate ?? 0.12) * 100)} min={10} max={37} onChange={(v) => setA({ taxRate: v / 100 })} format={(v) => v + "%"} />
              <Slider label="Employer adds" value={Math.round(a.matchPct * 100)} min={0} max={8} onChange={(v) => setA({ matchPct: v / 100 })} format={(v) => v + "% of pay"} />
              <Slider label="Yearly raises" value={Math.round(a.salaryGrowth * 1000) / 10} min={0} max={6} step={0.5} onChange={(v) => setA({ salaryGrowth: v / 100 })} format={(v) => v + "%"} />
              <Slider label="Share of leftover pay saved" value={Math.round(a.leftoverSaved * 100)} min={0} max={100} step={5} onChange={(v) => setA({ leftoverSaved: v / 100 })} format={(v) => v + "%"} />
            </>}
          </div>
          <p className="mt-2 text-[13px] text-slate-500">{simple ? "Switch to Detailed (top right) for more options." : "Assumes about 22% of pay goes to taxes and the same lifestyle in retirement at future prices. Pension + Social Security is a rough estimate that rises with prices."}</p>
        </div>
      </Card>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card className={kids.length ? "lg:col-span-1" : "lg:col-span-3"}>
          <div className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">{isDave ? "Example scenario" : "Your scenario"}</div>
          <div className="mt-1 font-display text-xl font-semibold">{isDave ? "🧹" : "🙋"} {p.name ? `${p.name}'s` : "Your"} family</div>
          <ul className="mt-2 space-y-1 text-[15px] text-slate-600">
            {p.job && <li>{p.job}{isDave ? ` · ~$${DAVE.hourly}/hr` : ""}</li>}
            <li>Household: {money(p.income)}/yr{isDave ? " (Linda part-time)" : ""}</li>
            {isDave && <li>PSERS pension + Social Security later</li>}
            <li>{(p.kids || []).length ? (p.kids || []).map((k) => `${k.name}, ${k.age}`).join(" · ") : "No children"}</li>
          </ul>
          <a href={isDave ? "#/welcome" : "#/welcome?edit"} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700"><PlayCircle size={16} /> {isDave ? "Switch scenario" : "Edit my answers"}</a>
        </Card>
        {kids.length > 0 && (
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-2 font-semibold"><GraduationCap className="text-sky-600" /> Big costs ahead: college</div>
            <p className="text-[14px] text-slate-500">A public in-state university costs about {money(DAVE.collegeCostToday)}/year today (PA example), before financial aid. College prices rise ~4%/year.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
      </div>

      <a href={moduleHref(nextLesson.id)} className="group mt-5 flex items-center gap-4 rounded-3xl bg-emerald-500 p-5 text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 text-3xl">{nextLesson.emoji}</span>
        <span className="flex-1">
          <span className="block text-[13px] font-bold uppercase tracking-wider text-emerald-100">{done.length ? "Continue learning" : "Start learning"} <BookOpen size={13} className="inline" /></span>
          <span className="block font-display text-xl sm:text-2xl font-semibold">{nextLesson.title}</span>
          <span className="text-emerald-50">Learn the idea, then try it on a real-world simulation ready for you.</span>
        </span>
        <ArrowRight className="transition group-hover:translate-x-1" />
      </a>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AskRipple
            ctx={{ page: "dashboard", module: "Retirement check: will savings cover the bills?", inputs: { age: p.age, income: p.income, monthlyBillsToday: p.expenses, savings: p.savings, retirementSaved: p.retirement, ...a }, results: { savingPerMonthToday: Math.round(proj.savingToday), savedByRetirement: Math.round(savedAtRetire), monthlyBillsAtRetirement: Math.round(billsAtRetire), pensionPlusSocialSecurityMonthlyAtRetirement: Math.round(incomeAtRetire), gapFromSavingsMonthly: Math.round(billsAtRetire - incomeAtRetire), savingsRunOutAtAge: runsOut, uncoveredMonthlyAfterThat: shortAt ? Math.round(shortAt.shortfallMonthly) : 0 }, insights }}
            prompts={isDave ? ["Will Dave have enough to retire?", "Why do his bills almost double?", "What would help the most?"] : ["Will I have enough to retire?", "Why do my bills grow so much?", "What would help me the most?"]}
            title="Next Step's insights" />
        </div>
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between"><div className="font-semibold">Learning progress</div><a href="#/progress" className="text-sm font-semibold text-emerald-600">See all</a></div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat label="Lessons done" value={`${done.length}/10`} tone="green" />
              <Stat label="XP earned" value={xp} tone="sky" />
            </div>
          </Card>
          <Card>
            <div className="font-semibold">Recommended for you</div>
            <div className="mt-3 space-y-2">
              {(recs.length ? recs : MODULES.slice(0, 3)).map((m) => (
                <a key={m.id} href={moduleHref(m.id)} className="flex items-center gap-3 rounded-2xl p-2 hover:bg-slate-50">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-xl">{m.emoji}</span>
                  <span className="flex-1"><span className="block font-semibold leading-tight">{m.title}</span><span className="text-[13px] text-slate-500">{m.minutes} min</span></span>
                  <ArrowRight size={16} className="text-slate-400" />
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
