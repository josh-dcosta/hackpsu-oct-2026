import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DEFAULT_ASSUMPTIONS, type Assumptions, type Profile } from "./calc";
import type { Choices } from "./story";
import { DAVE_PROFILE, DAVE_ASSUMPTIONS, DAVE_SIMS } from "../data/dave";

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
};

const DEFAULT: State = {
  profile: { ...DAVE_PROFILE },
  assumptions: { ...DAVE_ASSUMPTIONS },
  xp: 0, badges: [], done: [], touched: [], quiz: {}, simple: true, bigText: false, asked: 0, chat: [],
  story: { choices: {}, step: 0, finished: false }, sims: {},
};

const KEY = "nextstep-dave-v1";
function load(): State {
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...DEFAULT, ...JSON.parse(raw) }; } catch { /* ignore */ }
  return DEFAULT;
}

export type Toast = { id: number; text: string; emoji?: string };
type Ctx = State & {
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

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } }, [s]);
  useEffect(() => { document.documentElement.classList.toggle("big-text", s.bigText); }, [s.bigText]);

  const toast = useCallback((text: string, emoji?: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, emoji }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const set: Ctx["set"] = useCallback((patch) => setS((prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) })), []);

  const badge = useCallback((id: string) => {
    setS((prev) => {
      if (prev.badges.includes(id)) return prev;
      const b = BADGES.find((x) => x.id === id);
      if (b) setTimeout(() => toast(`Badge unlocked: ${b.name}`, b.emoji), 50);
      const badges = [...prev.badges, id];
      return { ...prev, badges, xp: prev.xp + 25 };
    });
  }, [toast]);

  const award = useCallback((xp: number, reason: string, once?: string) => {
    if (once) {
      if (onceRef.current.has(once)) return;
      onceRef.current.add(once);
      localStorage.setItem(KEY + "-once", JSON.stringify([...onceRef.current]));
    }
    setS((prev) => ({ ...prev, xp: prev.xp + xp }));
    toast(`+${xp} XP · ${reason}`, "✨");
  }, [toast]);

  const touch = useCallback((id: string) => {
    setS((prev) => (prev.touched.includes(id) ? prev : { ...prev, touched: [...prev.touched, id] }));
    award(15, "Experimented with a simulation", "touch-" + id);
  }, [award]);

  const finishModule = useCallback((id: string, badgeId?: string) => {
    setS((prev) => {
      if (prev.done.includes(id)) return prev;
      const done = [...prev.done, id];
      if (done.length >= 5) setTimeout(() => badge("scholar"), 300);
      if (done.length >= 10) setTimeout(() => badge("architect"), 600);
      return { ...prev, done };
    });
    award(40, "Lesson complete", "done-" + id);
    if (badgeId) setTimeout(() => badge(badgeId), 200);
  }, [award, badge]);

  const saveSim = useCallback((id: string, v: unknown) => setS((prev) => ({ ...prev, sims: { ...prev.sims, [id]: v } })), []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(KEY); localStorage.removeItem(KEY + "-once"); onceRef.current = new Set();
    setS(DEFAULT); window.location.hash = "#/welcome";
  }, []);

  const value = useMemo<Ctx>(() => ({ ...s, set, award, badge, touch, finishModule, resetAll, toasts, context, setContext, saveSim }),
    [s, set, award, badge, touch, finishModule, resetAll, toasts, context, saveSim]);
  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useStore() {
  const c = useContext(C);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

/** Persisted simulator settings: like useState but saved per module, with reset. */
export function useSim<T extends Record<string, unknown>>(id: string, defaults: T) {
  const { sims, saveSim, touch } = useStore();
  const base = { ...defaults, ...((DAVE_SIMS[id] as Partial<T>) || {}) } as T; // Dave's scenario preloaded
  const value = { ...base, ...((sims[id] as Partial<T>) || {}) } as T;
  const update = (patch: Partial<T>) => { saveSim(id, { ...value, ...patch }); touch(id); };
  const reset = () => saveSim(id, base);
  return [value, update, reset] as const;
}
