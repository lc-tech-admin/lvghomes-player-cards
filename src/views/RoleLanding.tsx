import { useNavigate } from 'react-router-dom';
import type { Player } from '../types';

interface Props {
  vps: Player[];
  ams: Player[];
}

export function RoleLanding({ vps, ams }: Props) {
  const navigate = useNavigate();

  return (
    <section className="hero fade-up">
      <div className="eyebrow">Performance Dashboard</div>
      <h1>Choose your <em>squad</em></h1>
      <p>Premium player cards for the Leverage Homes sales team — pulled from live YTD performance, ranked, and rendered on demand.</p>

      <div className="role-tiles">
        <button className="role-tile" onClick={() => navigate('/roster/vp')}>
          <div className="role-tag">
            <span className="num">01</span> Leadership Tier
          </div>
          <h2><span className="abbr">VP</span></h2>
          <div className="meta">
            <span>Vice Presidents</span>
            <span className="count">
              {vps.length}
              <small style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginLeft: 6 }}>active</small>
            </span>
          </div>
        </button>

        <button className="role-tile" onClick={() => navigate('/roster/am')}>
          <div className="role-tag">
            <span className="num">02</span> Acquisitions Tier
          </div>
          <h2><span className="abbr">AM</span></h2>
          <div className="meta">
            <span>Acquisition Managers</span>
            <span className="count">
              {ams.length}
              <small style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginLeft: 6 }}>active</small>
            </span>
          </div>
        </button>
      </div>
    </section>
  );
}
