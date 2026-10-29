// Next Step brand marks.
// Logo: three rising steps (today → tomorrow) with a glowing "next step" on top: progress you can climb.

export function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={"relative grid shrink-0 place-items-center rounded-[28%] bg-navy " + className} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 40 40" width={size * 0.72} height={size * 0.72}>
        <rect x="5" y="25" width="9" height="9" rx="2" fill="#F5C000" opacity=".45" />
        <rect x="15.5" y="18" width="9" height="16" rx="2" fill="#F5C000" opacity=".7" />
        <rect x="26" y="11" width="9" height="23" rx="2" fill="#F5C000" />
        <path d="M8 19 L17 12 L23 12 L30.5 4.5" fill="none" stroke="#F8FAFC" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M25.5 4 H31 V9.5" fill="none" stroke="#F8FAFC" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Wordmark({ dark = false, sub = true }: { dark?: boolean; sub?: boolean }) {
  return (
    <span className="leading-none">
      <span className={"whitespace-nowrap font-display text-[20px] sm:text-[22px] font-semibold tracking-tight " + (dark ? "text-white" : "text-navy")}>Next<span className={dark ? "text-sun" : "text-emerald-600"}> Step</span></span>
      {sub && <span className={"mt-1 block text-[11px] " + (dark ? "text-slate-400" : "text-slate-500")}>See tomorrow before you spend today</span>}
    </span>
  );
}

// A friendly blue-collar worker in a hard hat: the face of the demo scenario.
export function WorkerIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={"grid shrink-0 place-items-center rounded-2xl bg-amber-soft ring-1 ring-amber/30 " + className} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 48 48" width={size * 0.86} height={size * 0.86}>
        {/* shoulders + work shirt */}
        <path d="M9 46c0-8.5 6.7-14 15-14s15 5.5 15 14z" fill="#1D4ED8" />
        <path d="M19 32.6l5 6 5-6" fill="none" stroke="#DBEAFE" strokeWidth="2" strokeLinejoin="round" />
        <rect x="14.5" y="38" width="5" height="8" rx="1" fill="#F59E0B" opacity=".9" />
        <rect x="28.5" y="38" width="5" height="8" rx="1" fill="#F59E0B" opacity=".9" />
        {/* face */}
        <circle cx="24" cy="22" r="8.2" fill="#E8B48A" />
        <circle cx="21" cy="22.5" r="1" fill="#0B2A45" />
        <circle cx="27" cy="22.5" r="1" fill="#0B2A45" />
        <path d="M21.3 25.8q2.7 2 5.4 0" fill="none" stroke="#0B2A45" strokeWidth="1.2" strokeLinecap="round" />
        {/* hard hat */}
        <path d="M14.5 17.5a9.5 9 0 0 1 19 0z" fill="#F59E0B" />
        <rect x="12" y="16.6" width="24" height="3" rx="1.5" fill="#D97706" />
        <rect x="22.6" y="8.6" width="2.8" height="8.4" rx="1.2" fill="#FCD34D" />
      </svg>
    </span>
  );
}
