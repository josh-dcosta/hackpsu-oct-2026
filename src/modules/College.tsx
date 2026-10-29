import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim, useStore } from "../lib/store";
import { simulate529 } from "../lib/calc";
import { money, compact, axisMoney } from "../lib/format";
import { WhatItMeans, Quiz, Section, Slider, tooltipStyle, cx } from "../components/ui";
import { Idea, Simulator, endLabel, axis } from "../components/Lesson";
import { useFinish } from "../pages/ModuleFrame";

export default function College() {
  const finish = useFinish("college");
  const { profile } = useStore();
  const kids = (profile.kids || []).filter((k) => k.age < 18);
  const [s, set, reset] = useSim("college", { childAge: kids[0]?.age ?? 2, collegeAge: 18, cost: 25000, tInfl: 4, monthly: 250, ret: 6, balance: 0 });
  const r = simulate529({ childAge: s.childAge, collegeAge: s.collegeAge, costNow: s.cost, tuitionInflation: s.tInfl / 100, monthly: s.monthly, returnRate: s.ret / 100, balance: s.balance });
  const rows = r.rows.map((x) => ({ age: x.age, saved: Math.round(x.saved), contributed: Math.round(x.contributed) }));
  const insights = [
    `Four years of college that costs ${compact(r.todayCost)} today could cost about ${compact(r.totalCost)} in ${r.years} years.`,
    `Saving ${money(s.monthly)}/month could grow to about ${compact(r.saved)}, covering ${Math.round(r.coverage * 100)}% of that.`,
    `To cover it fully: about ${money(r.neededNow)}/month starting now.`,
  ];
  return (
    <div>
      <Idea title="A head start on college">
        <p>A <b>529 plan</b> is an investment account for education. Growth isn't taxed federally, and withdrawals for tuition, fees, books and room & board are tax-free. Pennsylvania also gives a state tax deduction for contributions.</p>
        <p>Money needed within 1–3 years is safer in savings or a CD than in stocks. And file the <b>FAFSA</b> every year: it unlocks grants.</p>
      </Idea>

      <Simulator title="College Savings Simulator" onReset={reset} note="Investment returns are not guaranteed. Financial aid and scholarships aren't included."
        controls={<>
          {kids.length > 0 && <div className="flex flex-wrap gap-2">
            {kids.map((k) => (
              <button key={k.name} onClick={() => set({ childAge: k.age, collegeAge: 18 })} aria-pressed={s.childAge === k.age}
                className={cx("rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1", s.childAge === k.age ? "bg-navy text-white ring-navy" : "bg-white ring-slate-200 hover:ring-emerald-400")}>🎓 {k.name}, {k.age}</button>
            ))}
          </div>}
          <div className="mt-2">
            <Slider label="Child's age now" value={s.childAge} min={0} max={17} onChange={(v) => set({ childAge: v, collegeAge: Math.max(s.collegeAge, v + 1) })} format={(v) => (v === 0 ? "Newborn" : `${v} years`)} />
            <Slider label="Cost per year today" value={s.cost} min={5000} max={90000} step={1000} onChange={(v) => set({ cost: v })} format={money} />
            <Slider label="Saving each month" value={s.monthly} min={0} max={2000} step={25} onChange={(v) => set({ monthly: v })} format={money} />
            <Slider label="College cost growth per year" value={s.tInfl} min={0} max={8} step={0.5} onChange={(v) => set({ tInfl: v })} format={(v) => v + "%"} />
            <Slider label="Investment return" value={s.ret} min={0} max={10} step={0.5} onChange={(v) => set({ ret: v })} format={(v) => v + "%"} />
          </div>
        </>}
        chart={
          <ResponsiveContainer>
            <AreaChart data={rows} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="age" tickFormatter={(v) => `Age ${v}`} {...axis} />
              <YAxis tickFormatter={axisMoney} {...axis} width={56} domain={[0, (max: number) => Math.max(max, r.totalCost * 1.08)]} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Child age ${l}`} formatter={(v, n) => [money(Number(v)), n]} />
              <ReferenceLine y={r.totalCost} stroke="#F97361" strokeDasharray="5 5" label={{ value: `4 years will cost ${compact(r.totalCost)}`, position: "insideTopLeft", fill: "#C2410C", fontSize: 13, fontWeight: 700 }} />
              <Area dataKey="contributed" name="You put in" stroke="#0B2A45" fill="#0B2A45" fillOpacity={0.12} animationDuration={500} />
              <Area dataKey="saved" name="Account value" stroke="#F5C000" strokeWidth={3} fill="#F5C000" fillOpacity={0.2} animationDuration={500}
                label={endLabel(rows.length, (v) => `Saved ${compact(v)} · covers ${Math.min(999, Math.round(r.coverage * 100))}%`, "#7A5C00")} />
            </AreaChart>
          </ResponsiveContainer>
        } />

      <Section n={3} kicker="What it means" title="Why starting early helps">
        <WhatItMeans ctx={{ page: "lesson", module: "College Savings Simulator", inputs: s, results: { yearsUntilCollege: r.years, projectedFourYearCost: Math.round(r.totalCost), projectedSaved: Math.round(r.saved), coveragePct: Math.round(r.coverage * 100), monthlyNeededStartingNow: Math.round(r.neededNow) }, insights }}
          prompts={["What can I do with only 1–3 years left?", "How do FAFSA and the PA State Grant help?", "Should I save for college or retirement first?"]} />
      </Section>
      <Section n={4} kicker="Quick check" title="Test yourself">
        <Quiz id="college" onComplete={finish} questions={[
          { q: "529 withdrawals are tax-free when used for…", options: ["Anything", "Qualified education expenses", "Only K–12"], answer: 1, why: "Qualified expenses like tuition, fees, books, and room & board." },
          { q: "Why does starting at birth need less per month than starting at age 8?", options: ["Lower fees", "More years of compound growth", "Colleges give discounts"], answer: 1, why: "More time means growth does more of the work." },
          { q: "What happens to earnings on a non-qualified withdrawal?", options: ["Nothing", "Income tax + 10% penalty", "They're frozen"], answer: 1, why: "Earnings are generally taxed and penalized (some exceptions apply)." },
        ]} />
      </Section>
    </div>
  );
}
