import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, MessageCircle, CheckCircle2, X, Rocket, Info } from "lucide-react";
import { ABOUT_NAV } from "./SiteMenu";
import { useStore } from "../lib/store";
import { Chat } from "./Chat";
import { cx } from "./ui";
import { Logo, Wordmark, CoachIcon } from "./Brand";
import { MODULES } from "../data/modules";

export const NAV = [
  { href: "#/try", label: "Try it now", short: "Try it", icon: Rocket },
  { href: "#/learn", label: "Learn", short: "Learn", icon: BookOpen },
  { href: "#/coach", label: "Ask Next Step", short: "Next Step", icon: MessageCircle },
  { href: "#/progress", label: "Progress", short: "Progress", icon: CheckCircle2 },
];


export function Layout({ route, children }: { route: string; children: ReactNode }) {
  const { done, toasts } = useStore();
  const [coach, setCoach] = useState(false);
  const active = (href: string) => (href === "#/about" ? route === "/" || route === "/about" : ("#" + route).startsWith(href));
  const inAbout = ABOUT_NAV.some((n) => active(n.href));

  return (
    <div className="min-h-screen ripple-bg">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 z-50 bg-white px-3 py-2 rounded-lg">Skip to content</a>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-navy px-4 py-6 text-white lg:flex">
        <a href="#/about" className="flex items-center gap-3 px-2">
          <Logo size={42} />
          <Wordmark dark />
        </a>
        <nav className="mt-8 space-y-1" aria-label="Main">
          <div className="flex items-center gap-3 px-3 pb-1 pt-1 text-[15px] font-semibold text-slate-300"><Info size={20} className={inAbout ? "text-emerald-400" : ""} />About</div>
          <div className="ml-[22px] space-y-0.5 border-l border-white/10 pl-3">
            {ABOUT_NAV.map((n) => (
              <a key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
                className={cx("block rounded-xl px-3 py-2 text-[14px] font-semibold transition", active(n.href) ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white")}>{n.label}</a>
            ))}
          </div>
          <div className="!mt-4" />
          {NAV.map((n) => (
            <a key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
              className={cx("flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-semibold transition", active(n.href) ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white")}>
              <n.icon size={20} className={active(n.href) ? "text-emerald-400" : ""} />{n.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-white/5 p-4">
          <div className="flex items-center justify-between text-sm"><span className="text-slate-300">Lessons completed</span><span className="num font-bold text-emerald-400">{done.length}/{MODULES.length}</span></div>
          <div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-emerald-400 transition-all" style={{ width: `${(done.length / MODULES.length) * 100}%` }} /></div>
          <p className="mt-3 text-[11px] leading-snug text-slate-400">Educational simulations. Not financial advice.</p>
        </div>
      </aside>

      {/* Top bar (phones and tablets) */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-paper/80 backdrop-blur lg:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="#/about" className="flex items-center gap-2"><Logo size={36} /><Wordmark sub={false} /></a>
          <a href="#/progress" className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 num" aria-label="Lessons completed"><CheckCircle2 size={15} />{done.length}/{MODULES.length}</a>
        </div>
      </header>

      <main id="main" className="lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:pb-10 lg:pt-8">{children}</div>
      </main>

      {/* Floating coach */}
      {route !== "/coach" && !inAbout && (
        <button onClick={() => setCoach(true)} className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full bg-navy p-1.5 text-white shadow-xl shadow-navy/30 hover:scale-[1.02] transition lg:bottom-6 lg:right-6 lg:py-2 lg:pl-2 lg:pr-5" aria-label="Ask Next Step">
          <CoachIcon size={44} /><span className="hidden font-semibold lg:inline">Ask Next Step</span>
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
        <div className="mx-auto grid max-w-md grid-cols-5">
          {[{ href: "#/about", short: "About", icon: Info }, ...NAV].map((n) => (
            <a key={n.href} href={n.href} aria-current={(n.href === "#/about" ? inAbout : active(n.href)) ? "page" : undefined}
              className={cx("flex flex-col items-center gap-1 pt-2.5 pb-1 text-[11px] font-semibold", (n.href === "#/about" ? inAbout : active(n.href)) ? "text-emerald-600" : "text-slate-500")}>
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
