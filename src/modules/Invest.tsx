import { useState } from "react";
import { motion } from "framer-motion";
import { Cell, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Shuffle } from "lucide-react";
import { useSim, useStore } from "../lib/store";
import { runPortfolio, MARKETS, type MarketKey } from "../lib/calc";
import { money, compact, axisMoney, pct } from "../lib/format";
import { AskRipple, Button, Card, EstimateTag, Quiz, ResetButton, Section, Segmented, Slider, Stat, Takeaway, tooltipStyle, cx } from "../components/ui";
import { useFinish } from "../pages/ModuleFrame";

const ASSETS = [
  { key: "single", label: "One fictional stock (\"ZoomCo\")", color: "#F97361" },
  { key: "several", label: "A few fictional stocks", color: "#F59E0B" },
  { key: "index", label: "Broad-market index fund", color: "#10B981" },
  { key: "bonds", label: "Bonds", color: "#38BDF8" },
  { key: "cash", label: "Cash equivalents", color: "#94A3B8" },
] as const;
const STRATS = [
  { key: "single", label: "All in one stock", color: "#F97361" },
  { key: "several", label: "A few stocks", color: "#F59E0B" },
  { key: "index", label: "Index fund", color: "#10B981" },
  { key: "mix", label: "60/40 stocks & bonds", color: "#38BDF8" },
] as const;
const GLOSS = [
  ["Stock / share", "A tiny slice of ownership in a company. If the company grows, the slice can be worth more. If it struggles, less."],
  ["ETF & mutual fund", "Baskets that hold many investments at once. ETFs trade like stocks during the day; mutual funds price once a day."],
  ["Index fund", "A fund that simply copies a market index (like the S&P 500), so you own hundreds of companies, usually at low cost."],
  ["Diversification", "Spreading money across many investments so one failure can't sink you. It reduces risk but doesn't eliminate it."],
  ["Volatility", "How much and how often a price swings. Higher volatility = a bumpier ride."],
  ["Dollar-cost averaging", "Investing a fixed amount on a schedule. You automatically buy more shares when prices are low and fewer when they're high."],
  ["Short-term risk", "Over 1–3 years, stocks can drop 30–50%. Money you'll need soon usually doesn't belong in stocks."],
];

export default function Invest() {
  const { simple } = useStore();
  const finish = useFinish("invest");
  const [s, set, reset] = useSim("invest", { single: 10, several: 10, index: 50, bonds: 25, cash: 5, market: "crash" as MarketKey, seed: 7, amount: 10000 });
  const [show, setShow] = useState<string[]>(["mine", "single", "index"]);
  const alloc = { single: s.single, several: s.several, index: s.index, bonds: s.bonds, cash: s.cash };
  const r = runPortfolio(alloc, s.amount, s.market, s.seed);
  const total = Object.values(alloc).reduce((a, b) => a + b, 0) || 1;
  const pie = ASSETS.map((a) => ({ name: a.label, value: alloc[a.key], color: a.color })).filter((x) => x.value > 0);
  const best = Object.entries(r.comps).sort((a, b) => b[1].final - a[1].final)[0];
  const insights = [
    `In this "${MARKETS[s.market].label}" simulation, your mix turned ${money(s.amount)} into about ${money(r.mine.final)}, with a worst drop of ${pct(-r.mine.maxDD, 0)} from its peak.`,
    `All-in-one-stock ended at ${money(r.comps.single.final)}, while the index fund ended at ${money(r.comps.index.final)}. Shuffle the luck to see how wildly one stock can swing.`,
    `Your risk level is ${r.risk}/10. ${r.risk >= 7 ? "That's a bumpy ride. Big gains and big losses are both possible." : r.risk <= 3 ? "That's a smooth ride, but growth is likely slower." : "That's a middle-of-the-road mix."}`,
  ];
  const toggle = (k: string) => setShow((v) => (v.includes(k) ? v.filter((x) => x !== k) : [...v, k]));

  return (
    <div>
      <Section n={1} kicker="The idea" title="Don't put all your eggs in one basket">
        <Card>
          <p className="text-lg leading-relaxed text-slate-700">One company can soar or go to zero. A <b>diversified</b> fund holds hundreds, so a single failure barely dents it. You give up the chance of a lottery win to avoid a wipe-out.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {(simple ? GLOSS.slice(0, 4) : GLOSS).map(([t, d]) => (
              <details key={t} className="group rounded-2xl bg-slate-50 p-4">
                <summary className="cursor-pointer list-none font-semibold flex justify-between">{t}<span className="text-slate-400 group-open:rotate-45 transition">＋</span></summary>
                <p className="mt-2 text-[15px] text-slate-600">{d}</p>
              </details>
            ))}
          </div>
        </Card>
      </Section>

      <Section n={2} kicker="Try it" title="Virtual Portfolio Simulator">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented label="Market conditions" value={s.market} onChange={(v) => set({ market: v })} options={(Object.keys(MARKETS) as MarketKey[]).map((k) => ({ value: k, label: MARKETS[k].label }))} />
            <div className="flex gap-2">
              <Button variant="soft" onClick={() => set({ seed: Math.floor(Math.random() * 1e6) })}><Shuffle size={16} /> Shuffle luck</Button>
              <ResetButton onClick={reset} />
            </div>
          </div>
          <p className="mt-2 text-[14px] text-slate-500">{MARKETS[s.market].note} Individual stocks get random "company luck" on top.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="text-[13px] font-semibold text-slate-500">Split {money(s.amount)} of pretend money:</div>
              {ASSETS.map((a) => (
                <Slider key={a.key} label={a.label} value={alloc[a.key]} min={0} max={100} step={5} onChange={(v) => set({ [a.key]: v } as Partial<typeof s>)} format={(v) => `${Math.round((v / total) * 100)}%`} />
              ))}
              <div className="mt-2 flex items-center gap-4">
                <div className="h-36 w-36 shrink-0">
                  <ResponsiveContainer>
                    <PieChart><Pie data={pie} dataKey="value" innerRadius={40} outerRadius={64} paddingAngle={2} animationDuration={400}>{pie.map((p) => <Cell key={p.name} fill={p.color} />)}</Pie></PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-slate-500">Risk level</div>
                  <div className="mt-1 flex gap-1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <motion.span key={i} className="h-6 flex-1 rounded" animate={{ backgroundColor: i < r.risk ? (r.risk >= 7 ? "#F97361" : r.risk >= 4 ? "#F59E0B" : "#10B981") : "#E2E8F0" }} />
                    ))}
                  </div>
                  <div className="mt-1 font-bold">{r.risk}/10 · {r.risk >= 7 ? "Bumpy" : r.risk >= 4 ? "Moderate" : "Smooth"}</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Your mix after 10 years" value={money(r.mine.final)} tone="navy" />
                <Stat label="Worst drop along the way" value={pct(r.mine.maxDD, 0)} tone="coral" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[{ key: "mine", label: "Your mix", color: "#0F172A" }, ...STRATS].map((x) => (
                  <button key={x.key} onClick={() => toggle(x.key)} aria-pressed={show.includes(x.key)}
                    className={cx("flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1", show.includes(x.key) ? "bg-white ring-slate-300" : "bg-slate-50 text-slate-400 ring-slate-100")}>
                    <i className="h-2.5 w-2.5 rounded-full" style={{ background: x.color }} />{x.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 h-64">
                <ResponsiveContainer>
                  <LineChart data={r.years} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#EEF2F7" vertical={false} />
                    <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
                    <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Year ${l}`} formatter={(v, n) => [money(Number(v)), n]} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {show.includes("mine") && <Line dataKey="mine" name="Your mix" stroke="#0F172A" strokeWidth={3.5} dot={false} animationDuration={700} />}
                    {STRATS.filter((x) => show.includes(x.key)).map((x) => <Line key={x.key} dataKey={x.key} name={x.label} stroke={x.color} strokeWidth={2.5} dot={false} animationDuration={700} />)}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STRATS.map((x) => {
              const c = r.comps[x.key];
              return (
                <div key={x.key} className={cx("rounded-2xl p-3 ring-1", best[0] === x.key ? "ring-emerald-400 bg-emerald-50" : "ring-slate-200 bg-white")}>
                  <div className="text-[13px] font-semibold text-slate-500">{x.label}</div>
                  <div className="num text-lg font-bold">{compact(c.final)}</div>
                  <div className="text-[12px] text-slate-500">worst drop {pct(c.maxDD, 0)}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3"><EstimateTag>Hypothetical simulation with fictional stocks. Past patterns don't guarantee future results.</EstimateTag></div>
        </Card>
      </Section>
      <Section n={3} kicker="Ripple explains" title="Risk and reward">
        <AskRipple ctx={{ page: "lesson", module: "Virtual Portfolio Simulator", inputs: { allocationPct: Object.fromEntries(Object.entries(alloc).map(([k, v]) => [k, Math.round((v / total) * 100)])), market: MARKETS[s.market].label, startingAmount: s.amount }, results: { yourMixFinal: Math.round(r.mine.final), yourWorstDropPct: Math.round(r.mine.maxDD * 100), riskLevel: r.risk, oneStock: Math.round(r.comps.single.final), fewStocks: Math.round(r.comps.several.final), indexFund: Math.round(r.comps.index.final), sixtyForty: Math.round(r.comps.mix.final) }, insights }}
          prompts={["Why is one stock so risky?", "Why hold bonds at all?", "What is dollar-cost averaging?"]} />
      </Section>
      <Section n={4} kicker="Quick check" title="Test yourself">
        <Quiz id="invest" onComplete={finish} questions={[
          { q: "What does an index fund do?", options: ["Picks the best stocks", "Holds a whole market index, like hundreds of companies", "Guarantees returns"], answer: 1, why: "It tracks an index, giving instant diversification, often at low cost." },
          { q: "Diversification mainly reduces…", options: ["All risk", "The risk of one company sinking you", "Taxes"], answer: 1, why: "It spreads company-specific risk. The whole market can still fall." },
          { q: "Money you'll need in 1–2 years is usually best kept in…", options: ["One hot stock", "Savings or cash equivalents", "100% stocks"], answer: 1, why: "Stocks can drop sharply over short periods." },
        ]} />
      </Section>
      <Takeaway>Diversify, think in decades, and choose a mix you can stick with when the market drops. That's when it matters most.</Takeaway>
    </div>
  );
}
