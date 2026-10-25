import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { MODULES, moduleHref } from "../data/modules";
import { cx } from "../components/ui";

export default function Learn() {
  const { profile, done } = useStore();
  const mine = MODULES.filter((m) => m.stages.includes(profile.ageRange));
  const rest = MODULES.filter((m) => !m.stages.includes(profile.ageRange));
  const roadmap = [...mine, ...rest];
  const nextUp = roadmap.find((m) => !done.includes(m.id));
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold">Learn by doing</h1>
      <p className="mt-2 max-w-2xl text-lg text-slate-500">Ten short lessons. Each one teaches a key idea, then gives you a real-world simulation already loaded with Dave's numbers. Tweak it to fit your own life, ask Next Step anything, and finish with a 3-question check.</p>
      {nextUp && (
        <a href={moduleHref(nextUp.id)} className="mt-6 flex items-center gap-4 rounded-3xl hero-dark p-5 text-white">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-3xl">{nextUp.emoji}</span>
          <span className="flex-1"><span className="text-[13px] font-semibold text-emerald-300">Up next on your roadmap</span><span className="block font-display text-2xl font-semibold">{nextUp.title}</span></span>
          <ArrowRight />
        </a>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roadmap.map((m, i) => {
          const isDone = done.includes(m.id);
          return (
            <motion.a key={m.id} href={moduleHref(m.id)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={cx("group flex flex-col rounded-3xl bg-white p-5 shadow-card ring-1 transition hover:-translate-y-0.5", isDone ? "ring-emerald-300" : "ring-slate-200 hover:ring-emerald-400")}>
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl text-2xl" style={{ background: m.color + "1f" }}>{m.emoji}</span>
                {isDone ? <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-bold text-emerald-700"><CheckCircle2 size={13} /> Done</span>
                  : m.stages.includes(profile.ageRange) ? <span className="rounded-full bg-sky-soft px-2.5 py-1 text-[12px] font-bold text-sky-800">For your stage</span> : null}
              </div>
              <div className="mt-3 text-[12px] font-bold uppercase tracking-wider text-slate-400">Lesson {m.letter}</div>
              <div className="text-lg font-semibold leading-snug">{m.title}</div>
              <p className="mt-1 flex-1 text-[15px] text-slate-500">{m.blurb}</p>
              <div className="mt-4 flex items-center justify-between text-[13px] font-semibold text-slate-500"><span className="flex items-center gap-1"><Clock size={13} />{m.minutes} min</span><span className="flex items-center gap-1 text-emerald-600 group-hover:gap-2 transition-all">Start <ArrowRight size={14} /></span></div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}

