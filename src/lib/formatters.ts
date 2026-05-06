export const fmtPct  = (v: number) => `${(v * 100).toFixed(2)}%`;
export const fmtInt  = (v: number) => v.toLocaleString();
export const fmtMoney = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const fmtMoneyShort = (v: number): string => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${Math.round(v)}`;
};

export function fmtStat(v: number, kind: 'int' | 'pct' | 'money'): string {
  if (kind === 'pct') return fmtPct(v);
  if (kind === 'money') return fmtMoney(v);
  return fmtInt(v);
}

export const initialsOf = (name: string) =>
  name.split(/\s+/).slice(0, 2).map(s => s[0]).join('').toUpperCase();
