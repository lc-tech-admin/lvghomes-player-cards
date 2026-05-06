import { useNavigate } from 'react-router-dom';
import { withOverall, tierLabel } from '../overall';
import { fmtStat } from '../lib/formatters';
import type { Player, PlayerWithOverall, Tier } from '../types';

interface Props {
  vps: Player[];
  ams: Player[];
}

function LbGroup({
  list,
  max,
  onPick,
}: {
  list: PlayerWithOverall[];
  max: number;
  onPick: (p: PlayerWithOverall) => void;
}) {
  const tierOvr: Record<Tier, string> = {
    diamond: '#1B6F5C', gold: '#9A6A0E', silver: '#1F507E', bronze: '#8A4A1A',
  };
  return (
    <div className="leaderboard stagger">
      {list.map((p, i) => (
        <div
          key={p.id}
          className={`lb-row t-${p.tier} ${i < 3 ? `top${i + 1}` : ''}`}
          onClick={() => onPick(p)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onPick(p)}
        >
          <div className="rank">#{i + 1}</div>
          <div>
            <div className="nm">{p.name}</div>
            <div className="rl">{tierLabel(p.tier)} · {p.role.includes('Vice') ? 'VP' : 'AM'}</div>
          </div>
          <div className="barbed">
            <div style={{ width: `${(p.overall / max) * 100}%` }} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)', textAlign: 'right' }}>
            {fmtStat(p.stats.closedRevQtr ?? 0, 'money')}
          </div>
          <div className="ov" style={{ color: tierOvr[p.tier] }}>{p.overall}</div>
        </div>
      ))}
    </div>
  );
}

export function Leaderboard({ vps, ams }: Props) {
  const navigate = useNavigate();
  const vpList = vps.map(withOverall).sort((a, b) => b.overall - a.overall);
  const amList = ams.map(withOverall).sort((a, b) => b.overall - a.overall);
  const maxVP = vpList[0]?.overall || 99;
  const maxAM = amList[0]?.overall || 99;

  const handlePick = (p: PlayerWithOverall) => {
    const role = p.role.includes('Vice') ? 'vp' : 'am';
    navigate(`/player/${role}/${p.id}`);
  };

  return (
    <section className="fade-up">
      <div className="section-head">
        <div>
          <h2><em>Team</em> Leaderboard</h2>
          <div className="sub">Ranked by weighted Overall · Q1 2026</div>
        </div>
      </div>

      <div className="lb-section-head">Vice Presidents · {vpList.length}</div>
      <LbGroup list={vpList} max={maxVP} onPick={handlePick} />

      <div className="lb-section-head">Acquisition Managers · {amList.length}</div>
      <LbGroup list={amList} max={maxAM} onPick={handlePick} />
    </section>
  );
}
