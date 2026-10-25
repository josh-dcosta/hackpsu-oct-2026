import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Gamepad2, TrendingUp, Wallet, PiggyBank, ShoppingCart } from "lucide-react";
import { useStore } from "../lib/store";
import { projectLife, futureCost } from "../lib/calc";
import { money, compact, axisMoney, pct } from "../lib/format";
import { AskRipple, Card, EstimateTag, ResetButton, Segmented, Slider, Stat, cx, tooltipStyle } from "../components/ui";
import { MODULES, moduleHref } from "../data/modules";
import { simulate529 } from "../lib/calc";
import { DAVE, DAVE_ASSUMPTIONS } from "../data/dave";
import { GraduationCap } from "lucide-react";

const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

export default function Dashboard() {
  const { profile: p, assumptions: a, set, done, xp, simple } = useStore();
  const [view, setView] = useState<"both" | "nominal" | "real">("both");
  const proj = useMemo(() => projectLife(p, a), [p, a]);
  const setA = (x: Partial<typeof a>) => set((s) => ({ assumptions: { ...s.assumptions, ...x } }));
  const [sel, setSel] = useState<number | null>(null);
  const ret = proj.atRetire;
  const yrsToRetire = Math.max(0, a.retireAge - p.age);
  const futureMonthly = futureCost(p.expenses, proj.inflation, yrsToRetire);
  const recs = MODULES.filter((m) => m.stages.includes(p.ageRange) && !done.includes(m.id)).slice(0, 3);
  const chart = proj.rows.filter((r) => r.age <= 90);
  const selected = sel !== null ? proj.milestones.find((m) => m.age === sel) : null;

  const isDave = p.name === "Dave";
  const kids = DAVE.kids.map((k) => ({ ...k, r: simulate529({ childAge: k.age, collegeAge: 18, costNow: DAVE.collegeCostToday, tuitionInflation: 0.04, monthly: 0, returnRate: 0.04, balance: 0 }) }));
  const insights = [
    `If things go roughly as assumed, you could have about ${compact(ret.nominal)} at age ${a.retireAge}. In today's buying power that feels like about ${compact(ret.real)}.`,
    `Your ${money(p.expenses)} of monthly spending today could cost about ${money(futureMonthly)} a month by age ${a.retireAge} at ${pct(proj.inflation)} inflation.`,
    ...(isDave ? [`Emma's and Jake's 4 years at a PA state university could cost about ${compact(kids[0].r.totalCost + kids[1].r.totalCost)} combined before aid, versus ${money(p.savings)} in savings today.`] : []),
    proj.depletedAge ? `Under these assumptions, savings could run short around age ${proj.depletedAge}. Try raising your 401(k) contribution or retirement age.` : `Under these assumptions, your savings last past age 90.`,
  ];

  return (
    <div>
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hero-dark rounded-[2rem] p-6 sm:p-8 text-white overflow-hidden">
        <div className="text-emerald-300 font-semibold">{greeting()}{p.name ? `, ${p.name}` : ""} 👋</div>
        <h1 className="mt-2 font-display text-3xl sm:text-5xl font-semibold leading-tight max-w-3xl">
          At {a.retireAge}, you could have <span className="text-emerald-400 num">{compact(ret.nominal)}</span>.
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-300">That would feel like <b className="text-white num">{compact(ret.real)}</b> in today's money, because prices rise over time. Move the sliders below to see how your choices change it.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Wallet, l: "Savings today", v: money(p.savings) },
            { icon: PiggyBank, l: "Retirement today", v: money(p.retirement) },
            { icon: ShoppingCart, l: "Monthly spending", v: money(p.expenses) },
            { icon: TrendingUp, l: `Spending at ${a.retireAge}`, v: money(futureMonthly) + "/mo" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-white/[.07] p-4 ring-1 ring-white/10">
              <s.icon size={18} className="text-emerald-400" />
              <div className="mt-2 text-[13px] text-slate-300">{s.l}</div>
              <div className="num text-xl font-bold">{s.v}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {isDave && (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <div className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">Demo scenario</div>
            <div className="mt-1 font-display text-xl font-semibold">🧹 Dave's family</div>
            <ul className="mt-2 space-y-1 text-[15px] text-slate-600">
              <li>Head custodian, PA public high school · ~${DAVE.hourly}/hr</li>
              <li>Household: {money(DAVE.household)}/yr (Linda part-time)</li>
              <li>PSERS pension + Social Security later</li>
              <li>Emma, 17 (senior) · Jake, 15 (sophomore)</li>
            </ul>
          </Card>
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-2 font-semibold"><GraduationCap className="text-sky-600" /> Big costs ahead: college</div>
            <p className="text-[14px] text-slate-500">A PA state university costs about {money(DAVE.collegeCostToday)}/year today, before financial aid. College prices rise ~4%/year.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {kids.map((k) => (
                <div key={k.name} className="rounded-2xl bg-sky-soft p-4">
                  <div className="text-[13px] font-semibold text-sky-800">{k.name} starts in {k.r.years} {k.r.years === 1 ? "year" : "years"}</div>
                  <div className="num font-display text-2xl font-semibold text-navy">{compact(k.r.totalCost)}</div>
                  <div className="text-[13px] text-slate-600">for 4 years (vs {compact(k.r.todayCost)} at today's prices)</div>
                </div>
              ))}
            </div>
            <a href="#/learn/college" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Plan for it in the College Savings Simulator <ArrowRight size={14} /></a>
          </Card>
        </div>
      )}

      {/* Big CTA */}
      <a href="#/future" className="group mt-5 flex items-center gap-4 rounded-3xl bg-emerald-500 p-5 text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20"><Gamepad2 size={28} /></span>
        <span className="flex-1">
          <span className="block font-display text-xl sm:text-2xl font-semibold">Play: Choose Your Financial Future</span>
          <span className="text-emerald-50">Make 10 life decisions and watch 30 years unfold.</span>
        </span>
        <ArrowRight className="transition group-hover:translate-x-1" />
      </a>

      {/* Timeline */}
      <Card className="mt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold">Your Financial Future Timeline</h2>
            <p className="text-slate-500">Total savings and investments by age. <EstimateTag /></p>
          </div>
          <Segmented label="Chart view" value={view} onChange={setView} options={[{ value: "both", label: "Both" }, { value: "nominal", label: "Future $" }, { value: "real", label: "Today's $" }]} />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-[13px] text-slate-600">
          <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-emerald-500" /> Future dollars (the number on your statement)</span>
          <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-navy" /> Today's buying power (after inflation)</span>
        </div>
        <div className="mt-2 h-72 sm:h-80">
          <ResponsiveContainer>
            <AreaChart data={chart} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#10B981" stopOpacity={0.35} /><stop offset="1" stopColor="#10B981" stopOpacity={0.02} /></linearGradient>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0F172A" stopOpacity={0.25} /><stop offset="1" stopColor="#0F172A" stopOpacity={0.02} /></linearGradient>
              </defs>
              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="age" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Age ${l}`} formatter={(v, n) => [money(Number(v)), n === "nominal" ? "Future dollars" : "Today's buying power"]} />
              <ReferenceLine x={a.retireAge} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: "Retire", position: "insideTopRight", fill: "#B45309", fontSize: 12 }} />
              {view !== "real" && <Area type="monotone" dataKey="nominal" stroke="#10B981" strokeWidth={3} fill="url(#gN)" animationDuration={600} />}
              {view !== "nominal" && <Area type="monotone" dataKey="real" stroke="#0F172A" strokeWidth={2.5} fill="url(#gR)" animationDuration={600} />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Milestones */}
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {proj.milestones.map((m) => (
            <button key={m.age} onClick={() => setSel(sel === m.age ? null : m.age)} aria-pressed={sel === m.age}
              className={cx("rounded-2xl p-3 text-left ring-1 transition", sel === m.age ? "bg-navy text-white ring-navy" : "bg-slate-50 ring-slate-200 hover:ring-emerald-400")}>
              <div className={cx("text-[12px] font-semibold", sel === m.age ? "text-emerald-300" : "text-slate-500")}>Age {m.age}</div>
              <div className="num font-bold">{compact(m.nominal)}</div>
              <div className={cx("num text-[12px]", sel === m.age ? "text-slate-300" : "text-slate-500")}>{compact(m.real)} today</div>
            </button>
          ))}
        </div>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-2xl bg-sky-soft p-4 text-[15px] text-sky-900">
            <b>At age {selected.age}</b>{selected.retired ? " (retired)" : ""}: about <b>{money(selected.nominal)}</b> in future dollars, which buys what <b>{money(selected.real)}</b> buys today. Monthly living costs could be around <b>{money(selected.expensesMonthly)}</b>.
          </motion.div>
        )}

        {/* Assumptions */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-semibold">Change the assumptions</div>
            <div className="flex items-center gap-2">
              <Segmented label="Scenario" value={a.scenario} onChange={(v) => setA({ scenario: v })} options={[{ value: "pessimistic", label: "😟 Rough" }, { value: "baseline", label: "Baseline" }, { value: "optimistic", label: "😊 Good" }]} />
              <ResetButton onClick={() => set({ assumptions: { ...DAVE_ASSUMPTIONS } })} />
            </div>
          </div>
          <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
            <Slider label="401(k) contribution" value={Math.round(a.contribPct * 100)} min={0} max={25} onChange={(v) => setA({ contribPct: v / 100 })} format={(v) => v + "% of pay"} />
            <Slider label="Retirement age" value={a.retireAge} min={Math.max(55, p.age + 1)} max={75} onChange={(v) => setA({ retireAge: v })} format={(v) => "Age " + v} />
            <Slider label="Investment return (yearly)" value={Math.round(a.returnRate * 1000) / 10} min={2} max={10} step={0.5} onChange={(v) => setA({ returnRate: v / 100 })} format={(v) => v + "%"} help={simple ? undefined : "Average yearly growth. Not guaranteed. Real markets go up and down."} />
            <Slider label="Inflation (yearly)" value={Math.round(a.inflation * 1000) / 10} min={0} max={8} step={0.5} onChange={(v) => setA({ inflation: v / 100 })} format={(v) => v + "%"} />
            {!simple && <>
              <Slider label="Employer match" value={Math.round(a.matchPct * 100)} min={0} max={8} onChange={(v) => setA({ matchPct: v / 100 })} format={(v) => v + "% of pay"} />
              <Slider label="Share of leftover money you save" value={Math.round(a.leftoverSaved * 100)} min={0} max={100} step={5} onChange={(v) => setA({ leftoverSaved: v / 100 })} format={(v) => v + "%"} />
              <Slider label="Social Security (rough % of pay)" value={Math.round(a.ssReplacement * 100)} min={0} max={60} onChange={(v) => setA({ ssReplacement: v / 100 })} format={(v) => v + "%"} help="Check your real estimate at ssa.gov/myaccount." />
              <Slider label="Raises (yearly)" value={Math.round(a.salaryGrowth * 1000) / 10} min={0} max={6} step={0.5} onChange={(v) => setA({ salaryGrowth: v / 100 })} format={(v) => v + "%"} />
            </>}
          </div>
          <p className="mt-2 text-[13px] text-slate-500">{simple ? "Switch to Detailed (top right) for more assumptions." : "Assumes ~22% of pay goes to taxes, leftover money is split between an emergency fund and investments, and retirees spend about 85% of their pre-retirement budget."}</p>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AskRipple
            ctx={{ page: "dashboard", module: "dashboard", inputs: { age: p.age, income: p.income, monthlyExpenses: p.expenses, savings: p.savings, retirementSaved: p.retirement, ...a }, results: { atRetirementNominal: Math.round(ret.nominal), atRetirementTodaysDollars: Math.round(ret.real), futureMonthlySpendingAtRetirement: Math.round(futureMonthly), moneyRunsShortAtAge: proj.depletedAge, milestones: proj.milestones.map((m) => ({ age: m.age, nominal: Math.round(m.nominal), todaysDollars: Math.round(m.real) })) }, insights }}
            prompts={["Explain my timeline simply", "Why are the two lines different?", "What would change my future the most?"]}
            title="Next Step's insights for you" />
        </div>
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between"><div className="font-semibold">Your learning progress</div><a href="#/progress" className="text-sm font-semibold text-emerald-600">See all</a></div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat label="Lessons done" value={`${done.length}/10`} tone="green" />
              <Stat label="XP earned" value={xp} tone="sky" />
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${done.length * 10}%` }} /></div>
          </Card>
          <Card>
            <div className="font-semibold">Recommended for you</div>
            <div className="mt-3 space-y-2">
              {(recs.length ? recs : MODULES.slice(0, 3)).map((m) => (
                <a key={m.id} href={moduleHref(m.id)} className="flex items-center gap-3 rounded-2xl p-2 hover:bg-slate-50">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-xl">{m.emoji}</span>
                  <span className="flex-1"><span className="block font-semibold leading-tight">{m.title}</span><span className="text-[13px] text-slate-500">{m.minutes} min · {m.sim}</span></span>
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
