import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim, useStore } from "../lib/store";
import { lifeExpenses, EXPENSE_CATS } from "../lib/calc";
import { money, axisMoney } from "../lib/format";
import { WhatItMeans, Quiz, Section, Segmented, Slider, tooltipStyle } from "../components/ui";
import { Idea, Simulator, axis } from "../components/Lesson";
import { useFinish } from "../pages/ModuleFrame";

export default function LifeStages() {
  const { profile } = useStore();
  const finish = useFinish("life");
  const [s, set, reset] = useSim("life", { age: profile.age, family: Math.min(6, 2 + (profile.kids || []).length), housing: 1600, retireAge: 67, inflation: 3, paidOff: true, real: false });
  const rows = lifeExpenses({ age: s.age, familySize: s.family, housing: s.housing, retireAge: s.retireAge, inflation: s.inflation / 100, mortgagePaidOff: s.paidOff, showReal: s.real });
  const peak = rows.reduce((a, b) => (Number(b.total) > Number(a.total) ? b : a), rows[0]);
  const insights = [
    `${s.real ? "In today's dollars" : "Including inflation"}, the most expensive stage looks like age ${peak.age} at about ${money(Number(peak.total))}/month.`,
    s.real ? "With inflation removed, you can see lifestyle changes alone. Kids and healthcare drive most of the shift." : "Switch to 'Today's dollars' to separate lifestyle changes from inflation.",
  ];
  const lastKey = EXPENSE_CATS[EXPENSE_CATS.length - 1].key;

  return (
    <div>
      <Idea title="Your expenses have seasons">
        <p>Life changes what you spend on. Kids bring childcare, middle age brings college bills, later life brings bigger healthcare costs. Meanwhile, <b>inflation</b> raises the price of everything.</p>
        <p>Retirement doesn't make every cost go up. Commuting and work costs often drop, and a paid-off mortgage can shrink housing costs a lot.</p>
      </Idea>

      <Simulator title="Life Expense Simulator" onReset={reset} note="Illustrative averages. Every household is different."
        controls={<>
          <Segmented label="Dollars" value={s.real ? "real" : "nominal"} onChange={(v) => set({ real: v === "real" })} options={[{ value: "nominal", label: "Future dollars" }, { value: "real", label: "Today's dollars" }]} />
          <div className="mt-3">
            <Slider label="Household size" value={s.family} min={1} max={6} onChange={(v) => set({ family: v })} format={(v) => `${v} ${v === 1 ? "person" : "people"}`} />
            <Slider label="Housing cost today" value={s.housing} min={500} max={5000} step={50} onChange={(v) => set({ housing: v })} format={(v) => money(v) + "/mo"} />
            <Slider label="Retirement age" value={s.retireAge} min={55} max={75} onChange={(v) => set({ retireAge: v })} format={(v) => "Age " + v} />
            <Slider label="Inflation" value={s.inflation} min={0} max={8} step={0.5} onChange={(v) => set({ inflation: v })} format={(v) => v + "%"} />
          </div>
          <label className="mt-2 flex items-center gap-3 text-[15px] font-medium text-slate-700">
            <input type="checkbox" className="h-5 w-5 accent-emerald-500" checked={s.paidOff} onChange={(e) => set({ paidOff: e.target.checked })} /> Mortgage paid off by retirement
          </label>
        </>}
        chart={
          <ResponsiveContainer>
            <BarChart data={rows} margin={{ top: 26, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="stage" tickFormatter={(v) => `Age ${v}`} {...axis} />
              <YAxis tickFormatter={axisMoney} {...axis} width={56} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Age ${l}`} formatter={(v, n) => [money(Number(v)) + "/mo", n]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {EXPENSE_CATS.map((c, i) => (
                <Bar key={c.key} dataKey={c.key} name={c.label} stackId="a" fill={c.color} radius={i === EXPENSE_CATS.length - 1 ? [8, 8, 0, 0] : 0} animationDuration={500}>
                  {c.key === lastKey && <LabelList dataKey="total" position="top" formatter={(v: unknown) => money(Number(v))} style={{ fontSize: 12, fontWeight: 700, fill: "#0B2A5B" }} />}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        } />

      <Section n={3} kicker="What it means" title="Lifestyle vs. inflation">
        <WhatItMeans ctx={{ page: "lesson", module: "Life Expense Simulator", inputs: s, results: { stages: rows.map((r) => ({ age: r.age, totalMonthly: r.total, retired: !!r.retired })) }, insights }}
          prompts={["Which costs grow the most, and why?", "Why might retirement cost less in some ways?", "How do I plan for healthcare costs?"]} />
      </Section>
      <Section n={4} kicker="Quick check" title="Test yourself">
        <Quiz id="life" onComplete={finish} questions={[
          { q: "Why show expenses in 'today's dollars'?", options: ["To hide inflation", "To see lifestyle changes without inflation's effect", "Because it's always lower"], answer: 1, why: "Removing inflation shows how your actual lifestyle costs change." },
          { q: "Which cost often DROPS in retirement?", options: ["Healthcare", "Commuting and work costs", "Everything"], answer: 1, why: "No daily commute or work wardrobe. Healthcare often rises." },
          { q: "Do all retirees spend more than they did while working?", options: ["Yes, always", "No, it varies a lot by household"], answer: 1, why: "Spending patterns vary widely." },
        ]} />
      </Section>
    </div>
  );
}
