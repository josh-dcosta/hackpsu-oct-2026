import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim, useStore } from "../lib/store";
import { simulate401k, LIMITS_NOTE } from "../lib/calc";
import { RULES, k401Limit } from "../lib/rules";
import { money, compact, axisMoney } from "../lib/format";
import { AskRipple, Card, EstimateTag, Examples, Quiz, ResetButton, Section, Slider, Stat, Takeaway, tooltipStyle } from "../components/ui";
import { useFinish } from "../pages/ModuleFrame";

export default function K401() {
  const { profile, simple } = useStore();
  const finish = useFinish("k401");
  const defaults = { age: profile.age, retireAge: 67, salary: profile.income || 75000, contrib: 5, matchRate: 50, matchCap: 6, ret: 6, growth: 3, balance: profile.retirement, inflation: 3 };
  const [s, set, reset] = useSim("k401", defaults);
  const base = (contrib: number, age = s.age) => simulate401k({ age, retireAge: s.retireAge, salary: s.salary, contribPct: contrib / 100, matchRate: s.matchRate / 100, matchCapPct: s.matchCap / 100, returnRate: s.ret / 100, salaryGrowth: s.growth / 100, balance: age === s.age ? s.balance : 0, inflation: s.inflation / 100 });
  const r = useMemo(() => base(s.contrib), [JSON.stringify(s)]); // eslint-disable-line react-hooks/exhaustive-deps
  const compare = [3, 6, 10, 15].map((c) => ({ label: `${c}%`, final: base(c).final, mine: c === s.contrib }));
  const r5 = base(5), r10 = base(10);
  const late = s.retireAge - (s.age + 10) > 0 ? simulate401k({ age: s.age + 10, retireAge: s.retireAge, salary: s.salary * Math.pow(1 + s.growth / 100, 10), contribPct: s.contrib / 100, matchRate: s.matchRate / 100, matchCapPct: s.matchCap / 100, returnRate: s.ret / 100, salaryGrowth: s.growth / 100, balance: 0, inflation: s.inflation / 100 }) : null;
  const early = simulate401k({ age: s.age, retireAge: s.retireAge, salary: s.salary, contribPct: s.contrib / 100, matchRate: s.matchRate / 100, matchCapPct: s.matchCap / 100, returnRate: s.ret / 100, salaryGrowth: s.growth / 100, balance: 0, inflation: s.inflation / 100 });
  const missing = s.contrib < s.matchCap ? s.salary * (s.matchCap - s.contrib) / 100 * s.matchRate / 100 : 0;

  const insights = [
    `Contributing ${s.contrib}% could grow to about ${compact(r.final)} by age ${s.retireAge}, which feels like ${compact(r.finalReal)} in today's money.`,
    `Of that, you'd put in ${compact(r.totalEmployee)}, your employer adds ${compact(r.totalEmployer)}, and investment growth adds about ${compact(r.totalGrowth)}.`,
    missing > 0 ? `You're leaving about ${money(missing)} of free employer match on the table this year. Contributing ${s.matchCap}% would claim it all.` : `You're getting the full employer match. 🎯`,
  ];

  return (
    <div>
      <Section n={1} kicker="The idea" title="Your future paycheck, built today">
        <Card>
          <p className="text-lg leading-relaxed text-slate-700">A <b>401(k)</b> is a retirement account offered through work. Money comes straight out of each paycheck and gets invested, so it can grow for decades.</p>
          <p className="mt-3 text-lg leading-relaxed text-slate-700">Many employers add a <b>match</b>, for example 50¢ for every $1 you save, up to 6% of your pay. {simple ? "That's extra money on top of your salary." : "It's part of your total compensation, and you only get it if you contribute."}</p>
          {!simple && <p className="mt-3 text-[15px] text-slate-500">{RULES.year} limits: {money(RULES.k401.employeeLimit)} from you, plus {money(RULES.k401.catchUp50)} catch-up at 50+ ({money(RULES.k401.superCatchUp60to63)} at ages 60–63). Your limit at {s.age}: {money(k401Limit(s.age))}. {RULES.k401.note}</p>}
        </Card>
      </Section>

      <Section n={2} kicker="Try it" title="401(k) Growth Simulator">
        <Card>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex justify-end"><ResetButton onClick={reset} /></div>
              <Slider label="Your contribution" value={s.contrib} min={0} max={25} onChange={(v) => set({ contrib: v })} format={(v) => v + "% of pay"} />
              <Slider label="Your age" value={s.age} min={20} max={64} onChange={(v) => set({ age: v, retireAge: Math.max(s.retireAge, v + 1) })} format={(v) => String(v)} />
              <Slider label="Retire at" value={s.retireAge} min={Math.max(55, s.age + 1)} max={75} onChange={(v) => set({ retireAge: v })} format={(v) => "Age " + v} />
              <Slider label="Salary" value={s.salary} min={20000} max={300000} step={1000} onChange={(v) => set({ salary: v })} format={money} />
              <Slider label="Employer match" value={s.matchRate} min={0} max={100} step={25} onChange={(v) => set({ matchRate: v })} format={(v) => `${v}¢ per $1`} />
              <Slider label="…up to" value={s.matchCap} min={0} max={10} onChange={(v) => set({ matchCap: v })} format={(v) => v + "% of pay"} />
              {!simple && <>
                <Slider label="Yearly investment return" value={s.ret} min={2} max={10} step={0.5} onChange={(v) => set({ ret: v })} format={(v) => v + "%"} help="Not guaranteed. Markets rise and fall." />
                <Slider label="Yearly raises" value={s.growth} min={0} max={6} step={0.5} onChange={(v) => set({ growth: v })} format={(v) => v + "%"} />
                <Slider label="Already saved" value={s.balance} min={0} max={1000000} step={1000} onChange={(v) => set({ balance: v })} format={money} />
                <Slider label="Inflation" value={s.inflation} min={0} max={6} step={0.5} onChange={(v) => set({ inflation: v })} format={(v) => v + "%"} />
              </>}
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Stat label={`Projected at age ${s.retireAge}`} value={money(r.final)} tone="navy" big sub={`≈ ${money(r.finalReal)} in today's buying power`} /></div>
                <Stat label="You contribute" value={compact(r.totalEmployee)} sub={`${money(r.firstYearEmployee)} this year`} />
                <Stat label="Employer adds" value={compact(r.totalEmployer)} tone="green" sub={`${money(r.firstYearMatch)} this year`} />
              </div>
              {missing > 0 && <div className="mt-3 rounded-2xl bg-amber-soft p-3 text-[15px] text-amber-900">💡 You're missing <b>{money(missing)}</b> of employer match this year. Try {s.matchCap}%.</div>}
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <AreaChart data={r.rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#EEF2F7" vertical={false} />
                    <XAxis dataKey="age" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
                    <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Age ${l}`} formatter={(v, n) => [money(Number(v)), n]} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" stackId="1" dataKey="employee" name="Your money" stroke="#0F172A" fill="#0F172A" fillOpacity={0.85} animationDuration={500} />
                    <Area type="monotone" stackId="1" dataKey="employer" name="Employer match" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.85} animationDuration={500} />
                    <Area type="monotone" stackId="1" dataKey="growth" name="Growth" stroke="#10B981" fill="#10B981" fillOpacity={0.75} animationDuration={500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2"><EstimateTag /><span className="text-[12px] text-slate-500">{LIMITS_NOTE}{r.limitYears ? ` Your contribution hit the IRS limit in ${r.limitYears} year(s).` : ""}</span></div>
        </Card>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="font-semibold">Compare contribution levels</div>
            <p className="text-[14px] text-slate-500">Same job, same match, same returns. Only your % changes.</p>
            <div className="mt-3 h-56">
              <ResponsiveContainer>
                <BarChart data={compare} margin={{ top: 22, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 13, fill: "#334155", fontWeight: 600 }} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [money(Number(v)), "At retirement"]} />
                  <Bar dataKey="final" radius={[10, 10, 4, 4]} animationDuration={500}>
                    {compare.map((c) => <Cell key={c.label} fill={c.mine ? "#10B981" : "#CBD5E1"} />)}
                    <LabelList dataKey="final" position="top" formatter={(v: unknown) => compact(Number(v))} style={{ fontSize: 12, fontWeight: 700, fill: "#0F172A" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <div className="font-semibold">The cost of waiting 10 years</div>
            <p className="text-[14px] text-slate-500">Starting from $0 at {s.contrib}%, now vs. a decade later.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label={`Start at ${s.age}`} value={compact(early.final)} tone="green" />
              <Stat label={`Start at ${s.age + 10}`} value={late ? compact(late.final) : "n/a"} tone="coral" />
            </div>
            {late && <p className="mt-4 text-[15px] text-slate-700">Waiting costs about <b>{compact(early.final - late.final)}</b>, even though you'd only contribute <b>{compact(early.totalEmployee - late.totalEmployee)}</b> less yourself. That gap is lost <b>compound growth</b>.</p>}
          </Card>
        </div>
      </Section>

      <Section n={3} kicker="Ripple explains" title="Why do small changes matter so much?">
        <AskRipple ctx={{ page: "lesson", module: "401(k) Growth Simulator", inputs: { ...s, contribPct: s.contrib + "%", match: `${s.matchRate}% up to ${s.matchCap}% of pay` }, results: { projected: Math.round(r.final), todaysDollars: Math.round(r.finalReal), yourContributions: Math.round(r.totalEmployee), employerMatch: Math.round(r.totalEmployer), growth: Math.round(r.totalGrowth), at5pct: Math.round(r5.final), at10pct: Math.round(r10.final), at5pctEmployer: Math.round(r5.totalEmployer), at10pctEmployer: Math.round(r10.totalEmployer), startNow: Math.round(early.final), startIn10Years: late ? Math.round(late.final) : null, missedMatchThisYear: Math.round(missing) }, insights }}
          prompts={["Why does going from 5% to 10% make such a big difference?", "What is an employer match, really?", "Why does starting early matter?"]} />
      </Section>

      <Section n={4} kicker="Real life" title="How people use this">
        <Examples items={[
          { emoji: "🪜", title: "The 1% ladder", text: "Raise your contribution 1% every year, often timed with a raise, so you barely notice it in your paycheck." },
          { emoji: "🎯", title: "Match first", text: "Many people make sure they get at least the full match before other saving goals." },
          { emoji: "🔁", title: "Changing jobs", text: "Your own contributions are always yours. Employer money may 'vest' over time. Roll old accounts over instead of cashing out." },
        ]} />
      </Section>

      <Section n={5} kicker="Quick check" title="Test yourself">
        <Quiz id="k401" onComplete={finish} questions={[
          { q: "Your employer matches 50% up to 6% of pay. You contribute 3%. What happens?", options: ["You get the full match", "You leave part of the match unclaimed", "Your employer pays 6%"], answer: 1, why: "You'd get 1.5% instead of 3%. The rest of the match is left behind." },
          { q: "Why does starting at 25 instead of 35 matter so much?", options: ["Lower fees", "10 extra years of compound growth", "Higher contribution limits"], answer: 1, why: "Early dollars have the most time to earn returns on their returns." },
          { q: `The ${RULES.year} employee 401(k) limit (under age 50) is…`, options: [money(RULES.k401.employeeLimit), "$7,500", "$1,000,000"], answer: 0, why: `${money(RULES.k401.employeeLimit)} for ${RULES.year}. $7,500 is the IRA limit.` },
        ]} />
      </Section>
      <Takeaway>Grab the full match, start as early as you can, and nudge your contribution up over time. Time does most of the heavy lifting.</Takeaway>
    </div>
  );
}
