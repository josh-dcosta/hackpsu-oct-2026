import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Shuffle } from "lucide-react";
import { useSim, useStore } from "../lib/store";
import { runPortfolio, MARKETS, type MarketKey } from "../lib/calc";
import { money, compact, axisMoney, pct } from "../lib/format";
import { WhatItMeans, Button, Quiz, Section, Slider, tooltipStyle, cx } from "../components/ui";
import { Idea, Simulator, endLabel, axis } from "../components/Lesson";
import { useFinish } from "../pages/ModuleFrame";

const ASSETS = [
  { key: "single", label: "One stock (\"ZoomCo\")" },
  { key: "several", label: "A few stocks" },
  { key: "index", label: "Stock index fund" },
  { key: "bonds", label: "Bond index fund" },
  { key: "cash", label: "Cash" },
] as const;
const GLOSS = [
  ["Index fund", "A fund that copies a market index (like the S&P 500), so you own hundreds of companies, usually at low cost."],
  ["Diversification", "Spreading money across many investments so one failure can't sink you."],
  ["Stock vs. bond", "A stock is a slice of a company. A bond is a loan to a company or government. Bonds usually swing less."],
  ["Short-term risk", "Over 1–3 years, stocks can drop 30–50%. Money you'll need soon doesn't belong in stocks."],
];

export default function Invest() {
  const { simple } = useStore();
  const finish = useFinish("invest");
  const [s, set, reset] = useSim("invest", { single: 0, several: 0, index: 60, bonds: 40, cash: 0, market: "crash" as MarketKey, seed: 7, amount: 10000 });
  const alloc = { single: s.single, several: s.several, index: s.index, bonds: s.bonds, cash: s.cash };
  const r = runPortfolio(alloc, s.amount, s.market, s.seed);
  const total = Object.values(alloc).reduce((a, b) => a + b, 0) || 1;
  const rows = r.years.map((y) => ({ year: y.year, mine: Math.round(y.mine), single: Math.round(y.single), index: Math.round(y.index), mix: Math.round(y.mix) }));
  const n = rows.length;
  const last = rows[n - 1];
  // spread end labels so they don't overlap
  const order = (["mine", "single", "index", "mix"] as const).slice().sort((a, b) => last[b] - last[a]);
  const dy = (k: (typeof order)[number]) => [-14, 6, 26, 46][order.indexOf(k)];
  const insights = [
    `In this "${MARKETS[s.market].label}" simulation, your mix turned ${money(s.amount)} into about ${money(r.mine.final)}, with a worst drop of ${pct(-r.mine.maxDD, 0)}.`,
    `All in one stock ended at ${money(r.comps.single.final)}; the index fund ended at ${money(r.comps.index.final)}. Shuffle the luck to see how wildly one stock can swing.`,
  ];

  return (
    <div>
      <Idea title="Invest the simple, safe way">
        <p>You don't need to pick stocks to build wealth. A low-cost <b>index fund</b> owns thousands of companies at once, so one company's failure barely dents it. Keep short-term money safe in savings, put long-term money in a few index funds, add regularly, and leave it alone.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {(simple ? GLOSS : GLOSS).map(([t, d]) => (
            <details key={t} className="group rounded-2xl bg-slate-50 p-4 text-base">
              <summary className="flex cursor-pointer list-none justify-between font-semibold">{t}<span className="text-slate-400 transition group-open:rotate-45">＋</span></summary>
              <p className="mt-2 text-[15px] text-slate-600">{d}</p>
            </details>
          ))}
        </div>
      </Idea>

      <Simulator title="One stock vs. index funds" onReset={reset} note="Hypothetical simulation with fictional stocks. Past patterns don't guarantee future results."
        controls={<>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(MARKETS) as MarketKey[]).map((k) => (
              <button key={k} onClick={() => set({ market: k })} aria-pressed={s.market === k}
                className={cx("rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1", s.market === k ? "bg-navy text-white ring-navy" : "bg-white ring-slate-200 hover:ring-emerald-400")}>{MARKETS[k].label}</button>
            ))}
          </div>
          <div className="mt-3 text-[13px] font-semibold text-slate-500">Split {money(s.amount)} of pretend money:</div>
          {ASSETS.map((a) => (
            <Slider key={a.key} label={a.label} value={alloc[a.key]} min={0} max={100} step={5} onChange={(v) => set({ [a.key]: v } as Partial<typeof s>)} format={(v) => `${Math.round((v / total) * 100)}%`} />
          ))}
          <Button variant="soft" className="mt-2 w-full" onClick={() => set({ seed: Math.floor(Math.random() * 1e6) })}><Shuffle size={16} /> Shuffle the luck</Button>
        </>}
        chart={
          <ResponsiveContainer>
            <LineChart data={rows} margin={{ top: 24, right: 12, left: 0, bottom: 30 }}>
              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} {...axis} />
              <YAxis tickFormatter={axisMoney} {...axis} width={56} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Year ${l}`} formatter={(v, nm) => [money(Number(v)), nm]} />
              <Line dataKey="single" name="All in one stock" stroke="#F97361" strokeWidth={2.5} dot={false} animationDuration={600} label={endLabel(n, (v) => `One stock ${compact(v)}`, "#C2410C", { dy: dy("single") })} />
              <Line dataKey="index" name="Stock index fund" stroke="#10B981" strokeWidth={2.5} dot={false} animationDuration={600} label={endLabel(n, (v) => `Index fund ${compact(v)}`, "#047857", { dy: dy("index") })} />
              <Line dataKey="mix" name="60/40 index funds" stroke="#38BDF8" strokeWidth={2.5} dot={false} animationDuration={600} label={endLabel(n, (v) => `60/40 ${compact(v)}`, "#0369A1", { dy: dy("mix") })} />
              <Line dataKey="mine" name="Your mix" stroke="#0F172A" strokeWidth={4} dot={false} animationDuration={600} label={endLabel(n, (v) => `Your mix ${compact(v)}`, "#0F172A", { dy: dy("mine") })} />
            </LineChart>
          </ResponsiveContainer>
        } />

      <Section n={3} kicker="What it means" title="Risk and reward">
        <WhatItMeans ctx={{ page: "lesson", module: "One stock vs index funds", inputs: { allocationPct: Object.fromEntries(Object.entries(alloc).map(([k, v]) => [k, Math.round((v / total) * 100)])), market: MARKETS[s.market].label, startingAmount: s.amount }, results: { yourMixFinal: Math.round(r.mine.final), yourWorstDropPct: Math.round(r.mine.maxDD * 100), oneStock: Math.round(r.comps.single.final), indexFund: Math.round(r.comps.index.final), sixtyForty: Math.round(r.comps.mix.final) }, insights }}
          prompts={["Why is one stock so risky?", "Why hold bonds at all?", "What is dollar-cost averaging?"]} />
      </Section>
      <Section n={4} kicker="Quick check" title="Test yourself">
        <Quiz id="invest" onComplete={finish} questions={[
          { q: "What does an index fund do?", options: ["Picks the best stocks", "Holds a whole market index, like hundreds of companies", "Guarantees returns"], answer: 1, why: "It tracks an index, giving instant diversification, often at low cost." },
          { q: "What's the practical, low-risk way most people build wealth?", options: ["Trading individual stocks often", "Holding low-cost, diversified index funds for many years", "Waiting for the perfect time to buy"], answer: 1, why: "Index funds spread risk across thousands of companies at low cost." },
          { q: "Money you'll need in 1–2 years is usually best kept in…", options: ["One hot stock", "Savings or cash equivalents", "100% stocks"], answer: 1, why: "Stocks can drop sharply over short periods." },
        ]} />
      </Section>
    </div>
  );
}
