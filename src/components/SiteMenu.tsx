import { Info, HeartHandshake, UserRound } from "lucide-react";
import { cx } from "./ui";

export const ABOUT_NAV = [
  { href: "#/about", label: "About the app", short: "The app", icon: Info },
  { href: "#/mission", label: "Where it's going", short: "Mission", icon: HeartHandshake },
  { href: "#/me", label: "About me", short: "About me", icon: UserRound },
];

// Always-visible top menu: About the app · Where it's going · About me
export function SiteMenu({ route, dark = false, className = "" }: { route?: string; dark?: boolean; className?: string }) {
  return (
    <nav aria-label="About" className={cx("flex items-center gap-1 overflow-x-auto", className)}>
      {ABOUT_NAV.map((n) => {
        const on = route && "#" + route === n.href;
        return (
          <a key={n.href} href={n.href} aria-current={on ? "page" : undefined}
            className={cx("inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-2 text-[13px] sm:text-sm font-semibold transition",
              on ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : dark ? "text-slate-200 hover:bg-white/10" : "text-slate-600 hover:bg-white hover:text-navy")}>
            <n.icon size={15} className="shrink-0" />
            <span className="sm:hidden">{n.short}</span><span className="hidden sm:inline">{n.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
