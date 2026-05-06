import { useCountUp } from '../lib/useCountUp';
import { fmtStat } from '../lib/formatters';
import { StatIcon } from './Icons';
import { tierLabel } from '../overall';
import { STAT_META } from '../data';
import type { PlayerWithOverall } from '../types';

interface Props {
  player: PlayerWithOverall;
  animationsOn?: boolean;
  compact?: boolean;
}

function clearPhoto(playerId: string) {
  try {
    const KEY = `lh-image-slot:shot-${playerId}`;
    localStorage.removeItem(KEY);
  } catch {}
  document.querySelectorAll<HTMLElement>(`image-slot[id="shot-${playerId}"]`).forEach(s => {
    const shadowRoot = (s as unknown as { shadowRoot: ShadowRoot | null }).shadowRoot;
    if (shadowRoot) {
      const btn = shadowRoot.querySelector<HTMLButtonElement>('button[data-act="clear"]');
      if (btn) btn.click();
    }
  });
}

export function PlayerCard({ player, animationsOn = true, compact = false }: Props) {
  const rawOvr = useCountUp(player.overall, 1100, [player.id]);
  const animatedOvr = animationsOn ? Math.round(rawOvr) : player.overall;
  const roleAbbr = player.role.includes('Vice') ? 'VP' : 'AM';

  const cardStatKeys = player.role.includes('Vice')
    ? ['appts', 'contracts', 'icp5', 'arip', 'dealReview', 'closedPct']
    : ['appts', 'icp5', 'arip', 'dealReviewLM', 'dealReviewLLM', 'closedPct'];

  return (
    <div className={`player-card tier-${player.tier} card-in${compact ? ' compact' : ''}`}>
      <div className="lattice" />
      <div className="glow" />
      <div className="card-frame" />
      {animationsOn && <div className="shine" />}

      <div className="card-plate">
        <span className="role-pill">
          <span className="role-dot" />
          {roleAbbr}
        </span>
        <span className="tier-badge">{tierLabel(player.tier)} · Q1 '26</span>
      </div>

      <div className="card-photo">
        <image-slot
          id={`shot-${player.id}`}
          shape="rounded"
          radius="14"
          placeholder={`Drop ${player.name.split(' ')[0]}'s headshot`}
          src={`${import.meta.env.BASE_URL}headshots/${player.id}.jpg`}
        />
        <button
          className="photo-clear"
          title="Remove headshot"
          onClick={e => { e.stopPropagation(); clearPhoto(player.id); }}
        >
          Remove photo
        </button>
        <div className="photo-stripe" />
      </div>

      <div className="overall-medallion" aria-label={`Overall ${player.overall}`}>
        <div className="ovr-num">{player.overall > 0 ? animatedOvr : '—'}</div>
        <div className="ovr-lbl">OVERALL</div>
      </div>

      <div className="card-name">
        <h3>{player.name}</h3>
        <div className="role">{player.role}</div>
      </div>

      {!compact && (
        <>
          <div className="card-stats">
            {cardStatKeys.map(k => {
              const meta = STAT_META[k];
              if (!meta) return null;
              const value = (player.stats as Record<string, number>)[k] ?? 0;
              return (
                <div className="stat-row" key={k}>
                  <div className="stat-label">
                    <StatIcon name={meta.icon} className="ic" />
                    {meta.label}
                  </div>
                  <div className="stat-value">{fmtStat(value, meta.kind)}</div>
                </div>
              );
            })}
          </div>

          <div className="card-foot">
            <div className="cell">
              <div className="lbl">Closed (Attr)</div>
              <div className="val">{fmtStat(player.stats.closedRevAttr ?? 0, 'money')}</div>
            </div>
            <div className="cell">
              <div className="lbl">Closed (Q)</div>
              <div className="val">{fmtStat(player.stats.closedRevQtr ?? 0, 'money')}</div>
            </div>
            <div className="cell">
              <div className="lbl">Pipeline</div>
              <div className="val">{fmtStat(player.stats.pipeline ?? 0, 'money')}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
