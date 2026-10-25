export const money = (n: number, opts: { compact?: boolean; cents?: boolean } = {}) => {
  if (!isFinite(n)) return "Never";
  const neg = n < 0; const a = Math.abs(n);
  let s: string;
  if (opts.compact && a >= 1_000_000) s = `$${(a / 1_000_000).toFixed(a >= 10_000_000 ? 1 : 2)}M`;
  else if (opts.compact && a >= 10_000) s = `$${Math.round(a / 1000).toLocaleString()}k`;
  else s = "$" + a.toLocaleString(undefined, { minimumFractionDigits: opts.cents ? 2 : 0, maximumFractionDigits: opts.cents ? 2 : 0 });
  return neg ? "−" + s : s;
};
export const compact = (n: number) => money(n, { compact: true });
export const pct = (n: number, d = 1) => `${(n * 100).toFixed(d).replace(/\.0$/, "")}%`;
export const months = (m: number) => {
  if (!isFinite(m)) return "Never";
  const y = Math.floor(m / 12), r = m % 12;
  if (y === 0) return `${r} mo`;
  return r ? `${y} yr ${r} mo` : `${y} yr`;
};
export const axisMoney = (n: number) => (Math.abs(n) >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : Math.abs(n) >= 1000 ? `$${Math.round(n / 1000)}k` : `$${Math.round(n)}`);
