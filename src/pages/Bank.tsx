import { motion } from "framer-motion";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useStore } from "../lib/store";
import { growMonthly } from "../lib/calc";
import { RULES } from "../lib/rules";
import { money, compact, axisMoney } from "../lib/format";
import { AskRipple, Card, Quiz, Section, tooltipStyle } from "../components/ui";
import { endLabel, axis } from "../components/Lesson";
import { useFinish } from "./ModuleFrame";

export default function Bank() {
  const { profile: p } = useStore();
  const finish = useFinish("bank");
  const name = p.name || "You";
  const his = p.name ? `${p.name}'s` : "Your";
  const has = p.name ? "has" : "have";
  const essentials = Math.max(500, Math.round((p.expenses * 0.85) / 100) * 100);
  const t3 = essentials * 3, t6 = essentials * 6;
  const saved = p.savings;
  const covered = saved / essentials;
  const scale = Math.max(t6, saved) * 1.05;
  const headline = saved >= t6 ? `${his} emergency fund is fully built: 6 months.` : saved >= t3 ? `${his} emergency fund covers 3 months. Next goal: 6 months.` : saved <= 0 ? `${name} ${has} no emergency fund yet.` : `${his} emergency fund isn't enough yet.`;

  const years = Math.max(5, Math.min(30, 67 - p.age));
  const start = Math.max(1000, saved);
  const rows = Array.from({ length: years + 1 }, (_, y) => ({
    year: y,
    compound: Math.round(growMonthly({ start, monthly: 0, annualRate: 0.04, years: y }).at(-1)!.balance),
    simple: Math.round(start * (1 + 0.04 * y)),
    regular: Math.round(growMonthly({ start, monthly: 0, annualRate: 0.005, years: y }).at(-1)!.balance),
  }));
  const last = rows[rows.length - 1];

  const insights = [
    `${his} essential bills are about ${money(essentials)} a month, so 3 months is ${money(t3)} and 6 months is ${money(t6)}.`,
    `${name} ${has} ${money(saved)} saved, about ${covered.toFixed(1)} months of essential bills.`,
    `Left alone for ${years} years, ${money(start)} grows to about ${money(last.compound)} at 4% compound interest, vs ${money(last.regular)} at 0.5%.`,
  ];

  return (
    <div>
      <Section n={1} kicker="Your cushion" title="Emergency fund">
        <Card>
          <div className="font-display text-2xl font-semibold text-navy">{headline}</div>
          <p className="mt-2 text-lg leading-relaxed text-slate-700">An emergency fund is money kept <b>only</b> for surprises, like a furnace that dies in January or a car repair. {his} essential bills are about <b>{money(essentials)}</b> a month, so the goal is <b>{money(t3)}</b> (3 months) first, then <b>{money(t6)}</b> (6 months).</p>
          <div className="relative mt-8 mb-10">
            <div className="h-10 overflow-hidden rounded-xl bg-slate-100">
              <motion.div className="flex h-10 items-center justify-end rounded-xl bg-emerald-500 pr-3 text-[15px] font-bold text-white num" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (saved / scale) * 100)}%` }}>
                {saved > 0 && `${money(saved)} saved`}
              </motion.div>
            </div>
            {[[t3, "3 months"], [t6, "6 months"]].map(([v, l]) => (
              <div key={l as string} className="absolute top-[-8px] flex h-[56px] flex-col items-center" style={{ left: `${((v as number) / scale) * 100}%`, transform: "translateX(-50%)" }}>
                <div className="h-14 w-0.5 bg-navy" />
                <div className="whitespace-nowrap text-center text-[13px] font-bold text-navy">{l}<br /><span className="num font-semibold text-slate-500">{money(v as number)}</span></div>
              </div>
            ))}
          </div>
          <p className="text-[15px] text-slate-600">Today: about <b>{covered.toFixed(1)} months</b> covered{saved < t3 ? `, ${money(t3 - saved)} short of 3 months` : ""}. Keep it in a savings or money market account, separate from checking.</p>
        </Card>
      </Section>

      <Section n={2} kicker="Is my money safe?" title="FDIC insurance">
        <Card>
          <p className="text-lg leading-relaxed text-slate-700">If an FDIC-insured bank fails, the <b>FDIC</b> protects deposits up to <b>{money(RULES.fdic.insuredPerDepositorPerBankPerCategory)}</b> per depositor, per bank, for each ownership category. {saved > 0 && <>So all of {his.toLowerCase() === "your" ? "your" : his} {money(saved)} is covered.</>} No depositor has lost a penny of FDIC-insured money since 1934.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 p-4"><div className="font-semibold text-emerald-800">✅ Covered</div><p className="mt-1 text-[15px] text-slate-700">Checking, savings, money market deposit accounts, CDs</p></div>
            <div className="rounded-2xl bg-orange-50 p-4"><div className="font-semibold text-orange-800">❌ Not covered</div><p className="mt-1 text-[15px] text-slate-700">Stocks, bonds, mutual funds, crypto, annuities</p></div>
          </div>
        </Card>
      </Section>

      <Section n={3} kicker="Money that grows itself" title="Compounding">
        <Card>
          <p className="text-lg leading-relaxed text-slate-700"><b>Compound interest</b> means earning interest on your savings <b>and</b> on the interest already earned. {his === "Your" ? "Your" : `${p.name}'s`} {money(start)}, left alone for {years} years:</p>
          <div className="mt-3 h-72 sm:h-80">
            <ResponsiveContainer>
              <LineChart data={rows} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#EEF2F7" vertical={false} />
                <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} {...axis} />
                <YAxis tickFormatter={axisMoney} {...axis} width={56} domain={[Math.floor(start * 0.9), "auto"]} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Year ${l}`} formatter={(v, n) => [money(Number(v)), n]} />
                <Line dataKey="compound" name="4% compound" stroke="#10B981" strokeWidth={3.5} dot={false} label={endLabel(rows.length, (v) => `4% compound: ${compact(v)}`, "#047857")} />
                <Line dataKey="simple" name="4% simple" stroke="#38BDF8" strokeWidth={2.5} dot={false} strokeDasharray="6 4" label={endLabel(rows.length, (v) => `4% simple: ${compact(v)}`, "#0369A1", { dy: 18 })} />
                <Line dataKey="regular" name="Regular 0.5%" stroke="#94A3B8" strokeWidth={2.5} dot={false} label={endLabel(rows.length, (v) => `0.5% account: ${compact(v)}`, "#475569", { dy: -10 })} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[12px] text-slate-500">Rates are examples. Banks set and change their own rates.</p>
        </Card>
      </Section>

      <Section n={4} kicker="Next Step explains" title="What does this mean for me?">
        <AskRipple ctx={{ page: "lesson", module: "Emergency fund, FDIC and compounding", inputs: { essentialsMonthly: essentials, saved }, results: { threeMonthGoal: t3, sixMonthGoal: t6, monthsCovered: Math.round(covered * 10) / 10, compound4pct: last.compound, simple4pct: last.simple, regular05pct: last.regular, years }, insights }}
          prompts={["How fast can I build my emergency fund?", "Is my money safe if the bank fails?", "How does compounding work?"]} />
      </Section>
      <Section n={5} kicker="Quick check" title="Test yourself">
        <Quiz id="bank" onComplete={finish} questions={[
          { q: "What is an emergency fund for?", options: ["Vacations", "Unexpected costs like a broken furnace or car repair", "Buying stocks"], answer: 1, why: "It's a cushion for surprises, so they don't turn into high-interest debt." },
          { q: "FDIC insurance protects deposits up to…", options: ["$25,000", money(RULES.fdic.insuredPerDepositorPerBankPerCategory) + " per depositor, per bank, per category", "Unlimited, including stocks"], answer: 1, why: "The standard amount is $250,000 per depositor, per insured bank, per ownership category. Stocks aren't covered." },
          { q: "Compound interest means…", options: ["Interest only on what you deposited", "Interest on your deposits AND on past interest", "A bank fee"], answer: 1, why: "Interest earns interest, which is why growth speeds up over time." },
        ]} />
      </Section>
    </div>
  );
}
