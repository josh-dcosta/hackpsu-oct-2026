import { useEffect, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { MODULES, moduleHref } from "../data/modules";
import { useStore } from "../lib/store";

export function useFinish(id: string) {
  const { finishModule } = useStore();
  const m = MODULES.find((x) => x.id === id);
  return () => finishModule(id, m?.badge);
}

export default function ModuleFrame({ id, children }: { id: string; children: ReactNode }) {
  const { done, award } = useStore();
  const i = MODULES.findIndex((m) => m.id === id);
  const m = MODULES[i];
  const next = MODULES[(i + 1) % MODULES.length];
  useEffect(() => { award(10, "Started a lesson", "visit-" + id); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
      <a href="#/learn" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy"><ArrowLeft size={16} /> All lessons</a>
      <div className="mt-3 flex items-start gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: m.color + "1f" }}>{m.emoji}</span>
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-slate-500">
            <span>Lesson {m.letter}</span><span>·</span><span className="flex items-center gap-1"><Clock size={13} />{m.minutes} min</span>
            {done.includes(id) && <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700"><CheckCircle2 size={13} /> Completed</span>}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">{m.title}</h1>
          <p className="mt-1 text-lg text-slate-500">{m.blurb}</p>
        </div>
      </div>
      <div className="mt-8">{children}</div>
      <a href={moduleHref(next.id)} className="mt-10 flex items-center justify-between rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-200 hover:ring-emerald-400">
        <span><span className="text-[13px] font-semibold text-slate-500">Next lesson</span><span className="block text-lg font-semibold">{next.emoji} {next.title}</span></span>
        <ArrowRight />
      </a>
    </div>
  );
}
