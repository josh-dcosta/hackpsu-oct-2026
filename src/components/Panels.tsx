import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cx } from "./ui";

export type Panel = { id: string; label: string; body: (go: (id: string) => void) => ReactNode };

// Height of one screen minus the app chrome (phone: top bar + bottom tabs; desktop: page padding)
export const SCREEN = "h-[calc(100dvh-184px)] lg:h-[calc(100dvh-4.5rem)]";

/**
 * A page made of panels that fit the screen: tabs on top, one panel at a time,
 * dots + Back / Next at the bottom. Swipe left/right (touch or trackpad) or use the arrow keys.
 */
export function Panels({ tabs, start = 0, top, index, onIndex, nextLabel }: {
  tabs: Panel[]; start?: number; top?: ReactNode;
  index?: number; onIndex?: (i: number) => void; // optional controlled mode
  nextLabel?: (i: number) => string | undefined;
}) {
  const [own, setOwn] = useState(start);
  const i = Math.min(index ?? own, tabs.length - 1);
  const [dir, setDir] = useState(1);
  const set = (n: number) => { if (n < 0 || n >= tabs.length || n === i) return; setDir(n > i ? 1 : -1); onIndex ? onIndex(n) : setOwn(n); };
  const go = (id: string) => set(tabs.findIndex((t) => t.id === id));

  // swipe (touch)
  const touch = useRef<{ x: number; y: number } | null>(null);
  // swipe (trackpad horizontal scroll), with a short cooldown
  const wheel = useRef({ acc: 0, until: 0 });
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    const now = Date.now();
    if (now < wheel.current.until) return;
    wheel.current.acc += e.deltaX;
    if (Math.abs(wheel.current.acc) > 60) { set(i + (wheel.current.acc > 0 ? 1 : -1)); wheel.current = { acc: 0, until: now + 700 }; }
  };
  // arrow keys (not while typing or moving a slider)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") set(i + 1); else if (e.key === "ArrowLeft") set(i - 1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const next = nextLabel?.(i) ?? tabs[i + 1]?.label;
  return (
    <div className={cx("flex flex-col", SCREEN)}>
      {top}
      <div role="tablist" className={cx("flex shrink-0 gap-1.5 overflow-x-auto", tabs.length < 2 && "hidden")}>
        {tabs.map((t, n) => (
          <button key={t.id} role="tab" aria-selected={n === i} onClick={() => set(n)}
            className={cx("inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-[14px] font-semibold transition", n === i ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : "text-slate-500 hover:bg-white hover:text-navy")}>
            <span className={cx("grid h-5 w-5 place-items-center rounded-full text-[11px] num", n === i ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600")}>{n + 1}</span>{t.label}
          </button>
        ))}
      </div>
      <div className={cx("relative min-h-0 flex-1 overflow-hidden", tabs.length > 1 && "mt-3")} onWheel={onWheel}
        onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
        onTouchEnd={(e) => {
          const s = touch.current; touch.current = null; if (!s) return;
          const dx = e.changedTouches[0].clientX - s.x, dy = e.changedTouches[0].clientY - s.y;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) set(i + (dx < 0 ? 1 : -1));
        }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={tabs[i].id} className="h-full" initial={{ opacity: 0, x: 40 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 * dir }} transition={{ duration: 0.22 }}>
            {tabs[i].body(go)}
          </motion.div>
        </AnimatePresence>
      </div>
      {tabs.length > 1 && (
        <div className="mt-3 flex shrink-0 items-center justify-between gap-2">
          <button onClick={() => set(i - 1)} disabled={i === 0} className="inline-flex min-w-0 items-center gap-1.5 rounded-xl px-2 py-2.5 font-semibold text-slate-500 hover:text-navy disabled:invisible"><ArrowLeft size={17} className="shrink-0" /><span className="hidden truncate sm:inline">{tabs[i - 1]?.label}</span></button>
          <div className="flex shrink-0 gap-1.5">{tabs.map((t, n) => <button key={t.id} onClick={() => set(n)} aria-label={t.label} className={cx("h-2.5 rounded-full transition-all", n === i ? "w-7 bg-emerald-500" : "w-2.5 bg-slate-300 hover:bg-slate-400")} />)}</div>
          <button onClick={() => set(i + 1)} disabled={i === tabs.length - 1} className="inline-flex min-w-0 items-center gap-1.5 rounded-xl bg-sun px-4 py-2.5 font-semibold text-navy hover:bg-sun-600 disabled:invisible"><span className="truncate">{next ?? "Next"}</span> <ArrowRight size={17} className="shrink-0" /></button>
        </div>
      )}
    </div>
  );
}

/** Fills its panel; centers content when it fits, scrolls quietly (no scroll bar) when it doesn't. */
export function Fill({ className, children, center = true }: { className?: string; children: ReactNode; center?: boolean }) {
  return <div className={cx("h-full overflow-y-auto", className)}><div className={cx("flex min-h-full flex-col", center && "justify-center")}>{children}</div></div>;
}
