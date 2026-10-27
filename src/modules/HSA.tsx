import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim } from "../lib/store";
import { simulateHSA } from "../lib/calc";
import { RULES } from "../lib/rules";
import { money, compact, axisMoney } from "../lib/format";
import { WhatItMeans, Quiz, Section, Slider, tooltipStyle } from "../components/ui";
import { Idea, Simulator, axis } from "../components/Lesson";
import { useFinish } from "../pages/ModuleFrame";

export default function HSA() {
  const finish = useFinish("hsa");
  const [s, set, reset] = useSim("hsa", { annual: 3000, tax: 12, years: 20, ret: 5, medical: 1000, payroll: true });
  const r = simulateHSA({ annual: s.annual, taxRate: s.tax / 100, payroll: s.payroll, years: s.years, returnRate: s.ret / 100, medical: s.medical, savingsRate: 0.03 });
  const step = s.years <= 10 ? 2 : 5;
  const bars = r.rows.filter((x) => x.year > 0 && (x.year % step === 0 || x.year === s.years)).map((x) => ({ label: `Yr ${x.year}`, hsa: Math.round(x.hsa), savings: Math.round(x.savings) }));
  const insights = [
    `Putting ${money(s.annual)} a year into an HSA could save about ${money(r.taxSavedPerYear)} in taxes each year.`,
    `After ${s.years} years, spending ${money(s.medical)}/year on care, the HSA could hold about ${compact(r.hsaFinal)} vs. ${compact(r.savingsFinal)} doing the same from regular savings.`,
  ];
  return (
    <div>
      <Idea title="The account with three tax breaks">
        <div className="grid gap-3 sm:grid-cols-3">
          {[["1", "Going in", "Contributions lower your taxable income."], ["2", "Growing", "Growth inside the HSA isn't taxed."], ["3", "Coming out", "Withdrawals for medical costs are tax-free."]].map(([n, t, d]) => (
            <div key={n} className="rounded-2xl bg-emerald-50 p-4"><div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-base font-bold text-white">{n}</div><div className="mt-2 text-base font-semibold">{t}</div><p className="text-[15px] text-slate-700">{d}</p></div>
          ))}
        </div>
        <p className="text-[15px] text-slate-600">You need a qualifying high-deductible health plan. {RULES.year} limits: {money(RULES.hsa.selfOnly)} self-only, {money(RULES.hsa.family)} family.</p>
      </Idea>

      <Simulator title="HSA Simulator" onReset={reset} note="Federal taxes only. Assumes withdrawals are for qualified medical expenses."
        controls={<>
          <Slider label="Yearly contribution" value={s.annual} min={500} max={9750} step={250} onChange={(v) => set({ annual: v })} format={money} />
          <Slider label="Medical costs paid each year" value={s.medical} min={0} max={6000} step={100} onChange={(v) => set({ medical: v })} format={money} />
          <Slider label="Federal tax rate" value={s.tax} min={10} max={37} onChange={(v) => set({ tax: v })} format={(v) => v + "%"} />
          <Slider label="Years" value={s.years} min={2} max={40} onChange={(v) => set({ years: v })} format={(v) => v + " years"} />
          <Slider label="Investment return" value={s.ret} min={0} max={10} step={0.5} onChange={(v) => set({ ret: v })} format={(v) => v + "%"} />
          <label className="mt-2 flex items-center gap-3 text-[15px] font-medium text-slate-700"><input type="checkbox" className="h-5 w-5 accent-emerald-500" checked={s.payroll} onChange={(e) => set({ payroll: e.target.checked })} /> Through payroll (also skips 7.65% payroll tax)</label>
        </>}
        chart={<div className="flex h-full flex-col">
          <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-[15px] font-semibold text-emerald-800">Tax saved: <span className="num">{money(r.taxSavedPerYear)}</span> a year · <span className="num">{compact(r.totalTaxSaved)}</span> over {s.years} years</div>
          <div className="mt-2 min-h-0 flex-1">
            <ResponsiveContainer>
              <BarChart data={bars} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#EEF2F7" vertical={false} />
                <XAxis dataKey="label" {...axis} />
                <YAxis tickFormatter={axisMoney} {...axis} width={56} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [money(Number(v)), n === "hsa" ? "HSA" : "Regular savings"]} />
                <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => (v === "hsa" ? "HSA (invested)" : "Same money in regular savings")} />
                <Bar dataKey="hsa" fill="#10B981" radius={[6, 6, 0, 0]} animationDuration={500}><LabelList dataKey="hsa" position="top" formatter={(v: unknown) => compact(Number(v))} style={{ fontSize: 11, fontWeight: 700, fill: "#047857" }} /></Bar>
                <Bar dataKey="savings" fill="#CBD5E1" radius={[6, 6, 0, 0]} animationDuration={500}><LabelList dataKey="savings" position="top" formatter={(v: unknown) => compact(Number(v))} style={{ fontSize: 11, fontWeight: 700, fill: "#475569" }} /></Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>} />

      <Section n={3} kicker="What it means" title="Where does the advantage come from?">
        <WhatItMeans ctx={{ page: "lesson", module: "HSA Simulator", inputs: s, results: { taxSavedPerYear: Math.round(r.taxSavedPerYear), totalTaxSaved: Math.round(r.totalTaxSaved), hsaBalance: Math.round(r.hsaFinal), regularSavingsBalance: Math.round(r.savingsFinal) }, insights }}
          prompts={["Explain the triple tax advantage simply", "Who is eligible for an HSA?", "What counts as a qualified expense?"]} />
      </Section>
      <Section n={4} kicker="Quick check" title="Test yourself">
        <Quiz id="hsa" onComplete={finish} questions={[
          { q: "What do you need to contribute to an HSA?", options: ["Any health plan", "A qualifying high-deductible health plan", "A 401(k)"], answer: 1, why: "HSA eligibility requires coverage under a qualifying HDHP." },
          { q: "Which is NOT one of the HSA tax advantages?", options: ["Tax-deductible contributions", "Tax-free growth", "Tax-free withdrawals for vacations"], answer: 2, why: "Only qualified medical expenses come out tax-free." },
          { q: `The ${RULES.year} self-only HSA limit is…`, options: [money(RULES.hsa.selfOnly), money(RULES.k401.employeeLimit), "$500"], answer: 0, why: `${money(RULES.hsa.selfOnly)} for self-only coverage in ${RULES.year}.` },
        ]} />
      </Section>
    </div>
  );
}
