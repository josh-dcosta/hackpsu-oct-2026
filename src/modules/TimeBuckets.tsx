import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useSim, useStore } from "../lib/store";
import { money } from "../lib/format";
import { ApplyToPlan, Card, EstimateTag, ResetButton, Slider, tooltipStyle } from "../components/ui";

// Educational rule of thumb for long-term money: stock share ≈ 110 − age, kept between 40% and 90%.
const CATS = [
  { key: "safe", label: "High-yield savings, CDs, Treasury bills", note: "FDIC-insured or U.S.-government-backed. Won't drop in a crash.", color: "#38BDF8" },
  { key: "bond", label: "Bond index fund", note: "Steadier than stocks. Holds thousands of bonds.", color: "#6366F1" },
  { key: "us", label: "U.S. total stock market index fund", note: "Thousands of U.S. companies in one low-cost fund.", color: "#F5C000" },
  { key: "intl", label: "International stock index fund", note: "Companies outside the U.S. for extra diversification.", color: "#0B2A45" },
] as const;

export default function TimeBuckets() {
  const { profile } = useStore();
  const [s, set, reset] = useSim("buckets", { short: profile.savings, medium: 0, long: profile.retirement });
  const stockPct = Math.min(90, Math.max(40, 110 - profile.age)) / 100;
  const amt = {
    safe: s.short + s.medium * 0.3,
    bond: s.medium * 0.5 + s.long * (1 - stockPct),
    us: s.medium * 0.2 * 0.7 + s.long * stockPct * 0.7,
    intl: s.medium * 0.2 * 0.3 + s.long * stockPct * 0.3,
  };
  const total = s.short + s.medium + s.long || 1;
  const pie = CATS.map((c) => ({ name: c.label, value: Math.round(amt[c.key]), color: c.color })).filter((x) => x.value > 0);
  const buckets = [
    { emoji: "🛟", title: "Short-term · 0–3 years", sub: "Emergency fund, bills coming soon", value: s.short, key: "short" as const, max: 100_000, plan: "100% in high-yield savings, CDs or Treasury bills. Safe and easy to reach. Never in stocks." },
    { emoji: "🎓", title: "Medium-term · 3–10 years", sub: "College help, a car, a home repair fund", value: s.medium, key: "medium" as const, max: 150_000, plan: "Mostly safe: ~30% savings/CDs, ~50% bond index fund, ~20% stock index funds." },
    { emoji: "🌳", title: "Long-term · 10+ years", sub: "Retirement", value: s.long, key: "long" as const, max: 1_000_000, plan: `About ${Math.round(stockPct * 100)}% stock index funds (U.S. + international) and ${100 - Math.round(stockPct * 100)}% bond index fund at age ${profile.age}. Or one target-date index fund for your retirement year.` },
  ];

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-semibold">Match money to time</div>
          <p className="text-[14px] text-slate-500">The sooner you need the money, the safer it should be. Set how much belongs in each bucket.</p>
        </div>
        <ResetButton onClick={reset} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {buckets.map((b) => (
          <div key={b.key} className="rounded-2xl bg-slate-50 p-4">
            <div className="text-2xl">{b.emoji}</div>
            <div className="mt-1 font-semibold">{b.title}</div>
            <div className="text-[13px] text-slate-500">{b.sub}</div>
            <Slider grow id={`bucket-${b.key}`} label="Amount" value={b.value} min={0} max={b.max} step={500} onChange={(v) => set({ [b.key]: v } as Partial<typeof s>)} format={money} />
            <p className="text-[14px] text-slate-700">{b.plan}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid items-center gap-5 lg:grid-cols-5">
        <div className="h-56 lg:col-span-2">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pie} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={2} animationDuration={500}>{pie.map((p) => <Cell key={p.name} fill={p.color} />)}</Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [money(Number(v)), n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 lg:col-span-3">
          <div className="text-[13px] font-semibold text-slate-500">Your {money(total)}, spread across 4 simple, low-cost categories:</div>
          {CATS.map((c) => (
            <div key={c.key} className="flex items-start gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
              <i className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ background: c.color }} />
              <div className="flex-1"><div className="font-semibold leading-tight">{c.label}</div><div className="text-[13px] text-slate-500">{c.note}</div></div>
              <div className="text-right"><div className="num font-bold">{money(amt[c.key])}</div><div className="num text-[12px] text-slate-500">{Math.round((amt[c.key] / total) * 100)}%</div></div>
            </div>
          ))}
        </div>
      </div>
      <ApplyToPlan label="Use this index-fund mix in my plan" patch={{ returnRate: stockPct >= 0.75 ? 0.068 : stockPct >= 0.5 ? 0.06 : 0.045 }} summary={`Your plan's long-term money will follow this mix: about ${Math.round(stockPct * 100)}% stock index funds and ${100 - Math.round(stockPct * 100)}% bond index funds.`} />
      <div className="mt-3 flex flex-wrap items-center gap-2"><EstimateTag>Educational rule of thumb, not personal advice.</EstimateTag><span className="text-[12px] text-slate-500">Notice what's missing: no individual stocks, no day trading, no market timing.</span></div>
    </Card>
  );
}
