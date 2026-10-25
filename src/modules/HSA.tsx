import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim } from "../lib/store";
import { simulateHSA } from "../lib/calc";
import { RULES } from "../lib/rules";
import { money, compact, axisMoney } from "../lib/format";
import { AskRipple, Card, EstimateTag, Examples, Quiz, ResetButton, Section, Slider, Stat, Takeaway, tooltipStyle } from "../components/ui";
import { useFinish } from "../pages/ModuleFrame";

export default function HSA() {
  const finish = useFinish("hsa");
  const [s, set, reset] = useSim("hsa", { annual: 3000, tax: 22, years: 25, ret: 6, medical: 1000, payroll: true });
  const r = simulateHSA({ annual: s.annual, taxRate: s.tax / 100, payroll: s.payroll, years: s.years, returnRate: s.ret / 100, medical: s.medical, savingsRate: 0.03 });
  const over = s.annual > RULES.hsa.family;
  const insights = [
    `Putting ${money(s.annual)} a year into an HSA could save about ${money(r.taxSavedPerYear)} in taxes each year (${s.tax}% income tax${s.payroll ? " + 7.65% payroll tax" : ""}).`,
    `After ${s.years} years, spending ${money(s.medical)}/year on care, the HSA could hold about ${compact(r.hsaFinal)} vs. ${compact(r.savingsFinal)} doing the same from regular savings.`,
    "The gap comes from three places: a tax break going in, tax-free growth, and tax-free qualified medical withdrawals.",
  ];
  return (
    <div>
      <Section n={1} kicker="The idea" title="The account with three tax breaks">
        <Card>
          <div className="grid gap-3 sm:grid-cols-3">
            {[["1", "Going in", "Eligible contributions can lower your taxable income."], ["2", "Growing", "Investment growth inside the HSA isn't taxed."], ["3", "Coming out", "Withdrawals for qualified medical expenses are tax-free."]].map(([n, t, d]) => (
              <div key={n} className="rounded-2xl bg-emerald-50 p-4"><div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 font-bold text-white">{n}</div><div className="mt-2 font-semibold">{t}</div><p className="text-[15px] text-slate-700">{d}</p></div>
            ))}
          </div>
          <p className="mt-4 text-[15px] text-slate-600"><b>Who can use one?</b> You need a qualifying high-deductible health plan (HDHP). In {RULES.year} that means a deductible of at least {money(RULES.hsa.hdhpMinDeductibleSelf)} (self) / {money(RULES.hsa.hdhpMinDeductibleFamily)} (family). You also generally can't be enrolled in Medicare or claimed as someone's dependent. {RULES.year} limits: {money(RULES.hsa.selfOnly)} self-only, {money(RULES.hsa.family)} family, +{money(RULES.hsa.catchUp55)} at 55+. Non-medical withdrawals before 65 are taxed plus a 20% penalty. State tax treatment varies.</p>
        </Card>
      </Section>
      <Section n={2} kicker="Try it" title="HSA Triple Tax Advantage Simulator">
        <Card>
          <div className="flex justify-end"><ResetButton onClick={reset} /></div>
          <div className="grid gap-x-8 sm:grid-cols-2">
            <Slider label="Yearly contribution" value={s.annual} min={500} max={9750} step={250} onChange={(v) => set({ annual: v })} format={money} help={over ? `Above the ${RULES.year} family limit of ${money(RULES.hsa.family)} (unless 55+ catch-up applies).` : `Limit ${money(RULES.hsa.selfOnly)} self / ${money(RULES.hsa.family)} family`} />
            <Slider label="Federal income tax rate" value={s.tax} min={10} max={37} onChange={(v) => set({ tax: v })} format={(v) => v + "%"} />
            <Slider label="Years until retirement" value={s.years} min={1} max={40} onChange={(v) => set({ years: v })} format={(v) => v + " years"} />
            <Slider label="Investment return" value={s.ret} min={0} max={10} step={0.5} onChange={(v) => set({ ret: v })} format={(v) => v + "%"} />
            <Slider label="Medical costs paid each year" value={s.medical} min={0} max={6000} step={100} onChange={(v) => set({ medical: v })} format={money} />
            <label className="flex items-center gap-3 pt-6 text-[15px] font-medium text-slate-700"><input type="checkbox" className="h-5 w-5 accent-emerald-500" checked={s.payroll} onChange={(e) => set({ payroll: e.target.checked })} /> Contributed through payroll (also skips 7.65% FICA)</label>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Tax saved per year" value={money(r.taxSavedPerYear)} tone="green" />
            <Stat label={`Tax saved over ${s.years} yrs`} value={compact(r.totalTaxSaved)} tone="green" />
            <Stat label="HSA balance" value={compact(r.hsaFinal)} tone="navy" />
            <Stat label="Regular savings instead" value={compact(r.savingsFinal)} />
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer>
              <LineChart data={r.rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#EEF2F7" vertical={false} />
                <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Year ${l}`} formatter={(v, n) => [money(Number(v)), n]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="hsa" name="HSA (invested)" stroke="#10B981" strokeWidth={3} dot={false} animationDuration={500} />
                <Line dataKey="savings" name="Same money via regular savings (3%)" stroke="#94A3B8" strokeWidth={3} strokeDasharray="6 4" dot={false} animationDuration={500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2"><EstimateTag>Federal taxes only. Assumes all withdrawals are for qualified medical expenses.</EstimateTag></div>
        </Card>
      </Section>
      <Section n={3} kicker="Next Step explains" title="Where does the advantage come from?">
        <AskRipple ctx={{ page: "lesson", module: "HSA Triple Tax Simulator", inputs: s, results: { taxSavedPerYear: Math.round(r.taxSavedPerYear), totalTaxSaved: Math.round(r.totalTaxSaved), hsaBalance: Math.round(r.hsaFinal), regularSavingsBalance: Math.round(r.savingsFinal) }, insights }}
          prompts={["Explain the triple tax advantage simply", "Who is eligible for an HSA?", "What counts as a qualified expense?"]} />
      </Section>
      <Section n={4} kicker="Real life" title="Ways people use HSAs">
        <Examples items={[
          { emoji: "💊", title: "Pay as you go", text: "Use the HSA for this year's doctor visits and prescriptions, tax-free." },
          { emoji: "🧾", title: "Save receipts", text: "Some pay medical bills out of pocket, invest the HSA, and keep receipts to reimburse themselves later." },
          { emoji: "👵", title: "Retirement health fund", text: "After 65, non-medical withdrawals are taxed like a Traditional IRA, with no penalty." },
        ]} />
      </Section>
      <Section n={5} kicker="Quick check" title="Test yourself">
        <Quiz id="hsa" onComplete={finish} questions={[
          { q: "What do you need to contribute to an HSA?", options: ["Any health plan", "A qualifying high-deductible health plan", "A 401(k)"], answer: 1, why: "HSA eligibility requires coverage under a qualifying HDHP, plus a few other rules." },
          { q: "Which is NOT one of the HSA tax advantages?", options: ["Tax-deductible contributions", "Tax-free growth", "Tax-free withdrawals for vacations"], answer: 2, why: "Only qualified medical expenses come out tax-free." },
          { q: `The ${RULES.year} self-only HSA limit is…`, options: [money(RULES.hsa.selfOnly), money(RULES.k401.employeeLimit), "$500"], answer: 0, why: `${money(RULES.hsa.selfOnly)} for self-only coverage in ${RULES.year}.` },
        ]} />
      </Section>
      <Takeaway>If you're eligible, an HSA can be one of the most tax-efficient ways to pay for healthcare, now and in retirement.</Takeaway>
    </div>
  );
}
