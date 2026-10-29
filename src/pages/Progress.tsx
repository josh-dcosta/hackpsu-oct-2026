import { CheckCircle2, Circle, Download, RotateCcw, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { MODULES, moduleHref } from "../data/modules";
import { RULES } from "../lib/rules";
import { downloadPlan } from "../lib/pdf";
import { Button, Card, Stat } from "../components/ui";
import { Panels, Fill } from "../components/Panels";

export default function Progress() {
  const st = useStore();
  const { done, quiz, resetAll, profile, stepsDone } = st;
  const correct = Object.values(quiz).flatMap((q) => Object.values(q)).filter(Boolean).length;
  const answered = Object.values(quiz).flatMap((q) => Object.values(q)).length;
  const stepsChecked = Object.values(stepsDone || {}).filter(Boolean).length;
  const pctDone = Math.round((done.length / MODULES.length) * 100);
  const head = (
    <div className="mb-3 flex shrink-0 flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold">Your progress</h1>
        <p className="mt-1 text-[16px] text-slate-500">Lessons you've completed and the real-world steps you've taken.</p>
      </div>
      <Button onClick={() => downloadPlan({ profile, assumptions: st.assumptions, story: st.story, done, xp: 0, badges: [], stepsDone, moments: st.moments })}><Download size={18} /> Download my plan (PDF)</Button>
    </div>
  );
  return (
    <Panels top={head} tabs={[
      { id: "lessons", label: "My lessons", body: () => <Fill center={false}><div className="grid items-start gap-4 lg:grid-cols-3">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[13px] font-semibold text-slate-500">Lessons completed</div>
            <div className="num font-display text-5xl font-semibold">{done.length}<span className="text-2xl text-slate-400"> / {MODULES.length}</span></div>
          </div>
          <div className="num text-lg font-bold text-emerald-600">{pctDone}%</div>
        </div>
        <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-100"><motion.div className="h-4 rounded-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${pctDone}%` }} /></div>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-1">
          <Stat label="Next steps checked off" value={stepsChecked} tone="green" />
          <Stat label="Quiz answers right" value={`${correct}/${answered}`} tone="sky" />
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <div className="font-semibold">Your lessons</div>
        <div className="mt-2 divide-y divide-slate-100">
          {MODULES.map((m) => (
            <a key={m.id} href={moduleHref(m.id)} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50">
              {done.includes(m.id) ? <CheckCircle2 className="text-emerald-500" /> : <Circle className="text-slate-300" />}
              <span className="text-xl">{m.emoji}</span>
              <span className="flex-1 font-semibold">{m.title}</span>
              <span className="text-[13px] text-slate-500">{quiz[m.id] ? `${Object.values(quiz[m.id]).filter(Boolean).length}/3 quiz` : `${m.minutes} min`}</span>
            </a>
          ))}
        </div>
      </Card>

      </div></Fill> },
      { id: "numbers", label: "About the numbers", body: () => <Fill center={false}><>
      <Card>
        <div className="font-semibold">About the numbers</div>
        <p className="mt-2 text-[15px] text-slate-600">Next Step is an educational tool. All simulations use hypothetical inputs and fictional money, and every calculation is done by fixed formulas. Nothing you enter leaves your device. Projections can't predict the future: markets, inflation, taxes, and laws change. This is not financial, tax, legal, or investment advice.</p>
        <p className="mt-3 text-[13px] font-semibold text-slate-500">{RULES.year} limits verified {RULES.verifiedOn} from:</p>
        <ul className="mt-1 space-y-1">
          {RULES.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[14px] font-medium text-emerald-700 hover:underline">{s.label} <ExternalLink size={12} /></a></li>)}
        </ul>
      </Card>

      <div className="mt-6 flex justify-center">
        <button onClick={() => { if (confirm("Start over? This clears your profile, progress and simulations on this device.")) resetAll(); }} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"><RotateCcw size={15} /> Start over</button>
      </div>
      </></Fill> },
    ]} />
  );
}
