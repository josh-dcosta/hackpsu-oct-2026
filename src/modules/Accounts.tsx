import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim } from "../lib/store";
import { compareAccounts } from "../lib/calc";
import { money, compact, axisMoney } from "../lib/format";
import { WhatItMeans, Quiz, Section, Slider, tooltipStyle, cx } from "../components/ui";
import { Idea, Simulator, axis } from "../components/Lesson";
import { useFinish } from "../pages/ModuleFrame";

export default function Accounts() {
  const finish = useFinish("accounts");
  const [s, set, reset] = useSim("accounts", { budget: 6000, years: 30, ret: 6, now: 12, later: 12, match: 50 });
  const { list } = compareAccounts({ budget: s.budget, years: s.years, returnRate: s.ret / 100, taxNow: s.now / 100, taxLater: s.later / 100, matchPct: s.match / 100 });
  const data = list.map((a) => ({ name: a.name.replace("Traditional", "Trad."), keep: Math.round(a.afterTax), tax: Math.round(a.taxes) }));
  const ira = list.slice(0, 2);
  const winner = Math.abs(ira[0].afterTax - ira[1].afterTax) < 1 ? "tie" : ira[0].afterTax > ira[1].afterTax ? "trad" : "roth";
  const insights = [
    winner === "tie" ? `With the same tax rate now and later (${s.now}%), Traditional and Roth IRAs end up exactly equal: ${compact(ira[0].afterTax)} after tax.` :
      winner === "roth" ? `With a higher tax rate later (${s.later}% vs ${s.now}% now), the Roth IRA comes out ahead: ${compact(ira[1].afterTax)} vs ${compact(ira[0].afterTax)}.` :
        `With a lower tax rate later (${s.later}% vs ${s.now}% now), the Traditional IRA comes out ahead: ${compact(ira[0].afterTax)} vs ${compact(ira[1].afterTax)}.`,
    s.match > 0 ? `The 401(k)s pull ahead because of the ${s.match}% employer match.` : "With no employer match, a 401(k) behaves like the matching IRA type in this simple model.",
  ];
  const presets = [["📈 Higher taxes later", 12, 22], ["⚖️ Same rate", 12, 12], ["📉 Lower taxes later", 22, 12]] as const;

  return (
    <div>
      <Idea title="Pay taxes now, or pay them later?">
        <p><b>Traditional</b> accounts skip taxes today and tax you when you withdraw in retirement. <b>Roth</b> accounts tax you today, then qualified withdrawals are tax-free.</p>
        <p>Which comes out ahead mostly depends on one thing: <b>is your tax rate higher now, or later?</b></p>
      </Idea>

      <Simulator title="Retirement Account Simulator" onReset={reset} note="Simplified: flat tax rates, no state taxes, all rules met for qualified withdrawals."
        controls={<>
          <div className="flex flex-wrap gap-2">
            {presets.map(([l, now, later]) => (
              <button key={l} onClick={() => set({ now, later })} aria-pressed={s.now === now && s.later === later}
                className={cx("rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1", s.now === now && s.later === later ? "bg-navy text-white ring-navy" : "bg-white ring-slate-200 hover:ring-emerald-400")}>{l}</button>
            ))}
          </div>
          <div className="mt-3">
            <Slider grow label="Set aside each year (pre-tax)" value={s.budget} min={1000} max={20000} step={500} onChange={(v) => set({ budget: v })} format={money} />
            <Slider label="Years invested" value={s.years} min={5} max={45} onChange={(v) => set({ years: v })} format={(v) => v + " years"} />
            <Slider label="Tax rate now" value={s.now} min={0} max={37} onChange={(v) => set({ now: v })} format={(v) => v + "%"} />
            <Slider label="Tax rate in retirement" value={s.later} min={0} max={37} onChange={(v) => set({ later: v })} format={(v) => v + "%"} />
            <Slider label="Yearly return" value={s.ret} min={2} max={10} step={0.5} onChange={(v) => set({ ret: v })} format={(v) => v + "%"} />
            <Slider label="401(k) employer match" value={s.match} min={0} max={100} step={25} onChange={(v) => set({ match: v })} format={(v) => v + "%"} />
          </div>
        </>}
        chart={
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 26, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#334155", fontWeight: 600 }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tickFormatter={axisMoney} {...axis} width={56} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [money(Number(v)), n === "keep" ? "You keep" : "Taxes at withdrawal"]} />
              <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => (v === "keep" ? "You keep" : "Taxes at withdrawal")} />
              <Bar dataKey="keep" stackId="a" fill="#F5C000" animationDuration={500}>
                <LabelList dataKey="keep" position="center" formatter={(v: unknown) => compact(Number(v))} style={{ fontSize: 13, fontWeight: 700, fill: "#fff" }} />
              </Bar>
              <Bar dataKey="tax" stackId="a" fill="#FDBA74" radius={[8, 8, 0, 0]} animationDuration={500}>
                <LabelList dataKey="tax" position="top" formatter={(v: unknown) => (Number(v) > 0 ? `tax ${compact(Number(v))}` : "no tax")} style={{ fontSize: 12, fontWeight: 700, fill: "#9A3412" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        } />

      <Section n={3} kicker="What it means" title="Understanding the trade-off">
        <WhatItMeans ctx={{ page: "lesson", module: "Retirement Account Simulator", inputs: { ...s, taxNow: s.now + "%", taxLater: s.later + "%" }, results: Object.fromEntries(list.map((a) => [a.name, { afterTax: Math.round(a.afterTax), taxesAtWithdrawal: Math.round(a.taxes) }])), insights }}
          prompts={["Why are Roth and Traditional equal when tax rates match?", "How would I guess my future tax rate?", "Why might someone use both?"]} />
      </Section>
      <Section n={4} kicker="Quick check" title="Test yourself">
        <Quiz id="accounts" onComplete={finish} questions={[
          { q: "Which account gives tax-free qualified withdrawals?", options: ["Traditional IRA", "Roth IRA", "Both"], answer: 1, why: "Roth: taxed going in, tax-free coming out (when rules are met)." },
          { q: "If your tax rate is the same now and in retirement, which wins?", options: ["Roth", "Traditional", "They're equal"], answer: 2, why: "Same rate means the same after-tax result." },
          { q: "Which usually comes with an employer match?", options: ["An IRA", "A 401(k)", "Neither"], answer: 1, why: "Matches come through workplace plans like 401(k)s." },
        ]} />
      </Section>
    </div>
  );
}
