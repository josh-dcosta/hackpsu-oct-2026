import { jsPDF } from "jspdf";
import { projectLife, type Assumptions, type Profile } from "./calc";
import type { Choices } from "./story";
import { buildPlan, autoMoments, MOMENTS, PLAN_ASSUMPTIONS, type MomentId } from "./plan";
import { RULES } from "./rules";
import { money } from "./format";
import { MODULES } from "../data/modules";

const NAVY: [number, number, number] = [0, 55, 123];
const MINT: [number, number, number] = [16, 185, 129];
const SLATE: [number, number, number] = [100, 116, 139];

export function downloadPlan(o: { profile: Profile; assumptions: Assumptions; story: { choices: Choices; finished: boolean }; done: string[]; xp: number; badges: string[]; stepsDone?: Record<string, boolean>; moments?: string[] }) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 48;
  let y = 0;
  const ensure = (h: number) => { if (y + h > H - 60) { footer(); doc.addPage(); y = 56; } };
  const footer = () => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...SLATE);
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
  const moments = ((o.moments as MomentId[] | undefined) ?? autoMoments(p));
  const plan = buildPlan(p, a, moments);
  const w = plan.without, wp = plan.withPlan;
  const link = (label: string, url: string) => {
    ensure(16); doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(0, 55, 123);
    doc.textWithLink(label + "  ->", M + 18, y, { url }); y += 15;
  };

  h2("1. My scenario");
  row(["Age", "Yearly income", "Monthly bills", "Savings", "Retirement"], [70, 110, 110, 100, 100], true, NAVY);
  row([String(p.age), money(p.income), money(p.expenses), money(p.savings), money(p.retirement)], [70, 110, 110, 100, 100]);
  if (p.job) para("Work: " + p.job);
  if ((p.kids || []).length) para("Children: " + (p.kids || []).map((k) => `${k.name} (${k.age})`).join(", "));

  h2("2. Life moments I'm going through");
  if (!moments.length) para("None picked: the plan covers the basics.");
  MOMENTS.filter((m) => moments.includes(m.id)).forEach((m) => para(`•  ${m.title}: ${m.sub}`));

  h2("3. My plan: where the money lives");
  const monthly = plan.items.reduce((t, i) => t + i.monthly, 0);
  para(`Saved every month: ${money(monthly)}`, 11, NAVY);
  plan.items.forEach((i) => {
    para(`${i.title}  -  ${i.amount}`, 11, NAVY);
    para(`${i.where}. ${i.why}`, 9.5);
  });

  h2("4. My next steps");
  plan.items.forEach((i, n) => {
    const done = o.stepsDone?.[i.id];
    para(`${done ? "[x]" : "[  ]"}  ${n + 1}. ${i.title}  ·  ${i.when}`, 11, NAVY);
    i.how.forEach((h) => para("      - " + h, 9.5, SLATE));
    [...i.products, ...(i.also || [])].forEach((pr) => link(pr.name, pr.url));
    y += 8;
  });

  ensure(300);
  h2(`5. The answer: will I have enough after retiring at ${a.retireAge}?`);
  // small chart: savings by age, without vs with the plan
  const cx0 = M + 40, cw = W - 2 * M - 50, ch = 140, cy0 = y + ch;
  const rowsW = w.rows, rowsP = wp.rows;
  const maxV = Math.max(1, ...rowsW.map((r) => r.nominal), ...rowsP.map((r) => r.nominal));
  const ages = rowsW.map((r) => r.age), a0 = ages[0], a1 = ages[ages.length - 1];
  const X = (age: number) => cx0 + ((age - a0) / (a1 - a0)) * cw, Y = (v: number) => cy0 - (Math.max(0, v) / maxV) * ch;
  doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.5);
  [0, 0.5, 1].forEach((f) => { doc.line(cx0, cy0 - f * ch, cx0 + cw, cy0 - f * ch); doc.setFontSize(7.5); doc.setTextColor(...SLATE); doc.text(money(maxV * f, { compact: true }), cx0 - 4, cy0 - f * ch + 2, { align: "right" }); });
  for (let ag = Math.ceil(a0 / 5) * 5; ag <= a1; ag += 5) doc.text(String(ag), X(ag), cy0 + 10, { align: "center" });
  const draw = (rows: typeof rowsW, rgb: [number, number, number]) => { doc.setDrawColor(...rgb); doc.setLineWidth(2); for (let i = 1; i < rows.length; i++) doc.line(X(rows[i - 1].age), Y(rows[i - 1].nominal), X(rows[i].age), Y(rows[i].nominal)); };
  draw(rowsW, [249, 115, 97]); draw(rowsP, MINT);
  doc.setDrawColor(148, 163, 184); doc.setLineWidth(0.6); doc.line(X(a.retireAge), cy0, X(a.retireAge), cy0 - ch);
  y = cy0 + 26;
  doc.setFontSize(9); doc.setTextColor(249, 115, 97); doc.text("Without the plan", M, y); doc.setTextColor(...MINT); doc.text("With the plan", M + 110, y); doc.setTextColor(...SLATE); doc.text(`Dashed line: retire at ${a.retireAge}`, M + 200, y); y += 18;
  row(["", "Without the plan", "With the plan"], [180, 150, 150], true, NAVY);
  row([`Savings at ${a.retireAge}`, money(w.atRetire.nominal), money(wp.atRetire.nominal)], [180, 150, 150]);
  row(["Money lasts until", w.depletedAge ? `age ${w.depletedAge}` : "past 90", wp.depletedAge ? `age ${wp.depletedAge}` : "past 90"], [180, 150, 150], false, [248, 250, 252]);
  para(`Assumes bills rise ${Math.round(a.inflation * 100)}% a year and investments earn about ${Math.round(a.returnRate * 100)}%. Life moment estimates: surprise bill ${money(PLAN_ASSUMPTIONS.surpriseBill)}, medical +${money(PLAN_ASSUMPTIONS.medicalMonthly)}/mo, market drop ${Math.round(PLAN_ASSUMPTIONS.marketDrop * 100)}%, college ${money(PLAN_ASSUMPTIONS.collegeShareNoAid)}/yr per student without the FAFSA vs ${money(PLAN_ASSUMPTIONS.collegeShareWithAid)} with typical grants.`, 8.5, SLATE);

  h2("6. What I've learned");
  para(`Lessons completed: ${o.done.length} of ${MODULES.length}`);
  [
    "Inflation compounds. Plan for future prices, not today's.",
    "Keep an emergency fund in an FDIC-insured account so surprises don't become debt.",
    "Start early and automate. Time and compounding do most of the heavy lifting.",
    "Roth vs. Traditional depends on your tax rate now vs. later. No account is best for everyone.",
    "Invest long-term money in low-cost, diversified index funds, and don't sell in a downturn.",
  ].forEach((t) => para("•  " + t));
  para("All numbers are calculated by Next Step's fixed formulas, not guessed by AI. Consider a fee-only, fiduciary professional before major decisions.", 9.5, SLATE);
  para(`Contribution limits reference IRS figures for ${RULES.year} (verified ${RULES.verifiedOn}). Sources: ${RULES.sources.map((s) => s.url).join(" · ")}`, 8, SLATE);
  footer();
  doc.save(`NextStep-Plan${o.profile.name ? "-" + o.profile.name.replace(/\W+/g, "") : ""}.pdf`);
}
