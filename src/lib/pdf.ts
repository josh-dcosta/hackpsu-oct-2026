import { jsPDF } from "jspdf";
import { projectLife, type Assumptions, type Profile } from "./calc";
import type { Choices } from "./story";
import { buildSteps } from "./steps";
import { DAVE_ASSUMPTIONS, CUSTOM_ASSUMPTIONS } from "../data/dave";
import { RULES } from "./rules";
import { money } from "./format";
import { MODULES } from "../data/modules";

const NAVY: [number, number, number] = [15, 23, 42];
const MINT: [number, number, number] = [16, 185, 129];
const SLATE: [number, number, number] = [100, 116, 139];

export function downloadPlan(o: { profile: Profile; assumptions: Assumptions; story: { choices: Choices; finished: boolean }; done: string[]; xp: number; badges: string[]; stepsDone?: Record<string, boolean> }) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 48;
  let y = 0;
  const ensure = (h: number) => { if (y + h > H - 60) { footer(); doc.addPage(); y = 56; } };
  const footer = () => {
    doc.setFontSize(8); doc.setTextColor(...SLATE);
    doc.text("Next Step · Educational estimates with hypothetical numbers. Not financial, tax, or investment advice.", M, H - 28);
    doc.text(`Page ${doc.getNumberOfPages()}`, W - M, H - 28, { align: "right" });
  };
  const h2 = (t: string) => { ensure(40); y += 14; doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...NAVY); doc.text(t, M, y); y += 6; doc.setDrawColor(...MINT); doc.setLineWidth(2); doc.line(M, y, M + 36, y); y += 16; };
  const para = (t: string, size = 10.5, color: [number, number, number] = [51, 65, 85]) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(t, W - 2 * M); ensure(lines.length * size * 1.4); doc.text(lines, M, y); y += lines.length * size * 1.4 + 4;
  };
  const row = (cells: string[], widths: number[], bold = false, fill?: [number, number, number]) => {
    ensure(22);
    if (fill) { doc.setFillColor(...fill); doc.rect(M, y - 13, W - 2 * M, 20, "F"); }
    doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(10); doc.setTextColor(...(fill === NAVY ? [255, 255, 255] as [number, number, number] : NAVY));
    let x = M + 8; cells.forEach((c, i) => { doc.text(c, x, y); x += widths[i]; }); y += 20;
  };

  // Header band
  doc.setFillColor(...NAVY); doc.rect(0, 0, W, 120, "F");
  // Logo: three rising steps
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(M, 58, 8, 8, 1.5, 1.5, "F");
  doc.roundedRect(M + 10, 51, 8, 15, 1.5, 1.5, "F");
  doc.roundedRect(M + 20, 44, 8, 22, 1.5, 1.5, "F");
  doc.setDrawColor(248, 250, 252); doc.setLineWidth(1.8);
  doc.lines([[8, -6], [6, 0], [8, -8]], M + 2, 50); doc.lines([[5, 0], [0, 5]], M + 19, 36);
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(24); doc.text("Next Step", M + 38, 60);
  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(203, 213, 225);
  doc.text("See tomorrow before you spend today.", M + 38, 78);
  doc.text(`My Next Steps Plan${o.profile.name ? ` · ${o.profile.name}` : ""} · ${new Date().toLocaleDateString()}`, M + 38, 96);
  y = 150;

  const p = o.profile, a = o.assumptions;
  const proj = projectLife(p, a);
  h2("1. Where I am today");
  row(["Age range", "Yearly income", "Monthly spending", "Savings", "Retirement"], [90, 100, 110, 90, 90], true, NAVY);
  row([p.ageRange, money(p.income), money(p.expenses), money(p.savings), money(p.retirement)], [90, 100, 110, 90, 90]);
  if (p.goals.length) para("My goals: " + p.goals.join(", ") + ".");

  // 2. The answer
  h2("2. Will I have enough after retirement?");
  const first = proj.firstRetire;
  const bills = first?.expensesMonthly ?? p.expenses, income = first?.incomeMonthly ?? 0;
  para(proj.depletedAge ? `Not quite. Saving at today's pace, savings run out at age ${proj.depletedAge}.` : "Yes. Saving at today's pace, the money lasts past age 90.", 12, NAVY);
  row(["", "Today", `At ${a.retireAge}`], [220, 130, 130], true, NAVY);
  row(["Monthly bills (" + (proj.inflation * 100).toFixed(1) + "% inflation)", money(p.expenses), money(bills)], [220, 130, 130]);
  row(["Saving each month", money(proj.savingToday), "n/a"], [220, 130, 130], false, [248, 250, 252]);
  row(["Total savings", money(p.savings + p.retirement), money(proj.atRetire.nominal)], [220, 130, 130]);
  row(["Pension + Social Security / month", "n/a", money(income)], [220, 130, 130], false, [248, 250, 252]);
  row(["Paid from savings / month", "n/a", money(Math.max(0, bills - income))], [220, 130, 130]);

  // 3. The plan
  h2("3. My plan");
  const tax = a.taxRate ?? 0.12;
  [
    `Savings account: ${(a.cashRate ?? 0) >= 0.03 ? "high-yield (~4%), FDIC-insured" : "regular (~0.5%)"}`,
    `Retirement savings: ${Math.round(a.contribPct * 100)}% of pay, ${a.accountType === "roth" ? "Roth (tax-free later)" : "Traditional (tax break now)"}`,
    `HSA: ${(a.hsaAnnual ?? 0) > 0 ? money(a.hsaAnnual ?? 0) + " a year" : "not yet"}`,
    `Long-term investments: low-cost index funds, ${a.returnRate >= 0.065 ? "growth" : a.returnRate <= 0.05 ? "safer" : "balanced"} mix (assumes ${(a.returnRate * 100).toFixed(1)}% average growth)`,
    `Taxes saved this year from the plan: about ${money(proj.taxSavedNow)} (at a ${Math.round(tax * 100)}% federal bracket)`,
  ].forEach((t) => para("•  " + t));

  // 4. Next steps
  h2("4. My next steps");
  const start = p.scenario === "custom" || (p.scenario === undefined && p.name !== "Dave") ? CUSTOM_ASSUMPTIONS : DAVE_ASSUMPTIONS;
  const steps = buildSteps(p, a, start);
  steps.forEach((st, i) => {
    const done = o.stepsDone?.[st.id];
    para(`${done ? "[x]" : "[  ]"}  ${i + 1}. ${st.title}${st.inPlan ? "" : "  (worth considering)"}  · ${st.when}`, 11, NAVY);
    para(st.why, 9.5);
    st.how.forEach((h) => para("      - " + h, 9.5, SLATE));
    if (st.automate) para("      Automate it: " + st.automate, 9.5, SLATE);
    if (st.source) para("      Verify: " + st.source.url, 8.5, SLATE);
  });

  h2("5. What I've learned");
  para(`Lessons completed: ${o.done.length} of ${MODULES.length}`);
  [
    "Inflation compounds. Plan for future prices, not today's.",
    "Keep an emergency fund in an FDIC-insured high-yield account so surprises don't become debt.",
    "Start early and automate. Time and compounding do most of the heavy lifting.",
    "Roth vs. Traditional depends on your tax rate now vs. later. No account is best for everyone.",
    "Invest long-term money in low-cost, diversified index funds, and don't sell in a downturn.",
  ].forEach((t) => para("•  " + t));
  para("All numbers are calculated by Next Step's fixed formulas, not guessed by AI. Consider a fee-only, fiduciary professional before major decisions.", 9.5, SLATE);
  para(`Contribution limits reference IRS figures for ${RULES.year} (verified ${RULES.verifiedOn}). Sources: ${RULES.sources.map((s) => s.url).join(" · ")}`, 8, SLATE);
  footer();
  doc.save(`NextStep-Plan${o.profile.name ? "-" + o.profile.name.replace(/\W+/g, "") : ""}.pdf`);
}
