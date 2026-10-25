import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim, useStore } from "../lib/store";
import { savingsVsInvesting } from "../lib/calc";
import { money, compact, axisMoney } from "../lib/format";
import { AskRipple, Card, EstimateTag, Examples, Quiz, ResetButton, Section, Segmented, Slider, Stat, Takeaway, tooltipStyle } from "../components/ui";
import { useFinish } from "../pages/ModuleFrame";

export default function Saving() {
  const { simple } = useStore();
  const finish = useFinish("saving");
  const [s, set, reset] = useSim("saving", { start: 5000, monthly: 300, sav: 4, inv: 7, inflation: 3, years: 25, real: false });
  const rows = savingsVsInvesting({ start: s.start, monthly: s.monthly, savingsRate: s.sav / 100, investRate: s.inv / 100, inflation: s.inflation / 100, years: s.years });
  const last = rows[rows.length - 1];
  const k = s.real ? { cash: "cashReal", hysa: "hysaReal", invest: "investReal" } : { cash: "cash", hysa: "hysa", invest: "invest" };
  const v = (key: "cash" | "hysa" | "invest") => Number(last[k[key] as keyof typeof last]);
  const insights = [
    `After ${s.years} years of putting in ${money(last.contributed)} total: a 0% account holds ${compact(last.cash)}, high-yield savings about ${compact(last.hysa)}, investing about ${compact(last.invest)} (not guaranteed).`,
    `In today's buying power, the 0% account is worth only ${compact(last.cashReal)}. Inflation quietly erased ${compact(last.cash - last.cashReal)}.`,
    `If investing averaged 3 points less, it could be closer to ${compact(last.investLow)}. Investing can lose money in any given year.`,
  ];
  return (
    <div>
      <Section n={1} kicker="The idea" title="Saving keeps money safe. Investing helps it grow.">
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-sky-soft p-5"><div className="text-2xl">🛟</div><div className="mt-1 font-semibold text-lg">Saving</div><p className="mt-1 text-slate-700">Safe, steady, easy to reach. Perfect for emergencies and goals in the next few years. {simple ? "" : "FDIC-insured bank deposits don't lose value to market swings, but low rates may trail inflation."}</p></div>
            <div className="rounded-2xl bg-emerald-50 p-5"><div className="text-2xl">🌱</div><div className="mt-1 font-semibold text-lg">Investing</div><p className="mt-1 text-slate-700">Owning pieces of companies (and bonds) that can grow over many years. Higher potential growth, but values go <b>up and down</b>, sometimes a lot.</p></div>
          </div>
          <p className="mt-4 text-lg text-slate-700">Investing doesn't <b>always</b> beat saving, especially over short periods. That's why most plans use both: an emergency fund first, then investing for long-term goals.</p>
        </Card>
      </Section>

      <Section n={2} kicker="Try it" title="Savings vs. Investing Simulator">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented label="Dollars" value={s.real ? "real" : "nominal"} onChange={(x) => set({ real: x === "real" })} options={[{ value: "nominal", label: "Future dollars" }, { value: "real", label: "Today's buying power" }]} />
            <ResetButton onClick={reset} />
          </div>
          <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
            <Slider label="Starting amount" value={s.start} min={0} max={50000} step={500} onChange={(x) => set({ start: x })} format={money} />
            <Slider label="Added each month" value={s.monthly} min={0} max={2000} step={25} onChange={(x) => set({ monthly: x })} format={money} />
            <Slider label="Savings account rate (APY)" value={s.sav} min={0} max={6} step={0.25} onChange={(x) => set({ sav: x })} format={(x) => x + "%"} help="A bank's stated rate. Can change over time." />
            <Slider label="Investment return (average)" value={s.inv} min={0} max={10} step={0.5} onChange={(x) => set({ inv: x })} format={(x) => x + "%"} help="An assumption, not a promise." />
            <Slider label="Inflation" value={s.inflation} min={0} max={8} step={0.5} onChange={(x) => set({ inflation: x })} format={(x) => x + "%"} />
            <Slider label="Years" value={s.years} min={1} max={40} onChange={(x) => set({ years: x })} format={(x) => x + " years"} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label="0% account" value={compact(v("cash"))} />
            <Stat label="High-yield savings" value={compact(v("hysa"))} tone="sky" />
            <Stat label="Diversified investing" value={compact(v("invest"))} tone="green" />
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer>
              <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#EEF2F7" vertical={false} />
                <XAxis dataKey="year" tickFormatter={(x) => `Yr ${x}`} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Year ${l}`} formatter={(x, n) => [money(Number(x)), n]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {!s.real && <Area dataKey="investLow" name="Investing (if returns are 3 pts lower)" stroke="none" fill="#10B981" fillOpacity={0.12} />}
                <Line dataKey={k.invest} name="Investing" stroke="#10B981" strokeWidth={3} dot={false} animationDuration={500} />
                <Line dataKey={k.hysa} name="High-yield savings" stroke="#38BDF8" strokeWidth={3} dot={false} animationDuration={500} />
                <Line dataKey={k.cash} name="0% account" stroke="#94A3B8" strokeWidth={3} dot={false} strokeDasharray="6 4" animationDuration={500} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2"><EstimateTag>Savings rates are set by banks and can change. Investment returns are uncertain and can be negative.</EstimateTag></div>
        </Card>
      </Section>

      <Section n={3} kicker="Ripple explains" title="Which one wins?">
        <AskRipple ctx={{ page: "lesson", module: "Savings vs Investing", inputs: s, results: { totalContributed: Math.round(last.contributed), zeroPctAccount: Math.round(last.cash), highYieldSavings: Math.round(last.hysa), investing: Math.round(last.invest), investingIfLowerReturns: Math.round(last.investLow), zeroPctTodaysDollars: Math.round(last.cashReal), hysaTodaysDollars: Math.round(last.hysaReal), investingTodaysDollars: Math.round(last.investReal) }, insights }}
          prompts={["Why not invest my emergency fund?", "Why does the 0% line fall in today's dollars?", "When is saving better than investing?"]} />
      </Section>
      <Section n={4} kicker="Real life" title="Matching money to time">
        <Examples items={[
          { emoji: "🚗", title: "Car in 2 years", text: "Short goal → savings. A market drop right before you need the money would hurt." },
          { emoji: "🛟", title: "Emergency fund", text: "Savings. The point is that it's there when you need it, not that it grows." },
          { emoji: "🧓", title: "Retirement in 30 years", text: "Long goal → investing has time to recover from bad years." },
        ]} />
      </Section>
      <Section n={5} kicker="Quick check" title="Test yourself">
        <Quiz id="saving" onComplete={finish} questions={[
          { q: "Where does an emergency fund usually belong?", options: ["Individual stocks", "A safe, easy-to-reach savings account", "Under a mattress"], answer: 1, why: "It needs to be stable and available. Growth is secondary." },
          { q: "Does investing always beat saving?", options: ["Yes, always", "No. Over short periods it can lose money"], answer: 1, why: "Markets can fall, sometimes for years. Long time horizons help." },
          { q: "Your savings earn 2% while inflation is 3%. Your buying power…", options: ["Grows", "Shrinks a little", "Stays the same"], answer: 1, why: "Your real return is roughly −1% a year." },
        ]} />
      </Section>
      <Takeaway>Save for safety, invest for time. Keep a cushion in savings, and give long-term money a chance to outgrow inflation.</Takeaway>
    </div>
  );
}
