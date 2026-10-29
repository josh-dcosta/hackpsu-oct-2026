import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim } from "../lib/store";
import { futureCost, todaysDollars } from "../lib/calc";
import { money, axisMoney } from "../lib/format";
import { WhatItMeans, NumberField, Quiz, Section, Slider, cx, tooltipStyle } from "../components/ui";
import { Idea, Simulator, endLabel, axis } from "../components/Lesson";
import { useFinish } from "../pages/ModuleFrame";

const ITEMS = [
  { id: "tuition", emoji: "🎓", label: "Year at Penn State", price: 22000, rate: 4 },
  { id: "health", emoji: "🩺", label: "Health insurance / mo", price: 600, rate: 5 },
  { id: "groceries", emoji: "🛒", label: "Groceries / mo", price: 1000, rate: 3 },
  { id: "rent", emoji: "🏠", label: "Housing / mo", price: 1250, rate: 3.5 },
  { id: "gas", emoji: "⛽", label: "Tank of gas", price: 50, rate: 3 },
];
const NOW = new Date().getFullYear();

export default function Inflation() {
  const finish = useFinish("inflation");
  const [s, set, reset] = useSim("inflation", { item: "groceries", price: 1000, rate: 3, years: 20 });
  const fut = futureCost(s.price, s.rate / 100, s.years);
  const pp = todaysDollars(100, s.rate / 100, s.years);
  const data = Array.from({ length: s.years + 1 }, (_, y) => ({ year: NOW + y, price: Math.round(futureCost(s.price, s.rate / 100, y)) }));
  const item = ITEMS.find((i) => i.id === s.item);
  const doubling = s.rate > 0 ? Math.log(2) / Math.log(1 + s.rate / 100) : Infinity;
  const insights = [
    `${item ? item.label : "This item"} costing ${money(s.price)} today could cost about ${money(fut)} in ${NOW + s.years} at ${s.rate}% inflation.`,
    `$100 in ${NOW + s.years} would only buy what about ${money(pp)} buys today.`,
    isFinite(doubling) ? `At ${s.rate}% a year, prices roughly double every ${doubling.toFixed(0)} years.` : "With 0% inflation, prices stay the same.",
  ];

  return (
    <div>
      <Idea title="Prices creep up. Every year.">
        <p><b>Inflation</b> means things slowly get more expensive, so the same dollar buys a little less each year. And it <b>compounds</b>: each year's increase lands on top of last year's higher prices.</p>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-[14px] font-semibold text-slate-600">Watch $100 shrink at 3% a year</div>
          <div className="mt-2 space-y-1.5">
            {[0, 10, 20, 30].map((y) => {
              const v = todaysDollars(100, 0.03, y);
              return (
                <div key={y} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 text-[13px] font-semibold text-slate-500">{y === 0 ? "Today" : `+${y} yrs`}</span>
                  <div className="h-7 flex-1 rounded-lg bg-white">
                    <motion.div className="flex h-7 items-center justify-end rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-300 pr-2 text-[13px] font-bold text-navy num" initial={{ width: 0 }} animate={{ width: `${v}%` }}>{money(v)}</motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Idea>

      <Simulator title="The Inflation Time Machine" onReset={reset}
        note="Assumes a steady inflation rate. Real inflation changes every year."
        controls={<>
          <div className="flex flex-wrap gap-2">
            {ITEMS.map((i) => (
              <button key={i.id} onClick={() => set({ item: i.id, price: i.price, rate: i.rate })} aria-pressed={s.item === i.id}
                className={cx("rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1 transition", s.item === i.id ? "bg-navy text-white ring-navy" : "bg-white ring-slate-200 hover:ring-emerald-400")}>{i.emoji} {i.label}</button>
            ))}
          </div>
          <div className="mt-3"><NumberField label="Price today" value={s.price} onChange={(v) => set({ price: v, item: "custom" })} step={10} /></div>
          <div className="mt-2"><Slider label="Inflation per year" value={s.rate} min={0} max={10} step={0.5} onChange={(v) => set({ rate: v })} format={(v) => v + "%"} /></div>
          <Slider label="Travel to the year" value={s.years} min={1} max={40} onChange={(v) => set({ years: v })} format={(v) => String(NOW + v)} />
        </>}
        chart={
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 30, right: 12, left: 0, bottom: 0 }}>
              <defs><linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F97361" stopOpacity={0.35} /><stop offset="1" stopColor="#F97361" stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="year" {...axis} />
              <YAxis tickFormatter={axisMoney} {...axis} width={56} domain={[0, "auto"]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [money(Number(v)), "Price"]} />
              <Area type="monotone" dataKey="price" stroke="#F97361" strokeWidth={3} fill="url(#gi)" animationDuration={500}
                label={endLabel(data.length, (v) => `${NOW + s.years}: ${money(v)} (+${Math.round((fut / s.price - 1) * 100)}%)`, "#C2410C")} />
              <Area type="monotone" dataKey="price" stroke="none" fill="none" isAnimationActive={false} tooltipType="none" activeDot={false}
                label={endLabel(data.length, (v) => `Today: ${money(v)}`, "#0B2A45", { at: "start", dy: -12 })} />
            </AreaChart>
          </ResponsiveContainer>
        } />

      <Section n={3} kicker="What it means" title="What does this mean for you?">
        <WhatItMeans ctx={{ page: "lesson", module: "Inflation Time Machine", inputs: { item: item?.label ?? "custom item", priceToday: s.price, inflationRate: s.rate + "%", years: s.years }, results: { futurePrice: Math.round(fut), hundredDollarsWorthInTodaysDollars: Math.round(pp), yearsToDouble: isFinite(doubling) ? Math.round(doubling) : null }, insights }}
          prompts={["Why does inflation compound?", "How can I protect my savings from inflation?", "Is some inflation normal?"]} />
      </Section>
      <Section n={4} kicker="Quick check" title="Test yourself">
        <Quiz id="inflation" onComplete={finish} questions={[
          { q: "If inflation is 3% a year, what happens to $100 sitting in a drawer?", options: ["It grows", "It buys less each year", "Nothing changes"], answer: 1, why: "The bill still says $100, but rising prices mean it buys less." },
          { q: "At about 3% inflation, roughly how long until prices double?", options: ["About 10 years", "About 24 years", "About 50 years"], answer: 1, why: "Compounding at 3% doubles prices in about 24 years (72 ÷ 3)." },
          { q: "Which usually needs the biggest inflation cushion?", options: ["College tuition and healthcare", "A tank of gas next week", "A movie ticket"], answer: 0, why: "Tuition and healthcare have often risen faster than general inflation." },
        ]} />
      </Section>
    </div>
  );
}
