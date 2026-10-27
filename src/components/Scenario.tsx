import { ArrowRight, Lock, PlayCircle, Pencil, Sparkles, UserRound } from "lucide-react";
import { useStore, loadMine, clearMine } from "../lib/store";
import { money } from "../lib/format";
import type { Profile } from "../lib/calc";
import { DAVE, DAVE_PROFILE, DAVE_ASSUMPTIONS, CUSTOM_ASSUMPTIONS } from "../data/dave";
import { WorkerIcon } from "./Brand";

// Everything needed to start a scenario, shared by "About the app" and "Try it now".
export function useScenario() {
  const { set, setEntered } = useStore();
  const mine = loadMine();
  const finish = (final: Profile) => {
    const custom = final.scenario === "custom";
    const keep = custom && mine; // editing your own numbers keeps your plan; the demo always starts fresh
    set({ profile: { ...final, onboarded: true }, assumptions: keep ? mine.assumptions : custom ? { ...CUSTOM_ASSUMPTIONS } : { ...DAVE_ASSUMPTIONS }, sims: keep ? mine.sims : {}, stepsDone: keep ? mine.stepsDone : {}, moments: undefined });
    setEntered(true);
    window.location.hash = "#/try";
  };
  return {
    mine,
    finish,
    demo: () => finish({ ...DAVE_PROFILE, onboarded: true }),
    walkDave: () => { window.location.hash = "#/try?walk=dave"; },
    ownNumbers: () => { window.location.hash = "#/try?walk=mine"; },
    freshNumbers: () => { clearMine(); window.location.hash = "#/try?walk=mine"; },
    continueMine: () => {
      if (!mine) return;
      set({ profile: { ...mine.profile, onboarded: true }, assumptions: mine.assumptions, sims: mine.sims, stepsDone: mine.stepsDone, moments: undefined });
      setEntered(true); window.location.hash = "#/try";
    },
  };
}

export function ScenarioCards({ compact = false }: { compact?: boolean }) {
  const { mine, demo, walkDave, ownNumbers, freshNumbers, continueMine } = useScenario();
  const pad = compact ? "p-5 sm:p-6" : "p-6 sm:p-7";
  return (
    <div>
      <div className="grid gap-5 text-left md:grid-cols-2">
        {/* Way 1: Dave */}
        <div className={"relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 text-white shadow-card " + pad}>
          <svg aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-48 w-48 opacity-[.13]" viewBox="0 0 40 40"><rect x="5" y="25" width="9" height="9" rx="2" fill="#fff" /><rect x="15.5" y="18" width="9" height="16" rx="2" fill="#fff" /><rect x="26" y="11" width="9" height="23" rx="2" fill="#fff" /></svg>
          <div className="relative flex items-center gap-4">
            <WorkerIcon size={60} />
            <div><div className="text-[12px] font-bold uppercase tracking-wider text-emerald-100">Way 1 · See how it works</div><div className="font-display text-2xl font-semibold">Dave's scenario</div></div>
          </div>
          <p className={"relative mt-4 flex-1 leading-relaxed text-emerald-50 " + (compact ? "text-[15px]" : "text-[16px]")} >Dave, 50, is a head custodian at a Pennsylvania public high school, earning about ${DAVE.hourly}/hour. With Linda's part-time job they bring in <b className="text-white">$64,000</b> a year, have <b className="text-white">$6,000</b> saved, and two kids, <b className="text-white">Emma (17)</b> and <b className="text-white">Jake (15)</b>, heading to college soon.</p>
          <button onClick={walkDave} className="relative mt-4 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[15px] font-semibold text-white/90 underline-offset-4 hover:text-white hover:underline"><PlayCircle size={16} /> Walk through Dave's answers first</button>
          <button onClick={demo} className="relative mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-lg font-semibold text-emerald-700 shadow-lg shadow-emerald-900/20 hover:bg-emerald-50"><Sparkles size={18} /> Explore Dave's scenario</button>
        </div>
        {/* Way 2: your own numbers */}
        <div className={"flex flex-col rounded-3xl bg-navy text-white shadow-card " + pad}>
          <div className="flex items-center gap-4">
            <span className="grid h-[60px] w-[60px] shrink-0 place-items-center rounded-2xl bg-white/10 text-3xl">🙋</span>
            <div><div className="text-[12px] font-bold uppercase tracking-wider text-emerald-300">Way 2 · {mine ? "Welcome back" : "Make it yours"}</div><div className="font-display text-2xl font-semibold">{mine ? `${mine.profile.name || "Your"}${mine.profile.name ? "'s" : ""} numbers` : "My own numbers"}</div></div>
          </div>
          <p className={"mt-4 flex-1 leading-relaxed text-slate-300 " + (compact ? "text-[15px]" : "text-[16px]")}>{mine
            ? `Pick up where you left off: ${money(mine.profile.income)} a year${mine.profile.kids?.length ? `, ${mine.profile.kids.length} ${mine.profile.kids.length === 1 ? "child" : "children"}` : ""}, and your plan and next steps saved on this device.`
            : "Answer a few quick questions (about 2 minutes): age, kids, income, monthly bills and savings. See your own retirement answer, plan and next steps. Rough guesses are fine."}</p>
          {mine ? (
            <>
              <div className="mt-4 flex justify-center gap-4">
                <button onClick={ownNumbers} className="flex items-center gap-1.5 rounded-xl py-2 text-sm font-semibold text-slate-300 hover:text-white"><Pencil size={14} /> Edit my answers</button>
                <button onClick={freshNumbers} className="rounded-xl py-2 text-sm font-semibold text-slate-400 hover:text-white">Start fresh</button>
              </div>
              <button onClick={continueMine} className="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-emerald-500 px-4 py-3 text-[17px] font-semibold text-white hover:bg-emerald-600"><UserRound size={18} /> Continue with my numbers</button>
            </>
          ) : (
            <button onClick={ownNumbers} className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-lg font-semibold text-white hover:bg-emerald-600"><UserRound size={19} /> Enter my numbers <ArrowRight size={18} /></button>
          )}
        </div>
      </div>
      {!compact && <p className="mt-5 flex items-center justify-center gap-2 text-center text-[14px] text-slate-500"><Lock size={14} /> No bank logins. No account numbers. Your numbers stay on your device. Educational, not financial advice.</p>}
    </div>
  );
}
