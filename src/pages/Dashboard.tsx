import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceDot } from "recharts";
import { ArrowRight, Check, CalendarPlus, Download, ChevronDown, ExternalLink, Pencil, UserRound, Sparkles, Zap, Compass, Target } from "lucide-react";
import { useStore } from "../lib/store";
import { money, compact, axisMoney } from "../lib/format";
import { Card, cx, tooltipStyle } from "../components/ui";
import { MOMENTS, autoMoments, whyAuto, buildPlan, PLAN_ASSUMPTIONS, type MomentId, type PlanItem } from "../lib/plan";
import { downloadReminder } from "../lib/steps";
import { downloadPlan } from "../lib/pdf";
import { Panels, Fill } from "../components/Panels";

const TABS = [
  { id: "moments", label: "Life moments", icon: Zap },
  { id: "plan", label: "Your plan", icon: Compass },
  { id: "future", label: "Your future", icon: Target },
] as const;
type TabId = (typeof TABS)[number]["id"];

function ScenarioPanel() {
  const { profile: p } = useStore();
  const chips: [string, string][] = [
    ["Age", `${p.age}`], ["Income", `${money(p.income)}/yr`], ["Bills", `${money(p.expenses)}/mo`], ["Savings", money(p.savings)], ["Retirement", money(p.retirement)],
    ...((p.kids || []).length ? [["Kids", (p.kids || []).map((k) => `${k.name} ${k.age}`).join(", ")] as [string, string]] : []),
  ];
  return (
    <div className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-white px-4 py-3 shadow-card ring-1 ring-slate-200">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy text-xl">🙋</span>
        <div className="leading-tight"><div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">My scenario</div><div className="font-display text-xl font-semibold">{p.name ? `${p.name}'s plan` : "Your plan"}</div></div>
      </div>
      <div className="flex flex-1 flex-wrap gap-1.5">
        {chips.map(([k, v]) => <span key={k} className="rounded-lg bg-slate-50 px-2 py-1 text-[13px] ring-1 ring-slate-200"><span className="text-slate-500">{k} </span><b className="num text-navy">{v}</b></span>)}
      </div>
      <a href="#/try?walk=mine" className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50"><Pencil size={14} /> Edit my numbers</a>
    </div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">{children}</div>;
}

/* 1 · Life moments: pick as many as apply */
function MomentsStep({ selected, toggle, auto }: { selected: MomentId[]; toggle: (m: MomentId) => void; auto: MomentId[] }) {
  const { profile: p } = useStore();
  const his = p.name ? `${p.name}'s` : "your";
  return (
    <Card className="p-4 sm:p-5">
      <Kicker>Step 1</Kicker>
      <h2 className="font-display text-2xl font-semibold">What's happening in {his} life right now?</h2>
      <div className="mt-2 rounded-2xl bg-sky-soft/70 px-4 py-2.5 ring-1 ring-sky-200">
        <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold">
          <span className="mr-1 text-[14px] text-navy">The moments you pick drive everything:</span>
          {["Life moments", "Your plan", "Your future"].map((t, i) => (
            <span key={t} className="flex items-center gap-2">
              <span className={cx("rounded-full px-2.5 py-0.5", i === 0 ? "bg-sun text-navy" : "bg-white text-navy ring-1 ring-slate-200")}>{t}</span>
              {i < 2 && <ArrowRight size={15} className="text-slate-400" />}
            </span>
          ))}
        </div>
        <p className="mt-1 text-[13px] text-slate-600">Pick every moment that applies (some are picked from {his} answers). Next Step builds the plan around them, links each action to the Valley Bank product that fits, and shows your future with and without the plan.</p>
      </div>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {MOMENTS.map((m) => {
          const on = selected.includes(m.id);
          const isAuto = auto.includes(m.id);
          return (
            <button key={m.id} onClick={() => toggle(m.id)} aria-pressed={on}
              className={cx("relative flex items-start gap-2.5 rounded-2xl p-3 text-left ring-2 transition", on ? "bg-emerald-50 ring-emerald-500" : "bg-white ring-slate-200 hover:ring-emerald-300")}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="flex-1">
                <span className="block text-[15px] font-semibold leading-snug">{m.title}</span>
                <span className="block text-[13px] text-slate-500">{m.sub}</span>
                {isAuto && <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200"><Sparkles size={11} /> {whyAuto(p, m.id)}</span>}
              </span>
              <span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-lg ring-2", on ? "bg-emerald-500 text-navy ring-emerald-500" : "bg-white ring-slate-300")}>{on && <Check size={16} />}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[13px] text-slate-500">{selected.length ? `${selected.length} moment${selected.length === 1 ? "" : "s"} picked. Next Step builds ${his} plan around them.` : "No moments picked: the plan will cover the basics."}</p>
    </Card>
  );
}

/* 2 · The plan, built automatically */
function PlanStep({ items }: { items: PlanItem[] }) {
  const st = useStore();
  const { profile: p, stepsDone, set } = st;
  const [openId, setOpenId] = useState<string | null>(null);
  const monthlyItems = items.filter((i) => i.monthly > 0);
  const total = monthlyItems.reduce((t, i) => t + i.monthly, 0);
  const done = items.filter((i) => stepsDone[i.id]).length;
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Kicker>Step 2</Kicker>
          <h2 className="font-display text-2xl font-semibold">{p.name ? `${p.name}'s` : "Your"} plan: where the money lives and what to do</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[14px] text-slate-500">Saved every month <b className="num text-lg text-navy">{money(total)}</b></span>
          <span className="num rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{done}/{items.length} done</span>
          <button onClick={() => downloadPlan({ profile: st.profile, assumptions: st.assumptions, story: st.story, done: st.done, xp: 0, badges: [], stepsDone, moments: st.moments })}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50"><Download size={15} /> PDF</button>
        </div>
      </div>
      <div className="mt-2 flex h-8 overflow-hidden rounded-xl text-[12px] font-bold text-white">
        {monthlyItems.map((i) => (
          <motion.div key={i.id} initial={{ width: 0 }} animate={{ width: `${(i.monthly / total) * 100}%` }} className="flex items-center justify-center overflow-hidden whitespace-nowrap px-1" style={{ background: i.color }} title={`${i.title} ${money(i.monthly)}/mo`}>
            {i.monthly / total > 0.2 ? `${i.title} ${money(i.monthly)}` : i.monthly / total > 0.08 ? money(i.monthly) : ""}
          </motion.div>
        ))}
      </div>
      <div className="mt-3 grid items-start gap-2.5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((i) => {
          const m = MOMENTS.find((x) => x.id === i.moment);
          const isDone = !!stepsDone[i.id], isOpen = openId === i.id;
          return (
            <div key={i.id} className={cx("flex flex-col rounded-2xl p-3 ring-1", isDone ? "bg-emerald-50/70 ring-emerald-200" : "bg-slate-50 ring-slate-200")} style={{ borderLeft: `6px solid ${i.color}` }} title={i.where}>
              <div className="flex items-start gap-2">
                <button onClick={() => set((s) => ({ stepsDone: { ...s.stepsDone, [i.id]: !isDone } }))} aria-pressed={isDone} aria-label={`Mark ${i.title} done`}
                  className={cx("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md ring-2", isDone ? "bg-emerald-500 text-navy ring-emerald-500" : "bg-white ring-slate-300")}>{isDone && <Check size={15} />}</button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className={cx("text-[15px] font-semibold leading-snug", isDone && "text-slate-400 line-through")}>{i.emoji} {i.title}</span>
                    <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500 ring-1 ring-slate-200">{i.when}</span>
                  </div>
                  <div className="num mt-1 text-[14px] font-bold text-navy">{i.amount}</div>
                </div>
              </div>
              <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-slate-600" title={i.why}>{m ? `${m.emoji} ` : ""}{i.why}</p>
              {isOpen && <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-[13px] text-slate-700">{i.how.map((h) => <li key={h}>{h}</li>)}</ol>}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {i.products.map((pr) => (
                  <a key={pr.url} href={pr.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-sun px-2.5 py-1 text-[12px] font-semibold text-navy hover:bg-sun-600">
                    <span className="rounded bg-navy px-1 text-[9px] font-extrabold text-sun">VALLEY</span>{pr.name.replace("Valley ", "")}<ExternalLink size={12} />
                  </a>
                ))}
                {(i.also || []).map((pr) => (
                  <a key={pr.url} href={pr.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[12px] font-semibold ring-1 ring-slate-200 hover:bg-slate-50">{pr.name}<ExternalLink size={12} /></a>
                ))}
                <button onClick={() => setOpenId(isOpen ? null : i.id)} aria-expanded={isOpen} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-50">{isOpen ? "Hide steps" : "How to do it"}<ChevronDown size={13} className={cx("transition", isOpen && "rotate-180")} /></button>
                <button onClick={() => downloadReminder({ id: i.id, title: i.title, why: i.why, how: i.how, source: i.products[0] ? { label: i.products[0].name, url: i.products[0].url } : undefined } as never)}
                  aria-label={`Add a reminder for ${i.title}`} title="Add a reminder" className="inline-flex items-center rounded-lg px-1.5 py-1 text-slate-500 hover:bg-white hover:text-navy"><CalendarPlus size={15} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* 3 · Your future: one graph, then the answer */
function AnswerStep({ plan }: { plan: ReturnType<typeof buildPlan> }) {
  const { profile: p, assumptions: a, set } = useStore();
  const [how, setHow] = useState(false);
  const { without: w, withPlan: wp } = plan;
  const data = w.rows.map((r, i) => ({ age: r.age, without: Math.round(r.nominal), with: Math.round(wp.rows[i]?.nominal ?? 0) }));
  const R = a.retireAge;
  const wAt = Math.round(w.atRetire.nominal), pAt = Math.round(wp.atRetire.nominal);
  const last = (d: number | null) => d ?? 90;
  const extra = last(wp.depletedAge) - last(w.depletedAge);
  const name = p.name || "you";
  const lbl = (txt: string, color: string, dy = -12) => ({ value: txt, position: "top" as const, fill: color, fontSize: 12, fontWeight: 700, dy });
  return (
    <Card className="p-4 sm:p-5">
      <Kicker>Step 3 · Your future</Kicker>
      <h2 className="font-display text-2xl font-semibold">Will {name} have enough money to pay the bills after retiring at {R}?</h2>
      <div className="mt-1 h-56 lg:h-[min(19rem,calc(100dvh-34rem))]">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 28, right: 24, left: 4, bottom: 4 }}>
            <CartesianGrid stroke="#EEF2F7" vertical={false} />
            <XAxis dataKey="age" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Age ${l}`} formatter={(v, n) => [money(Number(v)), n === "with" ? "With the plan" : "Without the plan"]} />
            <ReferenceLine x={R} stroke="#94A3B8" strokeDasharray="4 4" label={w.depletedAge && Math.abs(w.depletedAge - R) < 3 ? undefined : { value: `Retire at ${R}`, position: "insideBottomLeft", fill: "#64748B", fontSize: 12, dy: -18 }} />
            <Line dataKey="without" stroke="#F97361" strokeWidth={3} dot={false} animationDuration={700} />
            <Line dataKey="with" stroke="#F5C000" strokeWidth={3.5} dot={false} animationDuration={700} />
            <ReferenceDot x={R} y={pAt} r={6} fill="#F5C000" stroke="#fff" strokeWidth={2} label={lbl(`With plan: ${compact(pAt)}`, "#7A5C00")} />
            {wAt > 0 && <ReferenceDot x={R} y={wAt} r={6} fill="#F97361" stroke="#fff" strokeWidth={2} label={lbl(`Without: ${compact(wAt)}`, "#C2410C", 22)} />}
            {w.depletedAge && <ReferenceDot x={w.depletedAge} y={0} r={6} fill="#F97361" stroke="#fff" strokeWidth={2} label={lbl(`Runs out at ${w.depletedAge}`, "#C2410C")} />}
            {wp.depletedAge && <ReferenceDot x={wp.depletedAge} y={0} r={6} fill="#F5C000" stroke="#fff" strokeWidth={2} label={lbl(`Runs out at ${wp.depletedAge}`, "#7A5C00", w.depletedAge && Math.abs(wp.depletedAge - w.depletedAge) < 6 ? -44 : -12)} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex flex-wrap gap-4 text-[13px] font-semibold"><span className="flex items-center gap-2 text-orange-700"><i className="h-1 w-6 rounded bg-coral" /> Without the plan</span><span className="flex items-center gap-2 text-emerald-700"><i className="h-1 w-6 rounded bg-emerald-500" /> With the plan</span><span className="text-slate-500">Total savings by age</span></div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-200">
          <div className="text-[13px] font-bold uppercase tracking-wider text-orange-700">Without the plan</div>
          <div className="mt-1 font-display text-2xl font-semibold text-navy">{w.depletedAge ? `Not enough. Savings run out at ${w.depletedAge}.` : "Savings last past 90."}</div>
          <p className="mt-1 text-[15px] text-slate-600">About {money(wAt)} saved at {R}.</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-300">
          <div className="text-[13px] font-bold uppercase tracking-wider text-emerald-700">With the plan</div>
          <div className="mt-1 font-display text-2xl font-semibold text-navy">{wp.depletedAge ? `Money lasts until ${wp.depletedAge}${extra > 0 ? `, ${extra} more year${extra === 1 ? "" : "s"}` : ""}.` : "Money lasts past 90."}</div>
          <p className="mt-1 text-[15px] text-slate-600">About {money(pAt)} saved at {R}{pAt > wAt ? `, ${money(pAt - wAt)} more` : ""}.</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
        <span className="font-semibold text-slate-600">Prices rise each year:</span>
        {[2, 3, 4, 5, 6].map((v) => (
          <button key={v} onClick={() => set((s) => ({ assumptions: { ...s.assumptions, inflation: v / 100 } }))} aria-pressed={Math.abs(a.inflation * 100 - v) < 0.01}
            className={cx("rounded-lg px-2.5 py-1 font-semibold", Math.abs(a.inflation * 100 - v) < 0.01 ? "bg-navy text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{v}%</button>
        ))}
        <span className="text-slate-400">U.S. long-run average ≈ 3%</span>
      </div>

      <button onClick={() => setHow(!how)} aria-expanded={how} className="mt-2 flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-2.5 text-left text-[14px] font-semibold ring-1 ring-slate-200">How we calculate this <ChevronDown size={18} className={how ? "rotate-180 transition" : "transition"} /></button>
      {how && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[14px] text-slate-600">
          <li>Fixed formulas, not AI guesses. Bills rise {Math.round(a.inflation * 100)}% a year; investments earn about {Math.round(a.returnRate * 100)}% a year (not guaranteed).</li>
          <li>Pension + Social Security are estimated at {Math.round(a.ssReplacement * 100)}% of today's pay, rising with prices. Savings cover the rest of the bills.</li>
          <li>Life moments: surprise bill {money(PLAN_ASSUMPTIONS.surpriseBill)}; medical costs +{money(PLAN_ASSUMPTIONS.medicalMonthly)}/mo; market drop {Math.round(PLAN_ASSUMPTIONS.marketDrop * 100)}% (without a plan: selling and sitting in cash for 3 years); college {money(PLAN_ASSUMPTIONS.collegeShareNoAid)}/yr per student without the FAFSA vs {money(PLAN_ASSUMPTIONS.collegeShareWithAid)} with typical grants, rising 4% a year; vacation {money(PLAN_ASSUMPTIONS.vacationCost)} (without a plan, on a 22% credit card); car {money(PLAN_ASSUMPTIONS.carPrice)} (without a plan: $0 down, 9% for 6 years; with the plan: 10% down, 6.5% for 5 years).</li>
          <li>The plan: automatic payday transfers save most of what's left after bills, emergency money earns about {Math.round(PLAN_ASSUMPTIONS.savingsRateWithPlan * 100)}% in a money market (rates vary), plus the items in step 2.</li>
          <li>Educational estimates, not financial advice.</li>
        </ul>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const { profile: p, assumptions: a, moments: saved, set, setContext } = useStore();
  const auto = useMemo(() => autoMoments(p), [p]);
  const selected = (saved as MomentId[] | undefined) ?? auto;
  const toggle = (m: MomentId) => set({ moments: selected.includes(m) ? selected.filter((x) => x !== m) : [...selected, m] });
  const plan = useMemo(() => buildPlan(p, a, selected), [p, a, selected]);
  const [tab, setTab] = useState(0);
  useEffect(() => {
    setContext({
      page: "try it now", lifeMoments: selected,
      plan: plan.items.map((i) => ({ title: i.title, amount: i.amount, where: i.where })),
      results: { withoutPlan: { savingsAtRetirement: Math.round(plan.without.atRetire.nominal), runsOutAt: plan.without.depletedAge }, withPlan: { savingsAtRetirement: Math.round(plan.withPlan.atRetire.nominal), runsOutAt: plan.withPlan.depletedAge } },
    });
  }, [plan, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const body = (n: React.ReactNode) => <Fill center={false}>{n}</Fill>;
  return (
    <Panels nav="top" top={<ScenarioPanel />} index={tab} onIndex={setTab}
      nextLabel={(i) => (i === 0 ? "Build my plan" : TABS[i + 1] ? `Next: ${TABS[i + 1].label}` : undefined)}
      tabs={[
        { id: "moments", label: "Life moments", body: () => body(<MomentsStep selected={selected} toggle={toggle} auto={auto} />) },
        { id: "plan", label: "Your plan", body: () => body(<PlanStep items={plan.items} />) },
        { id: "future", label: "Your future", body: () => body(<AnswerStep plan={plan} />) },
      ]} />
  );
}
