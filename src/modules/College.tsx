import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim } from "../lib/store";
import { simulate529 } from "../lib/calc";
import { money, compact, axisMoney } from "../lib/format";
import { AskRipple, Card, EstimateTag, Examples, Quiz, ResetButton, Section, Slider, Stat, Takeaway, tooltipStyle } from "../components/ui";
import { useFinish } from "../pages/ModuleFrame";

export default function College() {
  const finish = useFinish("college");
  const [s, set, reset] = useSim("college", { childAge: 2, collegeAge: 18, cost: 25000, tInfl: 4, monthly: 250, ret: 6, balance: 0 });
  const r = simulate529({ childAge: s.childAge, collegeAge: s.collegeAge, costNow: s.cost, tuitionInflation: s.tInfl / 100, monthly: s.monthly, returnRate: s.ret / 100, balance: s.balance });
  const insights = [
    `Four years of college that costs ${compact(r.todayCost)} today could cost about ${compact(r.totalCost)} by the time your child starts in ${r.years} years.`,
    `Saving ${money(s.monthly)}/month could grow to about ${compact(r.saved)}, covering ${Math.round(r.coverage * 100)}% of that.`,
    r.years > 5 ? `To cover it fully, you'd need about ${money(r.neededNow)}/month starting now, or ${money(r.neededIfWait5)}/month if you wait 5 years.` : `With ${r.years} years left, you'd need about ${money(r.neededNow)}/month to cover it fully.`,
  ];
  return (
    <div>
      <Section n={1} kicker="The idea" title="A head start on college">
        <Card>
          <p className="text-lg leading-relaxed text-slate-700">A <b>529 plan</b> is an investment account for education. Growth isn't taxed federally, and withdrawals for <b>qualified education expenses</b> (tuition, fees, books, room & board for enrolled students, up to $10,000/yr of K–12 tuition) are tax-free.</p>
          <p className="mt-3 text-[15px] text-slate-600">Many states offer a state tax deduction for contributions. Non-qualified withdrawals owe income tax plus a 10% penalty on the earnings. Unused money can be moved to another family member, and under newer rules some can roll into the beneficiary's Roth IRA (lifetime cap and conditions apply).</p>
        </Card>
      </Section>
      <Section n={2} practice kicker="Real-world simulation · ready for you" title="College Savings Simulator">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              {[{ n: "Emma", a: 17 }, { n: "Jake", a: 15 }].map((k) => (
                <button key={k.n} onClick={() => set({ childAge: k.a, collegeAge: 18 })} aria-pressed={s.childAge === k.a}
                  className={"rounded-full px-4 py-2 text-sm font-semibold ring-1 " + (s.childAge === k.a ? "bg-navy text-white ring-navy" : "bg-white ring-slate-200 hover:ring-emerald-400")}>🎓 {k.n}, {k.a}</button>
              ))}
              <button onClick={() => set({ childAge: 2, collegeAge: 18 })} aria-pressed={s.childAge === 2}
                className={"rounded-full px-4 py-2 text-sm font-semibold ring-1 " + (s.childAge === 2 ? "bg-navy text-white ring-navy" : "bg-white ring-slate-200 hover:ring-emerald-400")}>⏪ If Dave had started when Jake was 2</button>
            </div>
            <ResetButton onClick={reset} />
          </div>
          <div className="grid gap-x-8 sm:grid-cols-2">
            <Slider label="Child's age now" value={s.childAge} min={0} max={17} onChange={(v) => set({ childAge: v, collegeAge: Math.max(s.collegeAge, v + 1) })} format={(v) => v === 0 ? "Newborn" : `${v} years`} />
            <Slider label="Starts college at" value={s.collegeAge} min={Math.max(16, s.childAge + 1)} max={22} onChange={(v) => set({ collegeAge: v })} format={(v) => `Age ${v}`} />
            <Slider label="Cost per year today" value={s.cost} min={5000} max={90000} step={1000} onChange={(v) => set({ cost: v })} format={money} help="Roughly $25k in-state public · $60k+ private, all-in" />
            <Slider label="College cost growth per year" value={s.tInfl} min={0} max={8} step={0.5} onChange={(v) => set({ tInfl: v })} format={(v) => v + "%"} />
            <Slider label="Monthly savings" value={s.monthly} min={0} max={2000} step={25} onChange={(v) => set({ monthly: v })} format={money} />
            <Slider label="Investment return" value={s.ret} min={0} max={10} step={0.5} onChange={(v) => set({ ret: v })} format={(v) => v + "%"} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="4 years will cost" value={compact(r.totalCost)} tone="coral" sub={`${compact(r.todayCost)} in today's prices`} />
            <Stat label="You could have" value={compact(r.saved)} tone="green" />
            <Stat label="Covered" value={`${Math.min(999, Math.round(r.coverage * 100))}%`} tone="navy" />
            <Stat label="Full coverage needs" value={`${money(r.neededNow)}/mo`} sub={r.years > 5 ? `${money(r.neededIfWait5)}/mo if you wait 5 yrs` : undefined} />
          </div>
          <div className="mt-3 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, r.coverage * 100)}%` }} /></div>
          <div className="mt-5 h-64">
            <ResponsiveContainer>
              <AreaChart data={r.rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#EEF2F7" vertical={false} />
                <XAxis dataKey="age" tickFormatter={(v) => `Age ${v}`} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} domain={[0, (max: number) => Math.max(max, r.totalCost * 1.05)]} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Child age ${l}`} formatter={(v, n) => [money(Number(v)), n]} />
                <ReferenceLine y={r.totalCost} stroke="#F97361" strokeDasharray="5 5" label={{ value: "Projected 4-year cost", position: "insideTopLeft", fill: "#C2410C", fontSize: 12 }} />
                <Area dataKey="contributed" name="You put in" stroke="#0F172A" fill="#0F172A" fillOpacity={0.12} animationDuration={500} />
                <Area dataKey="saved" name="Account value" stroke="#10B981" strokeWidth={3} fill="#10B981" fillOpacity={0.2} animationDuration={500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2"><EstimateTag>Investment returns are not guaranteed. Financial aid and scholarships aren't included.</EstimateTag></div>
        </Card>
      </Section>
      <Section n={3} kicker="Next Step explains" title="Why starting early helps">
        <AskRipple ctx={{ page: "lesson", module: "College Savings Simulator", inputs: s, results: { yearsUntilCollege: r.years, fourYearCostTodayPrices: Math.round(r.todayCost), projectedFourYearCost: Math.round(r.totalCost), projectedSaved: Math.round(r.saved), coveragePct: Math.round(r.coverage * 100), monthlyNeededStartingNow: Math.round(r.neededNow), monthlyNeededIfWait5Years: Math.round(r.neededIfWait5) }, insights }}
          prompts={["What can Dave do with only 1–3 years left?", "How do FAFSA and the PA State Grant help?", "Should Dave save for college or retirement first?"]} />
      </Section>
      <Section n={4} kicker="Quick check" title="Test yourself">
        <Quiz id="college" onComplete={finish} questions={[
          { q: "529 withdrawals are tax-free when used for…", options: ["Anything", "Qualified education expenses", "Only K–12"], answer: 1, why: "Qualified expenses like tuition, fees, books, and room & board for enrolled students." },
          { q: "Why does starting at birth need less per month than starting at age 8?", options: ["Lower fees", "More years of compound growth", "Colleges give discounts"], answer: 1, why: "More time means growth does more of the work." },
          { q: "What happens to earnings on a non-qualified withdrawal?", options: ["Nothing", "Income tax + 10% penalty", "They're frozen"], answer: 1, why: "Earnings are generally taxed and penalized (some exceptions apply)." },
        ]} />
      </Section>
      <Takeaway>Time is the best college fund. Even small amounts started early can cover a meaningful share.</Takeaway>
    </div>
  );
}
