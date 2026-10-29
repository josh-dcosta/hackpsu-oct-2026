import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { CORE, MODULES, moduleHref, type ModuleMeta } from "../data/modules";
import { cx } from "../components/ui";
import { Panels, Fill } from "../components/Panels";

function LessonCard({ m, i, step }: { m: ModuleMeta; i: number; step?: number }) {
  const { done } = useStore();
  const isDone = done.includes(m.id);
  return (
    <motion.a href={moduleHref(m.id)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
      className={cx("group flex flex-col rounded-3xl bg-white p-5 shadow-card ring-1 transition hover:-translate-y-0.5", isDone ? "ring-emerald-300" : "ring-slate-200 hover:ring-emerald-400")}>
      <div className="flex items-start justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl text-2xl" style={{ background: m.color + "1f" }}>{m.emoji}</span>
        {isDone ? <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-bold text-emerald-700"><CheckCircle2 size={13} /> Done</span>
          : step ? <span className="rounded-full bg-navy px-2.5 py-1 text-[12px] font-bold text-white">Essential {step} of 3</span> : null}
      </div>
      <div className="mt-3 text-lg font-semibold leading-snug">{m.title}</div>
      <p className="mt-1 flex-1 text-[15px] text-slate-500">{m.blurb}</p>
      <div className="mt-4 flex items-center justify-between text-[13px] font-semibold text-slate-500"><span className="flex items-center gap-1"><Clock size={13} />{m.minutes} min</span><span className="flex items-center gap-1 text-emerald-600 transition-all group-hover:gap-2">Start <ArrowRight size={14} /></span></div>
    </motion.a>
  );
}

const GROUPS = [
  { id: "basics", label: "Money basics", sub: "How prices, life stages, saving and debt shape your money.", ids: ["inflation", "life", "saving", "debt"] },
  { id: "family", label: "Retirement & family", sub: "Workplace retirement plans, health savings and college.", ids: ["k401", "hsa", "college"] },
];

export default function Learn() {
  const { done } = useStore();
  const coreDone = CORE.filter((m) => done.includes(m.id)).length;
  const head = (
    <div className="mb-3 flex shrink-0 flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold">Learn by doing</h1>
        <p className="mt-1 max-w-2xl text-[16px] text-slate-500">Short lessons: one idea, a simulator, what it means, and a 3-question check.</p>
      </div>
      <a href="#/progress" className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50"><CheckCircle2 size={15} className="text-emerald-600" /> My progress</a>
    </div>
  );
  return (
    <Panels top={head} tabs={[
      {
        id: "core", label: "The 3 essentials", body: () => (
          <Fill>
            <div className="flex items-end justify-between gap-3">
              <p className="text-slate-500">Protect your money, choose the right retirement account, and invest the simple, safe way.</p>
              <span className="num shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{coreDone}/3 done</span>
            </div>
            <div className="mt-3 grid gap-4 md:grid-cols-3">{CORE.map((m, i) => <LessonCard key={m.id} m={m} i={i} step={i + 1} />)}</div>
          </Fill>
        ),
      },
      ...GROUPS.map((g) => ({
        id: g.id, label: g.label, body: () => (
          <Fill>
            <p className="text-slate-500">{g.sub}</p>
            <div className={cx("mt-3 grid gap-4 sm:grid-cols-2", g.ids.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
              {g.ids.map((id, i) => { const m = MODULES.find((x) => x.id === id)!; return <LessonCard key={id} m={m} i={i} />; })}
            </div>
          </Fill>
        ),
      })),
    ]} />
  );
}
