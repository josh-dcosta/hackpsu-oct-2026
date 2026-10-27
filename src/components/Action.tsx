import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus, Check, ChevronDown, ExternalLink, ShieldCheck, Zap, Download } from "lucide-react";
import { useStore } from "../lib/store";
import { buildSteps, downloadReminder } from "../lib/steps";
import { projectLife, simulate529 } from "../lib/calc";
import { RULES } from "../lib/rules";
import { downloadPlan } from "../lib/pdf";
import { DAVE, DAVE_ASSUMPTIONS, CUSTOM_ASSUMPTIONS, isDaveProfile } from "../data/dave";
import { money, compact } from "../lib/format";
import { Button, Card, cx } from "./ui";

/* ---------------- Trust ---------------- */
export function Verified({ source, dark }: { source?: string; dark?: boolean }) {
  return (
    <span className={cx("inline-flex items-center gap-1 text-[12px] font-semibold", dark ? "text-emerald-300" : "text-emerald-700")}>
      <ShieldCheck size={13} /> Calculated by Next Step{source ? ` · ${source}` : ""}
    </span>
  );
}

export function HowWeCalculate() {
  const { assumptions: a } = useStore();
  const [open, setOpen] = useState(false);
  const rows = [
    ["Prices (inflation)", `Rise ${(a.inflation * 100).toFixed(1)}% a year. Your bills at retirement = today's bills × (1 + inflation)^years.`],
    ["Investments", `Grow an average ${(a.returnRate * 100).toFixed(1)}% a year (an assumption, not a promise; try Rough/Good).`],
    ["Taxes", `About 22% of pay goes to taxes overall. Traditional and HSA contributions skip your ${Math.round((a.taxRate ?? 0.12) * 100)}% federal bracket (HSA payroll contributions also skip 7.65% FICA). Traditional withdrawals are taxed; Roth withdrawals aren't.`],
    ["Retirement income", `Pension + Social Security ≈ ${Math.round(a.ssReplacement * 100)}% of today's pay, rising with prices. Check your real estimate at ssa.gov.`],
    ["Retirement spending", "The same lifestyle as today, at future prices."],
    ["Limits", `${RULES.year} IRS contribution limits, verified ${RULES.verifiedOn}.`],
  ];
  return (
    <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <span className="flex items-center gap-2 font-semibold"><ShieldCheck size={18} className="text-emerald-600" /> How we calculate this, and why you can trust it</span>
        <ChevronDown size={18} className={cx("transition", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4">
              <p className="text-[15px] text-slate-700"><b>Every number is calculated by fixed, tested formulas, never guessed by AI.</b> The AI coach only explains these results in plain English. Tax rules and limits come from official sources:</p>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                {rows.map(([k, v]) => <div key={k} className="rounded-xl bg-white p-3 ring-1 ring-slate-200"><dt className="text-[13px] font-semibold text-slate-500">{k}</dt><dd className="text-[14px] text-slate-700">{v}</dd></div>)}
              </dl>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {[...RULES.sources, { label: "SSA — my Social Security", url: "https://www.ssa.gov/myaccount/" }].map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-700 hover:underline">{s.label} <ExternalLink size={11} /></a>
                ))}
              </div>
              <p className="mt-2 text-[12px] text-slate-500">Educational estimates, not financial advice. Real results will differ.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Next steps ---------------- */
export function NextSteps({ compact: small }: { compact?: boolean }) {
  const st = useStore();
  const { profile: p, assumptions: a, stepsDone, set, award } = st;
  const start = isDaveProfile(p) ? DAVE_ASSUMPTIONS : CUSTOM_ASSUMPTIONS;
  const steps = useMemo(() => buildSteps(p, a, start), [p, a, start]);
  const [open, setOpen] = useState<string | null>(steps[0]?.id ?? null);
  const plan = steps.filter((s) => s.inPlan), ideas = steps.filter((s) => !s.inPlan);
  const doneCount = plan.filter((s) => stepsDone[s.id]).length;
  const toggle = (id: string) => {
    const now = !stepsDone[id];
    set((s) => ({ stepsDone: { ...s.stepsDone, [id]: now } }));
    if (now) award(25, "Took a real next step", "step-" + id);
  };
  const who = isDaveProfile(p) ? "Dave's" : p.name ? `${p.name}'s` : "Your";

  const Row = ({ s }: { s: (typeof steps)[number] }) => {
    const isOpen = open === s.id, done = !!stepsDone[s.id];
    return (
      <div className={cx("rounded-2xl ring-1 transition", done ? "bg-emerald-50/60 ring-emerald-200" : "bg-white ring-slate-200")}>
        <div className="flex items-start gap-3 p-4">
          {s.inPlan ? (
            <button onClick={() => toggle(s.id)} aria-pressed={done} aria-label={done ? "Mark not done" : "Mark done"}
              className={cx("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ring-2", done ? "bg-emerald-500 text-white ring-emerald-500" : "ring-slate-300 hover:ring-emerald-400")}>{done && <Check size={16} />}</button>
          ) : <span className="mt-0.5 text-xl">{s.emoji}</span>}
          <button onClick={() => setOpen(isOpen ? null : s.id)} aria-expanded={isOpen} className="flex-1 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cx("font-semibold leading-snug", done && "text-slate-500 line-through")}>{s.inPlan ? `${s.emoji} ` : ""}{s.title}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">{s.when}</span>
            </div>
            <div className="mt-1 text-[14px] text-slate-600">{s.why}</div>
          </button>
          <ChevronDown size={18} className={cx("mt-1 shrink-0 text-slate-400 transition", isOpen && "rotate-180")} />
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="border-t border-slate-100 px-4 pb-4 pt-3 sm:pl-14">
                <div className="text-[13px] font-bold uppercase tracking-wider text-slate-500">How to do it</div>
                <ol className="mt-1 list-decimal space-y-1 pl-5 text-[15px] text-slate-700">{s.how.map((h) => <li key={h}>{h}</li>)}</ol>
                {s.automate && <div className="mt-3 flex items-start gap-2 rounded-xl bg-sky-soft p-3 text-[14px] text-sky-900"><Zap size={16} className="mt-0.5 shrink-0" /><span><b>Automate it:</b> {s.automate}</span></div>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button onClick={() => { downloadReminder(s); award(10, "Set a reminder", "rem-" + s.id); }} className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-sm font-semibold text-white"><CalendarPlus size={15} /> Add a reminder</button>
                  <a href={s.lesson} className="rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50">Learn why</a>
                  {s.source && <a href={s.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-500 hover:text-navy"><ShieldCheck size={13} /> Verify: {s.source.label} <ExternalLink size={11} /></a>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <Card className="mt-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">Turn the plan into action</div>
          <h2 className="font-display text-2xl font-semibold">{who} next steps</h2>
          <p className="text-slate-500">Real-world steps with exact amounts, how to do them, and where to verify. Check them off as you go.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="num rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{doneCount}/{plan.length} done</span>
          {!small && <Button variant="ghost" onClick={() => downloadPlan({ profile: p, assumptions: a, story: st.story, done: st.done, xp: st.xp, badges: st.badges, stepsDone })} className="min-h-[40px] py-2 text-sm"><Download size={15} /> PDF</Button>}
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100"><motion.div className="h-2 rounded-full bg-emerald-500" animate={{ width: `${plan.length ? (doneCount / plan.length) * 100 : 0}%` }} /></div>
      <div className="mt-4 space-y-2.5">{plan.map((s) => <Row key={s.id} s={s} />)}</div>
      {ideas.length > 0 && (
        <>
          <div className="mt-5 text-[13px] font-bold uppercase tracking-wider text-slate-500">Worth considering, not in your plan yet</div>
          <div className="mt-2 space-y-2.5">{ideas.map((s) => <Row key={s.id} s={s} />)}</div>
        </>
      )}
    </Card>
  );
}

/* ---------------- Life moments ---------------- */
type Moment = { id: string; emoji: string; label: string };
const MOMENTS: Moment[] = [
  { id: "raise", emoji: "💵", label: "I got a raise" },
  { id: "enroll", emoji: "🩺", label: "Open enrollment" },
  { id: "bill", emoji: "🔧", label: "Surprise bill" },
  { id: "college", emoji: "🎓", label: "Kid heading to college" },
  { id: "crash", emoji: "📉", label: "The market dropped" },
  { id: "retire", emoji: "🏖️", label: "Retiring soon" },
];

export function Moments() {
  const { profile: p, assumptions: a, set, flash } = useStore();
  const [sel, setSel] = useState<string | null>(null);
  const [applied, setApplied] = useState<string | null>(null);
  const [change, setChange] = useState<{ id: string; before: ReturnType<typeof projectLife>; after: ReturnType<typeof projectLife>; beforeA: typeof a; afterA: typeof a } | null>(null);
  const tax = a.taxRate ?? 0.12;
  const proj = useMemo(() => projectLife(p, a), [p, a]);
  const efGoal = Math.round(p.expenses * 0.85) * 3;
  const kid = [...(p.kids || [])].filter((k) => k.age < 18).sort((x, y) => y.age - x.age)[0];
  const kidCost = kid ? simulate529({ childAge: kid.age, collegeAge: 18, costNow: DAVE.collegeCostToday, tuitionInflation: 0.04, monthly: 0, returnRate: 0.04, balance: 0 }) : null;
  const LEVER: Record<string, string> = { raise: "retire", enroll: "hsa", bill: "savings", retire: "age" };
  const apply = (id: string, patch: Partial<typeof a>) => {
    const afterA = { ...a, ...patch };
    setChange({ id, before: projectLife(p, a), after: projectLife(p, afterA), beforeA: a, afterA });
    set((s) => ({ assumptions: { ...s.assumptions, ...patch } }));
    setApplied(id);
    if (LEVER[id]) flash(LEVER[id]);
  };
  const seePlan = () => window.dispatchEvent(new CustomEvent("ns-tab", { detail: "plan" }));
  const raise = p.income * 0.04;
  const later = projectLife(p, { ...a, retireAge: a.retireAge + 2 });

  const content: Record<string, { head: string; body: string; action?: { label: string; patch: Partial<typeof a> }; lesson: string }> = {
    raise: { head: "Save half of it before you get used to it", body: `A 4% raise is about ${money(raise)} a year. Putting half toward retirement means raising your contribution about ${Math.round((raise / 2 / p.income) * 100)}%, and you still keep the other half to enjoy.`, action: { label: `Raise my retirement savings to ${Math.round((a.contribPct + 0.02) * 100)}%`, patch: { contribPct: Math.min(0.25, a.contribPct + 0.02) } }, lesson: "#/learn/k401" },
    enroll: { head: "This is your once-a-year chance to set up an HSA", body: `If you pick an HSA-qualifying high-deductible plan, ${money(1500)} a year saves about ${money(1500 * (tax + 0.0765))} in taxes and grows tax-free for medical costs. Compare total costs (premiums + deductible) before switching.`, action: { label: `Add a ${money(1500)}/yr HSA to my plan`, patch: { hsaAnnual: Math.max(1500, a.hsaAnnual ?? 0) } }, lesson: "#/learn/hsa" },
    bill: { head: "Pay it from savings, not a credit card", body: p.savings >= efGoal ? `Your ${money(p.savings)} cushion covers 3 months of essentials. That's exactly what it's for. Refill it afterwards with an automatic transfer.` : `Your cushion is ${money(p.savings)}; a 3-month goal is ${money(efGoal)}. If you must use a card, a $3,000 bill at 22% APR paid over 2 years costs about ${money(3000 * 0.22 * 1.05)} in interest. Keep the cushion in a high-yield account so it grows while it waits.`, action: { label: "Keep my cushion in high-yield savings (4%)", patch: { cashRate: 0.04 } }, lesson: "#/learn/bank" },
    college: { head: kid ? `${kid.name}'s 4 years could cost about ${compact(kidCost!.totalCost)}` : "Plan for college without wrecking retirement", body: kid ? `File the FAFSA as soon as it opens. It unlocks Pell Grants, state grants and college aid. Compare net price after aid, and consider community college first. Keep saving for retirement too: students can borrow for college, but nobody lends you money for retirement.` : "File the FAFSA every year, compare net price after aid, and keep retirement savings going.", lesson: "#/learn/college" },
    crash: { head: "Don't sell. Stay the course.", body: `Say the market drops 25% and ${isDaveProfile(p) ? "Dave's" : "your"} ${money(p.retirement)} retirement account falls to ${money(p.retirement * 0.75)}. Selling turns that paper loss into a real one, and you usually miss the recovery. Money you'll need in the next 3 years belongs in savings; long-term money stays in diversified index funds.`, lesson: "#/learn/invest" },
    retire: { head: proj.depletedAge ? `Today, savings run out at age ${proj.depletedAge}` : "Your money lasts past 90", body: `Working 2 more years (to ${a.retireAge + 2}) means 2 more years of saving and 2 fewer years to fund. With your plan, money would last until ${later.depletedAge ? `age ${later.depletedAge}` : "past 90"}. Also check your real Social Security estimate at ssa.gov: waiting to claim raises your monthly check.`, action: { label: `Try retiring at ${a.retireAge + 2}`, patch: { retireAge: Math.min(75, a.retireAge + 2) } }, lesson: "#/learn/accounts" },
  };
  const c = sel ? content[sel] : null;
  const who = isDaveProfile(p) ? "Dave" : "you";
  const DOS: Record<string, { do: string[]; dont: string[] }> = {
    raise: { do: ["Raise the retirement % the same week the raise starts, before you get used to the money.", "Turn on automatic yearly increases if your plan offers them."], dont: ["Don't let the whole raise disappear into new monthly bills.", "Don't drop below the % needed for any employer match."] },
    enroll: { do: ["Compare total yearly cost: premiums + deductible + what you usually spend on care.", "Only HSA-qualifying high-deductible plans allow HSA contributions.", "Set the HSA amount through payroll so it also skips payroll tax."], dont: ["Don't pick a high-deductible plan if you can't cover the deductible from savings.", "Don't spend HSA money on non-medical things before 65: tax + 20% penalty."] },
    bill: { do: ["Pay from your emergency fund, then refill it with an automatic transfer.", "Keep the cushion in an FDIC-insured high-yield account."], dont: ["Don't put it on a credit card you can't pay off this month (often 20%+ interest).", "Don't borrow from your retirement account to cover it."] },
    college: { do: ["File the FAFSA as soon as it opens, every year.", "Compare each college's net price after grants.", "Keep your own retirement saving going."], dont: ["Don't stop retirement saving to pay tuition.", "Don't take private loans before using federal aid."] },
    crash: { do: ["Keep investing on schedule; you're buying at lower prices.", "Keep money you'll need within 3 years in savings, not stocks."], dont: ["Don't sell in a panic; that locks in the loss.", "Don't check your balance every day."] },
    retire: { do: ["Get your real Social Security estimate at ssa.gov.", "Compare retiring at different ages before you decide.", "Plan for healthcare costs before Medicare at 65."], dont: ["Don't claim Social Security early without seeing how much smaller the check is.", "Don't forget that prices keep rising every year you're retired."] },
  };
  const d = sel ? DOS[sel] : null;
  // Market drop: what Dave's invested money looks like at retirement if he stays vs. panic-sells.
  // Illustration: a 25% drop, then the market recovers over 3 years (+12%/yr); selling locks in the loss and earns ~3% in cash.
  const yrsLeft = Math.max(3, a.retireAge - p.age);
  const afterDrop = p.retirement * 0.75;
  const stay = afterDrop * Math.pow(1.12, 3) * Math.pow(1 + a.returnRate, yrsLeft - 3);
  const sell = afterDrop * Math.pow(1.03, 3) * Math.pow(1 + a.returnRate, yrsLeft - 3);

  return (
    <Card className="mt-5">
      <div className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">The moments that matter</div>
      <h2 className="font-display text-2xl font-semibold">What's happening in {isDaveProfile(p) ? "Dave's" : "your"} life right now?</h2>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {MOMENTS.map((m) => (
          <button key={m.id} onClick={() => { setSel(sel === m.id ? null : m.id); setApplied(null); setChange(null); }} aria-pressed={sel === m.id}
            className={cx("flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-2xl p-3 text-center ring-2 transition", sel === m.id ? "bg-navy text-white ring-navy" : "bg-white ring-slate-200 hover:ring-emerald-400")}>
            <span className="text-2xl">{m.emoji}</span><span className="text-[14px] font-semibold leading-tight">{m.label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {c && sel && (
          <motion.div key={sel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-2xl bg-sky-soft p-5">
            <div className="font-display text-xl font-semibold text-navy">{c.head}</div>
            <p className="mt-1 text-[15px] text-slate-700">{c.body}</p>
            {sel === "crash" && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 ring-2 ring-emerald-400">
                  <div className="text-[13px] font-bold uppercase tracking-wider text-emerald-700">🧘 Stay invested</div>
                  <div className="num mt-1 font-display text-3xl font-semibold text-navy">{compact(stay)}</div>
                  <div className="text-[13px] text-slate-500">at {a.retireAge}, after the market recovers</div>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-orange-200">
                  <div className="text-[13px] font-bold uppercase tracking-wider text-orange-700">🏃 Sell and wait in cash</div>
                  <div className="num mt-1 font-display text-3xl font-semibold text-navy">{compact(sell)}</div>
                  <div className="text-[13px] text-slate-500">at {a.retireAge}: about <b className="text-orange-700">{compact(stay - sell)} less</b></div>
                </div>
                <p className="text-[12px] text-slate-500 sm:col-span-2">Illustration: a 25% drop, then 3 recovery years (+12% a year) vs. 3 years in cash (+3% a year), then the same {Math.round(a.returnRate * 1000) / 10}% average growth. Real markets don't follow a script, and past recoveries don't guarantee future ones.</p>
              </div>
            )}
            <div className="mt-2"><Verified /></div>
            <div className="mt-3 flex flex-wrap gap-2">
              {c.action && applied !== sel && <Button onClick={() => apply(sel, c.action!.patch)} className="min-h-[44px] py-2">{c.action.label}</Button>}
              <a href={c.lesson} className="inline-flex min-h-[44px] items-center rounded-2xl bg-white px-4 font-semibold text-emerald-700 ring-1 ring-emerald-200">Learn more</a>
            </div>

            {/* What changed */}
            {applied === sel && change && change.id === sel && (() => {
              const b = change.before, x = change.after;
              const last = (r: typeof b) => r.depletedAge ?? 90;
              const rows: [string, string, string, number, (n: number) => string, boolean][] = [
                ["Taxes saved this year", money(b.taxSavedNow), money(x.taxSavedNow), x.taxSavedNow - b.taxSavedNow, money, true],
                ["Saving each month", money(b.savingToday), money(x.savingToday), x.savingToday - b.savingToday, money, true],
                [`Savings at retirement`, `${compact(b.atRetire.nominal)} at ${change.beforeA.retireAge}`, `${compact(x.atRetire.nominal)} at ${change.afterA.retireAge}`, x.atRetire.nominal - b.atRetire.nominal, compact, true],
                ["Money lasts until", b.depletedAge ? `Age ${b.depletedAge}` : "Past 90", x.depletedAge ? `Age ${x.depletedAge}` : "Past 90", last(x) - last(b), (n) => `${n} yr${n === 1 ? "" : "s"}`, true],
              ];
              return (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl bg-white p-4 ring-2 ring-emerald-400">
                  <div className="flex items-center gap-2 font-semibold text-emerald-800"><Check size={18} /> Done. Here's what changed in {who === "you" ? "your" : "Dave's"} plan:</div>
                  <div className="mt-3 divide-y divide-slate-100">
                    {rows.map(([label, from, to, delta, fmt, upGood]) => (
                      <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2 text-[15px]">
                        <span className="text-slate-600">{label}</span>
                        <span className="flex items-center gap-2"><span className="num text-slate-400 line-through decoration-slate-300">{from}</span><span className="text-slate-400">→</span><span className="num font-bold text-navy">{to}</span>
                          {Math.abs(delta) >= 0.5 && <span className={cx("num rounded-full px-2 py-0.5 text-[12px] font-bold", (delta > 0) === upGood ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700")}>{delta > 0 ? "+" : "−"}{fmt(Math.abs(delta))}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button onClick={seePlan} className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-sm font-semibold text-white">See it highlighted in the plan →</button>
                </motion.div>
              );
            })()}

            {/* Do / Don't */}
            {d && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-emerald-200">
                  <div className="font-semibold text-emerald-700">✅ What to do</div>
                  <ul className="mt-2 space-y-1.5 text-[14px] text-slate-700">{d.do.map((t) => <li key={t} className="flex gap-2"><span className="text-emerald-500">•</span>{t}</li>)}</ul>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-orange-200">
                  <div className="font-semibold text-orange-700">❌ What not to do</div>
                  <ul className="mt-2 space-y-1.5 text-[14px] text-slate-700">{d.dont.map((t) => <li key={t} className="flex gap-2"><span className="text-orange-400">•</span>{t}</li>)}</ul>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
