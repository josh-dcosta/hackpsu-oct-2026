import { ArrowRight, Clock, RotateCcw, ExternalLink } from "lucide-react";
import { useStore } from "../lib/store";
import { CORE, MODULES, moduleHref, type ModuleMeta } from "../data/modules";
import { RULES } from "../lib/rules";
import { Card } from "../components/ui";
import { Panels, Fill } from "../components/Panels";

const isCore = (m: ModuleMeta) => CORE.some((c) => c.id === m.id);

function LessonRow({ m }: { m: ModuleMeta }) {
  return (
    <a href={moduleHref(m.id)} className="group flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card ring-1 ring-slate-200/70 transition hover:ring-emerald-400">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-2xl" style={{ background: m.color + "1f" }}>{m.emoji}</span>
      <span className="min-w-0 flex-1">
        <span className="font-semibold">{m.title}</span>
        {isCore(m) && <span className="ml-2 rounded-full bg-navy px-2 py-0.5 align-middle text-[10px] font-bold uppercase text-white">Essential</span>}
        <span className="block truncate text-[13px] text-slate-500">{m.blurb}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-[13px] text-slate-500"><Clock size={13} />{m.minutes} min</span>
      <ArrowRight size={16} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-navy" />
    </a>
  );
}

/** Learn: every lesson in one list (the 3 essentials first), plus where the numbers come from. */
export default function Learn() {
  const { resetAll } = useStore();
  const lessons = [...MODULES].sort((a, b) => Number(isCore(b)) - Number(isCore(a)));
  const head = (
    <div className="mb-3 shrink-0">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">Learn by doing</h1>
      <p className="mt-1 text-[16px] text-slate-500">Short lessons, each with a simulator and a 3-question check. Start with the 3 essentials.</p>
    </div>
  );
  return (
    <Panels top={head} tabs={[
      { id: "lessons", label: "Lessons", body: () => (
        <Fill center={false}>
          <div className="grid gap-2.5 lg:grid-cols-2">{lessons.map((m) => <LessonRow key={m.id} m={m} />)}</div>
        </Fill>
      ) },
      { id: "numbers", label: "About the numbers", body: () => (
        <Fill center={false}>
          <Card>
            <div className="font-semibold">About the numbers</div>
            <p className="mt-2 text-[15px] text-slate-600">Next Step is an educational tool. All simulations use hypothetical inputs and fictional money, and every calculation is done by fixed formulas. Nothing you enter leaves your device. Projections can't predict the future: markets, inflation, taxes, and laws change. This is not financial, tax, legal, or investment advice.</p>
            <p className="mt-3 text-[13px] font-semibold text-slate-500">{RULES.year} limits verified {RULES.verifiedOn} from:</p>
            <ul className="mt-1 space-y-1">
              {RULES.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[14px] font-medium text-emerald-700 hover:underline">{s.label} <ExternalLink size={12} /></a></li>)}
            </ul>
          </Card>
          <div className="mt-6 flex justify-center">
            <button onClick={() => { if (confirm("Start over? This clears your numbers and simulations on this device.")) resetAll(); }} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"><RotateCcw size={15} /> Start over</button>
          </div>
        </Fill>
      ) },
    ]} />
  );
}
