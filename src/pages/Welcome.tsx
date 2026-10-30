import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";

import { Button, MoneyInput, Slider, cx } from "../components/ui";
import { AGE_BANDS, ALL_JOBS, JOBS, STATES, matchJob, stateByCode, stateTaxLabel, taxes, type Filing } from "../data/grounding";
import { Logo } from "../components/Brand";
import { ScenarioCards, useScenario } from "../components/Scenario";
import { money } from "../lib/format";
import type { Profile } from "../lib/calc";
import { CUSTOM_PROFILE } from "../data/dave";
import { MOMENTS, autoMoments, whyAuto, type MomentId } from "../lib/plan";

const RETIRE_AGES = [55, 60, 62, 65, 67, 70, 72];
const LEVELS: { id: Profile["level"]; emoji: string; text: string }[] = [
  { id: "Beginner", emoji: "🌱", text: "Keep it simple. No jargon, please." },
  { id: "Intermediate", emoji: "🌿", text: "I know the basics and want to go deeper." },
  { id: "Advanced", emoji: "🌳", text: "Give me the details and the formulas." },
];
const AGES = AGE_BANDS; // Federal Reserve SCF age groups
const FILINGS: { id: Filing; label: string }[] = [{ id: "single", label: "Single" }, { id: "married", label: "Married, filing together" }, { id: "head", label: "Head of household" }];
const Src = ({ children }: { children: React.ReactNode }) => <span className="text-[12px] text-slate-400">Source: {children}</span>;

function Q({ title, sub, children, canSkip = true, ready = true, nextLabel = "Continue", onBack: back, onNext: next }: { title: string; sub?: string; children: React.ReactNode; canSkip?: boolean; ready?: boolean; nextLabel?: string; onBack: () => void; onNext: () => void }) {
  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">{title}</h1>
      {sub && <p className="mt-2 text-[17px] text-slate-500">{sub}</p>}
      <div className="mt-7">{children}</div>
      <div className="mt-8 flex items-center justify-between gap-3">
        <button onClick={back} className="flex items-center gap-1 rounded-xl px-3 py-3 font-semibold text-slate-500 hover:text-navy"><ArrowLeft size={18} /> Back</button>
        <div className="flex gap-2">
          {canSkip && <button onClick={next} className="rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-100">Skip</button>}
          <Button onClick={next} disabled={!ready}>{nextLabel} <ArrowRight size={18} /></Button>
        </div>
      </div>
    </div>
  );
}

function Typical({ label, value, current, onUse, src }: { label: string; value: number; current: number; onUse: (v: number) => void; src: string }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
      <div className="min-w-0"><div className="text-[14px] text-slate-700">{label}: <b className="num text-navy">{money(value)}</b></div><Src>{src}</Src></div>
      {Math.abs(current - value) > 1 ? <button onClick={() => onUse(value)} className="rounded-xl bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50">Use typical</button>
        : <span className="text-[13px] font-semibold text-emerald-700">Filled in · change it to yours</span>}
    </div>
  );
}

export default function Welcome() {
  const { mine, finish, continueMine } = useScenario();
  // "#/try?walk=mine" (or ?edit) goes straight to the questions; otherwise returning visitors see "Welcome back"
  const h = window.location.hash;
  const walk = h.includes("walk=mine") || h.includes("edit");
  const [step, setStep] = useState(1);
  // Numbers already saved on this device? Go straight to the plan (edit them anytime from there)
  useEffect(() => { if (!walk && mine) continueMine(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // New visitors start blank: name, work and age range are required answers
  const [p, setP] = useState<Profile>(mine ? { ...CUSTOM_PROFILE, ...mine.profile, scenario: "custom" } : { ...CUSTOM_PROFILE, name: "", job: "", ageRange: "", state: undefined, kids: [], scenario: "custom" });
  const [retireAge, setRetireAge] = useState<number>(mine?.assumptions.retireAge ?? 67);
  const [picked, setPicked] = useState<string[] | null>(mine?.moments ?? null); // null = use the automatic picks
  const auto = autoMoments(p);
  const moments = (picked ?? auto) as MomentId[];
  const toggleMoment = (id: MomentId) => setPicked(moments.includes(id) ? moments.filter((x) => x !== id) : [...moments, id]);
  const retireOptions = RETIRE_AGES.filter((r) => r > p.age);
  // Fields the person has typed themselves; untouched ones get filled with typical values from real data
  const [touched, setTouched] = useState<Record<string, boolean>>(mine ? { income: true, savings: true, retirement: true } : {});
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const job = matchJob(p.job);
  const band = AGES.find((a) => a.id === p.ageRange) ?? AGES[1];
  const st = stateByCode(p.state);
  const tx = taxes(p.income, p.state, p.filing);
  const total = 10;
  const next = () => setStep((s) => Math.min(total + 1, s + 1));
  const back = () => { if (step === 1) { if (mine) continueMine(); else window.location.hash = "#/about"; } else setStep((s) => Math.max(0, s - 1)); };
  const patch = (x: Partial<Profile>) => setP((v) => ({ ...v, ...x }));

  const steps = [
    // 0: welcome back (only when numbers are already saved on this device)
    <div key="pick">
      <div className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">Try it now</div>
      <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold">Your plan</h1>
      <div className="mt-6"><ScenarioCards /></div>
    </div>,
    <Q onBack={back} onNext={next} key="name" title="First, tell me a little bit about yourself" sub="So I can help you better." canSkip={false} ready={!!p.name?.trim() && !!p.job?.trim()}>
      <label htmlFor="nm" className="block text-[15px] font-medium text-slate-700">What's your first name?</label>
      <input id="nm" autoFocus value={p.name || ""} required onChange={(e) => patch({ name: e.target.value.slice(0, 30) })} placeholder="Your first name"
        className="mt-1 w-full rounded-2xl bg-white px-5 py-4 text-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" />
      <label htmlFor="job" className="mt-5 block text-[15px] font-medium text-slate-700">What do you do for work?</label>
      <input id="job" list="job-list" value={p.job || ""} placeholder="e.g. Plumber, nurse, teacher's aide"
        onChange={(e) => { const v = e.target.value.slice(0, 60); const j = matchJob(v); patch({ job: v, ...(!touched.income && j ? { income: j.median } : {}) }); }}
        className="mt-1 w-full rounded-2xl bg-white px-5 py-4 text-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" />
      <datalist id="job-list">{JOBS.map((j) => <option key={j.id} value={j.label.replace("*", "")} />)}</datalist>
      {job && <p className="mt-2 text-[14px] text-slate-600">We'll compare you with <b>{job.label.replace("*", "")}</b>: typical pay <b className="num">{money(job.median)}</b> a year. <Src>BLS, 2025 median pay</Src></p>}
    </Q>,
    <Q onBack={back} onNext={next} key="age" title="Which age range are you in?" sub="This helps us show what matters most at your stage of life." canSkip={false} ready={!!p.ageRange}>
      <div className="grid gap-3 sm:grid-cols-3">
        {AGES.map((a) => (
          <button key={a.id} onClick={() => { if (retireAge <= a.age) setRetireAge(RETIRE_AGES.find((r) => r > a.age) ?? a.age + 3); patch({ ageRange: a.id, age: a.age, ...(!touched.savings ? { savings: a.bank } : {}), ...(!touched.retirement ? { retirement: a.retirement } : {}) }); }}
            className={cx("rounded-3xl p-5 text-left ring-2 transition", p.ageRange === a.id ? "bg-emerald-50 ring-emerald-500" : "bg-white ring-slate-200 hover:ring-emerald-300")}>
            <div className="font-display text-3xl font-semibold">{a.id}</div>
            <div className="mt-1 text-slate-500">{a.text}</div>
          </button>
        ))}
      </div>
      {p.ageRange && (
        <div className="mt-6">
          <div className="text-[15px] font-medium text-slate-700">When would you like to retire?</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {retireOptions.map((r) => (
              <button key={r} onClick={() => setRetireAge(r)} aria-pressed={retireAge === r}
                className={cx("num rounded-2xl px-4 py-2.5 text-[16px] font-semibold ring-2 transition", retireAge === r ? "bg-emerald-50 ring-emerald-500" : "bg-white ring-slate-200 hover:ring-emerald-300")}>{r}</button>
            ))}
          </div>
          <p className="mt-2 text-[13px] text-slate-500">You can change this later on Your future.</p>
        </div>
      )}
    </Q>,
    <Q onBack={back} onNext={next} key="state" title="Which state do you live in?" sub="State income tax changes how much of each paycheck you keep." canSkip={false} ready={!!p.state}>
      <label htmlFor="state" className="sr-only">Your state</label>
      <select id="state" value={p.state || ""} onChange={(e) => patch({ state: e.target.value || undefined })}
        className="w-full appearance-none rounded-2xl bg-white px-5 py-4 text-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-emerald-500">
        <option value="">Choose your state</option>
        {STATES.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}
      </select>
      {st && <div className="mt-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="text-lg font-semibold">{st.name}: {stateTaxLabel(st)}</div><Src>Tax Foundation, 2026 state income tax rates and brackets</Src></div>}
      <div className="mt-6 text-[15px] font-medium text-slate-700">How do you file your taxes?</div>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {FILINGS.map((f) => <button key={f.id} onClick={() => patch({ filing: f.id })} aria-pressed={(p.filing ?? "single") === f.id}
          className={cx("rounded-2xl px-4 py-3 text-[15px] font-semibold ring-2 transition", (p.filing ?? "single") === f.id ? "bg-emerald-50 ring-emerald-500" : "bg-white ring-slate-200 hover:ring-emerald-300")}>{f.label}</button>)}
      </div>
    </Q>,
    <Q onBack={back} onNext={next} key="kids" title="Do you have children?" sub="Kids change budgets and bring college costs. Add each one with their age.">
      <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Number of children</span>
          <div className="flex items-center gap-3">
            <button aria-label="Remove a child" onClick={() => patch({ kids: (p.kids || []).slice(0, -1) })} className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-2xl font-bold hover:bg-slate-200">−</button>
            <span className="num w-8 text-center text-2xl font-bold">{(p.kids || []).length}</span>
            <button aria-label="Add a child" onClick={() => patch({ kids: [...(p.kids || []), { name: `Child ${(p.kids || []).length + 1}`, age: 10 }].slice(0, 6) })} className="grid h-11 w-11 place-items-center rounded-xl bg-sun text-2xl font-bold text-navy hover:bg-sun-600">+</button>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {(p.kids || []).map((k, i) => (
            <div key={i} className="rounded-2xl bg-slate-50 p-4">
              <label htmlFor={`kid-${i}`} className="sr-only">Child {i + 1} name</label>
              <input id={`kid-${i}`} value={k.name} onChange={(e) => patch({ kids: (p.kids || []).map((x, j) => (j === i ? { ...x, name: e.target.value.slice(0, 20) } : x)) })}
                className="w-full rounded-xl bg-white px-3 py-2 text-lg font-semibold ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" />
              <Slider id={`kid-age-${i}`} label="Age" value={k.age} min={0} max={25} onChange={(v) => patch({ kids: (p.kids || []).map((x, j) => (j === i ? { ...x, age: v } : x)) })} format={(v) => (v === 0 ? "Baby" : `${v} years`)} />
            </div>
          ))}
          {(p.kids || []).length === 0 && <p className="text-slate-500">No kids? That's fine. Tap Continue.</p>}
        </div>
      </div>
    </Q>,
    <Q onBack={back} onNext={next} key="inc" title="About how much do you earn in a year, before taxes?" sub="For your whole household. A rough number is fine.">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
        <MoneyInput id="income" label="Yearly income" value={p.income} base={150000} onChange={(v) => { touch("income"); patch({ income: v }); }} />
        <Typical label={job ? `Typical for ${job.label.replace("*", "").toLowerCase()}` : "U.S. median pay, all jobs"} value={job?.median ?? ALL_JOBS.median} current={p.income}
          onUse={(v) => { touch("income"); patch({ income: v }); }} src={job ? "BLS Occupational Outlook Handbook, 2025 median pay" : "BLS, May 2025 median hourly wage × 2,080 hours"} />
        {p.income > 0 && <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-[14px] text-slate-600">After federal{st && st.brackets.length ? `, ${st.name}` : ""} and payroll taxes, you'd keep about <b className="num text-navy">{money(tx.takeHome)}</b> a year (<b className="num text-navy">{money(tx.takeHome / 12)}</b> a month). <Src>IRS 2026 brackets{st ? ", Tax Foundation 2026" : ""}</Src></p>}
      </div>
    </Q>,
    <Q onBack={back} onNext={next} key="exp" title="What do you spend in a typical month?" sub="Rent or mortgage, food, bills, everything.">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
        <MoneyInput id="expenses" label="Monthly spending" value={p.expenses} base={10000} onChange={(v) => patch({ expenses: v })} />
      </div>
    </Q>,
    <Q onBack={back} onNext={next} key="sav" title="How much do you have saved?" sub="Checking and savings accounts, not counting retirement.">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
        <MoneyInput id="savings" label="Savings" value={p.savings} base={50000} onChange={(v) => { touch("savings"); patch({ savings: v }); }} />
        <Typical label={`Typical for ages ${band.id.toLowerCase()}`} value={band.bank} current={p.savings} onUse={(v) => { touch("savings"); patch({ savings: v }); }}
          src="Federal Reserve 2025 Survey of Consumer Finances, median checking + savings" />
      </div>
    </Q>,
    <Q onBack={back} onNext={next} key="ret" title="And invested for retirement?" sub="401(k), IRA, and similar accounts. Zero is a perfectly fine answer.">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
        <MoneyInput id="retirement" label="Retirement savings" value={p.retirement} base={500000} onChange={(v) => { touch("retirement"); patch({ retirement: v }); }} />
        <Typical label={`Typical for ages ${band.id.toLowerCase()} who have an account`} value={band.retirement} current={p.retirement} onUse={(v) => { touch("retirement"); patch({ retirement: v }); }}
          src={`Federal Reserve 2025 Survey of Consumer Finances, median balance. About ${Math.round(band.share * 100)}% of families this age have one.`} />
      </div>
    </Q>,
    <Q onBack={back} onNext={next} key="lvl" title="How comfortable are you with money topics?" sub="Next Step will explain things at your level. You can change this anytime." canSkip={false}>
      <div className="grid gap-3">
        {LEVELS.map((l) => (
          <button key={l.id} onClick={() => patch({ level: l.id })}
            className={cx("flex items-center gap-4 rounded-3xl p-5 text-left ring-2 transition", p.level === l.id ? "bg-emerald-50 ring-emerald-500" : "bg-white ring-slate-200 hover:ring-emerald-300")}>
            <span className="text-3xl">{l.emoji}</span>
            <span><span className="block text-lg font-semibold">{l.id}</span><span className="text-slate-500">{l.text}</span></span>
          </button>
        ))}
      </div>
    </Q>,
    <Q onBack={back} onNext={() => finish(p, moments, retireAge)} key="work" canSkip={false} nextLabel="Show my plan"
      title="What would you like to work on?" sub="Pick everything that's happening in your life. Your plan is built around these.">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {MOMENTS.map((m) => {
          const on = moments.includes(m.id);
          return (
            <button key={m.id} onClick={() => toggleMoment(m.id)} aria-pressed={on}
              className={cx("flex items-start gap-3 rounded-2xl p-3.5 text-left ring-2 transition", on ? "bg-emerald-50 ring-emerald-500" : "bg-white ring-slate-200 hover:ring-emerald-300")}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="flex-1">
                <span className="block text-[16px] font-semibold leading-snug">{m.title}</span>
                <span className="block text-[13px] text-slate-500">{m.sub}</span>
                {auto.includes(m.id) && <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200"><Sparkles size={11} /> {whyAuto(p, m.id)}</span>}
              </span>
              <span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-lg ring-2", on ? "bg-emerald-500 text-navy ring-emerald-500" : "bg-white ring-slate-300")}>{on && <Check size={16} />}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[13px] text-slate-500">{moments.length ? `${moments.length} picked.` : "Nothing picked? Your plan will cover the basics."}</p>
    </Q>,
  ];

  return (
    <div className={cx("mx-auto flex flex-col", step === 0 ? "max-w-5xl" : "max-w-2xl py-2")}>
      {step > 0 && step <= total && (
        <div className="mb-8 flex items-center gap-3" aria-label={`Step ${step} of ${total}`}>
          <Logo size={32} />
          <div className="h-2 flex-1 rounded-full bg-slate-200"><motion.div className="h-2 rounded-full bg-emerald-500" animate={{ width: `${(step / total) * 100}%` }} /></div>
          <span className="text-sm font-semibold text-slate-500 num">{step}/{total}</span>
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>{steps[step]}</motion.div>
      </AnimatePresence>
    </div>
  );
}
