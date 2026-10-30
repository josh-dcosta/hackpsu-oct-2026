import { ArrowRight, Lock, Pencil, UserRound } from "lucide-react";
import { useStore, loadMine, clearMine } from "../lib/store";
import { money } from "../lib/format";
import type { Profile } from "../lib/calc";
import { CUSTOM_ASSUMPTIONS } from "../data/dave";

// Starting, continuing or editing your own numbers (shared by "The App" and "Try it now").
export function useScenario() {
  const { set, setEntered } = useStore();
  const mine = loadMine();
  const finish = (final: Profile, moments?: string[], retireAge?: number) => {
    // editing your answers keeps your other settings (like the inflation you picked)
    const base = mine ? mine.assumptions : { ...CUSTOM_ASSUMPTIONS };
    set({ profile: { ...final, scenario: "custom", onboarded: true }, assumptions: { ...base, retireAge: retireAge ?? base.retireAge }, sims: mine ? mine.sims : {}, stepsDone: {}, moments });
    setEntered(true);
    window.location.hash = "#/try";
  };
  return {
    mine,
    finish,
    ownNumbers: () => { window.location.hash = "#/try?walk=mine"; },
    freshNumbers: () => { clearMine(); window.location.hash = "#/try?walk=mine"; },
    continueMine: () => {
      if (!mine) return;
      set({ profile: { ...mine.profile, onboarded: true }, assumptions: mine.assumptions, sims: mine.sims, stepsDone: {}, moments: mine.moments });
      setEntered(true); window.location.hash = "#/try";
    },
  };
}

/** One card: enter your numbers, or pick up where you left off. */
export function ScenarioCards({ compact = false }: { compact?: boolean }) {
  const { mine, ownNumbers, freshNumbers, continueMine } = useScenario();
  return (
    <div className={"mx-auto max-w-2xl rounded-3xl bg-navy text-left text-white shadow-card " + (compact ? "p-5 sm:p-7" : "p-6 sm:p-8")}>
      <div className="flex items-center gap-4">
        <span className="grid h-[60px] w-[60px] shrink-0 place-items-center rounded-2xl bg-white/10 text-3xl">🙂</span>
        <div><div className="text-[12px] font-bold uppercase tracking-wider text-emerald-300">{mine ? "Welcome back" : "About 2 minutes"}</div><div className="font-display text-2xl font-semibold">{mine ? `${mine.profile.name ? mine.profile.name + "'s" : "Your"} numbers` : "Enter your numbers"}</div></div>
      </div>
      <p className="mt-4 text-[16px] leading-relaxed text-slate-300">{mine
        ? `Pick up where you left off: ${money(mine.profile.income)} a year${mine.profile.kids?.length ? `, ${mine.profile.kids.length} ${mine.profile.kids.length === 1 ? "child" : "children"}` : ""}, with your plan and next steps saved on this device.`
        : "Answer a few quick questions: age, kids, income, monthly bills and savings. Rough guesses are fine. Then pick your life moments and get your plan, next steps and the answer."}</p>
      {mine ? (
        <>
          <button onClick={continueMine} className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-sun px-4 py-3 text-[17px] font-semibold text-navy hover:bg-sun-600"><UserRound size={18} /> Continue with my numbers</button>
          <div className="mt-2 flex justify-center gap-4">
            <button onClick={ownNumbers} className="flex items-center gap-1.5 rounded-xl py-2 text-sm font-semibold text-slate-300 hover:text-white"><Pencil size={14} /> Edit my answers</button>
            <button onClick={freshNumbers} className="rounded-xl py-2 text-sm font-semibold text-slate-400 hover:text-white">Start fresh</button>
          </div>
        </>
      ) : (
        <button onClick={ownNumbers} className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-sun px-5 py-3 text-lg font-semibold text-navy hover:bg-sun-600"><UserRound size={19} /> Enter my numbers <ArrowRight size={18} /></button>
      )}
      <p className="mt-4 flex items-center justify-center gap-2 text-center text-[13px] text-slate-400"><Lock size={13} /> No bank logins. No account numbers. Your numbers stay on your device.</p>
    </div>
  );
}
