import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DEFAULT_ASSUMPTIONS, type Assumptions, type Profile } from "./calc";
import type { Choices } from "./story";
import { DAVE_PROFILE, DAVE_ASSUMPTIONS, DAVE_SIMS, isDaveProfile } from "../data/dave";

export const SAMPLE_PROFILES: Record<string, Omit<Profile, "goals" | "level" | "onboarded" | "name">> = {
  "25–35": { ageRange: "25–35", age: 30, income: 75_000, expenses: 3_600, savings: 15_000, retirement: 12_000 },
  "35–45": { ageRange: "35–45", age: 40, income: 95_000, expenses: 5_200, savings: 25_000, retirement: 85_000 },
  "45–55": { ageRange: "45–55", age: 50, income: 64_000, expenses: 3_600, savings: 6_000, retirement: 22_000 }, // Dave
  "55–65": { ageRange: "55–65", age: 60, income: 98_000, expenses: 5_000, savings: 50_000, retirement: 390_000 },
};

export const BADGES = [
  { id: "welcome", name: "Fresh Start", emoji: "🌅", desc: "Finished setting up Next Step" },
  { id: "inflation", name: "Inflation Explorer", emoji: "🔭", desc: "Completed the Inflation Time Machine" },
  { id: "compound", name: "Compound Interest Champion", emoji: "🏆", desc: "Watched interest compound in the Virtual Bank or savings lesson" },
  { id: "retirement", name: "Retirement Planner", emoji: "🧭", desc: "Completed the 401(k) lesson" },
  { id: "diversify", name: "Diversification Detective", emoji: "🕵️", desc: "Completed the investing lesson" },
  { id: "debt", name: "Debt Destroyer", emoji: "🔨", desc: "Completed the debt & emergency fund lesson" },
  { id: "curious", name: "Curious Mind", emoji: "💡", desc: "Asked Next Step 3 questions" },
  { id: "architect", name: "Financial Future Architect", emoji: "🏛️", desc: "Completed all 10 lessons" },
  { id: "scholar", name: "Money Scholar", emoji: "🎓", desc: "Completed 5 lessons" },
] as const;

type ChatMsg = { role: "user" | "assistant"; text: string; source?: "ai" | "built-in" };
type State = {
  profile: Profile;
  assumptions: Assumptions;
  xp: number;
  badges: string[];
  done: string[]; // completed modules
  touched: string[]; // modules experimented with
  quiz: Record<string, Record<number, boolean>>;
  simple: boolean;
  bigText: boolean;
  asked: number;
  chat: ChatMsg[];
  story: { choices: Choices; step: number; finished: boolean };
  sims: Record<string, unknown>; // saved simulator settings per module
  stepsDone: Record<string, boolean>; // next-steps checklist
  moments?: string[]; // life moments picked on Try it now (undefined = picked automatically from the scenario)
};

const DEFAULT: State = {
  profile: { ...DAVE_PROFILE },
  assumptions: { ...DAVE_ASSUMPTIONS },
  xp: 0, badges: [], done: [], touched: [], quiz: {}, simple: true, bigText: false, asked: 0, chat: [],
  story: { choices: {}, step: 0, finished: false }, sims: {}, stepsDone: {},
};

const KEY = "nextstep-dave-v1";
function load(): State {
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...DEFAULT, ...JSON.parse(raw) }; } catch { /* ignore */ }
  return DEFAULT;
}

export type Toast = { id: number; text: string; emoji?: string };
// The user's own scenario is saved separately so trying the demo never erases it.
export type Mine = { profile: Profile; assumptions: Assumptions; sims: Record<string, unknown>; stepsDone: Record<string, boolean> };
const MINE_KEY = "nextstep-mine-v1";
export function loadMine(): Mine | null {
  try { const raw = localStorage.getItem(MINE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function clearMine() { try { localStorage.removeItem(MINE_KEY); } catch { /* ignore */ } }

type Ctx = State & {
  entered: boolean; // picked demo or own numbers during this visit (not saved, so every visit starts on Welcome)
  setEntered: (v: boolean) => void;
  highlight: string | null; // plan lever that just changed (from a life moment), glows for a few seconds
  flash: (lever: string) => void;
  set: (patch: Partial<State> | ((s: State) => Partial<State>)) => void;
  award: (xp: number, reason: string, once?: string) => void;
  badge: (id: string) => void;
  touch: (moduleId: string) => void;
  finishModule: (moduleId: string, badgeId?: string) => void;
  resetAll: () => void;
  toasts: Toast[];
  context: Record<string, unknown>;
  setContext: (c: Record<string, unknown>) => void;
  saveSim: (id: string, v: unknown) => void;
};
const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [context, setContext] = useState<Record<string, unknown>>({});
  const onceRef = useRef<Set<string>>(new Set(JSON.parse(localStorage.getItem(KEY + "-once") || "[]")));

  const [entered, setEntered] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>();
  const flash = useCallback((lever: string) => {
    setHighlight(lever);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setHighlight(null), 12_000);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
      if (s.profile.scenario === "custom" && s.profile.onboarded)
        localStorage.setItem(MINE_KEY, JSON.stringify({ profile: s.profile, assumptions: s.assumptions, sims: s.sims, stepsDone: s.stepsDone }));
    } catch { /* ignore */ }
  }, [s]);
  useEffect(() => { document.documentElement.classList.remove("big-text"); }, []);

  const toast = useCallback((text: string, emoji?: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, emoji }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const set: Ctx["set"] = useCallback((patch) => setS((prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) })), []);

  // Progress is tracked simply as lessons completed. (XP and badges were removed; these stay as no-ops for callers.)
  const badge = useCallback((_id: string) => {}, []);
  const award = useCallback((_xp: number, _reason: string, _once?: string) => {}, []);

  const touch = useCallback((id: string) => {
    setS((prev) => (prev.touched.includes(id) ? prev : { ...prev, touched: [...prev.touched, id] }));
  }, []);

  const finishModule = useCallback((id: string, _badgeId?: string) => {
    setS((prev) => {
      if (prev.done.includes(id)) return prev;
      setTimeout(() => toast("Lesson complete", "✅"), 50);
      return { ...prev, done: [...prev.done, id] };
    });
  }, [toast]);

  const saveSim = useCallback((id: string, v: unknown) => setS((prev) => ({ ...prev, sims: { ...prev.sims, [id]: v } })), []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(KEY); localStorage.removeItem(KEY + "-once"); clearMine(); onceRef.current = new Set();
    setS(DEFAULT); setEntered(false); window.location.hash = "#/try";
  }, []);

  const value = useMemo<Ctx>(() => ({ ...s, entered, setEntered, highlight, flash, set, award, badge, touch, finishModule, resetAll, toasts, context, setContext, saveSim }),
    [s, entered, highlight, flash, set, award, badge, touch, finishModule, resetAll, toasts, context, saveSim]);
  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useStore() {
  const c = useContext(C);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

/** Persisted simulator settings: like useState but saved per module, with reset. */
export function useSim<T extends Record<string, unknown>>(id: string, defaults: T) {
  const { sims, saveSim, touch, profile } = useStore();
  // Dave's scenario preloads his numbers; a custom scenario starts from the user's own profile-based defaults
  const base = (isDaveProfile(profile) ? { ...defaults, ...((DAVE_SIMS[id] as Partial<T>) || {}) } : { ...defaults }) as T;
  const key = id + "@2"; // lessons were redesigned: ignore settings saved by the old versions
  const value = { ...base, ...((sims[key] as Partial<T>) || {}) } as T;
  const update = (patch: Partial<T>) => { saveSim(key, { ...value, ...patch }); touch(id); };
  const reset = () => saveSim(key, base);
  return [value, update, reset] as const;
}
