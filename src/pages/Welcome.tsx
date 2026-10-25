import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, Sparkles } from "lucide-react";
import { useStore, SAMPLE_PROFILES, loadMine, clearMine } from "../lib/store";
import { Button, Slider, cx } from "../components/ui";
import { Logo } from "../components/Brand";
import { money } from "../lib/format";
import type { Profile } from "../lib/calc";
import { DAVE, DAVE_PROFILE, DAVE_ASSUMPTIONS, CUSTOM_PROFILE, CUSTOM_ASSUMPTIONS } from "../data/dave";
import { UserRound, PlayCircle, Pencil } from "lucide-react";

const GOALS = ["Build an emergency fund", "Pay off debt", "Buy a home", "Start investing", "Save for a child's education", "Retire comfortably", "Understand my money better", "Handle healthcare costs"];
const LEVELS: { id: Profile["level"]; emoji: string; text: string }[] = [
  { id: "Beginner", emoji: "🌱", text: "Keep it simple. No jargon, please." },
  { id: "Intermediate", emoji: "🌿", text: "I know the basics and want to go deeper." },
  { id: "Advanced", emoji: "🌳", text: "Give me the details and the formulas." },
];
const AGES = [
  { id: "25–35", text: "Building a foundation" },
  { id: "35–45", text: "Growing family & career" },
  { id: "45–55", text: "Peak saving years" },
  { id: "55–65", text: "Getting ready to retire" },
];

function Q({ title, sub, children, canSkip = true, onBack: back, onNext: next }: { title: string; sub?: string; children: React.ReactNode; canSkip?: boolean; onBack: () => void; onNext: () => void }) {
  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">{title}</h1>
      {sub && <p className="mt-2 text-[17px] text-slate-500">{sub}</p>}
      <div className="mt-7">{children}</div>
      <div className="mt-8 flex items-center justify-between gap-3">
        <button onClick={back} className="flex items-center gap-1 rounded-xl px-3 py-3 font-semibold text-slate-500 hover:text-navy"><ArrowLeft size={18} /> Back</button>
        <div className="flex gap-2">
          {canSkip && <button onClick={next} className="rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-100">Skip</button>}
          <Button onClick={next}>Continue <ArrowRight size={18} /></Button>
        </div>
      </div>
    </div>
  );
}

export default function Welcome() {
  const { profile, set, award, badge, setEntered } = useStore();
  const mine = loadMine();
  // "#/welcome?edit" jumps straight to editing your own numbers
  const editing = window.location.hash.includes("edit");
  const [step, setStep] = useState(editing ? 1 : 0);
  const [p, setP] = useState<Profile>(editing && mine ? { ...mine.profile } : profile.onboarded ? { ...profile } : { ...DAVE_PROFILE });
  const total = 9;
  const next = () => setStep((s) => Math.min(total + 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const patch = (x: Partial<Profile>) => setP((v) => ({ ...v, ...x }));

  const finish = (final: Profile) => {
    // switching scenario: fresh assumptions & simulators for that scenario
    const custom = final.scenario === "custom";
    // Editing your own numbers keeps your plan choices; the demo always starts fresh
    const keep = custom && mine;
    set({ profile: { ...final, onboarded: true }, assumptions: keep ? mine.assumptions : custom ? { ...CUSTOM_ASSUMPTIONS } : { ...DAVE_ASSUMPTIONS }, sims: keep ? mine.sims : {}, stepsDone: keep ? mine.stepsDone : {} });
    setEntered(true);
    setTimeout(() => { award(50, "Welcome to Next Step", "onboard"); badge("welcome"); }, 400);
    window.location.hash = "#/";
  };
  const demo = () => finish({ ...DAVE_PROFILE, onboarded: true });
  const walkDave = () => { setP({ ...DAVE_PROFILE }); next(); };
  const ownNumbers = () => { setP(mine ? { ...mine.profile } : { ...CUSTOM_PROFILE }); next(); };
  const freshNumbers = () => { clearMine(); setP({ ...CUSTOM_PROFILE }); next(); };
  const continueMine = () => {
    if (!mine) return;
    set({ profile: { ...mine.profile, onboarded: true }, assumptions: mine.assumptions, sims: mine.sims, stepsDone: mine.stepsDone });
    setEntered(true); window.location.hash = "#/";
  };
  const custom = p.scenario === "custom";

  const steps = [
    // 0 — the Why
    <div key="intro" className="text-center">
      <div className="mx-auto w-fit"><Logo size={72} /></div>
      <h1 className="mt-6 font-display text-4xl sm:text-6xl font-semibold leading-[1.05] tracking-tight">See tomorrow<br />before you spend today.</h1>
      <p className="mx-auto mt-5 max-w-lg text-lg sm:text-xl text-slate-600">Every money choice you make sends ripples into your future. Next Step shows you where they land, <span className="text-emerald-600 font-semibold">before</span> you make them.</p>
      <div className="mx-auto mt-9 grid max-w-3xl gap-4 text-left sm:grid-cols-2">
        {/* Demo */}
        <div className="flex flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-2xl">🧹</span>
            <div><div className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">See how it works</div><div className="font-display text-xl font-semibold">Dave's demo scenario</div></div>
          </div>
          <p className="mt-3 flex-1 text-[15px] text-slate-600">Dave, 50, is a head custodian at a Pennsylvania public high school, earning about ${DAVE.hourly}/hour. With Linda's part-time job they bring in <b>$64,000</b> a year, have <b>$6,000</b> saved, and two kids, <b>Emma (17)</b> and <b>Jake (15)</b>, heading to college soon.</p>
          <Button onClick={demo} className="mt-4 w-full text-lg"><Sparkles size={18} /> Explore Dave's demo</Button>
          <button onClick={walkDave} className="mt-2 flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold text-slate-500 hover:text-navy"><PlayCircle size={15} /> Walk through Dave's answers first</button>
        </div>
        {/* Own */}
        <div className="flex flex-col rounded-3xl bg-navy p-6 text-white shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl">🙋</span>
            <div><div className="text-[12px] font-bold uppercase tracking-wider text-emerald-300">{mine ? "Welcome back" : "Make it yours"}</div><div className="font-display text-xl font-semibold">{mine ? `${mine.profile.name || "Your"}${mine.profile.name ? "'s" : ""} numbers` : "Use my own numbers"}</div></div>
          </div>
          <p className="mt-3 flex-1 text-[15px] text-slate-300">{mine
            ? `Pick up where you left off: ${money(mine.profile.income)} a year${mine.profile.kids?.length ? `, ${mine.profile.kids.length} ${mine.profile.kids.length === 1 ? "child" : "children"}` : ""}, and your plan and next steps saved on this device.`
            : "Answer a few quick questions (about 2 minutes) and see your own retirement answer, plan and next steps. Rough guesses are fine."}</p>
          {mine ? (
            <>
              <button onClick={continueMine} className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-[17px] font-semibold text-white hover:bg-emerald-600 whitespace-nowrap"><UserRound size={18} /> Continue with my numbers</button>
              <div className="mt-2 flex justify-center gap-4">
                <button onClick={ownNumbers} className="flex items-center gap-1.5 rounded-xl py-2 text-sm font-semibold text-slate-300 hover:text-white"><Pencil size={14} /> Edit my answers</button>
                <button onClick={freshNumbers} className="rounded-xl py-2 text-sm font-semibold text-slate-400 hover:text-white">Start fresh</button>
              </div>
            </>
          ) : (
            <button onClick={ownNumbers} className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-lg font-semibold text-white hover:bg-emerald-600"><UserRound size={19} /> Enter my numbers <ArrowRight size={18} /></button>
          )}
        </div>
      </div>
      <p className="mt-5 flex items-center justify-center gap-2 text-[14px] text-slate-500"><Lock size={14} /> No bank logins. No account numbers. Rough guesses are perfect.</p>
    </div>,
    <Q onBack={back} onNext={next} key="name" title={custom ? "First, what should we call you?" : "First, what should we call you?"} sub={custom ? "Optional. It just makes things friendlier." : "This is Dave's scenario. Every answer is filled in; just tap Continue."}>
      <label htmlFor="nm" className="sr-only">Your first name</label>
      <input id="nm" autoFocus value={p.name || ""} onChange={(e) => patch({ name: e.target.value.slice(0, 30) })} placeholder="Your first name"
        className="w-full rounded-2xl bg-white px-5 py-4 text-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" />
      <label htmlFor="job" className="mt-5 block text-[15px] font-medium text-slate-700">What do you do for work? <span className="text-slate-400">(optional)</span></label>
      <input id="job" value={p.job || ""} onChange={(e) => patch({ job: e.target.value.slice(0, 60) })} placeholder="e.g. Plumber, nurse, teacher's aide"
        className="mt-1 w-full rounded-2xl bg-white px-5 py-4 text-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" />
    </Q>,
    <Q onBack={back} onNext={next} key="age" title="Which age range are you in?" sub="This helps us show what matters most at your stage of life." canSkip={false}>
      <div className="grid gap-3 sm:grid-cols-2">
        {AGES.map((a) => (
          <button key={a.id} onClick={() => { if (custom) patch({ ageRange: a.id, age: SAMPLE_PROFILES[a.id].age }); else { patch({ ...SAMPLE_PROFILES[a.id] }); setTimeout(next, 180); } }}
            className={cx("rounded-3xl p-5 text-left ring-2 transition", p.ageRange === a.id ? "bg-emerald-50 ring-emerald-500" : "bg-white ring-slate-200 hover:ring-emerald-300")}>
            <div className="font-display text-3xl font-semibold">{a.id}</div>
            <div className="mt-1 text-slate-500">{a.text}</div>
          </button>
        ))}
      </div>
      {custom && (
        <div className="mt-5 rounded-3xl bg-white p-5 ring-1 ring-slate-200">
          <Slider label="Your exact age" value={p.age} min={18} max={75} onChange={(v) => patch({ age: v, ageRange: v < 35 ? "25–35" : v < 45 ? "35–45" : v < 55 ? "45–55" : "55–65" })} format={(v) => `${v} years old`} />
        </div>
      )}
    </Q>,
    <Q onBack={back} onNext={next} key="kids" title="Do you have children?" sub={custom ? "Kids change budgets and bring college costs. Add each one with their age." : "Dave and Linda have two teenagers: Emma and Jake."}>
      <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Number of children</span>
          <div className="flex items-center gap-3">
            <button aria-label="Remove a child" onClick={() => patch({ kids: (p.kids || []).slice(0, -1) })} className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-2xl font-bold hover:bg-slate-200">−</button>
            <span className="num w-8 text-center text-2xl font-bold">{(p.kids || []).length}</span>
            <button aria-label="Add a child" onClick={() => patch({ kids: [...(p.kids || []), { name: `Child ${(p.kids || []).length + 1}`, age: 10 }].slice(0, 6) })} className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500 text-2xl font-bold text-white hover:bg-emerald-600">+</button>
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
    <Q onBack={back} onNext={next} key="inc" title="About how much do you earn in a year?" sub={custom ? "Before taxes, for your whole household. A rough number is fine." : "Dave earns about $46,000 and Linda about $18,000 part-time."}>
      <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
        <div className="text-center font-display text-5xl font-semibold num">{money(p.income)}</div>
        <Slider label="Yearly income" value={p.income} min={0} max={300000} step={1000} onChange={(v) => patch({ income: v })} format={money} />
      </div>
    </Q>,
    <Q onBack={back} onNext={next} key="exp" title="What do you spend in a typical month?" sub="Rent or mortgage, food, bills, everything.">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
        <div className="text-center font-display text-5xl font-semibold num">{money(p.expenses)}</div>
        <Slider label="Monthly spending" value={p.expenses} min={500} max={15000} step={100} onChange={(v) => patch({ expenses: v })} format={money} />
      </div>
    </Q>,
    <Q onBack={back} onNext={next} key="sav" title="How much do you have saved?" sub="Checking and savings accounts, not counting retirement.">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
        <div className="text-center font-display text-5xl font-semibold num">{money(p.savings)}</div>
        <Slider label="Savings" value={p.savings} min={0} max={200000} step={500} onChange={(v) => patch({ savings: v })} format={money} />
      </div>
    </Q>,
    <Q onBack={back} onNext={next} key="ret" title="And invested for retirement?" sub="401(k), IRA, and similar accounts. Zero is a perfectly fine answer.">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
        <div className="text-center font-display text-5xl font-semibold num">{money(p.retirement)}</div>
        <Slider label="Retirement savings" value={p.retirement} min={0} max={1500000} step={1000} onChange={(v) => patch({ retirement: v })} format={money} />
      </div>
    </Q>,
    <Q onBack={back} onNext={next} key="goals" title="What would you like to work on?" sub="Pick as many as you like.">
      <div className="flex flex-wrap gap-2">
        {GOALS.map((g) => {
          const on = p.goals.includes(g);
          return <button key={g} aria-pressed={on} onClick={() => patch({ goals: on ? p.goals.filter((x) => x !== g) : [...p.goals, g] })}
            className={cx("rounded-full px-4 py-3 text-[15px] font-semibold ring-2 transition", on ? "bg-navy text-white ring-navy" : "bg-white ring-slate-200 hover:ring-emerald-300")}>{on ? "✓ " : ""}{g}</button>;
        })}
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
    <div key="build" className="text-center">
      <motion.div className="mx-auto w-fit" animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}><Logo size={80} /></motion.div>
      <h1 className="mt-6 font-display text-4xl font-semibold">Your future is ready{p.name ? `, ${p.name}` : ""}.</h1>
      <p className="mx-auto mt-3 max-w-md text-lg text-slate-600">We built a personal, pretend projection from your answers. Everything is an educational estimate you can change.</p>
      <Button onClick={() => finish(p)} className="mt-8 text-lg px-8 py-4">Show me my future <ArrowRight size={20} /></Button>
    </div>,
  ];

  return (
    <div className="ripple-bg min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-8">
        {step > 0 && step <= total && (
          <div className="mb-8 flex items-center gap-3" aria-label={`Step ${step} of ${total}`}>
            <Logo size={32} />
            <div className="h-2 flex-1 rounded-full bg-slate-200"><motion.div className="h-2 rounded-full bg-emerald-500" animate={{ width: `${(step / total) * 100}%` }} /></div>
            <span className="text-sm font-semibold text-slate-500 num">{step}/{total}</span>
          </div>
        )}
        <div className="my-auto">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>{steps[step]}</motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
