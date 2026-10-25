import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, X, Lightbulb, RotateCcw, Info, Loader2 } from "lucide-react";
import { useStore } from "../lib/store";
import { askRipple, type RippleContext } from "../lib/ripple";
import { money } from "../lib/format";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function Card({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rounded-3xl bg-white shadow-card ring-1 ring-slate-200/70 p-5 sm:p-6", className)} {...rest}>{children}</div>;
}

export function Button({ children, variant = "primary", className, ...rest }: { variant?: "primary" | "ghost" | "dark" | "soft" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const v = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/30",
    dark: "bg-navy text-white hover:bg-navy-800",
    ghost: "bg-transparent text-navy hover:bg-slate-100 ring-1 ring-slate-200",
    soft: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  }[variant];
  return <button className={cx("inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold transition active:scale-[.98] disabled:opacity-50 min-h-[48px]", v, className)} {...rest}>{children}</button>;
}

export function Slider({ label, value, min, max, step = 1, onChange, format = (v) => String(v), help, id }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string; help?: string; id?: string;
}) {
  const sid = id || "s-" + label.replace(/\W+/g, "-").toLowerCase();
  const p = ((value - min) / (max - min)) * 100;
  return (
    <div className="py-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={sid} className="text-[15px] font-medium text-slate-700">{label}</label>
        <span className="num text-lg font-bold text-navy">{format(value)}</span>
      </div>
      <input id={sid} type="range" className="rs" min={min} max={max} step={step} value={value}
        style={{ ["--p" as string]: `${p}%` }} onChange={(e) => onChange(Number(e.target.value))} aria-valuetext={format(value)} />
      {help && <p className="-mt-1 text-[13px] text-slate-500">{help}</p>}
    </div>
  );
}

export function NumberField({ label, value, onChange, prefix = "$", suffix, min = 0, step = 100, id }: { label: string; value: number; onChange: (v: number) => void; prefix?: string; suffix?: string; min?: number; step?: number; id?: string }) {
  const fid = id || "n-" + label.replace(/\W+/g, "-").toLowerCase();
  return (
    <label htmlFor={fid} className="block">
      <span className="text-[15px] font-medium text-slate-700">{label}</span>
      <div className="mt-1 flex items-center rounded-2xl bg-slate-50 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-emerald-500 px-4">
        {prefix && <span className="text-slate-400 font-semibold">{prefix}</span>}
        <input id={fid} type="number" inputMode="decimal" min={min} step={step} value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          className="num w-full bg-transparent py-3 px-2 text-lg font-semibold outline-none" />
        {suffix && <span className="text-slate-400 font-semibold">{suffix}</span>}
      </div>
    </label>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-2xl bg-slate-100 p-1">
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={cx("rounded-xl px-3.5 py-2 text-sm font-semibold transition min-h-[40px]", value === o.value ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy")}>{o.label}</button>
      ))}
    </div>
  );
}

export function Stat({ label, value, sub, tone = "plain", big }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "plain" | "green" | "navy" | "coral" | "sky"; big?: boolean }) {
  const t = { plain: "bg-slate-50 text-navy", green: "bg-emerald-50 text-emerald-700", navy: "bg-navy text-white", coral: "bg-orange-50 text-orange-700", sky: "bg-sky-soft text-sky-900" }[tone];
  return (
    <div className={cx("rounded-2xl p-4", t)}>
      <div className={cx("text-[13px] font-medium", tone === "navy" ? "text-slate-300" : "opacity-80")}>{label}</div>
      <motion.div key={String(value)} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className={cx("num font-bold mt-0.5", big ? "text-3xl sm:text-4xl font-display" : "text-2xl")}>{value}</motion.div>
      {sub && <div className={cx("text-[13px] mt-0.5", tone === "navy" ? "text-slate-300" : "opacity-75")}>{sub}</div>}
    </div>
  );
}

export function EstimateTag({ children = "Educational estimate" }: { children?: ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full bg-amber-soft px-2.5 py-1 text-[12px] font-semibold text-amber-800"><Info size={12} />{children}</span>;
}

export function ResetButton({ onClick, dark }: { onClick: () => void; dark?: boolean }) {
  return <button onClick={onClick} className={cx("inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold", dark ? "text-slate-200 hover:bg-white/10" : "text-slate-500 hover:bg-slate-100 hover:text-navy")}><RotateCcw size={15} /> Reset</button>;
}

export function Section({ n, title, children, kicker }: { n?: number; title: string; kicker?: string; children: ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <div className="mb-3 flex items-center gap-3">
        {n !== undefined && <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-sm font-bold text-white">{n}</span>}
        <div>
          {kicker && <div className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">{kicker}</div>}
          <h2 className="font-display text-2xl font-semibold text-navy">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

export function Takeaway({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 rounded-3xl hero-dark p-6 text-white">
      <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold uppercase tracking-wider"><Lightbulb size={16} /> The takeaway</div>
      <p className="mt-2 font-display text-xl sm:text-2xl leading-snug">{children}</p>
    </div>
  );
}

export function Examples({ items }: { items: { emoji: string; title: string; text: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((e) => (
        <Card key={e.title} className="p-4 sm:p-5">
          <div className="text-2xl">{e.emoji}</div>
          <div className="mt-2 font-semibold">{e.title}</div>
          <p className="mt-1 text-[15px] text-slate-600">{e.text}</p>
        </Card>
      ))}
    </div>
  );
}

/** Lightweight renderer for **bold**, bullet lists, and paragraphs. */
export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  const inline = (s: string) => s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => p.startsWith("**") ? <strong key={i} className="font-semibold text-navy">{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>);
  return (
    <div className="space-y-2.5">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*[-•*]\s+/.test(l))) return <ul key={i} className="list-disc pl-5 space-y-1">{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-•*]\s+/, ""))}</li>)}</ul>;
        return <p key={i}>{lines.map((l, j) => <span key={j}>{inline(l.replace(/^#+\s*/, ""))}{j < lines.length - 1 && <br />}</span>)}</p>;
      })}
    </div>
  );
}

/** "Next Step explains" card: grounded in the current simulation's numbers. */
export function AskRipple({ ctx, prompts, title = "Ask Next Step about your numbers" }: { ctx: RippleContext; prompts: string[]; title?: string }) {
  const { profile, award, badge, asked, set, setContext } = useStore();
  const [answer, setAnswer] = useState<{ q: string; text: string; source: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [custom, setCustom] = useState("");
  // keep the global context fresh for the floating coach
  useEffect(() => { setContext(ctx as Record<string, unknown>); }, [JSON.stringify(ctx)]); // eslint-disable-line react-hooks/exhaustive-deps

  const ask = async (q: string) => {
    if (!q.trim() || loading) return;
    setLoading(true); setAnswer({ q, text: "", source: "" });
    const r = await askRipple(q, ctx, profile);
    setAnswer({ q, text: r.text, source: r.source }); setLoading(false); setCustom("");
    award(10, "Asked Next Step a question", "ask-" + q.slice(0, 40));
    set((s) => ({ asked: s.asked + 1 }));
    if (asked + 1 >= 3) badge("curious");
  };
  return (
    <Card className="bg-gradient-to-br from-white to-emerald-50/60">
      <div className="flex items-center gap-3">
        <RippleMark />
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-[13px] text-slate-500">Next Step uses the results above. It never makes up its own math.</div>
        </div>
      </div>
      {ctx.insights && ctx.insights.length > 0 && (
        <ul className="mt-4 space-y-2">
          {ctx.insights.slice(0, 3).map((t, i) => (
            <li key={i} className="flex gap-2 text-[15px] text-slate-700"><Sparkles size={16} className="mt-1 shrink-0 text-emerald-500" />{t}</li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {prompts.map((p) => (
          <button key={p} onClick={() => ask(p)} disabled={loading} className="rounded-full bg-white px-3.5 py-2 text-left text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50 disabled:opacity-50">{p}</button>
        ))}
      </div>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(custom); }}>
        <label htmlFor={"ask-" + (ctx.module || "x")} className="sr-only">Ask your own question</label>
        <input id={"ask-" + (ctx.module || "x")} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Or ask your own question…" className="min-h-[48px] flex-1 rounded-2xl bg-white px-4 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" />
        <Button type="submit" disabled={loading || !custom.trim()}>Ask</Button>
      </form>
      <AnimatePresence>
        {answer && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200" aria-live="polite">
            <div className="text-[13px] font-semibold text-slate-500">You asked: {answer.q}</div>
            {loading ? <div className="mt-3 flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin" size={18} /> Next Step is thinking…</div>
              : <div className="mt-2 text-[15px] leading-relaxed text-slate-700"><RichText text={answer.text} /></div>}
            {!loading && answer.source === "built-in" && <div className="mt-2 text-[12px] text-slate-400">Answered with Next Step's built-in explainer (AI is offline right now).</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export function RippleMark({ size = 40 }: { size?: number }) {
  return (
    <span className="relative grid shrink-0 place-items-center rounded-2xl bg-navy" style={{ width: size, height: size }} aria-hidden>
      <span className="absolute h-1/3 w-1/3 rounded-full bg-emerald-400/50 ring-anim" />
      <svg viewBox="0 0 40 40" width={size * 0.7} height={size * 0.7}><circle cx="20" cy="20" r="4" fill="#10B981" /><circle cx="20" cy="20" r="9.5" fill="none" stroke="#10B981" strokeWidth="2.5" opacity=".75" /><circle cx="20" cy="20" r="15.5" fill="none" stroke="#10B981" strokeWidth="2" opacity=".35" /></svg>
    </span>
  );
}

export type QuizQ = { q: string; options: string[]; answer: number; why: string };
export function Quiz({ id, questions, onComplete }: { id: string; questions: QuizQ[]; onComplete?: () => void }) {
  const { quiz, set, award } = useStore();
  const mine = quiz[id] || {};
  const [picked, setPicked] = useState<Record<number, number>>({});
  const answeredAll = questions.every((_, i) => mine[i] !== undefined);
  useEffect(() => { if (answeredAll && onComplete) onComplete(); }, [answeredAll]); // eslint-disable-line react-hooks/exhaustive-deps
  const choose = (qi: number, oi: number) => {
    if (picked[qi] !== undefined) return;
    setPicked((p) => ({ ...p, [qi]: oi }));
    const right = oi === questions[qi].answer;
    set((s) => ({ quiz: { ...s.quiz, [id]: { ...(s.quiz[id] || {}), [qi]: right } } }));
    if (right) award(20, "Correct answer", `quiz-${id}-${qi}`);
  };
  const score = Object.values(mine).filter(Boolean).length;
  return (
    <div className="space-y-4">
      {questions.map((q, qi) => {
        const p = picked[qi];
        return (
          <Card key={qi} className="p-5">
            <div className="font-semibold text-[17px]">{qi + 1}. {q.q}</div>
            <div className="mt-3 grid gap-2">
              {q.options.map((o, oi) => {
                const state = p === undefined ? "idle" : oi === q.answer ? "right" : oi === p ? "wrong" : "dim";
                return (
                  <button key={oi} onClick={() => choose(qi, oi)} disabled={p !== undefined}
                    className={cx("flex min-h-[48px] items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium ring-1 transition",
                      state === "idle" && "bg-white ring-slate-200 hover:ring-emerald-400 hover:bg-emerald-50/50",
                      state === "right" && "bg-emerald-50 ring-emerald-400 text-emerald-800",
                      state === "wrong" && "bg-orange-50 ring-orange-300 text-orange-800",
                      state === "dim" && "bg-white ring-slate-100 text-slate-400")}>
                    {o}
                    {state === "right" && <Check size={18} />}{state === "wrong" && <X size={18} />}
                  </button>
                );
              })}
            </div>
            {p !== undefined && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-[15px] text-slate-600">{p === q.answer ? "✅ Nice! " : "Not quite. "}{q.why}</motion.p>}
          </Card>
        );
      })}
      {answeredAll && <div className="text-center text-sm font-semibold text-emerald-700">You got {score} of {questions.length} right. Lesson complete! 🎉</div>}
    </div>
  );
}

export const tooltipStyle = { borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 8px 24px -12px rgba(15,23,42,.25)", fontFamily: "Plus Jakarta Sans", fontSize: 13 };
export const moneyFmt = (v: unknown) => money(Number(v));
