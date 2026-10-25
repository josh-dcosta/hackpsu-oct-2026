import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim, useStore } from "../lib/store";
import { lifeExpenses, EXPENSE_CATS } from "../lib/calc";
import { money, axisMoney } from "../lib/format";
import { AskRipple, Card, EstimateTag, Examples, Quiz, ResetButton, Section, Segmented, Slider, Stat, Takeaway, tooltipStyle, cx } from "../components/ui";
import { useFinish } from "../pages/ModuleFrame";

export default function LifeStages() {
  const { profile } = useStore();
  const finish = useFinish("life");
  const [s, set, reset] = useSim("life", { age: profile.age, family: 3, housing: 1600, retireAge: 67, inflation: 3, paidOff: true, real: false, stage: 1 });
  const rows = lifeExpenses({ age: s.age, familySize: s.family, housing: s.housing, retireAge: s.retireAge, inflation: s.inflation / 100, mortgagePaidOff: s.paidOff, showReal: s.real });
  const idx = Math.min(s.stage, rows.length - 1);
  const cur = rows[idx];
  const first = rows[0];
  const peak = rows.reduce((a, b) => (Number(b.total) > Number(a.total) ? b : a), rows[0]);
  const insights = [
    `At age ${cur.age}, monthly costs could be about ${money(Number(cur.total))}${s.real ? " in today's dollars" : " in future dollars"}.`,
    `${s.real ? "In today's dollars" : "Including inflation"}, the most expensive stage looks like age ${peak.age} at about ${money(Number(peak.total))}/month.`,
    s.real ? "With inflation removed, you can see lifestyle changes alone. Kids and healthcare drive most of the shift." : "Switch to 'Today's dollars' to separate lifestyle changes from inflation.",
  ];

  return (
    <div>
      <Section n={1} kicker="The idea" title="Your expenses have seasons">
        <Card>
          <p className="text-lg leading-relaxed text-slate-700">Life changes what you spend on. Kids bring childcare, middle age brings college bills, later life brings bigger healthcare costs. Meanwhile, <b>inflation</b> raises the price of everything.</p>
          <p className="mt-3 text-lg leading-relaxed text-slate-700">Every household is different. Retirement doesn't make every cost go up. Commuting and work costs often drop, and a paid-off mortgage can shrink housing costs a lot.</p>
        </Card>
      </Section>

      <Section n={2} kicker="Try it" title="Life Expense Simulator">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented label="Dollars" value={s.real ? "real" : "nominal"} onChange={(v) => set({ real: v === "real" })} options={[{ value: "nominal", label: "Future dollars" }, { value: "real", label: "Today's dollars" }]} />
            <ResetButton onClick={reset} />
          </div>
          <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
            <Slider label="Household size" value={s.family} min={1} max={6} onChange={(v) => set({ family: v })} format={(v) => `${v} ${v === 1 ? "person" : "people"}`} help="Up to 2 adults; the rest are kids." />
            <Slider label="Housing cost today" value={s.housing} min={500} max={5000} step={50} onChange={(v) => set({ housing: v })} format={(v) => money(v) + "/mo"} />
            <Slider label="Retirement age" value={s.retireAge} min={55} max={75} onChange={(v) => set({ retireAge: v })} format={(v) => "Age " + v} />
            <Slider label="Inflation" value={s.inflation} min={0} max={8} step={0.5} onChange={(v) => set({ inflation: v })} format={(v) => v + "%"} />
          </div>
          <label className="mt-2 flex items-center gap-3 text-[15px] font-medium text-slate-700">
            <input type="checkbox" className="h-5 w-5 accent-emerald-500" checked={s.paidOff} onChange={(e) => set({ paidOff: e.target.checked })} /> Mortgage paid off by retirement
          </label>

          <div className="mt-5 h-72">
            <ResponsiveContainer>
              <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} onClick={(e) => { const i = (e as { activeTooltipIndex?: number })?.activeTooltipIndex; if (typeof i === "number") set({ stage: i }); }}>
                <CartesianGrid stroke="#EEF2F7" vertical={false} />
                <XAxis dataKey="stage" tickFormatter={(v) => `Age ${v}`} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Age ${l}`} formatter={(v, n) => [money(Number(v)) + "/mo", n]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {EXPENSE_CATS.map((c, i) => <Bar key={c.key} dataKey={c.key} name={c.label} stackId="a" fill={c.color} radius={i === EXPENSE_CATS.length - 1 ? [8, 8, 0, 0] : 0} animationDuration={500} />)}
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Stage stepper */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {rows.map((r, i) => (
              <button key={String(r.stage)} onClick={() => set({ stage: i })} aria-pressed={i === idx}
                className={cx("shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold ring-1", i === idx ? "bg-navy text-white ring-navy" : "bg-white ring-slate-200")}>Age {r.age}{r.retired ? " 🏖️" : ""}</button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label={`Monthly at ${cur.age}`} value={money(Number(cur.total))} tone="navy" />
            <Stat label={`vs. age ${first.age}`} value={`${Number(cur.total) >= Number(first.total) ? "+" : ""}${Math.round((Number(cur.total) / Number(first.total) - 1) * 100)}%`} tone="sky" />
            <Stat label="Housing" value={money(Number(cur.housing))} />
            <Stat label="Healthcare" value={money(Number(cur.health))} tone="coral" />
          </div>
          <div className="mt-3"><EstimateTag>Illustrative averages. Your household will differ.</EstimateTag></div>
        </Card>
      </Section>

      <Section n={3} kicker="Next Step explains" title="Lifestyle vs. inflation">
        <AskRipple ctx={{ page: "lesson", module: "Life Expense Simulator", inputs: s, results: { stages: rows.map((r) => ({ age: r.age, totalMonthly: r.total, retired: !!r.retired })) }, insights }}
          prompts={["Which costs grow the most, and why?", "Why might retirement cost less in some ways?", "How do I plan for healthcare costs?"]} />
      </Section>

      <Section n={4} kicker="Real life" title="Common turning points">
        <Examples items={[
          { emoji: "👶", title: "Childcare", text: "Full-time childcare for one child can cost as much as rent in many U.S. cities." },
          { emoji: "🏠", title: "Paying off a home", text: "Once a mortgage is gone, housing often drops to taxes, insurance and repairs." },
          { emoji: "🩺", title: "Healthcare", text: "Medicare starts at 65, but premiums, copays and dental still add up." },
        ]} />
      </Section>
      <Section n={5} kicker="Quick check" title="Test yourself">
        <Quiz id="life" onComplete={finish} questions={[
          { q: "Why show expenses in 'today's dollars'?", options: ["To hide inflation", "To see lifestyle changes without inflation's effect", "Because it's always lower"], answer: 1, why: "Removing inflation shows how your actual lifestyle costs change." },
          { q: "Which cost often DROPS in retirement?", options: ["Healthcare", "Commuting and work costs", "Everything"], answer: 1, why: "No daily commute or work wardrobe. Healthcare often rises." },
          { q: "Do all retirees spend more than they did while working?", options: ["Yes, always", "No, it varies a lot by household"], answer: 1, why: "Spending patterns vary widely. Some spend more early in retirement (travel), many spend less." },
        ]} />
      </Section>
      <Takeaway>Plan for the stage you're heading into, not just the one you're in. Lifestyle and inflation stack on top of each other.</Takeaway>
    </div>
  );
}
