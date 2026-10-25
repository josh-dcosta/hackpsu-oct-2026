import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, Sparkles } from "lucide-react";
import { useStore, SAMPLE_PROFILES } from "../lib/store";
import { Button, RippleMark, Slider, cx } from "../components/ui";
import { money } from "../lib/format";
import type { Profile } from "../lib/calc";

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
  const { profile, set, award, badge } = useStore();
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Profile>({ ...profile });
  const total = 8;
  const next = () => setStep((s) => Math.min(total + 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const patch = (x: Partial<Profile>) => setP((v) => ({ ...v, ...x }));

  const finish = (final: Profile) => {
    set({ profile: { ...final, onboarded: true } });
    setTimeout(() => { award(50, "Welcome to Ripple", "onboard"); badge("welcome"); }, 400);
    window.location.hash = "#/";
  };
  const demo = () => finish({ ...p, ...SAMPLE_PROFILES["25–35"], name: "Alex", goals: ["Retire comfortably", "Build an emergency fund", "Start investing"], level: "Beginner", onboarded: true });

  const steps = [
    // 0 — the Why
    <div key="intro" className="text-center">
      <div className="mx-auto w-fit"><RippleMark size={72} /></div>
      <h1 className="mt-6 font-display text-4xl sm:text-6xl font-semibold leading-[1.05] tracking-tight">See tomorrow<br />before you spend today.</h1>
      <p className="mx-auto mt-5 max-w-lg text-lg sm:text-xl text-slate-600">Every money choice you make sends ripples into your future. Ripple shows you where they land, <span className="text-emerald-600 font-semibold">before</span> you make them.</p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button onClick={next} className="w-full sm:w-auto text-lg px-8 py-4">Let's begin <ArrowRight size={20} /></Button>
        <Button variant="ghost" onClick={demo} className="w-full sm:w-auto text-lg px-6 py-4"><Sparkles size={18} /> Try a demo profile</Button>
      </div>
      <p className="mt-6 flex items-center justify-center gap-2 text-[14px] text-slate-500"><Lock size={14} /> No bank logins. No account numbers. Rough guesses are perfect.</p>
    </div>,
    <Q onBack={back} onNext={next} key="name" title="First, what should we call you?" sub="Optional. It just makes things friendlier.">
      <label htmlFor="nm" className="sr-only">Your first name</label>
      <input id="nm" autoFocus value={p.name || ""} onChange={(e) => patch({ name: e.target.value.slice(0, 30) })} placeholder="Your first name"
        className="w-full rounded-2xl bg-white px-5 py-4 text-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" />
    </Q>,
    <Q onBack={back} onNext={next} key="age" title="Which age range are you in?" sub="This helps us show what matters most at your stage of life." canSkip={false}>
      <div className="grid gap-3 sm:grid-cols-2">
        {AGES.map((a) => (
          <button key={a.id} onClick={() => { patch({ ...SAMPLE_PROFILES[a.id] }); setTimeout(next, 180); }}
            className={cx("rounded-3xl p-5 text-left ring-2 transition", p.ageRange === a.id ? "bg-emerald-50 ring-emerald-500" : "bg-white ring-slate-200 hover:ring-emerald-300")}>
            <div className="font-display text-3xl font-semibold">{a.id}</div>
            <div className="mt-1 text-slate-500">{a.text}</div>
          </button>
        ))}
      </div>
    </Q>,
    <Q onBack={back} onNext={next} key="inc" title="About how much do you earn in a year?" sub="Before taxes. A rough number is fine. We've filled in a typical one.">
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
    <Q onBack={back} onNext={next} key="lvl" title="How comfortable are you with money topics?" sub="Ripple will explain things at your level. You can change this anytime." canSkip={false}>
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
      <motion.div className="mx-auto w-fit" animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}><RippleMark size={80} /></motion.div>
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
            <RippleMark size={32} />
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
