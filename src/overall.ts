import type { Player, PlayerWithOverall, Tier, BreakdownEntry } from './types';

function ratio(value: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.max(0, Math.min(value / target, 1.0));
}

export function compute(player: Player): { overall: number; breakdown: Record<string, BreakdownEntry> } {
  const WEIGHTS = player.weights;
  const breakdown: Record<string, BreakdownEntry> = {};

  if (!WEIGHTS || Object.keys(WEIGHTS).length === 0) {
    return { overall: 0, breakdown };
  }

  const keys = (Object.keys(player.stats) as string[]).filter(k => WEIGHTS[k]);
  let totalWeight = 0;
  let earned = 0;

  keys.forEach(k => {
    const w = WEIGHTS[k];
    const value = (player.stats as Record<string, number>)[k] ?? 0;
    const r = ratio(value, w.target);
    totalWeight += w.weight;
    earned += r * w.weight;
    breakdown[k] = { ratio: r, weight: w.weight, target: w.target, value };
  });

  if (totalWeight === 0) return { overall: 0, breakdown };
  const overall = Math.round(Math.min(100, (earned / totalWeight) * 100));
  return { overall: Math.max(1, overall), breakdown };
}

export function tier(overall: number): Tier {
  if (overall >= 90) return 'diamond';
  if (overall >= 80) return 'gold';
  if (overall >= 70) return 'silver';
  return 'bronze';
}

export function tierLabel(t: Tier): string {
  const labels: Record<Tier, string> = {
    diamond: 'DIAMOND',
    gold: 'GOLD',
    silver: 'SILVER',
    bronze: 'BRONZE',
  };
  return labels[t];
}

export function withOverall(p: Player): PlayerWithOverall {
  const r = compute(p);
  return { ...p, overall: r.overall, tier: tier(r.overall), breakdown: r.breakdown };
}
