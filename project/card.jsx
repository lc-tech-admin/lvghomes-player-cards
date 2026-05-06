/* global React */
const { useState, useEffect, useMemo, useRef } = React;

// ---------- Inline SVG icon set ----------
const IconStroke = (d) => (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" {...props}>{d}</svg>
);
const Icons = {
  calendar: IconStroke(<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>),
  doc:      IconStroke(<><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v6h5M9 14h7M9 18h5"/></>),
  users:    IconStroke(<><circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="10" r="2.4"/><path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6M14 19c0-2.4 1.7-4.5 4-5"/></>),
  trend:    IconStroke(<><path d="M3 17l5-5 4 4 8-9"/><path d="M14 7h6v6"/></>),
  review:   IconStroke(<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>),
  check:    IconStroke(<><circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/></>),
  money:    IconStroke(<><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/></>),
  pipe:     IconStroke(<><path d="M3 12h6l3-6 3 12 3-6h3"/></>),
};
const StatIcon = ({ name, className }) => {
  const C = Icons[name] || Icons.trend;
  return <C className={className} width="14" height="14"/>;
};

// ---------- Formatters ----------
const fmtPct  = (v) => `${(v * 100).toFixed(2)}%`;
const fmtInt  = (v) => v.toLocaleString();
const fmtMoney = (v) => `$${v.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:2})}`;
const fmtStat = (v, kind) =>
  kind === "pct" ? fmtPct(v) :
  kind === "money" ? fmtMoney(v) :
  fmtInt(v);

// ---------- Animated number ----------
function useCountUp(target, duration = 900, deps = []) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, start;
    const from = 0, to = Number(target) || 0;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line
  }, deps);
  return v;
}

const initialsOf = (name) =>
  name.split(/\s+/).slice(0,2).map(s => s[0]).join("").toUpperCase();

// ---------- Player Card ----------
function PlayerCard({ player, overall, tier, animationsOn = true }) {
  const animatedOvr = animationsOn ? Math.round(useCountUp(overall, 1100, [player.id])) : overall;
  const role = player.role.includes("Vice") ? "Vice President" : "Acquisition Manager";
  const roleAbbr = player.role.includes("Vice") ? "VP" : "AM";

  // Pick which stats to show on card body (compact subset for legibility)
  const cardStatKeys = player.role.includes("Vice")
    ? ["appts","contracts","icp5","arip","dealReview","closedPct"]
    : ["appts","icp5","arip","dealReviewLM","dealReviewLLM","closedPct"];

  return (
    <div className={`player-card tier-${tier} card-in`}>
      <div className="lattice"/>
      <div className="glow"/>
      <div className="card-frame"/>
      {animationsOn && <div className="shine"/>}

      <div className="card-plate">
        <span className="role-pill">
          <span className="role-dot"/>
          {roleAbbr}
        </span>
        <span className="tier-badge">{window.LH_OVERALL.tierLabel(tier)} · Q1 ’26</span>
      </div>

      <div className="card-photo">
        <image-slot
          id={`shot-${player.id}`}
          shape="rounded"
          radius="14"
          {...(player.headshot ? { src: player.headshot } : {})}
          placeholder={`Drop ${player.name.split(" ")[0]}'s headshot`}
        ></image-slot>
        <button
          className="photo-clear"
          title="Remove headshot"
          onClick={(e) => {
            e.stopPropagation();
            // Clear sidecar entry + force re-render of all slots
            try {
              const KEY = "image-slot:" + `shot-${player.id}`;
              localStorage.removeItem(KEY);
            } catch {}
            // Find all matching slots on page and re-render
            document.querySelectorAll(`image-slot[id="shot-${player.id}"]`).forEach(s => {
              // Trigger the component's clear path by dispatching a click on its internal Remove button equivalent
              if (s.shadowRoot) {
                const btn = s.shadowRoot.querySelector('button[data-act="clear"]');
                if (btn) btn.click();
              }
            });
          }}
        >Remove photo</button>
        <div className="photo-stripe"/>
      </div>

      <div className="overall-medallion" aria-label={`Overall ${overall}`}>
        <div className="ovr-num">{animatedOvr}</div>
        <div className="ovr-lbl">OVERALL</div>
      </div>

      <div className="card-name">
        <h3>{player.name}</h3>
        <div className="role">{role}</div>
      </div>

      <div className="card-stats">
        {cardStatKeys.map(k => {
          const meta = window.LH_DATA.STAT_META[k];
          if (!meta) return null;
          return (
            <div className="stat-row" key={k}>
              <div className="stat-label"><StatIcon name={meta.icon} className="ic"/>{meta.label}</div>
              <div className="stat-value">{fmtStat(player.stats[k], meta.kind)}</div>
            </div>
          );
        })}
      </div>

      <div className="card-foot">
        <div className="cell">
          <div className="lbl">Closed (Attr)</div>
          <div className="val">{fmtMoney(player.stats.closedRevAttr)}</div>
        </div>
        <div className="cell">
          <div className="lbl">Closed (Q)</div>
          <div className="val">{fmtMoney(player.stats.closedRevQtr)}</div>
        </div>
        <div className="cell">
          <div className="lbl">Pipeline</div>
          <div className="val">{fmtMoney(player.stats.pipeline)}</div>
        </div>
      </div>
    </div>
  );
}

// ---------- Stat Bars (Detail panel) ----------
function StatBars({ player, breakdown, tier }) {
  const keys = Object.keys(breakdown);
  const tierClass = tier === "diamond" ? "t-diamond" : tier === "silver" ? "t-silver" : tier === "bronze" ? "t-bronze" : "";
  return (
    <div className="bars stagger">
      {keys.map(k => {
        const meta = window.LH_DATA.STAT_META[k] || { label: k, kind: "pct" };
        const b = breakdown[k];
        const pct = Math.min(1, b.ratio);
        return (
          <div className="bar" key={k}>
            <div className="top">
              <span>{meta.label}</span>
              <span className="v">{fmtStat(b.value, meta.kind)} <span style={{color:"var(--text-3)"}}>· trgt {fmtStat(b.target, meta.kind)}</span></span>
            </div>
            <div className="track">
              <div className={`fill ${tierClass}`} style={{width: `${pct*100}%`}}/>
              <div className="target" style={{left:"100%"}}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

window.LH_COMP = { PlayerCard, StatBars, fmtStat, fmtMoney, fmtPct, fmtInt, initialsOf, useCountUp, StatIcon };
