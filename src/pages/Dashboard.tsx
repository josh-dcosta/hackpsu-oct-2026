import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceDot } from "recharts";
import { ArrowRight, Check, CalendarPlus, Download, ChevronDown, ExternalLink, Pencil, UserRound, Sparkles, Zap, Compass, ListChecks, Target } from "lucide-react";
import { useStore } from "../lib/store";
import { money, compact, axisMoney } from "../lib/format";
import { Card, cx, tooltipStyle } from "../components/ui";
import { WorkerIcon } from "../components/Brand";
import { DAVE, isDaveProfile } from "../data/dave";
import { MOMENTS, autoMoments, whyAuto, buildPlan, PLAN_ASSUMPTIONS, type MomentId, type PlanItem } from "../lib/plan";
import { downloadReminder } from "../lib/steps";
import { downloadPlan } from "../lib/pdf";

const TABS = [
  { id: "moments", label: "Life moments", icon: Zap },
  { id: "plan", label: "Your plan", icon: Compass },
  { id: "steps", label: "Next steps", icon: ListChecks },
  { id: "answer", label: "The answer", icon: Target },
] as const;
type TabId = (typeof TABS)[number]["id"];

function ScenarioPanel() {
  const { profile: p } = useStore();
  const isDave = isDaveProfile(p);
  return (
    <div className={"mb-4 rounded-3xl p-5 sm:p-6 shadow-card ring-1 " + (isDave ? "bg-gradient-to-br from-emerald-50 via-white to-amber-50 ring-emerald-200" : "bg-white ring-slate-200")}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {isDave ? <WorkerIcon size={64} /> : <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-navy text-3xl">🙋</span>}
          <div>
            <div className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">{isDave ? "Scenario: Dave" : "Scenario: my own numbers"}</div>
            <div className="font-display text-2xl sm:text-3xl font-semibold">{isDave ? "Meet Dave" : p.name ? `${p.name}'s plan` : "Your plan"}</div>
            <p className="mt-1 max-w-2xl text-[15px] text-slate-600">{isDave
              ? `Head custodian at a Pennsylvania public high school, earning about $${DAVE.hourly} an hour. His wife Linda works part-time.`
              : `${p.job ? p.job + ". " : ""}Built from the answers you gave.`}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={isDave ? "#/try?pick" : "#/try?walk=mine"} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50"><Pencil size={14} /> {isDave ? "Use my own numbers" : "Edit my numbers"}</a>
          {!isDave && <a href="#/try?pick" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"><UserRound size={14} /> Try Dave's scenario</a>}
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
    <Card>
      <Kicker>Step 1</Kicker>
      <h2 className="font-display text-2xl sm:text-3xl font-semibold">What's happening in {his} life right now?</h2>
      <p className="mt-1 text-slate-500">Pick every moment that applies. Some are already picked from {his} scenario.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MOMENTS.map((m) => {
          const on = selected.includes(m.id);
          const isAuto = auto.includes(m.id);
          return (
            <button key={m.id} onClick={() => toggle(m.id)} aria-pressed={on}
              className={cx("relative flex items-start gap-3 rounded-2xl p-4 text-left ring-2 transition", on ? "bg-emerald-50 ring-emerald-500" : "bg-white ring-slate-200 hover:ring-emerald-300")}>
              <span className="text-3xl">{m.emoji}</span>
              <span className="flex-1">
                <span className="block text-[17px] font-semibold">{m.title}</span>
                <span className="block text-[14px] text-slate-500">{m.sub}</span>
                {isAuto && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-200"><Sparkles size={12} /> From the scenario: {whyAuto(p, m.id)}</span>}
              </span>
              <span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-lg ring-2", on ? "bg-emerald-500 text-white ring-emerald-500" : "bg-white ring-slate-300")}>{on && <Check size={16} />}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-[14px] text-slate-500">{selected.length ? `${selected.length} moment${selected.length === 1 ? "" : "s"} picked. Next Step builds ${his} plan around them.` : "No moments picked: the plan will cover the basics."}</p>
    </Card>
  );
}

/* 2 · The plan, built automatically */
function PlanStep({ items }: { items: PlanItem[] }) {
  const { profile: p } = useStore();
  const monthlyItems = items.filter((i) => i.monthly > 0);
  const total = monthlyItems.reduce((t, i) => t + i.monthly, 0);
  return (
    <Card>
      <Kicker>Step 2</Kicker>
      <h2 className="font-display text-2xl sm:text-3xl font-semibold">{p.name ? `${p.name}'s` : "Your"} plan: where the money lives</h2>
      <p className="mt-1 text-slate-500">Built automatically from the scenario and the life moments picked.</p>
      <div className="mt-5">
        <div className="flex items-baseline justify-between text-[14px]"><span className="font-semibold">Saved every month</span><span className="num text-xl font-bold">{money(total)}/mo</span></div>
        <div className="mt-2 flex h-12 overflow-hidden rounded-2xl text-[13px] font-bold text-white">
          {monthlyItems.map((i) => (
            <motion.div key={i.id} initial={{ width: 0 }} animate={{ width: `${(i.monthly / total) * 100}%` }} className="flex items-center justify-center px-1" style={{ background: i.color }} title={i.title}>
              {i.monthly / total > 0.12 && money(i.monthly)}
            </motion.div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-600">
          {monthlyItems.map((i) => <span key={i.id} className="flex items-center gap-1.5"><i className="h-3 w-3 rounded" style={{ background: i.color }} />{i.title} {money(i.monthly)}</span>)}
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((i) => {
          const m = MOMENTS.find((x) => x.id === i.moment);
          return (
            <div key={i.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200" style={{ borderLeft: `6px solid ${i.color}` }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2"><span className="text-2xl">{i.emoji}</span><span className="text-lg font-semibold">{i.title}</span></div>
                {m && <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[12px] font-semibold text-slate-600 ring-1 ring-slate-200">{m.emoji} {m.title}</span>}
              </div>
              <div className="mt-1 text-[14px] text-slate-500">{i.where}</div>
              <div className="num mt-2 text-[17px] font-bold text-navy">{i.amount}</div>
              <p className="mt-1 text-[14px] text-slate-600">{i.why}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* 3 · Next steps, each linked to a real product */
function StepsStep({ items }: { items: PlanItem[] }) {
  const st = useStore();
  const { stepsDone, set } = st;
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  const done = items.filter((i) => stepsDone[i.id]).length;
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Kicker>Step 3</Kicker>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">Next steps</h2>
          <p className="mt-1 text-slate-500">Every action in the plan, with the Valley Bank product that does it.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="num rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{done}/{items.length} done</span>
          <button onClick={() => downloadPlan({ profile: st.profile, assumptions: st.assumptions, story: st.story, done: st.done, xp: 0, badges: [], stepsDone, moments: st.moments })}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50"><Download size={15} /> PDF</button>
        </div>
      </div>
      <div className="mt-4 space-y-2.5">
        {items.map((i) => {
          const isOpen = open === i.id, isDone = !!stepsDone[i.id];
          return (
            <div key={i.id} className={cx("rounded-2xl ring-1", isDone ? "bg-emerald-50/60 ring-emerald-200" : "bg-white ring-slate-200")}>
              <div className="flex items-start gap-3 p-4">
                <button onClick={() => set((s) => ({ stepsDone: { ...s.stepsDone, [i.id]: !isDone } }))} aria-pressed={isDone} aria-label={`Mark ${i.title} done`}
                  className={cx("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-2", isDone ? "bg-emerald-500 text-white ring-emerald-500" : "bg-white ring-slate-300")}>{isDone && <Check size={18} />}</button>
                <button onClick={() => setOpen(isOpen ? null : i.id)} className="flex flex-1 items-start justify-between gap-2 text-left" aria-expanded={isOpen}>
                  <span>
                    <span className="flex flex-wrap items-center gap-2"><span className={cx("text-[17px] font-semibold", isDone && "text-slate-400 line-through")}>{i.emoji} {i.title}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-500">{i.when}</span></span>
                    <span className="mt-0.5 block text-[14px] text-slate-600">{i.amount}</span>
                  </span>
                  <ChevronDown size={18} className={cx("mt-1 shrink-0 text-slate-400 transition", isOpen && "rotate-180")} />
                </button>
              </div>
              {isOpen && (
                <div className="border-t border-slate-100 px-4 pb-4 pt-3 sm:pl-[60px]">
                  <ol className="list-decimal space-y-1 pl-5 text-[15px] text-slate-700">{i.how.map((h) => <li key={h}>{h}</li>)}</ol>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {i.products.map((pr) => (
                      <a key={pr.url} href={pr.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-sun px-3.5 py-2.5 text-sm font-semibold text-navy hover:bg-sun-600">
                        <span className="rounded bg-navy px-1 text-[10px] font-extrabold text-sun">VALLEY</span>{pr.name.replace("Valley ", "")}<ExternalLink size={14} />
                      </a>
                    ))}
                    {(i.also || []).map((pr) => (
                      <a key={pr.url} href={pr.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50">{pr.name}<ExternalLink size={14} /></a>
                    ))}
                    <button onClick={() => downloadReminder({ id: i.id, title: i.title, why: i.why, how: i.how, source: i.products[0] ? { label: i.products[0].name, url: i.products[0].url } : undefined } as never)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50"><CalendarPlus size={15} /> Add a reminder</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[12px] text-slate-500">Product links go to Valley Bank's personal banking pages at valley.com. Check current rates, fees and eligibility with the bank.</p>
    </Card>
  );
}

/* 4 · The answer: one graph, then the answer */
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
    <Card>
      <Kicker>Step 4 · The answer</Kicker>
      <h2 className="font-display text-2xl sm:text-3xl font-semibold">Will {name} have enough money to pay the bills after retiring at {R}?</h2>
      <div className="mt-4 h-80 sm:h-96">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 28, right: 24, left: 4, bottom: 4 }}>
            <CartesianGrid stroke="#EEF2F7" vertical={false} />
            <XAxis dataKey="age" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Age ${l}`} formatter={(v, n) => [money(Number(v)), n === "with" ? "With the plan" : "Without the plan"]} />
            <ReferenceLine x={R} stroke="#94A3B8" strokeDasharray="4 4" label={w.depletedAge && Math.abs(w.depletedAge - R) < 3 ? undefined : { value: `Retire at ${R}`, position: "insideBottomLeft", fill: "#64748B", fontSize: 12, dy: -18 }} />
            <Line dataKey="without" stroke="#F97361" strokeWidth={3} dot={false} animationDuration={700} />
            <Line dataKey="with" stroke="#10B981" strokeWidth={3.5} dot={false} animationDuration={700} />
            <ReferenceDot x={R} y={pAt} r={6} fill="#10B981" stroke="#fff" strokeWidth={2} label={lbl(`With plan: ${compact(pAt)}`, "#047857")} />
            {wAt > 0 && <ReferenceDot x={R} y={wAt} r={6} fill="#F97361" stroke="#fff" strokeWidth={2} label={lbl(`Without: ${compact(wAt)}`, "#C2410C", 22)} />}
            {w.depletedAge && <ReferenceDot x={w.depletedAge} y={0} r={6} fill="#F97361" stroke="#fff" strokeWidth={2} label={lbl(`Runs out at ${w.depletedAge}`, "#C2410C")} />}
            {wp.depletedAge && <ReferenceDot x={wp.depletedAge} y={0} r={6} fill="#10B981" stroke="#fff" strokeWidth={2} label={lbl(`Runs out at ${wp.depletedAge}`, "#047857", w.depletedAge && Math.abs(wp.depletedAge - w.depletedAge) < 6 ? -44 : -12)} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex flex-wrap gap-4 text-[13px] font-semibold"><span className="flex items-center gap-2 text-orange-700"><i className="h-1 w-6 rounded bg-coral" /> Without the plan</span><span className="flex items-center gap-2 text-emerald-700"><i className="h-1 w-6 rounded bg-emerald-500" /> With the plan</span><span className="text-slate-500">Total savings by age</span></div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-orange-50 p-5 ring-1 ring-orange-200">
          <div className="text-[13px] font-bold uppercase tracking-wider text-orange-700">Without the plan</div>
          <div className="mt-1 font-display text-2xl font-semibold text-navy">{w.depletedAge ? `Not enough. Savings run out at ${w.depletedAge}.` : "Savings last past 90."}</div>
          <p className="mt-1 text-[15px] text-slate-600">About {money(wAt)} saved at {R}.</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-300">
          <div className="text-[13px] font-bold uppercase tracking-wider text-emerald-700">With the plan</div>
          <div className="mt-1 font-display text-2xl font-semibold text-navy">{wp.depletedAge ? `Money lasts until ${wp.depletedAge}${extra > 0 ? `, ${extra} more year${extra === 1 ? "" : "s"}` : ""}.` : "Money lasts past 90."}</div>
          <p className="mt-1 text-[15px] text-slate-600">About {money(pAt)} saved at {R}{pAt > wAt ? `, ${money(pAt - wAt)} more` : ""}.</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px]">
        <span className="font-semibold text-slate-600">Prices rise each year:</span>
        {[2, 3, 4, 5, 6].map((v) => (
          <button key={v} onClick={() => set((s) => ({ assumptions: { ...s.assumptions, inflation: v / 100 } }))} aria-pressed={Math.abs(a.inflation * 100 - v) < 0.01}
            className={cx("rounded-lg px-2.5 py-1 font-semibold", Math.abs(a.inflation * 100 - v) < 0.01 ? "bg-navy text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{v}%</button>
        ))}
        <span className="text-slate-400">U.S. long-run average ≈ 3%</span>
      </div>

      <button onClick={() => setHow(!how)} aria-expanded={how} className="mt-4 flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left text-[15px] font-semibold ring-1 ring-slate-200">How we calculate this <ChevronDown size={18} className={how ? "rotate-180 transition" : "transition"} /></button>
      {how && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[14px] text-slate-600">
          <li>Fixed formulas, not AI guesses. Bills rise {Math.round(a.inflation * 100)}% a year; investments earn about {Math.round(a.returnRate * 100)}% a year (not guaranteed).</li>
          <li>Pension + Social Security are estimated at {Math.round(a.ssReplacement * 100)}% of today's pay, rising with prices. Savings cover the rest of the bills.</li>
          <li>Life moments: surprise bill {money(PLAN_ASSUMPTIONS.surpriseBill)}; medical costs +{money(PLAN_ASSUMPTIONS.medicalMonthly)}/mo; market drop {Math.round(PLAN_ASSUMPTIONS.marketDrop * 100)}% (without a plan: selling and sitting in cash for 3 years); college {money(PLAN_ASSUMPTIONS.collegeShareNoAid)}/yr per student without the FAFSA vs {money(PLAN_ASSUMPTIONS.collegeShareWithAid)} with typical grants, rising 4% a year.</li>
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
  const [tab, setTab] = useState<TabId>("moments");
  const tabsRef = useRef<HTMLDivElement>(null);
  const go = (id: TabId) => {
    setTab(id);
    const mark = tabsRef.current; if (!mark) return;
    const header = window.innerWidth >= 1024 ? 0 : 64;
    const y = mark.getBoundingClientRect().top + window.scrollY - header;
    if (window.scrollY > y) window.scrollTo({ top: y, behavior: "smooth" });
  };
  const nextTab = TABS[TABS.findIndex((t) => t.id === tab) + 1];
  useEffect(() => {
    setContext({
      page: "try it now", lifeMoments: selected,
      plan: plan.items.map((i) => ({ title: i.title, amount: i.amount, where: i.where })),
      results: { withoutPlan: { savingsAtRetirement: Math.round(plan.without.atRetire.nominal), runsOutAt: plan.without.depletedAge }, withPlan: { savingsAtRetirement: Math.round(plan.withPlan.atRetire.nominal), runsOutAt: plan.withPlan.depletedAge } },
    });
  }, [plan, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <ScenarioPanel />
      <div ref={tabsRef} />
      <div className="sticky top-16 z-20 -mx-4 mb-4 bg-paper/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0">
        <div role="tablist" aria-label="Try it now steps" className="flex gap-1.5 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-card ring-1 ring-slate-200 [scrollbar-width:none]">
          {TABS.map((t, n) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => go(t.id)}
              className={"inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-[14px] font-semibold transition " + (tab === t.id ? "bg-navy text-white" : "text-slate-600 hover:bg-slate-100")}>
              <span className={cx("grid h-5 w-5 place-items-center rounded-full text-[11px] num", tab === t.id ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600")}>{n + 1}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === "moments" && <MomentsStep selected={selected} toggle={toggle} auto={auto} />}
        {tab === "plan" && <PlanStep items={plan.items} />}
        {tab === "steps" && <StepsStep items={plan.items} />}
        {tab === "answer" && <AnswerStep plan={plan} />}
      </motion.div>

      {nextTab && (
        <div className="mt-5 flex justify-center">
          <button onClick={() => go(nextTab.id)} className="inline-flex items-center gap-2 rounded-2xl bg-sun px-6 py-3.5 text-[17px] font-semibold text-navy hover:bg-sun-600">
            {tab === "moments" ? "Build my plan" : `Next: ${nextTab.label}`} <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
