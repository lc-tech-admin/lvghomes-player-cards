import { useState } from 'react';
import { withOverall } from '../overall';
import { fmtStat } from '../lib/formatters';
import { PlayerCard } from '../components/PlayerCard';
import { STAT_META } from '../data';
import type { Player } from '../types';

interface Props {
  vps: Player[];
  ams: Player[];
}

const COMPARE_KEYS = [
  'appts', 'icp5', 'arip', 'dealReview', 'dealReviewLM', 'dealReviewLLM',
  'closedPct', 'closedRevAttr', 'closedRevQtr', 'pipeline', 'contracts',
];

function Picker({
  value,
  set,
  vps,
  ams,
}: {
  value: string;
  set: (id: string) => void;
  vps: Player[];
  ams: Player[];
}) {
  return (
    <select
      value={value}
      onChange={e => set(e.target.value)}
      style={{
        appearance: 'none', background: 'rgba(0,0,0,0.4)', color: '#EDEFF3',
        border: '1px solid rgba(255,255,255,0.16)', borderRadius: 8, padding: '10px 14px',
        fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.04em', cursor: 'pointer', width: '100%',
      }}
    >
      <optgroup label="Vice Presidents">
        {vps.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </optgroup>
      <optgroup label="Acquisition Managers">
        {ams.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </optgroup>
    </select>
  );
}

export function Compare({ vps, ams }: Props) {
  const all = [...vps, ...ams].map(withOverall);
  const [aId, setA] = useState(all[0]?.id ?? '');
  const [bId, setB] = useState(all[1]?.id ?? '');
  const A = all.find(p => p.id === aId);
  const B = all.find(p => p.id === bId);

  const compareKeys = COMPARE_KEYS.filter(k =>
    (A?.stats as Record<string, unknown>)?.[k] !== undefined ||
    (B?.stats as Record<string, unknown>)?.[k] !== undefined
  );

  return (
    <section className="fade-up">
      <div className="section-head">
        <div>
          <h2><em>Head-to-</em>head</h2>
          <div className="sub">Pick two players · stat-by-stat comparison</div>
        </div>
      </div>

      <div className="compare-grid">
        <div>
          <Picker value={aId} set={setA} vps={vps} ams={ams} />
          {A && <div style={{ marginTop: 18 }}><PlayerCard player={A} /></div>}
        </div>
        <div>
          <Picker value={bId} set={setB} vps={vps} ams={ams} />
          {B && <div style={{ marginTop: 18 }}><PlayerCard player={B} /></div>}
        </div>
      </div>

      <div style={{
        marginTop: 32, border: '1px solid var(--line)', borderRadius: 12,
        padding: '14px 22px', background: 'rgba(255,255,255,0.02)',
      }}>
        <div className="compare-row" style={{ borderBottom: '1px solid var(--line-strong)', paddingBottom: 14 }}>
          <div className="v l" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: '#3BBFA0' }}>
            {A?.overall}
          </div>
          <div className="lbl" style={{ color: '#3BBFA0' }}>OVERALL</div>
          <div className="v r" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: '#3BBFA0' }}>
            {B?.overall}
          </div>
        </div>

        {compareKeys.map(k => {
          const meta = STAT_META[k];
          if (!meta) return null;
          const av = (A?.stats as Record<string, number>)?.[k];
          const bv = (B?.stats as Record<string, number>)?.[k];
          const aWin = (av ?? -1) > (bv ?? -1);
          const bWin = (bv ?? -1) > (av ?? -1);
          return (
            <div className="compare-row" key={k}>
              <div className={`v l ${aWin ? 'win' : bWin ? 'lose' : ''}`}>
                {av !== undefined ? fmtStat(av, meta.kind) : '—'}
              </div>
              <div className="lbl">{meta.label}</div>
              <div className={`v r ${bWin ? 'win' : aWin ? 'lose' : ''}`}>
                {bv !== undefined ? fmtStat(bv, meta.kind) : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
