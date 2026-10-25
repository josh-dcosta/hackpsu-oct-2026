import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { CORE, EXTRA, moduleHref, nextLessonFor, type ModuleMeta } from "../data/modules";
import { cx } from "../components/ui";

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
      <div className="mt-4 flex items-center justify-between text-[13px] font-semibold text-slate-500"><span className="flex items-center gap-1"><Clock size={13} />{m.minutes} min</span><span className="flex items-center gap-1 text-emerald-600 group-hover:gap-2 transition-all">Start <ArrowRight size={14} /></span></div>
    </motion.a>
  );
}

export default function Learn() {
  const { done } = useStore();
  const nextUp = nextLessonFor(done);
  const coreDone = CORE.filter((m) => done.includes(m.id)).length;
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold">Learn by doing</h1>
      <p className="mt-2 max-w-2xl text-lg text-slate-500">Practical, safe money basics. Each lesson teaches one idea, then gives you a real-world simulation that's already filled in. Tweak it to fit your own life, ask Next Step anything, and finish with a 3-question check.</p>
      <a href={moduleHref(nextUp.id)} className="mt-6 flex items-center gap-4 rounded-3xl hero-dark p-5 text-white">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-3xl">{nextUp.emoji}</span>
        <span className="flex-1"><span className="text-[13px] font-semibold text-emerald-300">Up next</span><span className="block font-display text-2xl font-semibold">{nextUp.title}</span></span>
        <ArrowRight />
      </a>

      <div className="mt-8 flex items-end justify-between gap-3">
        <div>
          <div className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">Start here</div>
          <h2 className="font-display text-2xl font-semibold">The 3 essentials</h2>
          <p className="text-slate-500">Protect your money, choose the right retirement account, and invest the simple, safe way.</p>
        </div>
        <span className="num shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{coreDone}/3 done</span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {CORE.map((m, i) => <LessonCard key={m.id} m={m} i={i} step={i + 1} />)}
      </div>

      <div className="mt-10">
        <div className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Go deeper</div>
        <h2 className="font-display text-2xl font-semibold">More lessons</h2>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXTRA.map((m, i) => <LessonCard key={m.id} m={m} i={i} />)}
      </div>
    </div>
  );
}
