import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { MODULES, moduleHref } from "../data/modules";
import { useStore } from "../lib/store";
import { Panels, Fill } from "../components/Panels";

export function useFinish(id: string) {
  const { finishModule } = useStore();
  const m = MODULES.find((x) => x.id === id);
  return () => finishModule(id, m?.badge);
}

const DEFAULT_LABELS = ["The idea", "Simulator", "What it means", "Test yourself"];

/** Shows one <section> of the lesson (plus anything that follows it until the next section). */
function SectionView({ index, children, onLabels }: { index: number; children: ReactNode; onLabels: (l: string[]) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current?.firstElementChild as HTMLElement | null;
    if (!root) return;
    const groups: HTMLElement[][] = [];
    Array.from(root.children).forEach((el) => {
      if (el.tagName === "SECTION" || !groups.length) groups.push([]);
      groups[groups.length - 1].push(el as HTMLElement);
    });
    groups.forEach((g, n) => g.forEach((el, k) => { el.style.display = n === index ? "" : "none"; if (k === 0) el.style.marginTop = "0"; }));
    const labels = groups.map((g, n) => {
      const kicker = g[0].querySelector(".text-emerald-600")?.textContent?.trim() || DEFAULT_LABELS[n] || `Part ${n + 1}`;
      const k = kicker.toLowerCase();
      return k === "quick check" ? "Test yourself" : kicker.charAt(0) + kicker.slice(1).toLowerCase();
    });
    onLabels(labels);
  });
  return <div ref={ref}>{children}</div>;
}

export default function ModuleFrame({ id, children }: { id: string; children: ReactNode }) {
  const { done, award } = useStore();
  const i = MODULES.findIndex((m) => m.id === id);
  const m = MODULES[i];
  const next = MODULES[(i + 1) % MODULES.length];
  const [labels, setLabels] = useState<string[]>(DEFAULT_LABELS);
  const [panel, setPanel] = useState(0);
  useLayoutEffect(() => { setPanel(0); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const update = (l: string[]) => { if (l.join("|") !== labels.join("|")) setLabels(l); };

  const head = (
    <div className="mb-3 flex shrink-0 items-center gap-3">
      <a href="#/learn" aria-label="All lessons" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-slate-200 hover:bg-slate-50"><ArrowLeft size={18} /></a>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-2xl" style={{ background: m.color + "1f" }}>{m.emoji}</span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-slate-500">
          <span>Lesson {m.letter}</span><span>·</span><span className="flex items-center gap-1"><Clock size={12} />{m.minutes} min</span>
        </div>
        <h1 className="truncate font-display text-2xl sm:text-3xl font-semibold leading-tight">{m.title}</h1>
      </div>
    </div>
  );

  return (
    <Panels key={id} top={head} index={panel} onIndex={setPanel}
      tabs={labels.map((l, n) => ({
        id: `p${n}`, label: l, body: () => (
          <Fill center={false}>
            <SectionView index={n} onLabels={update}>{children}</SectionView>
            {n === labels.length - 1 && (
              <a href={moduleHref(next.id)} className="mt-6 flex items-center justify-between rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-200 hover:ring-emerald-400">
                <span><span className="text-[13px] font-semibold text-slate-500">Next lesson</span><span className="block text-lg font-semibold">{next.emoji} {next.title}</span></span>
                <ArrowRight />
              </a>
            )}
          </Fill>
        ),
      }))} />
  );
}
