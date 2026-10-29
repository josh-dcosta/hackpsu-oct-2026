import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim } from "../lib/store";
import { multiDebt, type Debt as D } from "../lib/calc";
import { money, compact, axisMoney, months } from "../lib/format";
import { WhatItMeans, Quiz, Section, Slider, tooltipStyle } from "../components/ui";
import { Idea, Simulator, axis } from "../components/Lesson";
import { useFinish } from "../pages/ModuleFrame";

export default function Debt() {
  const finish = useFinish("debt");
  const [s, set, reset] = useSim("debt", { cc: 6000, ccApr: 24, store: 900, storeApr: 26, car: 11000, carApr: 7, pay: 600 });
  const debts: D[] = [
    { name: "Credit card", balance: s.cc, apr: s.ccApr / 100, min: s.cc > 0 ? Math.max(25, s.cc * 0.03) : 0 },
    { name: "Store card", balance: s.store, apr: s.storeApr / 100, min: s.store > 0 ? Math.max(25, s.store * 0.03) : 0 },
    { name: "Car loan", balance: s.car, apr: s.carApr / 100, min: s.car > 0 ? Math.max(25, s.car * 0.025) : 0 },
  ].filter((d) => d.balance > 0);
  const mins = debts.reduce((t, d) => t + d.min, 0);
  const pay = Math.max(s.pay, Math.ceil(mins / 25) * 25);
  const minOnly = multiDebt(debts, 0, "minimum");
  const mine = multiDebt(debts, pay - mins, "avalanche");
  const more = multiDebt(debts, pay - mins + 100, "avalanche");
  const len = Math.min(240, Math.max(mine.series.length, isFinite(minOnly.months) ? minOnly.series.length : 240));
  const rows = Array.from({ length: len }, (_, i) => ({ month: i, min: Math.round(minOnly.series[i]?.total ?? 0), mine: Math.round(mine.series[i]?.total ?? 0), more: Math.round(more.series[i]?.total ?? 0) }));
  const total = debts.reduce((t, d) => t + d.balance, 0);
  const insights = [
    `Paying ${money(pay)}/month on ${money(total)} of debt: debt-free in ${months(mine.months)}, ${money(mine.totalInterest)} in interest. Minimums only: ${isFinite(minOnly.months) ? `${months(minOnly.months)} and ${money(minOnly.totalInterest)}` : "never finishes"}.`,
    `Adding $100/month: debt-free in ${months(more.months)} and saves ${money(mine.totalInterest - more.totalInterest)} in interest.`,
    "Extra money goes to the highest interest rate first (the avalanche method).",
  ];

  return (
    <div>
      <Idea title="Interest works both ways">
        <p>Compound interest grows your savings, and it grows debt too. Credit cards often charge <b>20–30% APR</b>, so high-interest debt is usually the first fire to put out.</p>
        <p>Pay more than the minimum, and send every extra dollar to the <b>highest interest rate first</b>. An <b>emergency fund</b> keeps the next surprise off the card.</p>
      </Idea>

      <Simulator title="Debt Payoff Simulator" onReset={reset} note="Simplified: fixed rates, no new charges, minimums estimated."
        controls={<>
          <div className="grid gap-x-4 sm:grid-cols-2">
          <Slider label="Credit card" value={s.cc} min={0} max={20000} step={100} onChange={(v) => set({ cc: v })} format={money} />
          <Slider label="Credit card rate (APR)" value={s.ccApr} min={0} max={36} step={0.5} onChange={(v) => set({ ccApr: v })} format={(v) => v + "%"} />
          <Slider label="Store card" value={s.store} min={0} max={5000} step={50} onChange={(v) => set({ store: v })} format={money} />
          <Slider label="Store card rate (APR)" value={s.storeApr} min={0} max={36} step={0.5} onChange={(v) => set({ storeApr: v })} format={(v) => v + "%"} />
          <Slider label="Car loan" value={s.car} min={0} max={40000} step={500} onChange={(v) => set({ car: v })} format={money} />
          <Slider label="Car loan rate (APR)" value={s.carApr} min={0} max={20} step={0.5} onChange={(v) => set({ carApr: v })} format={(v) => v + "%"} />
          </div>
          <div className="mt-2 rounded-2xl bg-slate-50 p-3">
            <Slider label="Total monthly payment" value={pay} min={Math.ceil(mins / 25) * 25} max={3000} step={25} onChange={(v) => set({ pay: v })} format={money} help={`Minimums add up to about ${money(mins)}.`} />
          </div>
        </>}
        chart={<div className="relative h-full">
          <div className="pointer-events-none absolute right-3 top-1 z-10 space-y-1 rounded-xl bg-white/90 p-2.5 text-[13px] font-bold ring-1 ring-slate-200">
            {[["#F97361", "Minimums only", minOnly], ["#0B2A45", `${money(pay)}/mo`, mine], ["#10B981", `${money(pay + 100)}/mo`, more]].map(([c, l, x]) => {
              const r = x as typeof mine;
              return <div key={l as string} className="flex items-center gap-2"><i className="h-1 w-5 rounded" style={{ background: c as string }} /><span style={{ color: c === "#0B2A45" ? "#0B2A45" : c === "#10B981" ? "#047857" : "#C2410C" }}>{l as string}: {isFinite(r.months) ? `debt-free in ${months(r.months)}, ${money(r.totalInterest)} interest` : "never paid off"}</span></div>;
            })}
          </div>
          <ResponsiveContainer>
            <LineChart data={rows} margin={{ top: 30, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="month" tickFormatter={(v) => (v % 12 === 0 ? `${v / 12} yr` : "")} interval={0} {...axis} />
              <YAxis tickFormatter={axisMoney} {...axis} width={56} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Month ${l}`} formatter={(v, n) => [money(Number(v)), n]} />
              <Line dataKey="min" name="Minimums only" stroke="#F97361" strokeWidth={2.5} dot={false} animationDuration={500} />
              <Line dataKey="mine" name={`${money(pay)}/mo`} stroke="#0B2A45" strokeWidth={3.5} dot={false} animationDuration={500} />
              <Line dataKey="more" name={`${money(pay + 100)}/mo`} stroke="#10B981" strokeWidth={3} dot={false} animationDuration={500} />
            </LineChart>
          </ResponsiveContainer>
        </div>} />

      <Section n={3} kicker="What it means" title="Make a plan">
        <WhatItMeans ctx={{ page: "lesson", module: "Debt Payoff Simulator", inputs: s, results: { totalDebt: total, monthlyPayment: pay, minimums: Math.round(mins), debtFreeMonths: mine.months, interest: Math.round(mine.totalInterest), withExtra100Months: more.months, withExtra100Interest: Math.round(more.totalInterest), minimumsOnlyMonths: isFinite(minOnly.months) ? minOnly.months : "never", payoffOrder: mine.order }, insights }}
          prompts={["Which debt should I pay first?", "Why is the minimum payment a trap?", "Should I save or pay off debt first?"]} />
      </Section>
      <Section n={4} kicker="Quick check" title="Test yourself">
        <Quiz id="debt" onComplete={finish} questions={[
          { q: "Which debt should usually get extra money first?", options: ["The smallest balance", "The highest interest rate", "The car loan"], answer: 1, why: "Paying the most expensive debt first saves the most interest (the avalanche method)." },
          { q: "Why is paying only the minimum risky?", options: ["It's illegal", "Most of the payment goes to interest, so it takes years", "It hurts your income"], answer: 1, why: "Minimums barely cover interest, so balances shrink very slowly." },
          { q: "A common emergency fund goal is…", options: ["1 week of expenses", "3–6 months of essential expenses", "10 years of salary"], answer: 1, why: "3–6 months is a common guideline." },
        ]} />
      </Section>
    </div>
  );
}
