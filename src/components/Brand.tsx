// Next Step brand marks.
// Logo: three rising steps (today → tomorrow) with a glowing "next step" on top: progress you can climb.
// Coach: a friendly AI chat bubble with a spark, so the assistant is clearly distinct from the brand.

export function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={"relative grid shrink-0 place-items-center rounded-[28%] bg-navy " + className} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 40 40" width={size * 0.72} height={size * 0.72}>
        <rect x="5" y="25" width="9" height="9" rx="2" fill="#10B981" opacity=".45" />
        <rect x="15.5" y="18" width="9" height="16" rx="2" fill="#10B981" opacity=".7" />
        <rect x="26" y="11" width="9" height="23" rx="2" fill="#10B981" />
        <path d="M8 19 L17 12 L23 12 L30.5 4.5" fill="none" stroke="#F8FAFC" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M25.5 4 H31 V9.5" fill="none" stroke="#F8FAFC" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Wordmark({ dark = false, sub = true }: { dark?: boolean; sub?: boolean }) {
  return (
    <span className="leading-none">
      <span className={"whitespace-nowrap font-display text-[20px] sm:text-[22px] font-semibold tracking-tight " + (dark ? "text-white" : "text-navy")}>Next<span className="text-emerald-500"> Step</span></span>
      {sub && <span className={"mt-1 block text-[11px] " + (dark ? "text-slate-400" : "text-slate-500")}>See tomorrow before you spend today</span>}
    </span>
  );
}

export function CoachIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={"relative grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm shadow-emerald-500/30 " + className} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 40 40" width={size * 0.7} height={size * 0.7}>
        <path d="M8 12.5C8 9.5 10.5 7 13.5 7h13C29.5 7 32 9.5 32 12.5v9c0 3-2.5 5.5-5.5 5.5H18l-6 5v-5.2c-2.3-.7-4-2.8-4-5.3z" fill="#fff" />
        <path d="M20 10.5l1.5 3.6 3.6 1.5-3.6 1.5L20 20.7l-1.5-3.6-3.6-1.5 3.6-1.5z" fill="#059669" />
        <circle cx="26.5" cy="20.5" r="1.6" fill="#059669" opacity=".7" />
        <circle cx="13.5" cy="20.5" r="1.6" fill="#059669" opacity=".7" />
      </svg>
      <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-navy px-1 text-[8px] font-bold leading-[13px] text-white ring-2 ring-white" style={{ fontSize: Math.max(7, size * 0.2) }}>AI</span>
    </span>
  );
}
