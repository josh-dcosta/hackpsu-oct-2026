import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, FastForward, ShieldCheck, Wallet, PiggyBank } from "lucide-react";
import { useSim, useStore } from "../lib/store";
import { growMonthly, emergencyFund } from "../lib/calc";
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
  // Compounding demo with Dave's own savings: 17 years until retirement
  const compoundRows = Array.from({ length: 18 }, (_, y) => ({
    year: y,
    "High-yield 4% (compound)": growMonthly({ start: 4000, monthly: 0, annualRate: 0.04, years: y }).at(-1)!.balance,
    "4% simple interest": 4000 * (1 + 0.04 * y),
    "Regular bank 0.5%": growMonthly({ start: 4000, monthly: 0, annualRate: 0.005, years: y }).at(-1)!.balance,
  }));
  const lastC = compoundRows[compoundRows.length - 1];
  const ef = emergencyFund({ essentials: 3000, targetMonths: 3, saved: s.savings, monthlySave: 150 });
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
          <p className="mt-1 text-lg text-slate-500">Dave's $6,000 cushion, in pretend money: $2,000 in checking and $4,000 in savings. Move it around, then fast-forward time.</p>
        </div>
      </div>

      {/* Bank app */}
      <div className="mt-6 overflow-hidden rounded-[2rem] bg-white shadow-card ring-1 ring-slate-200">
        <div className="hero-dark p-5 sm:p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[13px] text-slate-300"><ShieldCheck size={15} className="text-emerald-400" /> Next Step Bank (fictional) · {monthLabel(s.month)}</div>
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

      <Section n={1} kicker="Your safety net" title="Emergency fund">
        <Card>
          <p className="text-lg leading-relaxed text-slate-700">An <b>emergency fund</b> is money set aside <b>only</b> for surprises, like a furnace that dies in January, a car repair, or fewer hours over the summer. It keeps a bad week from turning into credit-card debt at 22% interest.</p>
          <p className="mt-3 text-lg leading-relaxed text-slate-700">A common goal is <b>3–6 months of essential expenses</b>, kept in savings where it's safe and easy to reach. It's not meant to grow fast. It's meant to be there.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Stat label="Dave's essentials" value={money(3000) + "/mo"} sub="Mortgage, food, utilities, insurance" />
            <Stat label="3-month goal" value={money(ef.target)} tone="sky" />
            <Stat label="In savings now" value={money(s.savings)} tone="green" sub={ef.gap === 0 ? "Goal reached! 🎉" : `${money(ef.gap)} to go · ~${ef.months} months at $150/mo`} />
          </div>
          <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-100"><motion.div className="h-4 rounded-full bg-emerald-500" animate={{ width: `${ef.progress * 100}%` }} /></div>
          <p className="mt-2 text-[14px] text-slate-500">Try it: move money from Checking to Savings above and watch the bar fill.</p>
        </Card>
      </Section>

      <Section n={2} kicker="Is my money safe?" title="FDIC insurance">
        <Card>
          <p className="text-lg leading-relaxed text-slate-700">If an FDIC-insured bank fails, the U.S. government's <b>FDIC</b> protects your deposits up to <b>{money(RULES.fdic.insuredPerDepositorPerBankPerCategory)}</b> per depositor, per bank, for each ownership category. Since the FDIC began in 1934, no depositor has lost a penny of FDIC-insured funds.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 p-5">
              <div className="font-semibold text-emerald-800">✅ Covered</div>
              <ul className="mt-2 space-y-1 text-[15px] text-slate-700"><li>Checking accounts</li><li>Savings & high-yield savings accounts</li><li>Money market deposit accounts</li><li>Certificates of deposit (CDs)</li></ul>
            </div>
            <div className="rounded-2xl bg-orange-50 p-5">
              <div className="font-semibold text-orange-800">❌ Not covered</div>
              <ul className="mt-2 space-y-1 text-[15px] text-slate-700"><li>Stocks, bonds & mutual funds</li><li>Crypto</li><li>Annuities & life insurance</li><li>Safe deposit box contents</li></ul>
            </div>
          </div>
          <p className="mt-3 text-[14px] text-slate-500">Before opening an account, look for "Member FDIC" or check the bank with the FDIC's BankFind tool at fdic.gov. Credit unions have similar protection through the NCUA.</p>
        </Card>
      </Section>

      <Section n={3} kicker="Money that grows itself" title="Compounding">
        <Card>
          <p className="text-lg leading-relaxed text-slate-700"><b>Compound interest</b> means you earn interest on your savings <b>and</b> on the interest you've already earned. Like a snowball rolling downhill, it starts small and speeds up over time.</p>
          <p className="mt-2 text-[15px] text-slate-600">Dave's {money(4000)} in savings over the 17 years until he turns 67, left alone:</p>
          <div className="mt-3 h-60">
            <ResponsiveContainer>
              <LineChart data={compoundRows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#EEF2F7" vertical={false} />
                <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={axisMoney} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} width={48} domain={[3800, "auto"]} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Year ${l}`} formatter={(v, n) => [money(Number(v)), n]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="High-yield 4% (compound)" stroke="#10B981" strokeWidth={3} dot={false} />
                <Line dataKey="4% simple interest" stroke="#38BDF8" strokeWidth={2.5} dot={false} strokeDasharray="6 4" />
                <Line dataKey="Regular bank 0.5%" stroke="#94A3B8" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Stat label="Regular bank 0.5%" value={money(lastC["Regular bank 0.5%"])} />
            <Stat label="4% simple" value={money(lastC["4% simple interest"])} tone="sky" />
            <Stat label="4% compound" value={money(lastC["High-yield 4% (compound)"])} tone="green" />
          </div>
          <p className="mt-3 text-[14px] text-slate-500">Try it: set the savings rate above to 4% and tap "+5 years" to watch compounding happen in your pretend account.</p>
        </Card>
      </Section>

      <Section kicker="Next Step explains" title="What just happened to my money?">
        <AskRipple ctx={{ page: "virtual bank", module: "Virtual Bank: emergency fund, FDIC, compounding", inputs: { apy: s.apy + "%", monthsElapsed: s.month, essentialsMonthly: 3000, emergencyFundGoal: ef.target }, results: { checking: Math.round(s.checking * 100) / 100, savings: Math.round(s.savings * 100) / 100, interestEarned: Math.round(s.interest * 100) / 100, emergencyFundProgressPct: Math.round(ef.progress * 100), fourThousandAfter17yrs: { regularBank: Math.round(lastC["Regular bank 0.5%"]), simple4pct: Math.round(lastC["4% simple interest"]), compound4pct: Math.round(lastC["High-yield 4% (compound)"]) } }, insights }}
          prompts={["How big should Dave's emergency fund be?", "Is our money safe if the bank fails?", "How does compounding work here?"]} />
      </Section>
      <Section kicker="Quick check" title="Test yourself">
        <Quiz id="bank" onComplete={finish} questions={[
          { q: "What is an emergency fund for?", options: ["Vacations", "Unexpected costs like a broken furnace or car repair", "Buying stocks"], answer: 1, why: "It's a cushion for surprises, so they don't turn into high-interest debt." },
          { q: "FDIC insurance protects deposits up to…", options: ["$25,000", money(RULES.fdic.insuredPerDepositorPerBankPerCategory) + " per depositor, per bank, per category", "Unlimited, including stocks"], answer: 1, why: "The standard amount is $250,000 per depositor, per insured bank, per ownership category. Stocks aren't covered." },
          { q: "Compound interest means…", options: ["Interest only on what you deposited", "Interest on your deposits AND on past interest", "A bank fee"], answer: 1, why: "Interest earns interest, which is why growth speeds up over time." },
        ]} />
      </Section>
      <Takeaway>Build a cushion first, keep it somewhere FDIC-insured, and let compound interest quietly do the work.</Takeaway>
    </div>
  );
}
