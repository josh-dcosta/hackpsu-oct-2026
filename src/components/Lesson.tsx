// Shared building blocks for every lesson:
// 1. The idea  ·  2. Simulator (sliders left, chart right, numbers on the chart)  ·  3. Next Step explains  ·  4. Test yourself
import type { ReactNode } from "react";
import { Card, ResetButton, Section } from "./ui";

export function Idea({ title, children, n = 1, kicker = "The idea" }: { title: string; children: ReactNode; n?: number; kicker?: string }) {
  return (
    <Section n={n} kicker={kicker} title={title}>
      <Card><div className="space-y-3 text-lg leading-relaxed text-slate-700">{children}</div></Card>
    </Section>
  );
}

export function Simulator({ title, controls, chart, onReset, note, n = 2, chartClass = "h-80 sm:h-96" }: { title: string; controls: ReactNode; chart: ReactNode; onReset?: () => void; note?: string; n?: number; chartClass?: string }) {
  return (
    <Section n={n} kicker="Simulator" title={title}>
      <Card>
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            {onReset && <div className="-mb-1 flex justify-end"><ResetButton onClick={onReset} /></div>}
            {controls}
          </div>
          <div className={"lg:col-span-3 " + chartClass}>{chart}</div>
        </div>
        {note && <p className="mt-3 text-[12px] text-slate-500">{note}</p>}
      </Card>
    </Section>
  );
}

/** A value written onto the last point of a line (or the first, with at="start"). */
export function endLabel(len: number, fmt: (v: number) => string, color: string, opts: { dy?: number; at?: "start" | "end" } = {}) {
  const { dy = -10, at = "end" } = opts;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Label = (props: any) => {
    const i = at === "end" ? len - 1 : 0;
    if (props.index !== i) return <g />;
    return (
      <text x={Number(props.x) + (at === "end" ? -2 : 4)} y={Number(props.y) + dy} textAnchor={at === "end" ? "end" : "start"} fill={color} fontSize={13} fontWeight={700}
        stroke="#fff" strokeWidth={4} paintOrder="stroke">{fmt(Number(props.value))}</text>
    );
  };
  return Label;
}

export const axis = { tick: { fontSize: 12, fill: "#64748B" }, tickLine: false, axisLine: false } as const;
