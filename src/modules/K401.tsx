import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim, useStore } from "../lib/store";
import { simulate401k } from "../lib/calc";
import { RULES } from "../lib/rules";
import { money, compact, axisMoney } from "../lib/format";
import { WhatItMeans, Card, Quiz, Section, Slider, tooltipStyle } from "../components/ui";
import { Idea, Simulator, axis } from "../components/Lesson";
import { useFinish } from "../pages/ModuleFrame";

export default function K401() {
  const { profile } = useStore();
  const finish = useFinish("k401");
  const salary0 = Math.max(20000, Math.round((profile.income || 60000) / 5000) * 5000);
  const defaults = { age: profile.age, retireAge: 67, salary: salary0, contrib: 5, matchRate: 100, matchCap: 5, ret: 6, growth: 2.5, balance: Math.round(profile.retirement / 1000) * 1000, inflation: 3 };
  const [s, set, reset] = useSim("k401", defaults);
  const run = (contrib: number, age = s.age, balance = s.balance, salary = s.salary) => simulate401k({ age, retireAge: s.retireAge, salary, contribPct: contrib / 100, matchRate: s.matchRate / 100, matchCapPct: s.matchCap / 100, returnRate: s.ret / 100, salaryGrowth: s.growth / 100, balance, inflation: s.inflation / 100 });
  const r = useMemo(() => run(s.contrib), [JSON.stringify(s)]); // eslint-disable-line react-hooks/exhaustive-deps
  const compare = [...new Set([3, 6, 10, 15, s.contrib])].sort((a, b) => a - b).map((c) => ({ label: `${c}%`, final: run(c).final, mine: c === s.contrib }));
  const waitAge = Math.min(s.retireAge - 1, s.age + 10);
  const early = run(s.contrib, s.age, 0);
  const late = run(s.contrib, waitAge, 0, s.salary * Math.pow(1 + s.growth / 100, waitAge - s.age));
  const wait = [{ label: `Start at ${s.age}`, final: early.final, c: "#F5C000" }, { label: `Start at ${waitAge}`, final: late.final, c: "#F97361" }];
  const missing = s.contrib < s.matchCap ? (s.salary * (s.matchCap - s.contrib) / 100) * (s.matchRate / 100) : 0;
  const insights = [
    `Contributing ${s.contrib}% could grow to about ${compact(r.final)} by age ${s.retireAge}, about ${compact(r.finalReal)} in today's money.`,
    `You'd put in ${compact(r.totalEmployee)}, your employer adds ${compact(r.totalEmployer)}, and growth adds about ${compact(r.totalGrowth)}.`,
    missing > 0 ? `You're leaving about ${money(missing)} of employer match on the table this year.` : "You're getting the full employer match.",
  ];
  const chartRows = r.rows.map((x) => ({ age: x.age, employee: Math.round(x.employee), employer: Math.round(x.employer), growth: Math.round(x.growth) }));

  return (
    <div>
      <Idea title="Your future paycheck, built today">
        <p>A <b>401(k)</b> (or 403(b) or 457 at schools and governments) is a retirement account through work. Money comes straight out of each paycheck and gets invested for decades.</p>
        <p>Many employers add a <b>match</b>. A common one: 100% of what you put in, up to the first 5% of pay. That's free money on top of your salary.</p>
      </Idea>

      <Simulator title="401(k) Growth Simulator" onReset={reset}
        controls={<>
          <Slider label="Your contribution" value={s.contrib} min={0} max={20} onChange={(v) => set({ contrib: v })} format={(v) => v + "% of pay"} />
          <Slider label="Salary" value={s.salary} min={20000} max={200000} step={5000} onChange={(v) => set({ salary: v })} format={money} />
          <Slider label="Employer matches 100% up to" value={s.matchCap} min={0} max={8} onChange={(v) => set({ matchCap: v })} format={(v) => v + "% of pay"} />
          <Slider label="Your age" value={s.age} min={20} max={64} onChange={(v) => set({ age: v, retireAge: Math.max(s.retireAge, v + 1) })} format={(v) => String(v)} />
          <Slider label="Retire at" value={s.retireAge} min={Math.max(55, s.age + 1)} max={75} onChange={(v) => set({ retireAge: v })} format={(v) => "Age " + v} />
          <Slider label="Already saved" value={s.balance} min={0} max={500000} step={1000} onChange={(v) => set({ balance: v })} format={money} />
        </>}
        chart={<div className="flex h-full flex-col">
          <div className="rounded-2xl bg-navy px-4 py-3 text-white">
            <div className="text-[13px] text-slate-300">Projected at age {s.retireAge}</div>
            <div className="num font-display text-3xl font-semibold">{money(r.final)}</div>
            <div className="text-[13px] text-slate-300">≈ {money(r.finalReal)} in today's buying power</div>
          </div>
          <div className="mt-2 min-h-0 flex-1">
            <ResponsiveContainer>
              <AreaChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#EEF2F7" vertical={false} />
                <XAxis dataKey="age" {...axis} />
                <YAxis tickFormatter={axisMoney} {...axis} width={56} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Age ${l}`} formatter={(v, n) => [money(Number(v)), n]} />
                <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => v === "Your money" ? `Your money ${compact(r.totalEmployee)}` : v === "Employer match" ? `Employer match ${compact(r.totalEmployer)}` : `Growth ${compact(r.totalGrowth + r.startBalance)}`} />
                <Area type="monotone" stackId="1" dataKey="employee" name="Your money" stroke="#0B2A45" fill="#0B2A45" fillOpacity={0.85} animationDuration={500} />
                <Area type="monotone" stackId="1" dataKey="employer" name="Employer match" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.85} animationDuration={500} />
                <Area type="monotone" stackId="1" dataKey="growth" name="Growth" stroke="#F5C000" fill="#F5C000" fillOpacity={0.75} animationDuration={500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>} />

      <Section n={3} kicker="Compare" title="Small changes, big differences">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="font-semibold">Compare contribution levels</div>
          <p className="text-[14px] text-slate-500">Same job, same match, same returns. Only the % changes.</p>
          <div className="mt-2 h-56">
            <ResponsiveContainer>
              <BarChart data={compare} margin={{ top: 22, right: 8, left: 8, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 13, fill: "#334155", fontWeight: 600 }} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [money(Number(v)), "At retirement"]} />
                <Bar dataKey="final" radius={[10, 10, 4, 4]} animationDuration={500}>
                  {compare.map((c) => <Cell key={c.label} fill={c.mine ? "#F5C000" : "#CBD5E1"} />)}
                  <LabelList dataKey="final" position="top" formatter={(v: unknown) => compact(Number(v))} style={{ fontSize: 13, fontWeight: 700, fill: "#0B2A45" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <div className="font-semibold">If you wait 10 years</div>
          <p className="text-[14px] text-slate-500">Starting from $0 at {s.contrib}%.</p>
          <div className="mt-2 h-56">
            <ResponsiveContainer>
              <BarChart data={wait} margin={{ top: 22, right: 8, left: 8, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 13, fill: "#334155", fontWeight: 600 }} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [money(Number(v)), "At retirement"]} />
                <Bar dataKey="final" radius={[10, 10, 4, 4]} animationDuration={500}>
                  {wait.map((c) => <Cell key={c.label} fill={c.c} />)}
                  <LabelList dataKey="final" position="top" formatter={(v: unknown) => compact(Number(v))} style={{ fontSize: 13, fontWeight: 700, fill: "#0B2A45" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      </Section>

      <Section n={4} kicker="What it means" title="Why do small changes matter so much?">
        <WhatItMeans ctx={{ page: "lesson", module: "401(k) Growth Simulator", inputs: { ...s, contribPct: s.contrib + "%", match: `${s.matchRate}% up to ${s.matchCap}% of pay` }, results: { projected: Math.round(r.final), todaysDollars: Math.round(r.finalReal), yourContributions: Math.round(r.totalEmployee), employerMatch: Math.round(r.totalEmployer), growth: Math.round(r.totalGrowth), byContribution: Object.fromEntries(compare.map((c) => [c.label, Math.round(c.final)])), startNow: Math.round(early.final), startIn10Years: Math.round(late.final), missedMatchThisYear: Math.round(missing) }, insights }}
          prompts={["Why does going from 5% to 10% make such a big difference?", "What is an employer match, really?", "Why does starting early matter?"]} />
      </Section>
      <Section n={5} kicker="Quick check" title="Test yourself">
        <Quiz id="k401" onComplete={finish} questions={[
          { q: "Your employer matches 100% up to 5% of pay. You contribute 3%. What happens?", options: ["You get the full match", "You leave part of the match unclaimed", "Your employer pays 5% anyway"], answer: 1, why: "You'd get 3% instead of 5%. The rest of the match is left behind." },
          { q: "Why does starting 10 years earlier matter so much?", options: ["Lower fees", "10 extra years of compound growth", "Higher contribution limits"], answer: 1, why: "Early dollars have the most time to earn returns on their returns." },
          { q: `The ${RULES.year} employee 401(k) limit (under age 50) is…`, options: [money(RULES.k401.employeeLimit), "$7,500", "$1,000,000"], answer: 0, why: `${money(RULES.k401.employeeLimit)} for ${RULES.year}. $7,500 is the IRA limit.` },
        ]} />
      </Section>
    </div>
  );
}
