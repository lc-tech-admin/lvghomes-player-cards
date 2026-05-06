import { fmtStat } from '../lib/formatters';
import { STAT_META } from '../data';
import type { PlayerWithOverall, Tier } from '../types';

interface Props {
  player: PlayerWithOverall;
  tier: Tier;
}

export function StatBars({ player, tier }: Props) {
  const tierClass = tier === 'diamond' ? 't-diamond' : tier === 'silver' ? 't-silver' : tier === 'bronze' ? 't-bronze' : '';
  return (
    <div className="bars stagger">
      {Object.entries(player.breakdown).map(([k, b]) => {
        const meta = STAT_META[k] || { label: k, kind: 'pct' as const };
        const pct = Math.min(1, b.ratio);
        return (
          <div className="bar" key={k}>
            <div className="top">
              <span>{meta.label}</span>
              <span className="v">
                {fmtStat(b.value, meta.kind)}{' '}
                <span style={{ color: 'var(--text-3)' }}>· trgt {fmtStat(b.target, meta.kind)}</span>
              </span>
            </div>
            <div className="track">
              <div className={`fill ${tierClass}`} style={{ width: `${pct * 100}%` }} />
              <div className="target" style={{ left: '100%' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
