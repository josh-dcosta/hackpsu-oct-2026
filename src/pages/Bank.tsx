import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, FastForward, ShieldCheck, Wallet, PiggyBank } from "lucide-react";
import { useSim, useStore } from "../lib/store";
import { growMonthly } from "../lib/calc";
import { RULES } from "../lib/rules";
import { money, axisMoney } from "../lib/format";
import { AskRipple, Button, Card, EstimateTag, Examples, NumberField, Quiz, ResetButton, Section, Segmented, Slider, Stat, Takeaway, tooltipStyle, cx } from "../components/ui";
import { useFinish } from "./ModuleFrame";

type Tx = { id: number; m: number; desc: string; acct: "Checking" | "Savings"; amt: number; bal: number };
const START = { checking: 3000, savings: 2000, apy: 4, month: 0, interest: 0, tx: [] as Tx[], hist: [{ m: 0, savings: 2000, checking: 3000 }] };
const monthLabel = (m: number) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + m); return d.toLocaleDateString(undefined, { month: "short", year: "numeric" }); };

function Count({ value }: { value: number }) {
  const [v, setV] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now(), a = from.current, b = value;
    let raf = 0;
    const tick = (t: number) => { const k = Math.min(1, (t - start) / 700); const e = 1 - Math.pow(1 - k, 3); setV(a + (b - a) * e); if (k < 1) raf = requestAnimationFrame(tick); else from.current = b; };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="num">{money(v, { cents: true })}</span>;
}

export default function Bank() {
  const { badge, award, simple } = useStore();
  const finish = useFinish("bank");
  const [s, set, reset] = useSim("bank", START);
  const [action, setAction] = useState<"deposit" | "withdraw" | "transfer">("deposit");
  const [amt, setAmt] = useState(200);
  const [acct, setAcct] = useState<"Checking" | "Savings">("Checking");
  const [dir, setDir] = useState<"c2s" | "s2c">("c2s");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const tx = s.tx as Tx[];
  const id = () => Date.now() + Math.random();

  const flash = (ok: boolean, text: string) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 2600); };
  const doAction = () => {
    if (!(amt > 0)) return flash(false, "Enter an amount above $0.");
    let { checking, savings } = s; const add: Tx[] = [];
    if (action === "deposit") {
      if (acct === "Checking") checking += amt; else savings += amt;
      add.push({ id: id(), m: s.month, desc: "Deposit", acct, amt, bal: acct === "Checking" ? checking : savings });
    } else if (action === "withdraw") {
      const have = acct === "Checking" ? checking : savings;
      if (amt > have) return flash(false, `Not enough in ${acct}. Available: ${money(have, { cents: true })}.`);
      if (acct === "Checking") checking -= amt; else savings -= amt;
      add.push({ id: id(), m: s.month, desc: "Withdrawal", acct, amt: -amt, bal: acct === "Checking" ? checking : savings });
    } else {
      const fromC = dir === "c2s"; const have = fromC ? checking : savings;
      if (amt > have) return flash(false, `Not enough in ${fromC ? "Checking" : "Savings"}.`);
      if (fromC) { checking -= amt; savings += amt; } else { savings -= amt; checking += amt; }
      add.push({ id: id(), m: s.month, desc: `Transfer ${fromC ? "to Savings" : "from Savings"}`, acct: "Checking", amt: fromC ? -amt : amt, bal: checking });
      add.push({ id: id(), m: s.month, desc: `Transfer ${fromC ? "from Checking" : "to Checking"}`, acct: "Savings", amt: fromC ? amt : -amt, bal: savings });
    }
    set({ checking, savings, tx: [...add.reverse(), ...tx].slice(0, 80) });
    flash(true, "Done! ✓");
  };

  const advance = (n: number) => {
    const r = Math.pow(1 + s.apy / 100, 1 / 12) - 1;
    let sv = s.savings, it = s.interest; const add: Tx[] = []; const hist = [...s.hist];
    for (let i = 1; i <= n; i++) {
      const int = sv * r; sv += int; it += int;
      if (n <= 12) add.unshift({ id: id(), m: s.month + i, desc: "Interest earned", acct: "Savings", amt: int, bal: sv });
      hist.push({ m: s.month + i, savings: sv, checking: s.checking });
    }
    if (n > 12) add.unshift({ id: id(), m: s.month + n, desc: `Interest earned (${n} months)`, acct: "Savings", amt: sv - s.savings, bal: sv });
    set({ savings: sv, interest: it, month: s.month + n, tx: [...add, ...tx].slice(0, 80), hist: hist.slice(-241) });
    award(5, "Fast-forwarded time", "ff-" + Math.min(3, Math.floor((s.month + n) / 12)));
    if (s.month + n >= 12) badge("compound");
  };

  const years = s.month / 12;
  const realSavings = s.savings / Math.pow(1.03, years);
  const typeCompare = (() => {
    const types = [{ k: "Checking", r: 0.0001 }, { k: "Traditional savings", r: 0.004 }, { k: "High-yield savings", r: 0.04 }, { k: "5-yr CD", r: 0.042 }];
    const rows = Array.from({ length: 11 }, (_, y) => ({ year: y } as Record<string, number>));
    types.forEach((t) => growMonthly({ start: 5000, monthly: 0, annualRate: t.r, years: 10 }).forEach((g, i) => (rows[i][t.k] = g.balance)));
    return rows;
  })();
  const simpleVsCompound = Array.from({ length: 31 }, (_, y) => ({ year: y, Simple: 1000 * (1 + 0.05 * y), Compound: 1000 * Math.pow(1.05, y) }));
  const insights = [
    `Your pretend savings of ${money(s.savings)} earn ${s.apy}% APY, about ${money(s.savings * (Math.pow(1 + s.apy / 100, 1 / 12) - 1), { cents: true })} next month.`,
    s.month > 0 ? `After ${s.month} months you've earned ${money(s.interest, { cents: true })} in interest without lifting a finger. That's compound interest.` : "Tap 'fast-forward' to watch interest pile up month by month.",
    s.month > 0 ? `With 3% inflation, your savings would buy what ${money(realSavings)} buys today.` : "Remember: if inflation beats your interest rate, buying power still shrinks.",
  ];

  return (
    <div>
      <div className="flex items-start gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-100 text-3xl">🏦</span>
        <div>
          <div className="text-[13px] font-semibold text-slate-500">Lesson D · Pretend money only</div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold">Virtual Bank</h1>
          <p className="mt-1 text-lg text-slate-500">You start with $5,000 of fictional money. Move it around, then fast-forward time.</p>
        </div>
      </div>

      {/* Bank app */}
      <div className="mt-6 overflow-hidden rounded-[2rem] bg-white shadow-card ring-1 ring-slate-200">
        <div className="hero-dark p-5 sm:p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[13px] text-slate-300"><ShieldCheck size={15} className="text-emerald-400" /> Ripple Bank (fictional) · {monthLabel(s.month)}</div>
            <ResetButton dark onClick={reset} />
          </div>
          <div className="mt-2 text-[13px] text-slate-300">Total balance</div>
          <div className="font-display text-4xl sm:text-5xl font-semibold"><Count value={s.checking + s.savings} /></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/[.07] p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-[13px] text-slate-300"><Wallet size={16} /> Checking · 0.01% APY</div>
              <div className="mt-1 text-2xl font-bold"><Count value={s.checking} /></div>
              <div className="text-[12px] text-slate-400">For everyday spending & bills</div>
            </div>
            <div className="rounded-2xl bg-emerald-500/15 p-4 ring-1 ring-emerald-400/30">
              <div className="flex items-center gap-2 text-[13px] text-emerald-200"><PiggyBank size={16} /> Savings · {s.apy}% APY</div>
              <div className="mt-1 text-2xl font-bold"><Count value={s.savings} /></div>
              <div className="text-[12px] text-emerald-200/80">Interest earned so far: {money(s.interest, { cents: true })}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
          <div>
            <Segmented label="Action" value={action} onChange={setAction} options={[{ value: "deposit", label: "Deposit" }, { value: "withdraw", label: "Withdraw" }, { value: "transfer", label: "Transfer" }]} />
            <div className="mt-4 space-y-3">
              <NumberField label="Amount" value={amt} onChange={setAmt} step={50} id="bank-amt" />
              <div className="flex flex-wrap gap-2">{[50, 200, 500, 1000].map((v) => <button key={v} onClick={() => setAmt(v)} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold hover:bg-slate-200">{money(v)}</button>)}</div>
              {action !== "transfer" ? (
                <Segmented label="Account" value={acct} onChange={setAcct} options={[{ value: "Checking", label: "Checking" }, { value: "Savings", label: "Savings" }]} />
              ) : (
                <Segmented label="Direction" value={dir} onChange={setDir} options={[{ value: "c2s", label: "Checking → Savings" }, { value: "s2c", label: "Savings → Checking" }]} />
              )}
              <Button onClick={doAction} className="w-full">
                {action === "deposit" ? <ArrowDownLeft size={18} /> : action === "withdraw" ? <ArrowUpRight size={18} /> : <ArrowLeftRight size={18} />}
                {action === "deposit" ? `Deposit ${money(amt)}` : action === "withdraw" ? `Withdraw ${money(amt)}` : `Transfer ${money(amt)}`}
              </Button>
              <AnimatePresence>{msg && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" className={cx("rounded-xl px-3 py-2 text-sm font-semibold", msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700")}>{msg.text}</motion.div>}</AnimatePresence>
            </div>
          </div>
          <div>
            <div className="font-semibold">⏩ Time machine</div>
            <Slider label="Savings interest rate (APY)" value={s.apy} min={0} max={6} step={0.25} onChange={(v) => set({ apy: v })} format={(v) => v + "%"} />
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[[1, "+1 month"], [12, "+1 year"], [60, "+5 years"]].map(([n, l]) => (
                <Button key={l} variant="dark" onClick={() => advance(n as number)} className="px-2"><FastForward size={16} />{l}</Button>
              ))}
            </div>
            <div className="mt-3 h-36">
              <ResponsiveContainer>
                <AreaChart data={s.hist} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <XAxis dataKey="m" hide /><YAxis hide domain={["dataMin - 50", "dataMax + 50"]} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => monthLabel(Number(l))} formatter={(v) => [money(Number(v), { cents: true }), "Savings"]} />
                  <Area dataKey="savings" stroke="#10B981" strokeWidth={2.5} fill="#10B981" fillOpacity={0.15} animationDuration={500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Time passed" value={`${Math.floor(s.month / 12)}y ${s.month % 12}m`} />
              <Stat label="Savings in today's $" value={money(realSavings)} tone="sky" sub="at 3% inflation" />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-5 sm:p-6">
          <div className="font-semibold">Transaction history</div>
          {tx.length === 0 ? <p className="mt-2 text-slate-500">No transactions yet. Try a deposit or fast-forward time.</p> : (
            <div className="mt-3 max-h-72 overflow-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="sticky top-0 bg-white text-[12px] uppercase tracking-wide text-slate-400"><tr><th className="py-2">Date</th><th>Description</th><th className="hidden sm:table-cell">Account</th><th className="text-right">Amount</th><th className="hidden text-right sm:table-cell">Balance</th></tr></thead>
                <tbody>
                  {tx.map((t) => (
                    <motion.tr key={t.id} initial={{ opacity: 0, backgroundColor: "#ECFDF5" }} animate={{ opacity: 1, backgroundColor: "#FFFFFF" }} className="border-t border-slate-100">
                      <td className="py-2.5 text-slate-500 whitespace-nowrap">{monthLabel(t.m)}</td><td className="font-medium">{t.desc}</td><td className="hidden text-slate-500 sm:table-cell">{t.acct}</td>
                      <td className={cx("text-right font-semibold num", t.amt >= 0 ? "text-emerald-600" : "text-navy")}>{t.amt >= 0 ? "+" : "−"}{money(Math.abs(t.amt), { cents: true })}</td>
                      <td className="hidden text-right text-slate-500 num sm:table-cell">{money(t.bal, { cents: true })}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2"><EstimateTag>Fictional bank, fictional money. Real rates vary and can change.</EstimateTag></div>

      <Section kicker="Learn" title="Banking basics">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="font-semibold">Simple vs. compound interest</div>
            <p className="text-[15px] text-slate-600">$1,000 at 5% for 30 years. Simple interest pays only on the original $1,000. Compound interest also pays on past interest.</p>
            <div className="mt-3 h-48">
              <ResponsiveContainer>
                <LineChart data={simpleVsCompound} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#EEF2F7" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={axisMoney} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} width={48} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Year ${l}`} formatter={(v, n) => [money(Number(v)), n]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line dataKey="Simple" stroke="#94A3B8" strokeWidth={2.5} dot={false} />
                  <Line dataKey="Compound" stroke="#10B981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[14px] text-slate-600">After 30 years: <b>{money(2500)}</b> simple vs. <b>{money(1000 * Math.pow(1.05, 30))}</b> compound.</p>
          </Card>
          <Card>
            <div className="font-semibold">Comparing account types</div>
            <p className="text-[15px] text-slate-600">$5,000 left alone for 10 years at typical example rates.</p>
            <div className="mt-3 h-48">
              <ResponsiveContainer>
                <LineChart data={typeCompare} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#EEF2F7" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={axisMoney} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} width={48} domain={[4800, "auto"]} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Year ${l}`} formatter={(v, n) => [money(Number(v)), n]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line dataKey="Checking" stroke="#94A3B8" strokeWidth={2} dot={false} />
                  <Line dataKey="Traditional savings" stroke="#38BDF8" strokeWidth={2} dot={false} />
                  <Line dataKey="High-yield savings" stroke="#10B981" strokeWidth={3} dot={false} />
                  <Line dataKey="5-yr CD" stroke="#6366F1" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[13px] text-slate-500">CDs lock your money for a set term; withdrawing early usually costs a penalty.</p>
          </Card>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["💳 Checking vs. savings", "Checking is for daily spending, with easy access and little interest. Savings is for money you're setting aside, and it earns more."],
            ["📊 APY vs. APR", simple ? "APY is what savings actually earn in a year, including compounding. APR is the yearly rate on loans, before compounding." : "APY = (1 + APR/n)ⁿ − 1. Compare APYs for savings and APRs for borrowing."],
            ["🛡️ FDIC insurance", `Deposits at FDIC-insured banks are protected up to ${money(RULES.fdic.insuredPerDepositorPerBankPerCategory)} per depositor, per bank, per ownership category. Stocks and crypto aren't covered.`],
            ["🛟 Emergency fund", "Keep 3–6 months of essential expenses in savings, so a surprise bill doesn't become debt."],
          ].map(([t, d]) => <Card key={t} className="p-4 sm:p-5"><div className="font-semibold">{t}</div><p className="mt-1 text-[14px] text-slate-600">{d}</p></Card>)}
        </div>
      </Section>

      <Section kicker="Ripple explains" title="What just happened to my money?">
        <AskRipple ctx={{ page: "virtual bank", module: "Virtual Bank", inputs: { apy: s.apy + "%", monthsElapsed: s.month }, results: { checking: Math.round(s.checking * 100) / 100, savings: Math.round(s.savings * 100) / 100, interestEarned: Math.round(s.interest * 100) / 100, savingsInTodaysDollarsAt3pctInflation: Math.round(realSavings) }, insights }}
          prompts={["How does compound interest work here?", "What's the difference between APY and APR?", "Is my money safe in a bank?"]} />
      </Section>
      <Section kicker="Real life" title="Everyday banking moves">
        <Examples items={[
          { emoji: "🔁", title: "Pay yourself first", text: "Set an automatic transfer to savings on payday, before you have a chance to spend it." },
          { emoji: "🔎", title: "Shop for APY", text: "Online banks often pay much higher savings rates than big branch banks. Check that they're FDIC-insured." },
          { emoji: "🚫", title: "Avoid fees", text: "Overdraft and monthly fees can wipe out any interest you earn. Many accounts waive them." },
        ]} />
      </Section>
      <Section kicker="Quick check" title="Test yourself">
        <Quiz id="bank" onComplete={finish} questions={[
          { q: "When comparing savings accounts, which number should you compare?", options: ["APR", "APY", "Routing number"], answer: 1, why: "APY includes compounding, so it shows what you'll actually earn." },
          { q: "FDIC insurance covers deposits up to…", options: ["$25,000", money(RULES.fdic.insuredPerDepositorPerBankPerCategory) + " per depositor, per bank, per category", "Unlimited"], answer: 1, why: "The standard insurance amount is $250,000 per depositor, per insured bank, per ownership category." },
          { q: "Compound interest means…", options: ["Interest only on what you deposited", "Interest on your deposits AND on past interest", "A bank fee"], answer: 1, why: "Interest earns interest, which is why growth speeds up over time." },
        ]} />
      </Section>
      <Takeaway>Keep spending money in checking, park your cushion in a high-yield savings account, and let compound interest quietly work.</Takeaway>
    </div>
  );
}
