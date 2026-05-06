import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { withOverall, tierLabel } from '../overall';
import { useCountUp } from '../lib/useCountUp';
import { PlayerCard } from '../components/PlayerCard';
import { StatBars } from '../components/StatBars';
import type { Player } from '../types';

interface Props {
  vps: Player[];
  ams: Player[];
}

const ovrBigColor: Record<string, string> = {
  diamond: '#3BBFA0',
  gold: '#3BBFA0',
  silver: '#3BBFA0',
  bronze: '#3BBFA0',
};

export function Detail({ vps, ams }: Props) {
  const navigate = useNavigate();
  const { role, id } = useParams<{ role: string; id: string }>();
  const list = role === 'vp' ? vps : ams;
  const player = useMemo(() => {
    const found = list.find(p => p.id === id);
    return found ? withOverall(found) : null;
  }, [id, list]);

  const animOvr = Math.round(useCountUp(player?.overall ?? 0, 1200, [player?.id]));

  if (!player) {
    return (
      <section className="fade-up">
        <div className="section-head">
          <button className="back" onClick={() => navigate(`/roster/${role}`)}>← Back to roster</button>
        </div>
        <p style={{ color: 'var(--text-2)', marginTop: 24 }}>Player not found.</p>
      </section>
    );
  }

  const [first, ...rest] = player.name.split(' ');

  return (
    <section className="fade-up">
      <div className="section-head" style={{ marginBottom: 16 }}>
        <div>
          <div className="sub" style={{ marginBottom: 8 }}>
            {role === 'vp' ? 'Vice President' : 'Acquisition Manager'} · Player Card
          </div>
          <h2 style={{ fontSize: 36 }}><em>{first}</em> {rest.join(' ')}</h2>
        </div>
        <button className="back" onClick={() => navigate(`/roster/${role}`)}>← Back to roster</button>
      </div>

      <div className="stage">
        <div className="card-wrap">
          <PlayerCard player={player} />
        </div>

        <div className="detail">
          <div className="meta-row">
            <div>
              <h2>
                <span className="role-i">{tierLabel(player.tier)} · OVERALL</span>
                {player.overall}
              </h2>
            </div>
            <div className="ovr-big" style={{ color: ovrBigColor[player.tier] }}>
              <small>weighted score</small>
              {animOvr}
              <span style={{ color: 'var(--text-3)', fontStyle: 'normal', fontSize: 24 }}> / 99</span>
            </div>
          </div>

          <h3 style={{
            fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.24em',
            color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600,
          }}>
            Stat breakdown — YTD vs target
          </h3>

          <StatBars player={player} tier={player.tier} />

          <p className="legend">
            Overall is a weighted score (0–100) based on each YTD metric vs its target from the Google Sheet.
            Weights and targets update automatically when you refresh live data.
            Each metric is capped at 100% of target.
          </p>
        </div>
      </div>
    </section>
  );
}
