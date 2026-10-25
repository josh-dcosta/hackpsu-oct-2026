import { CheckCircle2, Circle, Download, RotateCcw, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useStore, BADGES } from "../lib/store";
import { MODULES, moduleHref } from "../data/modules";
import { RULES } from "../lib/rules";
import { downloadPlan } from "../lib/pdf";
import { Button, Card, Stat, cx } from "../components/ui";

const MILESTONES = [
  { xp: 100, name: "Money Curious", emoji: "🌱" },
  { xp: 300, name: "Smart Saver", emoji: "🌿" },
  { xp: 600, name: "Future Builder", emoji: "🌳" },
  { xp: 1000, name: "Next Step Master", emoji: "🌊" },
];

export default function Progress() {
  const st = useStore();
  const { xp, badges, done, quiz, resetAll, profile } = st;
  const level = Math.floor(xp / 200) + 1;
  const correct = Object.values(quiz).flatMap((q) => Object.values(q)).filter(Boolean).length;
  const answered = Object.values(quiz).flatMap((q) => Object.values(q)).length;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Your progress</h1>
          <p className="mt-1 text-lg text-slate-500">You earn XP for learning and experimenting, never for taking more risk.</p>
        </div>
        <Button onClick={() => downloadPlan({ profile, assumptions: st.assumptions, story: st.story, done, xp, badges })}><Download size={18} /> Download my plan (PDF)</Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Level" value={level} tone="navy" big />
        <Stat label="XP" value={xp} tone="green" big />
        <Stat label="Lessons" value={`${done.length}/10`} tone="sky" big />
        <Stat label="Quiz answers right" value={`${correct}/${answered}`} big />
      </div>

      <Card className="mt-5">
        <div className="font-semibold">Unlockable milestones</div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MILESTONES.map((m) => {
            const on = xp >= m.xp;
            return (
              <div key={m.name} className={cx("rounded-2xl p-4 text-center ring-1", on ? "bg-emerald-50 ring-emerald-300" : "bg-slate-50 ring-slate-200 opacity-70")}>
                <div className={cx("text-3xl", !on && "grayscale")}>{m.emoji}</div>
                <div className="mt-1 font-semibold">{m.name}</div>
                <div className="text-[13px] text-slate-500">{on ? "Unlocked" : `${m.xp - xp} XP to go`}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="mt-5">
        <div className="font-semibold">Badges · {badges.length}/{BADGES.length}</div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BADGES.map((b, i) => {
            const on = badges.includes(b.id);
            return (
              <motion.div key={b.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                className={cx("rounded-2xl p-4 text-center ring-1", on ? "bg-white ring-emerald-300 shadow-card" : "bg-slate-50 ring-slate-200")}>
                <div className={cx("mx-auto grid h-14 w-14 place-items-center rounded-full text-3xl", on ? "bg-emerald-50" : "bg-slate-100 grayscale opacity-50")}>{b.emoji}</div>
                <div className="mt-2 text-[14px] font-semibold leading-tight">{b.name}</div>
                <div className="mt-1 text-[12px] text-slate-500">{b.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      <Card className="mt-5">
        <div className="font-semibold">Your learning roadmap</div>
        <div className="mt-3 divide-y divide-slate-100">
          {MODULES.map((m) => (
            <a key={m.id} href={moduleHref(m.id)} className="flex items-center gap-3 py-3 hover:bg-slate-50 rounded-xl px-2">
              {done.includes(m.id) ? <CheckCircle2 className="text-emerald-500" /> : <Circle className="text-slate-300" />}
              <span className="text-xl">{m.emoji}</span>
              <span className="flex-1 font-semibold">{m.title}</span>
              <span className="text-[13px] text-slate-500">{quiz[m.id] ? `${Object.values(quiz[m.id]).filter(Boolean).length}/3 quiz` : `${m.minutes} min`}</span>
            </a>
          ))}
        </div>
      </Card>

      <Card className="mt-5">
        <div className="font-semibold">About the numbers</div>
        <p className="mt-2 text-[15px] text-slate-600">Next Step is an educational tool. All simulations use hypothetical inputs and fictional money, and every calculation is done by fixed formulas. The AI coach explains those results but never invents its own. Projections can't predict the future: markets, inflation, taxes, and laws change. This is not financial, tax, legal, or investment advice.</p>
        <p className="mt-3 text-[13px] font-semibold text-slate-500">{RULES.year} limits verified {RULES.verifiedOn} from:</p>
        <ul className="mt-1 space-y-1">
          {RULES.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[14px] font-medium text-emerald-700 hover:underline">{s.label} <ExternalLink size={12} /></a></li>)}
        </ul>
      </Card>

      <div className="mt-6 flex justify-center">
        <button onClick={() => { if (confirm("Start over? This clears your profile, progress and simulations on this device.")) resetAll(); }} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"><RotateCcw size={15} /> Start over</button>
      </div>
    </div>
  );
}
