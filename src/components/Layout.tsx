import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Home, BookOpen, MessageCircle, Trophy, Type, X } from "lucide-react";
import { useStore } from "../lib/store";
import { Chat } from "./Chat";
import { RippleMark, cx } from "./ui";

export const NAV = [
  { href: "#/", label: "Dashboard", short: "Home", icon: Home },
  { href: "#/learn", label: "Learn", short: "Learn", icon: BookOpen },
  { href: "#/coach", label: "Ask Next Step", short: "Next Step", icon: MessageCircle },
  { href: "#/progress", label: "Progress", short: "Progress", icon: Trophy },
];
const MOBILE = ["#/", "#/learn", "#/coach", "#/progress"];

export function Layout({ route, children }: { route: string; children: ReactNode }) {
  const { xp, bigText, simple, set, toasts, profile } = useStore();
  const [coach, setCoach] = useState(false);
  const active = (href: string) => (href === "#/" ? route === "/" : ("#" + route).startsWith(href));
  const level = Math.floor(xp / 200) + 1;

  return (
    <div className="min-h-screen ripple-bg">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 z-50 bg-white px-3 py-2 rounded-lg">Skip to content</a>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-navy px-4 py-6 text-white lg:flex">
        <a href="#/" className="flex items-center gap-3 px-2">
          <RippleMark size={40} />
          <div><div className="font-display text-2xl font-semibold leading-none">Next Step</div><div className="mt-1 text-[11px] text-slate-400">See tomorrow before you spend today</div></div>
        </a>
        <nav className="mt-8 space-y-1" aria-label="Main">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
              className={cx("flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-semibold transition", active(n.href) ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white")}>
              <n.icon size={20} className={active(n.href) ? "text-emerald-400" : ""} />{n.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-white/5 p-4">
          <div className="flex items-center justify-between text-sm"><span className="text-slate-300">Level {level}</span><span className="font-bold text-emerald-400 num">{xp} XP</span></div>
          <div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-emerald-400 transition-all" style={{ width: `${(xp % 200) / 2}%` }} /></div>
          <p className="mt-3 text-[11px] leading-snug text-slate-400">Educational simulations with fictional money. Not financial advice.</p>
        </div>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-paper/80 backdrop-blur lg:ml-64">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="#/" className="flex items-center gap-2 lg:hidden"><RippleMark size={34} /><span className="font-display text-xl font-semibold">Next Step</span></a>
          <div className="hidden text-[15px] text-slate-500 lg:block">{profile.onboarded ? `Ages ${profile.ageRange} · ${profile.level}` : "Welcome"}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => set({ simple: !simple })} aria-pressed={simple}
              className="rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-slate-200 bg-white hover:bg-slate-50" title="Switch between simple and detailed explanations">
              {simple ? "Simple" : "Detailed"}
            </button>
            <button onClick={() => set({ bigText: !bigText })} aria-pressed={bigText} aria-label="Toggle larger text"
              className={cx("grid h-10 w-10 place-items-center rounded-xl ring-1 ring-slate-200", bigText ? "bg-navy text-white" : "bg-white")}><Type size={18} /></button>
            <a href="#/progress" className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 lg:hidden num"><Trophy size={15} />{xp}</a>
          </div>
        </div>
      </header>

      <main id="main" className="lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:pb-16">{children}</div>
      </main>

      {/* Floating coach */}
      {route !== "/coach" && (
        <button onClick={() => setCoach(true)} className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full bg-navy p-1.5 text-white shadow-xl shadow-navy/30 hover:scale-[1.02] transition lg:bottom-6 lg:right-6 lg:py-2 lg:pl-2 lg:pr-5" aria-label="Ask Next Step">
          <RippleMark size={44} /><span className="hidden font-semibold lg:inline">Ask Next Step</span>
        </button>
      )}
      <AnimatePresence>
        {coach && (
          <motion.div className="fixed inset-0 z-50 flex justify-end bg-navy/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCoach(false)}>
            <motion.div role="dialog" aria-label="Ask Next Step" className="flex h-full w-full max-w-md flex-col bg-paper p-4 sm:p-5" initial={{ x: 40 }} animate={{ x: 0 }} exit={{ x: 40 }} onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <div className="font-display text-xl font-semibold">Ask Next Step</div>
                <button onClick={() => setCoach(false)} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100"><X /></button>
              </div>
              <div className="min-h-0 flex-1"><Chat compact /></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur safe-bottom lg:hidden" aria-label="Main">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {NAV.filter((n) => MOBILE.includes(n.href)).map((n) => (
            <a key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
              className={cx("flex flex-col items-center gap-1 pt-2.5 pb-1 text-[11px] font-semibold", active(n.href) ? "text-emerald-600" : "text-slate-500")}>
              <n.icon size={22} />{n.short}
            </a>
          ))}
        </div>
      </nav>

      {/* Toasts */}
      <div className="pointer-events-none fixed left-1/2 bottom-24 z-[60] flex w-max max-w-[92vw] -translate-x-1/2 flex-col items-center gap-2 lg:bottom-auto lg:top-20" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white shadow-lg">{t.emoji} {t.text}</motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
