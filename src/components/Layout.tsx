import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CheckCircle2, Rocket, Info } from "lucide-react";
import { useStore } from "../lib/store";
import { cx } from "./ui";
import { Logo, Wordmark } from "./Brand";
import { MODULES } from "../data/modules";

export const NAV = [
  { href: "#/try", label: "Try it now", short: "Try it", icon: Rocket },
  { href: "#/learn", label: "Learn", short: "Learn", icon: BookOpen },
  { href: "#/about", label: "About", short: "About", icon: Info },
];


export function Layout({ route, children }: { route: string; children: ReactNode }) {
    const active = (href: string) => (href === "#/about" ? route === "/" || route === "/about" : ("#" + route).startsWith(href));
  const inAbout = ["/", "/about", "/mission", "/me"].includes(route);

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
          {NAV.map((n) => {
            const on = n.href === "#/learn" ? active("#/learn") || active("#/progress") || active("#/bank") : n.href === "#/about" ? inAbout : active(n.href);
            return (
              <div key={n.href}>
                <a href={n.href} aria-current={on ? "page" : undefined}
                  className={cx("flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-semibold transition", on ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white")}>
                  <n.icon size={20} className={on ? "text-emerald-400" : ""} />{n.label}
                </a>
              </div>
            );
          })}
        </nav>
        <div className="mt-auto px-2 text-slate-400">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Disclaimer:</div>
          <p className="mt-0.5 whitespace-nowrap text-[11px] tracking-tight">Educational simulations, not financial advice.</p>
        </div>
      </aside>

      {/* Top bar (phones and tablets) */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-paper/80 backdrop-blur lg:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="#/about" className="flex items-center gap-2"><Logo size={36} /><Wordmark sub={false} /></a>
        </div>
      </header>

      <main id="main" className="lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 sm:px-6 lg:pb-10 lg:pt-8">{children}</div>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur safe-bottom lg:hidden" aria-label="Main">
        <div className="mx-auto grid max-w-md grid-cols-3">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} aria-current={(n.href === "#/about" ? inAbout : active(n.href)) ? "page" : undefined}
              className={cx("flex flex-col items-center gap-1 pt-2.5 pb-1 text-[11px] font-semibold", (n.href === "#/about" ? inAbout : active(n.href)) ? "text-emerald-600" : "text-slate-500")}>
              <n.icon size={22} />{n.short}
            </a>
          ))}
        </div>
      </nav>

    </div>
  );
}
