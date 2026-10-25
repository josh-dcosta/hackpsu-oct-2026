import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Download, RotateCcw, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { useStore } from "../lib/store";
import { DECISIONS, STORY_START, altChoices, defaultChoices, simulateStory, type Choices } from "../lib/story";
import { downloadPlan } from "../lib/pdf";
import { money, compact, axisMoney } from "../lib/format";
import { AskRipple, Button, Card, EstimateTag, RippleMark, cx, tooltipStyle } from "../components/ui";

function AnimatedMoney({ value, className }: { value: number; className?: string }) {
  const [v, setV] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now(), a = from.current, b = value; let raf = 0;
    const tick = (t: number) => { const k = Math.min(1, (t - start) / 800); setV(a + (b - a) * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(tick); else from.current = b; };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={cx("num", className)}>{compact(v)}</span>;
}

export default function Future() {
  const { story, set, award, badge, profile, assumptions, done, xp, badges } = useStore();
  const step = story.step; // 0 = intro, 1..N = decisions, N+1 = finale
  const N = DECISIONS.length;
  const [picked, setPicked] = useState<string | null>(null);
  const setStory = (p: Partial<typeof story>) => set((s) => ({ story: { ...s.story, ...p } }));

  const working: Choices = useMemo(() => ({ ...defaultChoices(), ...story.choices }), [story.choices]);
  const sim = useMemo(() => simulateStory(working), [working]);

  if (step === 0) return <Intro onStart={() => setStory({ step: 1, choices: {}, finished: false })} />;
  if (step > N || story.finished) return <Finale choices={working} onReplay={() => { setStory({ step: 0, choices: {}, finished: false }); }} onPdf={() => downloadPlan({ profile, assumptions, story: { choices: working, finished: true }, done, xp, badges })} />;

  const d = DECISIONS[step - 1];
  const chosen = picked ?? story.choices[d.id] ?? null;
  const optionOutcomes = d.options.map((o) => ({ ...o, sim: simulateStory({ ...working, [d.id]: o.id }) }));
  const mineOut = optionOutcomes.find((o) => o.id === chosen);
  const target = d.id === "retire" ? "retireRow" : "y30";
  const best = Math.max(...optionOutcomes.map((o) => o.sim[target].netWorth));
  const worst = Math.min(...optionOutcomes.map((o) => o.sim[target].netWorth));

  const choose = (id: string) => {
    setPicked(id);
    setStory({ choices: { ...story.choices, [d.id]: id } });
    award(10, "Made a life decision", "story-" + d.id);
  };
  const next = () => {
    setPicked(null);
    if (step === N) { setStory({ step: N + 1, finished: true }); award(100, "Finished your financial story", "story-finish"); badge("architect"); }
    else setStory({ step: step + 1 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const age = STORY_START.age + d.year;

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="h-2.5 flex-1 rounded-full bg-slate-200"><motion.div className="h-2.5 rounded-full bg-emerald-500" animate={{ width: `${((step - 1) / N) * 100}%` }} /></div>
        <span className="text-sm font-semibold text-slate-500 num">{step}/{N}</span>
        <button onClick={() => setStory({ step: 0, choices: {}, finished: false })} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" aria-label="Restart story"><RotateCcw size={16} /></button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        {/* Decision card */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div key={d.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <Card className={cx(d.kind === "event" && "ring-2 ring-amber/50")}>
                <div className="flex items-center justify-between text-[13px] font-bold uppercase tracking-wider">
                  <span className={d.kind === "event" ? "text-amber-600" : "text-emerald-600"}>{d.kind === "event" ? "⚡ Life event" : "🧭 Your plan"}</span>
                  <span className="text-slate-400">{d.id === "retire" ? "The finish line" : `Year ${d.year} · Age ${age}`}</span>
                </div>
                <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold leading-tight">{d.title}</h1>
                <p className="mt-2 text-lg text-slate-600">{d.story}</p>
                <div className="mt-5 grid gap-2.5">
                  {d.options.map((o) => (
                    <motion.button key={o.id} whileTap={{ scale: 0.98 }} onClick={() => choose(o.id)} aria-pressed={chosen === o.id}
                      className={cx("flex min-h-[64px] items-center gap-4 rounded-2xl p-4 text-left ring-2 transition", chosen === o.id ? "bg-emerald-50 ring-emerald-500" : "bg-white ring-slate-200 hover:ring-emerald-300")}>
                      <span className="text-3xl">{o.emoji}</span>
                      <span className="flex-1"><span className="block text-[17px] font-semibold">{o.label}</span><span className="text-[14px] text-slate-500">{o.detail}</span></span>
                      <span className={cx("grid h-6 w-6 place-items-center rounded-full ring-2", chosen === o.id ? "bg-emerald-500 ring-emerald-500 text-white" : "ring-slate-300")}>{chosen === o.id && "✓"}</span>
                    </motion.button>
                  ))}
                </div>
                <AnimatePresence>
                  {chosen && mineOut && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="mt-5 rounded-2xl bg-navy p-4 text-white">
                        <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-emerald-300"><Sparkles size={14} /> The ripple effect</div>
                        <p className="mt-1.5 text-[15px] text-slate-200">
                          {best - worst < 500 ? "In this simulation, this choice barely changes the long-term number. Its value is in safety and peace of mind." :
                            mineOut.sim[target].netWorth >= best - 1 ? <>Best long-term number of these options: <b className="text-emerald-300">{compact(best - worst)} more</b> {d.id === "retire" ? "at retirement" : "after 30 years"} than the lowest.</> :
                              <>Compared with the strongest option here, this path ends about <b className="text-orange-300">{compact(best - mineOut.sim[target].netWorth)} lower</b> {d.id === "retire" ? "at retirement" : "after 30 years"}. Tradeoffs can still be worth it!</>}
                        </p>
                        <p className="mt-2 text-[14px] text-slate-300">💡 {d.lesson}</p>
                      </div>
                      <Button onClick={next} className="mt-4 w-full text-lg">{step === N ? "See my two futures" : "Next"} <ArrowRight size={20} /></Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Live projection */}
        <div className="lg:col-span-3">
          <Card>
            <div className="flex items-center justify-between">
              <div><div className="font-semibold">Alex's projected net worth</div><div className="text-[13px] text-slate-500">Updates with every choice · future dollars</div></div>
              <EstimateTag />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[["In 10 yrs", sim.y10.netWorth], ["In 20 yrs", sim.y20.netWorth], ["In 30 yrs", sim.y30.netWorth]].map(([l, v]) => (
                <div key={l as string} className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-[12px] font-semibold text-slate-500">{l as string}</div>
                  <AnimatedMoney value={v as number} className="text-xl sm:text-2xl font-bold" />
                </div>
              ))}
            </div>
            <div className="mt-4 h-64 sm:h-72">
              <ResponsiveContainer>
                <AreaChart data={sim.rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs><linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#10B981" stopOpacity={0.4} /><stop offset="1" stopColor="#10B981" stopOpacity={0.02} /></linearGradient></defs>
                  <CartesianGrid stroke="#EEF2F7" vertical={false} />
                  <XAxis dataKey="age" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Age ${l}`} formatter={(v, n) => [money(Number(v)), n === "netWorth" ? "Net worth" : "Today's buying power"]} />
                  <Area type="monotone" dataKey="netWorth" stroke="#10B981" strokeWidth={3} fill="url(#gs)" animationDuration={700} />
                  <Area type="monotone" dataKey="real" stroke="#0F172A" strokeWidth={2} fill="none" strokeDasharray="5 4" animationDuration={700} />
                  {d.year > 0 && d.year < sim.rows.length && <ReferenceDot x={STORY_START.age + d.year} y={sim.rows[d.year].netWorth} r={7} fill="#F59E0B" stroke="#fff" strokeWidth={2} />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-slate-500">
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Future dollars</span>
              <span className="flex items-center gap-1.5"><i className="h-0.5 w-4 bg-navy" /> Today's buying power</span>
              {d.year > 0 && d.id !== "retire" && <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber" /> You are here</span>}
            </div>
            <p className="mt-3 text-[12px] text-slate-400">Choices you haven't made yet use a middle-of-the-road default.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mx-auto w-fit"><RippleMark size={64} /></div>
      <div className="mt-5 text-sm font-bold uppercase tracking-wider text-emerald-600">Choose Your Financial Future</div>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold leading-tight">Ten choices. Thirty years.<br />Two possible futures.</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">Meet <b>Alex</b>. Alex is 30, earns <b>{money(STORY_START.salary)}</b> a year, and has <b>{money(STORY_START.savings)}</b> in savings. You make Alex's money decisions and handle life's surprises. Watch each choice ripple across the decades.</p>
      <div className="mx-auto mt-8 grid max-w-xl grid-cols-3 gap-3">
        {[["🧭", "4 planning choices"], ["⚡", "5 life events"], ["🏁", "1 retirement call"]].map(([e, t]) => (
          <div key={t} className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200"><div className="text-3xl">{e}</div><div className="mt-1 text-[14px] font-semibold">{t}</div></div>
        ))}
      </div>
      <Button onClick={onStart} className="mt-8 px-10 py-4 text-lg">Start the story <ArrowRight size={20} /></Button>
      <p className="mt-4 text-[13px] text-slate-500">A fictional story with hypothetical, educational estimates. There's no single "right" answer, only tradeoffs.</p>
    </div>
  );
}

function Finale({ choices, onReplay, onPdf }: { choices: Choices; onReplay: () => void; onPdf: () => void }) {
  const [b, setB] = useState<Choices>(() => altChoices(choices));
  const A = simulateStory(choices), B = simulateStory(b);
  const len = Math.max(A.rows.length, B.rows.length);
  const data = Array.from({ length: len }, (_, i) => ({ age: STORY_START.age + i, A: A.rows[i]?.netWorth, B: B.rows[i]?.netWorth }));
  const gap = A.y30.netWorth - B.y30.netWorth;
  const insights = [
    `Path A (your choices) could reach about ${compact(A.y30.netWorth)} in 30 years. Path B could reach about ${compact(B.y30.netWorth)}, a difference of ${compact(Math.abs(gap))}.`,
    `At their retirement ages, Path A has about ${compact(A.retireRow.netWorth)} at ${A.retireAge} and Path B about ${compact(B.retireRow.netWorth)} at ${B.retireAge}.`,
    `Credit-card interest paid: ${money(A.interestPaid)} on Path A vs ${money(B.interestPaid)} on Path B. Unclaimed employer match: ${compact(A.missedMatch)} vs ${compact(B.missedMatch)}.`,
  ];
  const differing = DECISIONS.filter((d) => choices[d.id] !== b[d.id]);

  return (
    <div>
      <div className="text-center">
        <div className="text-sm font-bold uppercase tracking-wider text-emerald-600">🏛️ Badge unlocked: Financial Future Architect</div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold">Two possible futures</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">Same person, same paycheck, different choices. <b>Path B</b> starts as the road not taken. Tap any choice below to build your own alternative.</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[{ label: "Path A · Your choices", s: A, tone: "bg-navy text-white", acc: "text-emerald-300" }, { label: "Path B · The other road", s: B, tone: "bg-white ring-1 ring-slate-200", acc: "text-sky-600" }].map((p) => (
          <motion.div key={p.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={cx("rounded-3xl p-5 shadow-card", p.tone)}>
            <div className={cx("text-[13px] font-bold uppercase tracking-wider", p.acc)}>{p.label}</div>
            <div className="mt-1 font-display text-4xl font-semibold num">{compact(p.s.y30.netWorth)}</div>
            <div className="text-[14px] opacity-70">after 30 years (age {STORY_START.age + 30})</div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[["10 yrs", p.s.y10.netWorth], ["20 yrs", p.s.y20.netWorth], [`At ${p.s.retireAge}`, p.s.retireRow.netWorth]].map(([l, v]) => (
                <div key={l as string} className="rounded-xl bg-black/5 p-2"><div className="text-[12px] opacity-70">{l as string}</div><div className="num font-bold">{compact(v as number)}</div></div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      <Card className="mt-5">
        <div className="flex items-center gap-2 font-semibold">{gap >= 0 ? <TrendingUp className="text-emerald-500" /> : <TrendingDown className="text-orange-500" />} The gap: {compact(Math.abs(gap))} after 30 years</div>
        <div className="mt-3 h-72">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="age" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Age ${l}`} formatter={(v, n) => [money(Number(v)), n === "A" ? "Path A" : "Path B"]} />
              <Legend formatter={(v) => (v === "A" ? "Path A (yours)" : "Path B")} wrapperStyle={{ fontSize: 12 }} />
              <Line dataKey="A" stroke="#10B981" strokeWidth={3.5} dot={false} animationDuration={1200} />
              <Line dataKey="B" stroke="#38BDF8" strokeWidth={3} dot={false} strokeDasharray="6 4" animationDuration={1200} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="mt-5 p-0 sm:p-0 overflow-hidden">
        <div className="p-5 pb-2 font-semibold">Decision by decision · <span className="text-slate-500 font-normal">{differing.length} differences</span></div>
        <div className="divide-y divide-slate-100">
          {DECISIONS.map((d) => (
            <div key={d.id} className="grid gap-2 px-5 py-3 sm:grid-cols-3 sm:items-center">
              <div className="font-semibold text-[15px]">{d.title}</div>
              <div className="text-[14px]"><span className="mr-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">A</span>{d.options.find((o) => o.id === choices[d.id])?.label}</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-md bg-sky-soft px-1.5 py-0.5 text-[11px] font-bold text-sky-700">B</span>
                {d.options.map((o) => (
                  <button key={o.id} onClick={() => setB({ ...b, [d.id]: o.id })} aria-pressed={b[d.id] === o.id}
                    className={cx("rounded-full px-2.5 py-1 text-[13px] font-semibold ring-1", b[d.id] === o.id ? "bg-navy text-white ring-navy" : "bg-white ring-slate-200 hover:ring-sky-400")}>{o.emoji} {o.label}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-5">
        <AskRipple title="Ripple compares your two futures" ctx={{ page: "choose your financial future", module: "Choose Your Financial Future", inputs: { character: "Alex, 30, $75k salary, $15k savings", pathA: Object.fromEntries(DECISIONS.map((d) => [d.title, d.options.find((o) => o.id === choices[d.id])?.label])), pathB: Object.fromEntries(DECISIONS.map((d) => [d.title, d.options.find((o) => o.id === b[d.id])?.label])) }, results: { pathA: { in10: Math.round(A.y10.netWorth), in20: Math.round(A.y20.netWorth), in30: Math.round(A.y30.netWorth), atRetirement: Math.round(A.retireRow.netWorth), retireAge: A.retireAge, cardInterest: Math.round(A.interestPaid), missedMatch: Math.round(A.missedMatch) }, pathB: { in10: Math.round(B.y10.netWorth), in20: Math.round(B.y20.netWorth), in30: Math.round(B.y30.netWorth), atRetirement: Math.round(B.retireRow.netWorth), retireAge: B.retireAge, cardInterest: Math.round(B.interestPaid), missedMatch: Math.round(B.missedMatch) } }, insights }}
          prompts={["Which decisions mattered most, and why?", "What tradeoffs did Path A make?", "What can't this simulation predict?"]} />
      </div>
      <Card className="mt-5 bg-amber-soft/60">
        <div className="font-semibold">🌦️ Remember: the future is uncertain</div>
        <p className="mt-1 text-[15px] text-slate-700">These paths assume steady average returns after one simulated crash. Real life brings different markets, job changes, health events and policy changes. The lesson isn't the exact dollar amount. It's which <b>habits</b> tend to move the needle: saving consistently, claiming the match, avoiding high-interest debt, and staying invested through downturns.</p>
      </Card>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button onClick={onPdf}><Download size={18} /> Download my plan (PDF)</Button>
        <Button variant="ghost" onClick={onReplay}><RotateCcw size={18} /> Play again</Button>
        <a href="#/learn" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 font-semibold text-white">Keep learning <ArrowRight size={18} /></a>
      </div>
    </div>
  );
}
