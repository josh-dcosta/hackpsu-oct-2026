import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, Trash2 } from "lucide-react";
import { useStore } from "../lib/store";
import { askRipple } from "../lib/ripple";
import { RichText, RippleMark, cx } from "./ui";

const STARTERS = [
  "How will Emma's and Jake's college costs affect our savings?",
  "How does inflation affect our $6,000 in savings?",
  "Is Dave's PSERS pension enough to retire on?",
  "How big should our emergency fund be?",
  "What should Dave learn next?",
];

export function Chat({ compact }: { compact?: boolean }) {
  const { chat, set, profile, context, award, badge, asked } = useStore();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [chat.length, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const history = chat.slice(-6).map((m) => ({ role: m.role, text: m.text }));
    set((s) => ({ chat: [...s.chat, { role: "user", text }] }));
    setQ(""); setLoading(true);
    const ctx = { page: (context.page as string) || "coach", ...context, insights: (context.insights as string[]) || [] };
    const r = await askRipple(text, ctx, profile, history);
    set((s) => ({ chat: [...s.chat, { role: "assistant", text: r.text, source: r.source }], asked: s.asked + 1 }));
    setLoading(false);
    award(10, "Asked Next Step a question", "chat-" + text.slice(0, 40));
    if (asked + 1 >= 3) badge("curious");
  };

  return (
    <div className={cx("flex flex-col", compact ? "h-full" : "h-[calc(100dvh-220px)] min-h-[420px] lg:h-[calc(100dvh-160px)]")}>
      <div className="flex-1 overflow-y-auto space-y-4 pr-1" aria-live="polite">
        {chat.length === 0 && (
          <div className="pt-2">
            <div className="flex items-center gap-3">
              <RippleMark size={44} />
              <div>
                <div className="font-display text-xl font-semibold">Hi{profile.name ? `, ${profile.name}` : ""}! I'm Next Step.</div>
                <div className="text-[15px] text-slate-500">Ask me anything about money, or about the simulation you're looking at.</div>
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-2xl bg-white px-4 py-3 text-left text-[15px] font-medium ring-1 ring-slate-200 hover:ring-emerald-400 hover:bg-emerald-50/40">{s}</button>
              ))}
            </div>
          </div>
        )}
        {chat.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cx("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role === "assistant" && <RippleMark size={30} />}
            <div className={cx("max-w-[85%] rounded-3xl px-4 py-3 text-[15px] leading-relaxed", m.role === "user" ? "bg-navy text-white rounded-br-lg" : "bg-white ring-1 ring-slate-200 text-slate-700 rounded-bl-lg")}>
              {m.role === "assistant" ? <RichText text={m.text} /> : m.text}
              {m.source === "built-in" && <div className="mt-2 text-[11px] text-slate-400">Built-in explainer (AI offline)</div>}
            </div>
          </motion.div>
        ))}
        {loading && <div className="flex items-center gap-2 text-slate-500"><RippleMark size={30} /><Loader2 size={18} className="animate-spin" /> Thinking…</div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(q); }} className="mt-3 flex gap-2">
        <label htmlFor="chat-input" className="sr-only">Message Next Step</label>
        <input id="chat-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask Next Step a question…" className="min-h-[52px] flex-1 rounded-2xl bg-white px-4 text-[16px] ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" />
        <button type="submit" disabled={!q.trim() || loading} aria-label="Send" className="grid h-[52px] w-[52px] place-items-center rounded-2xl bg-emerald-500 text-white disabled:opacity-40"><Send size={20} /></button>
        {chat.length > 0 && <button type="button" onClick={() => set({ chat: [] })} aria-label="Clear conversation" className="grid h-[52px] w-[52px] place-items-center rounded-2xl ring-1 ring-slate-200 text-slate-500 hover:bg-slate-100"><Trash2 size={18} /></button>}
      </form>
      <p className="mt-2 text-center text-[12px] text-slate-400">Educational information, not financial advice. Never share passwords or account numbers.</p>
    </div>
  );
}
