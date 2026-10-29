import { CartesianGrid, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim } from "../lib/store";
import { savingsVsInvesting } from "../lib/calc";
import { money, compact, axisMoney } from "../lib/format";
import { WhatItMeans, Quiz, Section, Segmented, Slider, tooltipStyle } from "../components/ui";
import { Idea, Simulator, endLabel, axis } from "../components/Lesson";
import { useFinish } from "../pages/ModuleFrame";

export default function Saving() {
  const finish = useFinish("saving");
  const [s, set, reset] = useSim("saving", { start: 5000, monthly: 300, sav: 4, inv: 7, inflation: 3, years: 25, real: false });
  const rows = savingsVsInvesting({ start: s.start, monthly: s.monthly, savingsRate: s.sav / 100, investRate: s.inv / 100, inflation: s.inflation / 100, years: s.years })
    .map((r) => ({ ...r, c: Math.round(s.real ? r.cashReal : r.cash), h: Math.round(s.real ? r.hysaReal : r.hysa), i: Math.round(s.real ? r.investReal : r.invest) }));
  const last = rows[rows.length - 1];
  const n = rows.length;
  const insights = [
    `After ${s.years} years of putting in ${money(last.contributed)} total: a 0% account holds ${compact(last.cash)}, savings at ${s.sav}% about ${compact(last.hysa)}, investing about ${compact(last.invest)} (not guaranteed).`,
    `In today's buying power, the 0% account is worth only ${compact(last.cashReal)}.`,
    `If investing averaged 3 points less, it could be closer to ${compact(last.investLow)}.`,
  ];
  return (
    <div>
      <Idea title="Saving keeps money safe. Investing helps it grow.">
        <p><b>Saving</b> is safe, steady and easy to reach: right for emergencies and goals in the next few years. <b>Investing</b> owns pieces of companies and bonds that can grow over many years, but values go up and down.</p>
        <p>Investing doesn't always beat saving over short periods. Most plans use both: an emergency fund first, then investing for long-term goals.</p>
      </Idea>

      <Simulator title="Savings vs. Investing Simulator" onReset={reset} note="Savings rates are set by banks and can change. Investment returns are uncertain and can be negative."
        controls={<>
          <Segmented label="Dollars" value={s.real ? "real" : "nominal"} onChange={(x) => set({ real: x === "real" })} options={[{ value: "nominal", label: "Future dollars" }, { value: "real", label: "Today's buying power" }]} />
          <div className="mt-3">
            <Slider grow label="Starting amount" value={s.start} min={0} max={50000} step={500} onChange={(x) => set({ start: x })} format={money} />
            <Slider grow label="Added each month" value={s.monthly} min={0} max={2000} step={25} onChange={(x) => set({ monthly: x })} format={money} />
            <Slider label="Savings account rate" value={s.sav} min={0} max={6} step={0.25} onChange={(x) => set({ sav: x })} format={(x) => x + "%"} />
            <Slider label="Investment return (average)" value={s.inv} min={0} max={10} step={0.5} onChange={(x) => set({ inv: x })} format={(x) => x + "%"} />
            <Slider label="Inflation" value={s.inflation} min={0} max={8} step={0.5} onChange={(x) => set({ inflation: x })} format={(x) => x + "%"} />
            <Slider label="Years" value={s.years} min={1} max={40} onChange={(x) => set({ years: x })} format={(x) => x + " years"} />
          </div>
        </>}
        chart={
          <ResponsiveContainer>
            <LineChart data={rows} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="year" tickFormatter={(x) => `Yr ${x}`} {...axis} />
              <YAxis tickFormatter={axisMoney} {...axis} width={56} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Year ${l}`} formatter={(x, nm) => [money(Number(x)), nm]} />
              <Line dataKey="i" name="Investing" stroke="#F5C000" strokeWidth={3} dot={false} animationDuration={500} label={endLabel(n, (v) => `Investing ${compact(v)}`, "#7A5C00")} />
              <Line dataKey="h" name={`Savings ${s.sav}%`} stroke="#38BDF8" strokeWidth={3} dot={false} animationDuration={500} label={endLabel(n, (v) => `Savings ${s.sav}% ${compact(v)}`, "#0369A1", { dy: last.i - last.h < last.i * 0.12 ? 18 : -10 })} />
              <Line dataKey="c" name="0% account" stroke="#94A3B8" strokeWidth={3} dot={false} strokeDasharray="6 4" animationDuration={500} label={endLabel(n, (v) => `0% account ${compact(v)}`, "#475569", { dy: 18 })} />
            </LineChart>
          </ResponsiveContainer>
        } />

      <Section n={3} kicker="What it means" title="Which one wins?">
        <WhatItMeans ctx={{ page: "lesson", module: "Savings vs Investing", inputs: s, results: { totalContributed: Math.round(last.contributed), zeroPctAccount: Math.round(last.cash), savingsAccount: Math.round(last.hysa), investing: Math.round(last.invest), investingIfLowerReturns: Math.round(last.investLow), zeroPctTodaysDollars: Math.round(last.cashReal) }, insights }}
          prompts={["Why not invest my emergency fund?", "Why does the 0% line fall in today's dollars?", "When is saving better than investing?"]} />
      </Section>
      <Section n={4} kicker="Quick check" title="Test yourself">
        <Quiz id="saving" onComplete={finish} questions={[
          { q: "Where does an emergency fund usually belong?", options: ["Individual stocks", "A safe, easy-to-reach savings account", "Under a mattress"], answer: 1, why: "It needs to be stable and available. Growth is secondary." },
          { q: "Does investing always beat saving?", options: ["Yes, always", "No. Over short periods it can lose money"], answer: 1, why: "Markets can fall, sometimes for years. Long time horizons help." },
          { q: "Your savings earn 2% while inflation is 3%. Your buying power…", options: ["Grows", "Shrinks a little", "Stays the same"], answer: 1, why: "Your real return is roughly −1% a year." },
        ]} />
      </Section>
    </div>
  );
}
