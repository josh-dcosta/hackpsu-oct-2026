import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSim, useStore } from "../lib/store";
import { futureCost, todaysDollars } from "../lib/calc";
import { money, axisMoney, pct } from "../lib/format";
import { AskRipple, Card, EstimateTag, Examples, NumberField, Quiz, ResetButton, Section, Slider, Stat, Takeaway, cx, tooltipStyle } from "../components/ui";
import { useFinish } from "../pages/ModuleFrame";

const ITEMS = [
  { id: "groceries", emoji: "🛒", label: "Groceries (family of 4) / mo", price: 1000, rate: 3 },
  { id: "rent", emoji: "🏠", label: "Housing / mo", price: 1250, rate: 3.5 },
  { id: "gas", emoji: "⛽", label: "Tank of gas", price: 50, rate: 3 },
  { id: "tuition", emoji: "🎓", label: "Year at a PA state university", price: 22000, rate: 4 },
  { id: "health", emoji: "🩺", label: "Health insurance / mo", price: 600, rate: 5 },
];
const NOW = new Date().getFullYear();

export default function Inflation() {
  const { simple } = useStore();
  const finish = useFinish("inflation");
  const [s, set, reset] = useSim("inflation", { item: "groceries", price: 150, rate: 3, years: 20 });
  const fut = futureCost(s.price, s.rate / 100, s.years);
  const pp = todaysDollars(100, s.rate / 100, s.years);
  const data = Array.from({ length: s.years + 1 }, (_, y) => ({ year: NOW + y, price: futureCost(s.price, s.rate / 100, y) }));
  const item = ITEMS.find((i) => i.id === s.item);
  const doubling = s.rate > 0 ? Math.log(2) / Math.log(1 + s.rate / 100) : Infinity;

  const insights = [
    `${item ? item.label : "This item"} costing ${money(s.price)} today could cost about ${money(fut)} in ${NOW + s.years} at ${s.rate}% inflation, which is ${((fut / s.price - 1) * 100).toFixed(0)}% more.`,
    `$100 in ${NOW + s.years} would only buy what about ${money(pp)} buys today.`,
    isFinite(doubling) ? `At ${s.rate}% a year, prices roughly double every ${doubling.toFixed(0)} years. That's compounding at work.` : "With 0% inflation, prices stay the same.",
  ];

  return (
    <div>
      <Section n={1} kicker="The idea" title="Prices creep up. Every year.">
        <Card>
          <p className="text-lg leading-relaxed text-slate-700">
            <b>Inflation</b> means things slowly get more expensive. A movie ticket cost about $4 in 1990. Today it's over $11.
            {simple ? " So the same dollar buys a little less each year." : " As the overall price level rises, each dollar's purchasing power falls. Causes include rising demand, higher production costs, and growth in the money supply."}
          </p>
          <p className="mt-3 text-lg leading-relaxed text-slate-700">
            And it <b>compounds</b>. This year's increase is added on top of last year's higher prices, so it works like a multiplier on every future expense.
          </p>
          {!simple && <div className="mt-4 rounded-2xl bg-slate-50 p-4 font-mono text-[15px] text-navy">Future Cost = Present Cost × (1 + Inflation Rate)<sup>Years</sup></div>}
        </Card>
      </Section>

      <Section n={2} practice kicker="Real-world simulation · ready for you" title="The Inflation Time Machine">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {ITEMS.map((i) => (
                <button key={i.id} onClick={() => set({ item: i.id, price: i.price, rate: i.rate })} aria-pressed={s.item === i.id}
                  className={cx("rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition", s.item === i.id ? "bg-navy text-white ring-navy" : "bg-white ring-slate-200 hover:ring-emerald-400")}>{i.emoji} {i.label}</button>
              ))}
            </div>
            <ResetButton onClick={reset} />
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div>
              <NumberField label="Price today" value={s.price} onChange={(v) => set({ price: v, item: "custom" })} step={10} />
              <div className="mt-3"><Slider label="Inflation per year" value={s.rate} min={0} max={10} step={0.5} onChange={(v) => set({ rate: v })} format={(v) => v + "%"} help="The U.S. long-run average is roughly 3%. 2022 peaked near 9%." /></div>
              <Slider label="Travel to the year" value={s.years} min={1} max={40} onChange={(v) => set({ years: v })} format={(v) => String(NOW + v)} />
            </div>
            <div className="grid grid-cols-2 gap-3 content-start">
              <Stat label={`Price in ${NOW}`} value={money(s.price)} />
              <Stat label={`Price in ${NOW + s.years}`} value={money(fut)} tone="coral" sub={`+${((fut / s.price - 1) * 100).toFixed(0)}%`} />
              <div className="col-span-2"><Stat label={`What $100 buys in ${NOW + s.years}, in today's dollars`} value={money(pp)} tone="navy" big sub={`Your dollar loses ${pct(1 - pp / 100, 0)} of its buying power`} /></div>
            </div>
          </div>
          <div className="mt-6 h-60">
            <ResponsiveContainer>
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs><linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F97361" stopOpacity={0.35} /><stop offset="1" stopColor="#F97361" stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid stroke="#EEF2F7" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={axisMoney} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={56} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [money(Number(v)), "Price"]} />
                <Area type="monotone" dataKey="price" stroke="#F97361" strokeWidth={3} fill="url(#gi)" animationDuration={500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2"><EstimateTag>Assumes a steady inflation rate. Real inflation changes every year.</EstimateTag></div>
        </Card>

        <Card className="mt-4">
          <div className="font-semibold">Watch $100 shrink</div>
          <p className="text-[15px] text-slate-500">What a $100 bill can buy at {s.rate}% inflation, shown in today's dollars.</p>
          <div className="mt-4 space-y-3">
            {[0, 10, 20, 30].map((y) => {
              const v = todaysDollars(100, s.rate / 100, y);
              return (
                <div key={y} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-sm font-semibold text-slate-500">{y === 0 ? "Today" : `+${y} yrs`}</span>
                  <div className="h-11 flex-1 rounded-xl bg-slate-100">
                    <motion.div className="flex h-11 items-center justify-end rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-400 pr-3 font-bold text-white num" initial={false} animate={{ width: `${v}%` }} transition={{ type: "spring", stiffness: 90, damping: 18 }}>
                      {money(v)}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </Section>

      <Section n={3} kicker="Next Step explains" title="What does this mean for you?">
        <AskRipple ctx={{ page: "lesson", module: "Inflation Time Machine", inputs: { item: item?.label ?? "custom item", priceToday: s.price, inflationRate: s.rate + "%", years: s.years }, results: { futurePrice: Math.round(fut), hundredDollarsWorthInTodaysDollars: Math.round(pp), yearsToDouble: isFinite(doubling) ? Math.round(doubling) : null }, insights }}
          prompts={["Why does inflation compound?", "How can I protect my savings from inflation?", "Is some inflation normal?"]} />
      </Section>


      <Section n={4} kicker="Quick check" title="Test yourself">
        <Quiz id="inflation" onComplete={finish} questions={[
          { q: "If inflation is 3% a year, what happens to $100 sitting in a drawer?", options: ["It grows", "It buys less each year", "Nothing changes"], answer: 1, why: "The bill still says $100, but rising prices mean it buys less." },
          { q: "At about 3% inflation, roughly how long until prices double?", options: ["About 10 years", "About 24 years", "About 50 years"], answer: 1, why: "Compounding at 3% doubles prices in about 24 years (72 ÷ 3)." },
          { q: "Which usually needs the biggest inflation cushion?", options: ["College tuition and healthcare", "A tank of gas next week", "A movie ticket"], answer: 0, why: "Tuition and healthcare have often risen faster than general inflation." },
        ]} />
      </Section>
      <Takeaway>Your money needs to grow at least as fast as prices just to stand still. Plan for future prices, not today's.</Takeaway>
    </div>
  );
}
