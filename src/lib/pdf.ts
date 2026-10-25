import { jsPDF } from "jspdf";
import { projectLife, type Assumptions, type Profile } from "./calc";
import { simulateStory, altChoices, describeChoices, type Choices } from "./story";
import { RULES } from "./rules";
import { money } from "./format";
import { MODULES } from "../data/modules";

const NAVY: [number, number, number] = [15, 23, 42];
const MINT: [number, number, number] = [16, 185, 129];
const SLATE: [number, number, number] = [100, 116, 139];

export function downloadPlan(o: { profile: Profile; assumptions: Assumptions; story: { choices: Choices; finished: boolean }; done: string[]; xp: number; badges: string[] }) {
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
  doc.setFillColor(...MINT); doc.circle(M + 14, 52, 6, "F");
  doc.setDrawColor(...MINT); doc.setLineWidth(2); doc.circle(M + 14, 52, 13, "S");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(24); doc.text("Next Step", M + 38, 60);
  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(203, 213, 225);
  doc.text("See tomorrow before you spend today.", M + 38, 78);
  doc.text(`My Financial Future Plan${o.profile.name ? ` · ${o.profile.name}` : ""} · ${new Date().toLocaleDateString()}`, M + 38, 96);
  y = 150;

  const p = o.profile, a = o.assumptions;
  const proj = projectLife(p, a);
  h2("1. Where I am today");
  row(["Age range", "Yearly income", "Monthly spending", "Savings", "Retirement"], [90, 100, 110, 90, 90], true, NAVY);
  row([p.ageRange, money(p.income), money(p.expenses), money(p.savings), money(p.retirement)], [90, 100, 110, 90, 90]);
  if (p.goals.length) para("My goals: " + p.goals.join(", ") + ".");

  h2("2. My projected future (hypothetical)");
  para(`Assumptions: ${a.scenario} scenario, ${(proj.returnRate * 100).toFixed(1)}% average investment return, ${(proj.inflation * 100).toFixed(1)}% inflation, ${Math.round(a.contribPct * 100)}% 401(k) contribution + ${Math.round(a.matchPct * 100)}% employer match, retire at ${a.retireAge}.`, 9.5, SLATE);
  // mini bar chart
  const ms = proj.milestones; const maxV = Math.max(...ms.map((m) => m.nominal), 1); const cH = 120;
  ensure(cH + 50); const bw = (W - 2 * M) / Math.max(ms.length, 1);
  ms.forEach((m, i) => {
    const x = M + i * bw + bw * 0.18, w = bw * 0.3;
    const hN = (m.nominal / maxV) * cH, hR = (m.real / maxV) * cH;
    doc.setFillColor(...MINT); doc.rect(x, y + cH - hN, w, hN, "F");
    doc.setFillColor(...NAVY); doc.rect(x + w + 3, y + cH - hR, w, hR, "F");
    doc.setFontSize(9); doc.setTextColor(...NAVY); doc.text(`Age ${m.age}`, x + w, y + cH + 14, { align: "center" });
  });
  y += cH + 30;
  doc.setFontSize(8.5); doc.setFillColor(...MINT); doc.rect(M, y - 7, 8, 8, "F"); doc.setTextColor(...SLATE); doc.text("Future dollars", M + 12, y);
  doc.setFillColor(...NAVY); doc.rect(M + 90, y - 7, 8, 8, "F"); doc.text("Today's buying power", M + 102, y); y += 18;
  row(["Age", "Future dollars", "Today's buying power", "Monthly costs then"], [70, 130, 150, 150], true, NAVY);
  ms.forEach((m, i) => row([String(m.age), money(m.nominal), money(m.real), money(m.expensesMonthly)], [70, 130, 150, 150], false, i % 2 ? undefined : [248, 250, 252]));
  para(proj.depletedAge ? `Under these assumptions savings could run short around age ${proj.depletedAge}.` : "Under these assumptions savings last past age 90.", 10.5);

  if (o.story.finished) {
    const mine = simulateStory(o.story.choices), alt = simulateStory(altChoices(o.story.choices));
    h2("3. Choose Your Financial Future: two paths");
    para("A fictional 30-year-old earning $75,000. Path A is my choices. Path B is the road not taken.", 9.5, SLATE);
    row(["", "In 10 years", "In 20 years", "In 30 years", `At retirement`], [120, 95, 95, 95, 110], true, NAVY);
    row(["Path A (mine)", money(mine.y10.netWorth), money(mine.y20.netWorth), money(mine.y30.netWorth), money(mine.retireRow.netWorth)], [120, 95, 95, 95, 110]);
    row(["Path B", money(alt.y10.netWorth), money(alt.y20.netWorth), money(alt.y30.netWorth), money(alt.retireRow.netWorth)], [120, 95, 95, 95, 110], false, [248, 250, 252]);
    y += 4;
    const a1 = describeChoices(mine.choices), b1 = describeChoices(alt.choices);
    row(["Decision", "Path A", "Path B"], [210, 140, 140], true, NAVY);
    a1.forEach((d, i) => row([d.decision.slice(0, 34), d.choice, b1[i].choice], [210, 140, 140], false, i % 2 ? undefined : [248, 250, 252]));
  }

  h2(o.story.finished ? "4. What I've learned" : "3. What I've learned");
  para(`Lessons completed: ${o.done.length} of ${MODULES.length} · ${o.xp} XP · ${o.badges.length} badges`);
  const takeaways = [
    "Inflation compounds. Plan for future prices, not today's.",
    "Grab the full employer match. It's part of your pay.",
    "Start early. Time does most of the heavy lifting through compound growth.",
    "Keep an emergency fund so surprises don't become high-interest debt.",
    "Diversify and think in decades. Markets drop, and staying the course has historically mattered.",
    "Roth vs. Traditional depends on your tax rate now vs. later. No account is best for everyone.",
  ];
  takeaways.forEach((t) => para("•  " + t));

  h2("Next steps to explore");
  ["Check your real Social Security estimate at ssa.gov/myaccount.", "Look up your employer's 401(k) match and vesting rules.", "Consider talking with a fee-only, fiduciary financial professional before major decisions."].forEach((t) => para("•  " + t));
  para(`Contribution limits reference IRS figures for ${RULES.year} (verified ${RULES.verifiedOn}). Sources: ${RULES.sources.map((s) => s.url).join(" · ")}`, 8, SLATE);
  footer();
  doc.save(`NextStep-Plan${o.profile.name ? "-" + o.profile.name.replace(/\W+/g, "") : ""}.pdf`);
}
