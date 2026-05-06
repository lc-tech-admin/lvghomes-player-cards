import { useNavigate, useParams } from 'react-router-dom';
import { withOverall, tierLabel } from '../overall';
import { initialsOf } from '../lib/formatters';
import type { Player, Tier } from '../types';

interface Props {
  vps: Player[];
  ams: Player[];
}

const tierColor: Record<Tier, string> = {
  diamond: '#1B6F5C',
  gold: '#9A6A0E',
  silver: '#1F507E',
  bronze: '#8A4A1A',
};

export function Roster({ vps, ams }: Props) {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const isVP = role === 'vp';
  const list = (isVP ? vps : ams).map(withOverall).sort((a, b) => b.overall - a.overall);
  const title = isVP ? 'Vice Presidents' : 'Acquisition Managers';
  const [first, ...rest] = title.split(' ');

  return (
    <section className="fade-up">
      <div className="section-head">
        <div>
          <h2><em>{first}</em> {rest.join(' ')}</h2>
          <div className="sub">Tap a name to reveal their card · sorted by Overall</div>
        </div>
        <button className="back" onClick={() => navigate('/')}>← Back to roles</button>
      </div>

      <div className="roster-grid stagger">
        {list.map(p => (
          <button
            key={p.id}
            className="roster-cell"
            style={{ '--cell-tier-color': tierColor[p.tier] } as React.CSSProperties}
            onClick={() => navigate(`/player/${role}/${p.id}`)}
          >
            <div className="tier-stripe" />
            <div className="ovr">{p.overall}</div>
            <div className="photo-mini">
              <image-slot
                id={`shot-${p.id}`}
                shape="circle"
                placeholder={initialsOf(p.name)}
              />
            </div>
            <div className="name">{p.name}</div>
            <div className="role-mini">{tierLabel(p.tier)} · {isVP ? 'VP' : 'AM'}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
