import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim, useStore } from "../lib/store";
import { payoff, multiDebt, emergencyFund, type Debt as D } from "../lib/calc";
import { money, compact, axisMoney, months } from "../lib/format";
import { AskRipple, Card, EstimateTag, Examples, NumberField, Quiz, ResetButton, Section, Slider, Stat, Takeaway, tooltipStyle, cx } from "../components/ui";
import { useFinish } from "../pages/ModuleFrame";

export default function Debt() {
  const { profile } = useStore();
  const finish = useFinish("debt");
  const [s, set, reset] = useSim("debt", {
    bal: 6000, apr: 24, pay: 200, extra: 300,
    d1b: 900, d1r: 18, d2b: 6500, d2r: 24, d3b: 11000, d3r: 7,
    limit: 10000, used: 3000,
    ess: Math.round(profile.expenses * 0.75), efMonths: 3, efSaved: 2000, efMonthly: 300,
  });
  const one = payoff({ balance: s.bal, apr: s.apr / 100, payment: s.pay });
  const more = payoff({ balance: s.bal, apr: s.apr / 100, payment: s.pay + 100 });
  const minPay = Math.max(25, s.bal * (s.apr / 100 / 12) + s.bal * 0.01);
  const debts: D[] = [
    { name: "Store card", balance: s.d1b, apr: s.d1r / 100, min: Math.max(25, s.d1b * 0.03) },
    { name: "Credit card", balance: s.d2b, apr: s.d2r / 100, min: Math.max(25, s.d2b * 0.03) },
    { name: "Car loan", balance: s.d3b, apr: s.d3r / 100, min: Math.max(25, s.d3b * 0.025) },
  ];
  const av = multiDebt(debts, s.extra, "avalanche"), sn = multiDebt(debts, s.extra, "snowball"), mn = multiDebt(debts, s.extra, "minimum");
  const len = Math.min(240, Math.max(av.series.length, sn.series.length, isFinite(mn.months) ? mn.series.length : 240));
  const series = Array.from({ length: len }, (_, i) => ({ month: i, Avalanche: av.series[i]?.total ?? 0, Snowball: sn.series[i]?.total ?? 0, "Minimums only": mn.series[i]?.total ?? 0 }));
  const one12 = one.series.filter((_, i) => i % 1 === 0).map((p, i) => ({ month: p.month, "Your payment": p.balance, "+$100/mo": more.series[i]?.balance ?? 0 }));
  const util = s.limit ? s.used / s.limit : 0;
  const ef = emergencyFund({ essentials: s.ess, targetMonths: s.efMonths, saved: s.efSaved, monthlySave: s.efMonthly });

  const insights = [
    one.never ? `At ${money(s.pay)}/month, the payment doesn't even cover the monthly interest, so this debt would never be paid off.` :
      `Paying ${money(s.pay)}/month on ${money(s.bal)} at ${s.apr}% takes ${months(one.months)} and costs ${money(one.totalInterest)} in interest. Adding $100/month cuts that to ${months(more.months)} and ${money(more.totalInterest)}.`,
    `With 3 debts and ${money(s.extra)} extra per month: avalanche costs ${money(av.totalInterest)} in interest, snowball ${money(sn.totalInterest)}, and minimums only ${isFinite(mn.totalInterest) ? money(mn.totalInterest) : "never finishes"}.`,
    `Your credit utilization is ${Math.round(util * 100)}%. Many guides suggest keeping it under 30%, and lower tends to be better.`,
  ];

  return (
    <div>
      <Section n={1} kicker="The idea" title="Interest works both ways">
        <Card>
          <p className="text-lg leading-relaxed text-slate-700">Compound interest helps your savings grow, and it makes debt grow too. Credit cards often charge <b>20–30% APR</b>. That's why high-interest debt is usually the first fire to put out.</p>
          <p className="mt-3 text-lg leading-relaxed text-slate-700">An <b>emergency fund</b> is your firewall. When the car breaks down, you pay from savings instead of a 24% credit card.</p>
        </Card>
      </Section>

      <Section n={2} kicker="Try it" title="Debt Payoff Simulator">
        <Card>
          <div className="flex justify-between"><div className="font-semibold">One debt: how payment size changes everything</div><ResetButton onClick={reset} /></div>
          <div className="mt-3 grid gap-6 lg:grid-cols-2">
            <div>
              <Slider label="Balance" value={s.bal} min={500} max={30000} step={250} onChange={(v) => set({ bal: v })} format={money} />
              <Slider label="Interest rate (APR)" value={s.apr} min={0} max={36} step={0.5} onChange={(v) => set({ apr: v })} format={(v) => v + "%"} />
              <Slider label="Monthly payment" value={s.pay} min={25} max={2000} step={25} onChange={(v) => set({ pay: v })} format={money} help={`A typical minimum here would be around ${money(minPay)}.`} />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Stat label="Debt-free in" value={months(one.months)} tone={one.never ? "coral" : "navy"} />
                <Stat label="Total interest" value={one.never ? "∞" : money(one.totalInterest)} tone="coral" />
              </div>
              {!one.never && <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-[15px] text-emerald-800">💡 Adding $100/month saves <b>{money(one.totalInterest - more.totalInterest)}</b> and <b>{months(one.months - more.months)}</b>.</div>}
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={one12} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#EEF2F7" vertical={false} />
                  <XAxis dataKey="month" tickFormatter={(v) => `${v}m`} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Month ${l}`} formatter={(v, n) => [money(Number(v)), n]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line dataKey="Your payment" stroke="#F97361" strokeWidth={3} dot={false} animationDuration={500} />
                  <Line dataKey="+$100/mo" stroke="#10B981" strokeWidth={3} dot={false} animationDuration={500} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="mt-4">
          <div className="font-semibold">Several debts: avalanche vs. snowball</div>
          <p className="text-[14px] text-slate-500"><b>Avalanche</b>: extra money goes to the highest interest rate first. <b>Snowball</b>: smallest balance first, for quick wins.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {([["Store card", "d1b", "d1r"], ["Credit card", "d2b", "d2r"], ["Car loan", "d3b", "d3r"]] as const).map(([n, b, r]) => (
              <div key={n} className="rounded-2xl bg-slate-50 p-3">
                <div className="font-semibold">{n}</div>
                <NumberField label="Balance" value={s[b]} onChange={(v) => set({ [b]: v } as Partial<typeof s>)} />
                <div className="mt-2"><NumberField label="APR" prefix="" suffix="%" step={0.5} value={s[r]} onChange={(v) => set({ [r]: Math.min(60, v) } as Partial<typeof s>)} /></div>
              </div>
            ))}
          </div>
          <Slider label="Extra money each month (beyond minimums)" value={s.extra} min={0} max={1500} step={25} onChange={(v) => set({ extra: v })} format={money} />
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[["Avalanche", av], ["Snowball", sn], ["Minimums only", mn]].map(([n, r]) => {
              const x = r as typeof av;
              const bestI = Math.min(av.totalInterest, sn.totalInterest);
              return (
                <div key={n as string} className={cx("rounded-2xl p-3 ring-1", x.totalInterest === bestI && n !== "Minimums only" ? "bg-emerald-50 ring-emerald-300" : "bg-white ring-slate-200")}>
                  <div className="text-[13px] font-semibold text-slate-500">{n as string}</div>
                  <div className="num text-lg font-bold">{months(x.months)}</div>
                  <div className="text-[13px] text-slate-600">{isFinite(x.totalInterest) ? money(x.totalInterest) : "∞"} interest</div>
                  {n !== "Minimums only" && <div className="mt-1 text-[12px] text-slate-500">Order: {x.order.join(" → ")}</div>}
                </div>
              );
            })}
          </div>
          <div className="mt-4 h-60">
            <ResponsiveContainer>
              <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#EEF2F7" vertical={false} />
                <XAxis dataKey="month" tickFormatter={(v) => `${v}m`} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Month ${l}`} formatter={(v, n) => [money(Number(v)), n]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="Avalanche" stroke="#10B981" strokeWidth={3} dot={false} />
                <Line dataKey="Snowball" stroke="#38BDF8" strokeWidth={3} dot={false} strokeDasharray="6 3" />
                <Line dataKey="Minimums only" stroke="#F97361" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="font-semibold">Credit utilization</div>
            <p className="text-[14px] text-slate-500">How much of your credit limit you're using. It's one of the biggest factors in credit scores, along with on-time payments.</p>
            <Slider label="Total credit limits" value={s.limit} min={1000} max={50000} step={500} onChange={(v) => set({ limit: v, used: Math.min(s.used, v) })} format={money} />
            <Slider label="Current balances" value={s.used} min={0} max={s.limit} step={100} onChange={(v) => set({ used: v })} format={money} />
            <div className="mt-2 h-4 rounded-full bg-slate-100 overflow-hidden"><div className="h-4 rounded-full transition-all" style={{ width: `${Math.min(100, util * 100)}%`, background: util < 0.1 ? "#10B981" : util < 0.3 ? "#84CC16" : util < 0.5 ? "#F59E0B" : "#F97361" }} /></div>
            <div className="mt-2 text-lg font-bold">{Math.round(util * 100)}% used · {util < 0.1 ? "Excellent" : util < 0.3 ? "Good" : util < 0.5 ? "Fair" : "High"}</div>
          </Card>
          <Card>
            <div className="font-semibold">Emergency fund calculator</div>
            <Slider label="Essential monthly expenses" value={s.ess} min={500} max={10000} step={100} onChange={(v) => set({ ess: v })} format={money} help="Rent, food, utilities, insurance, minimum debt payments" />
            <Slider label="Target" value={s.efMonths} min={1} max={12} onChange={(v) => set({ efMonths: v })} format={(v) => `${v} months`} />
            <Slider label="Already saved" value={s.efSaved} min={0} max={60000} step={250} onChange={(v) => set({ efSaved: v })} format={money} />
            <Slider label="Saving each month" value={s.efMonthly} min={0} max={3000} step={25} onChange={(v) => set({ efMonthly: v })} format={money} />
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Stat label="Your goal" value={compact(ef.target)} tone="sky" />
              <Stat label="Fully funded in" value={ef.gap === 0 ? "Done! 🎉" : months(ef.months)} tone="green" />
            </div>
            <div className="mt-3 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${ef.progress * 100}%` }} /></div>
          </Card>
        </div>
        <div className="mt-3"><EstimateTag>Simplified: fixed rates, no new charges, minimums estimated.</EstimateTag></div>
      </Section>

      <Section n={3} kicker="Next Step explains" title="Make a plan">
        <AskRipple ctx={{ page: "lesson", module: "Debt & Emergency Fund", inputs: s, results: { singleDebtMonths: one.never ? "never" : one.months, singleDebtInterest: one.never ? "infinite" : Math.round(one.totalInterest), withExtra100Months: more.months, withExtra100Interest: Math.round(more.totalInterest), avalanche: { months: av.months, interest: Math.round(av.totalInterest), order: av.order }, snowball: { months: sn.months, interest: Math.round(sn.totalInterest), order: sn.order }, creditUtilizationPct: Math.round(util * 100), emergencyFundGoal: ef.target, monthsToGoal: ef.months }, insights }}
          prompts={["Avalanche or snowball, which fits me?", "Why is the minimum payment a trap?", "Should I save or pay off debt first?"]} />
      </Section>
      <Section n={4} kicker="Real life" title="Other debts to know">
        <Examples items={[
          { emoji: "🎓", title: "Student loans", text: "Federal loans offer income-driven repayment and other protections. Check studentaid.gov before refinancing." },
          { emoji: "🚗", title: "Auto loans", text: "A longer loan means a lower payment but more total interest, and the car loses value meanwhile." },
          { emoji: "🏡", title: "Mortgages", text: "One extra payment a year on a 30-year mortgage can cut several years off the loan." },
        ]} />
      </Section>
      <Section n={5} kicker="Quick check" title="Test yourself">
        <Quiz id="debt" onComplete={finish} questions={[
          { q: "Which strategy usually saves the most interest?", options: ["Snowball (smallest balance first)", "Avalanche (highest rate first)", "Paying minimums"], answer: 1, why: "Avalanche targets the most expensive debt first. Snowball can be more motivating." },
          { q: "Credit utilization is…", options: ["Your income", "How much of your available credit you're using", "Your number of cards"], answer: 1, why: "Lower utilization generally helps credit scores." },
          { q: "A common emergency fund goal is…", options: ["1 week of expenses", "3–6 months of essential expenses", "10 years of salary"], answer: 1, why: "3–6 months is a common guideline. More if income is irregular." },
        ]} />
      </Section>
      <Takeaway>Pay more than the minimum, attack high-interest debt first, and build a cushion so tomorrow's surprise doesn't become next year's debt.</Takeaway>
    </div>
  );
}
