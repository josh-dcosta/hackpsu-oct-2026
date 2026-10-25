import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim, useStore } from "../lib/store";
import { compareAccounts } from "../lib/calc";
import { RULES } from "../lib/rules";
import { money, compact, axisMoney } from "../lib/format";
import { AskRipple, Card, EstimateTag, Examples, Quiz, ResetButton, Section, Slider, Takeaway, tooltipStyle, cx } from "../components/ui";
import { useFinish } from "../pages/ModuleFrame";

const ROWS: [string, string, string, string, string][] = [
  ["", "Traditional IRA", "Roth IRA", "Traditional 401(k)", "Roth 401(k)"],
  ["Money goes in", "Pre-tax (often deductible)", "After-tax", "Pre-tax from paycheck", "After-tax from paycheck"],
  ["Growth", "Tax-deferred", "Tax-free", "Tax-deferred", "Tax-free"],
  ["Qualified withdrawals", "Taxed as income", "Tax-free", "Taxed as income", "Tax-free"],
  [`${RULES.year} limit`, `${money(RULES.ira.limit)} (+${money(RULES.ira.catchUp50)} at 50+), shared across IRAs`, `${money(RULES.ira.limit)} shared across IRAs`, `${money(RULES.k401.employeeLimit)} (+catch-up)`, `${money(RULES.k401.employeeLimit)} combined with Trad.`],
  ["Income limits", "Deduction phases out if covered at work", `Phases out ${compact(RULES.ira.rothPhaseOutSingle[0])}–${compact(RULES.ira.rothPhaseOutSingle[1])} single`, "None", "None"],
  ["Employer match", "No", "No", "Often", "Often (match may be pre-tax)"],
  ["Early withdrawal", "Usually 10% penalty before 59½ + tax", "Contributions out anytime; earnings rules apply", "Usually penalty before 59½ (some exceptions)", "Penalty/tax on earnings before 59½ & 5 years"],
];

export default function Accounts() {
  const { simple } = useStore();
  const finish = useFinish("accounts");
  const [s, set, reset] = useSim("accounts", { budget: 6000, years: 30, ret: 6, now: 22, later: 22, match: 50 });
  const { list } = compareAccounts({ budget: s.budget, years: s.years, returnRate: s.ret / 100, taxNow: s.now / 100, taxLater: s.later / 100, matchPct: s.match / 100 });
  const data = list.map((a) => ({ name: a.name.replace("Traditional", "Trad."), "You keep": Math.round(a.afterTax), "Taxes at withdrawal": Math.round(a.taxes) }));
  const ira = list.slice(0, 2);
  const winner = Math.abs(ira[0].afterTax - ira[1].afterTax) < 1 ? "tie" : ira[0].afterTax > ira[1].afterTax ? "trad" : "roth";
  const insights = [
    winner === "tie" ? `With the same tax rate now and later (${s.now}%), Traditional and Roth IRAs end up exactly equal: ${compact(ira[0].afterTax)} after tax.` :
      winner === "roth" ? `Because you assumed a HIGHER tax rate later (${s.later}% vs ${s.now}% now), the Roth IRA comes out ahead: ${compact(ira[1].afterTax)} vs ${compact(ira[0].afterTax)}.` :
        `Because you assumed a LOWER tax rate later (${s.later}% vs ${s.now}% now), the Traditional IRA comes out ahead: ${compact(ira[0].afterTax)} vs ${compact(ira[1].afterTax)}.`,
    s.match > 0 ? `The 401(k)s pull ahead because of the ${s.match}% employer match, about ${compact(list[2].afterTax - ira[0].afterTax)} more than the Traditional IRA here.` : "With no employer match, a 401(k) behaves like the matching IRA type in this simple model.",
    "Nobody knows future tax rates, which is why some people use both types for tax diversification.",
  ];
  const preset = (now: number, later: number) => set({ now, later });

  return (
    <div>
      <Section n={1} kicker="The idea" title="Pay taxes now, or pay them later?">
        <Card>
          <p className="text-lg leading-relaxed text-slate-700"><b>Traditional</b> accounts skip taxes today and tax you when you withdraw in retirement. <b>Roth</b> accounts tax you today, then qualified withdrawals are tax-free.</p>
          <p className="mt-3 text-lg leading-relaxed text-slate-700">Which comes out ahead mostly depends on one unknowable thing: <b>is your tax rate higher now, or later?</b> {simple ? "" : "If the rates are equal, the math comes out identical. Multiplication is commutative: C×(1−t)×G = C×G×(1−t)."}</p>
        </Card>
      </Section>

      <Section n={2} kicker="Try it" title="Retirement Account Lab">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => preset(12, 22)} className="rounded-full bg-white px-3.5 py-2 text-sm font-semibold ring-1 ring-slate-200 hover:ring-emerald-400">📈 Higher taxes later</button>
              <button onClick={() => preset(22, 22)} className="rounded-full bg-white px-3.5 py-2 text-sm font-semibold ring-1 ring-slate-200 hover:ring-emerald-400">⚖️ Same rate</button>
              <button onClick={() => preset(24, 12)} className="rounded-full bg-white px-3.5 py-2 text-sm font-semibold ring-1 ring-slate-200 hover:ring-emerald-400">📉 Lower taxes later</button>
            </div>
            <ResetButton onClick={reset} />
          </div>
          <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
            <Slider label="Pre-tax dollars set aside each year" value={s.budget} min={1000} max={20000} step={500} onChange={(v) => set({ budget: v })} format={money} help={s.budget > RULES.ira.limit ? `Note: above the ${RULES.year} IRA limit of ${money(RULES.ira.limit)}; IRA rows are illustrative.` : undefined} />
            <Slider label="Years invested" value={s.years} min={5} max={45} onChange={(v) => set({ years: v })} format={(v) => v + " years"} />
            <Slider label="Your tax rate now" value={s.now} min={0} max={37} onChange={(v) => set({ now: v })} format={(v) => v + "%"} />
            <Slider label="Your tax rate in retirement" value={s.later} min={0} max={37} onChange={(v) => set({ later: v })} format={(v) => v + "%"} />
            <Slider label="Yearly return" value={s.ret} min={2} max={10} step={0.5} onChange={(v) => set({ ret: v })} format={(v) => v + "%"} />
            <Slider label="401(k) employer match" value={s.match} min={0} max={100} step={25} onChange={(v) => set({ match: v })} format={(v) => v + "% of what you put in"} />
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#EEF2F7" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#334155", fontWeight: 600 }} tickLine={false} axisLine={false} interval={0} />
                <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [money(Number(v)), n]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="You keep" stackId="a" fill="#10B981" animationDuration={500} />
                <Bar dataKey="Taxes at withdrawal" stackId="a" fill="#FDBA74" radius={[8, 8, 0, 0]} animationDuration={500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {list.map((a) => (
              <div key={a.name} className="rounded-2xl bg-slate-50 p-3">
                <div className="text-[13px] font-semibold text-slate-500">{a.name}</div>
                <div className="num text-xl font-bold">{compact(a.afterTax)}</div>
                <div className="text-[12px] text-slate-500">after tax</div>
              </div>
            ))}
          </div>
          <div className="mt-3"><EstimateTag>Simplified: flat tax rates, no state taxes, all rules met for qualified withdrawals.</EstimateTag></div>
        </Card>

        <Card className="mt-4 overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[720px] text-left text-[14px]">
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={i} className={cx(i === 0 ? "bg-navy text-white" : i % 2 ? "bg-white" : "bg-slate-50")}>
                  {r.map((c, j) => <td key={j} className={cx("px-4 py-3 align-top", j === 0 && "font-semibold", i === 0 && "font-semibold")}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p className="mt-2 text-[12px] text-slate-500">Rules summarized from IRS guidance for {RULES.year}. Details have exceptions. Check irs.gov or a tax professional.</p>
      </Section>

      <Section n={3} kicker="Ripple explains" title="Understanding the tradeoff">
        <AskRipple ctx={{ page: "lesson", module: "Retirement Account Comparison Lab", inputs: { ...s, taxNow: s.now + "%", taxLater: s.later + "%" }, results: Object.fromEntries(list.map((a) => [a.name, { afterTax: Math.round(a.afterTax), taxesAtWithdrawal: Math.round(a.taxes), investedPerYear: Math.round(a.invested) }])), insights }}
          prompts={["Why are Roth and Traditional equal when tax rates match?", "How would I guess my future tax rate?", "Why might someone use both?"]} />
      </Section>
      <Section n={4} kicker="Real life" title="Who tends to pick what">
        <Examples items={[
          { emoji: "🎓", title: "Early career", text: "Lower income now often means a lower tax rate now, which is one reason Roth is popular with young savers." },
          { emoji: "💼", title: "Peak earning years", text: "High current tax rates can make Traditional's upfront deduction more appealing." },
          { emoji: "🧺", title: "A bit of both", text: "Having both types gives flexibility to manage taxes in retirement." },
        ]} />
      </Section>
      <Section n={5} kicker="Quick check" title="Test yourself">
        <Quiz id="accounts" onComplete={finish} questions={[
          { q: "Which account gives tax-free qualified withdrawals?", options: ["Traditional IRA", "Roth IRA", "Both"], answer: 1, why: "Roth: taxed going in, tax-free coming out (when rules are met)." },
          { q: "If your tax rate is the same now and in retirement, which wins?", options: ["Roth", "Traditional", "They're equal"], answer: 2, why: "Same rate means the same after-tax result. The order of multiplication doesn't matter." },
          { q: "Which usually comes with an employer match?", options: ["An IRA", "A 401(k)", "Neither"], answer: 1, why: "Matches come through workplace plans like 401(k)s." },
        ]} />
      </Section>
      <Takeaway>No account is "best" for everyone. The question is when you'd rather pay the tax: now, or later.</Takeaway>
    </div>
  );
}
