/* global React, ReactDOM */
const { useState, useEffect, useMemo, useRef } = React;
const { PlayerCard, StatBars, fmtStat, fmtMoney, initialsOf } = window.LH_COMP;
const { vps, ams, STAT_META } = window.LH_DATA;
const { compute, tier, tierLabel } = window.LH_OVERALL;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "emerald",
  "tierTreatments": true,
  "trendArrows": true,
  "ambientGrid": true,
  "shineSweep": true
}/*EDITMODE-END*/;

const ACCENTS = {
  emerald: { edge:"#3BBFA0", edge2:"#5FE0BC", deep:"#1B6F5C" },  // brand
  navy:    { edge:"#1F507E", edge2:"#3F7AAB", deep:"#0F2A47" },
  gold:    { edge:"#C9A24C", edge2:"#E5C475", deep:"#7A5E1F" },
};

function useTweaks(defaults){
  const [t, setT] = useState(defaults);
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__edit_mode_set_keys') {
        setT(prev => ({...prev, ...e.data.edits}));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
  const set = (k,v) => {
    const edits = typeof k === 'object' ? k : {[k]: v};
    setT(prev => ({...prev, ...edits}));
    window.parent.postMessage({type:'__edit_mode_set_keys', edits}, '*');
  };
  return [t, set];
}

// Pre-compute overalls for all players
function withOverall(p){
  const r = compute(p);
  return { ...p, overall: r.overall, tier: tier(r.overall), breakdown: r.breakdown };
}

// ---------- ROLE LANDING ----------
function RoleLanding({ onPick }) {
  return (
    <section className="hero fade-up">
      <div className="eyebrow">Performance Dashboard</div>
      <h1>Choose your <em>squad</em></h1>
      <p>Premium player cards for the Leverage Homes sales team — pulled from live YTD performance, ranked, and rendered on demand.</p>

      <div className="role-tiles">
        <button className="role-tile" onClick={() => onPick("vp")}>
          <div className="role-tag"><span className="num">01</span> Leadership Tier</div>
          <h2><span className="abbr">VP</span></h2>
          <div className="meta">
            <span>Vice Presidents</span>
            <span className="count">{vps.length}<small style={{fontSize:14,color:"rgba(255,255,255,0.6)",marginLeft:6}}>active</small></span>
          </div>
        </button>
        <button className="role-tile" onClick={() => onPick("am")}>
          <div className="role-tag"><span className="num">02</span> Acquisitions Tier</div>
          <h2><span className="abbr">AM</span></h2>
          <div className="meta">
            <span>Acquisition Managers</span>
            <span className="count">{ams.length}<small style={{fontSize:14,color:"rgba(255,255,255,0.6)",marginLeft:6}}>active</small></span>
          </div>
        </button>
      </div>
    </section>
  );
}

// ---------- ROSTER ----------
function Roster({ role, onPickName, onBack }) {
  const list = (role === "vp" ? vps : ams).map(withOverall).sort((a,b) => b.overall - a.overall);
  const tierColor = (t) => ({
    diamond:"#1B6F5C", gold:"#9A6A0E", silver:"#1F507E", bronze:"#8A4A1A"
  })[t];
  const title = role === "vp" ? "Vice Presidents" : "Acquisition Managers";

  return (
    <section className="fade-up">
      <div className="section-head">
        <div>
          <h2><em>{title.split(" ")[0]}</em> {title.split(" ").slice(1).join(" ")}</h2>
          <div className="sub">Tap a name to reveal their card · sorted by Overall</div>
        </div>
        <button className="back" onClick={onBack}>← Back to roles</button>
      </div>

      <div className="roster-grid stagger">
        {list.map(p => (
          <button
            key={p.id}
            className="roster-cell"
            style={{"--cell-tier-color": tierColor(p.tier)}}
            onClick={() => onPickName(p.id)}
          >
            <div className="tier-stripe"/>
            <div className="ovr">{p.overall}</div>
            <div className="photo-mini">
              <image-slot
                id={`shot-${p.id}`}
                shape="circle"
                {...(p.headshot ? { src: p.headshot } : {})}
                placeholder={initialsOf(p.name)}
              ></image-slot>
            </div>
            <div className="name">{p.name}</div>
            <div className="role-mini">{tierLabel(p.tier)} · {p.role.includes("Vice") ? "VP" : "AM"}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

// ---------- DETAIL ----------
function Detail({ playerId, role, onBack, tweaks }) {
  const list = role === "vp" ? vps : ams;
  const player = useMemo(() => withOverall(list.find(p => p.id === playerId)), [playerId, role]);
  const animOvr = Math.round(window.LH_COMP.useCountUp(player.overall, 1200, [player.id]));

  return (
    <section className="fade-up">
      <div className="section-head" style={{marginBottom:16}}>
        <div>
          <div className="sub" style={{marginBottom:8}}>
            {role === "vp" ? "Vice President" : "Acquisition Manager"} · Player Card
          </div>
          <h2 style={{fontSize:36}}><em>{player.name.split(" ")[0]}</em> {player.name.split(" ").slice(1).join(" ")}</h2>
        </div>
        <button className="back" onClick={onBack}>← Back to roster</button>
      </div>

      <div className="stage">
        <div className="card-wrap">
          <PlayerCard player={player} overall={player.overall} tier={tweaks.tierTreatments ? player.tier : "gold"}/>
        </div>

        <div className="detail">
          <div className="meta-row">
            <div>
              <h2><span className="role-i">{tierLabel(player.tier)} · OVERALL</span>{player.overall}</h2>
            </div>
            <div className="ovr-big" style={{
              color: player.tier === "diamond" ? "#E8F1F8"
                   : player.tier === "silver"  ? "#DCE3EA"
                   : player.tier === "bronze"  ? "#D69A6A"
                   : "#E5C475"
            }}>
              <small>weighted score</small>
              {animOvr}<span style={{color:"var(--text-3)",fontStyle:"normal",fontSize:24}}> / 99</span>
            </div>
          </div>

          <h3 style={{fontFamily:"var(--font-ui)",fontSize:11,letterSpacing:"0.24em",color:"var(--text-3)",textTransform:"uppercase",fontWeight:600}}>
            Stat breakdown — YTD vs target
          </h3>
          <StatBars player={player} breakdown={player.breakdown} tier={player.tier}/>

          <p className="legend">
            Overall is calculated by weighting each YTD metric against its target (ARIP 23%, Deal Review LM 21.6%, Closed Rev/Qtr 20%, Pipeline 15%, Closed Rev/Attr & Closed % 7.5%, Deal Review LLM 5.4%) then normalizing to 0–99. Bars cap visually at 100% of target; each player can over-perform.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------- LEADERBOARD ----------
function Leaderboard({ onPick }) {
  const vpList = vps.map(withOverall).sort((a,b) => b.overall - a.overall);
  const amList = ams.map(withOverall).sort((a,b) => b.overall - a.overall);
  const maxVP = vpList[0]?.overall || 99;
  const maxAM = amList[0]?.overall || 99;

  const renderGroup = (list, max) => (
    <div className="leaderboard stagger">
      {list.map((p, i) => (
        <div key={p.id} className={`lb-row t-${p.tier} ${i<3 ? `top${i+1}` : ""}`} onClick={() => onPick(p)}>
          <div className="rank">#{i+1}</div>
          <div>
            <div className="nm">{p.name}</div>
            <div className="rl">{tierLabel(p.tier)} · {p.role.includes("Vice") ? "VP" : "AM"}</div>
          </div>
          <div className="barbed"><div style={{width: `${(p.overall/max)*100}%`}}/></div>
          <div style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-2)",textAlign:"right"}}>
            {fmtMoney(p.stats.closedRevQtr)}
          </div>
          <div className="ov">{p.overall}</div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="fade-up">
      <div className="section-head">
        <div>
          <h2><em>Team</em> Leaderboard</h2>
          <div className="sub">Ranked by weighted Overall · Q1 2026</div>
        </div>
      </div>

      <div className="lb-section-head">Vice Presidents · {vpList.length}</div>
      {renderGroup(vpList, maxVP)}

      <div className="lb-section-head">Acquisition Managers · {amList.length}</div>
      {renderGroup(amList, maxAM)}
    </section>
  );
}

// ---------- COMPARE ----------
function Compare() {
  const all = [...vps, ...ams].map(withOverall);
  const [a, setA] = useState(all[0]?.id);
  const [b, setB] = useState(all[1]?.id);
  const A = all.find(p => p.id === a);
  const B = all.find(p => p.id === b);

  const compareKeys = [
    "appts", "icp5", "arip", "dealReview", "dealReviewLM", "dealReviewLLM",
    "closedPct", "closedRevAttr", "closedRevQtr", "pipeline", "contracts"
  ].filter(k => (A?.stats[k] !== undefined) || (B?.stats[k] !== undefined));

  const Picker = ({ value, set }) => (
    <select
      value={value}
      onChange={e => set(e.target.value)}
      style={{
        appearance:"none",background:"rgba(0,0,0,0.4)",color:"#EDEFF3",
        border:"1px solid rgba(255,255,255,0.16)",borderRadius:8,padding:"10px 14px",
        fontFamily:"inherit",fontSize:13,letterSpacing:"0.04em",cursor:"pointer",width:"100%"
      }}
    >
      <optgroup label="Vice Presidents">{vps.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</optgroup>
      <optgroup label="Acquisition Managers">{ams.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</optgroup>
    </select>
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
          <Picker value={a} set={setA}/>
          <div style={{marginTop:18}}>
            <PlayerCard player={A} overall={A.overall} tier={A.tier}/>
          </div>
        </div>
        <div>
          <Picker value={b} set={setB}/>
          <div style={{marginTop:18}}>
            <PlayerCard player={B} overall={B.overall} tier={B.tier}/>
          </div>
        </div>
      </div>

      <div style={{marginTop:32,border:"1px solid var(--line)",borderRadius:12,padding:"14px 22px",background:"rgba(255,255,255,0.02)"}}>
        <div className="compare-row" style={{borderBottom:"1px solid var(--line-strong)",paddingBottom:14}}>
          <div className="v l" style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontSize:24,color:"#E5C475"}}>{A?.overall}</div>
          <div className="lbl" style={{color:"#E5C475"}}>OVERALL</div>
          <div className="v r" style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontSize:24,color:"#E5C475"}}>{B?.overall}</div>
        </div>
        {compareKeys.map(k => {
          const meta = STAT_META[k];
          const av = A?.stats[k], bv = B?.stats[k];
          const aWin = (av ?? -1) > (bv ?? -1);
          const bWin = (bv ?? -1) > (av ?? -1);
          return (
            <div className="compare-row" key={k}>
              <div className={`v l ${aWin?"win":bWin?"lose":""}`}>{av !== undefined ? fmtStat(av, meta.kind) : "—"}</div>
              <div className="lbl">{meta.label}</div>
              <div className={`v r ${bWin?"win":aWin?"lose":""}`}>{bv !== undefined ? fmtStat(bv, meta.kind) : "—"}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------- TWEAKS PANEL ----------
function TweaksPanel({ tweaks, setTweak }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({type:'__edit_mode_available'}, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  if (!open) return null;
  return (
    <div style={{
      position:"fixed",bottom:24,right:24,zIndex:100,
      width:300,padding:18,
      background:"rgba(11,26,46,0.95)",
      border:"1px solid rgba(201,162,76,0.3)",
      borderRadius:14,backdropFilter:"blur(12px)",
      boxShadow:"0 20px 60px rgba(0,0,0,0.6)"
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontSize:18}}>Tweaks</div>
        <button onClick={() => {
          setOpen(false);
          window.parent.postMessage({type:'__edit_mode_dismissed'}, '*');
        }} style={{background:"transparent",border:0,color:"var(--text-2)",cursor:"pointer",fontSize:18}}>×</button>
      </div>

      <div style={{fontSize:10,letterSpacing:"0.18em",color:"var(--text-3)",textTransform:"uppercase",marginBottom:8}}>Accent</div>
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {Object.keys(ACCENTS).map(k => (
          <button key={k}
            onClick={() => setTweak("accent", k)}
            style={{
              flex:1,padding:"8px 0",borderRadius:6,
              background: tweaks.accent === k ? "rgba(201,162,76,0.15)" : "rgba(255,255,255,0.04)",
              border: tweaks.accent === k ? "1px solid rgba(201,162,76,0.4)" : "1px solid rgba(255,255,255,0.08)",
              color: "#EDEFF3",fontSize:11,letterSpacing:"0.16em",textTransform:"uppercase",cursor:"pointer"
            }}>{k}</button>
        ))}
      </div>

      {[
        ["tierTreatments","Tier card themes"],
        ["trendArrows","Trend arrows"],
        ["ambientGrid","Ambient grid"],
        ["shineSweep","Shine sweep"],
      ].map(([k,label]) => (
        <label key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px dashed rgba(255,255,255,0.06)",fontSize:12,color:"#EDEFF3",cursor:"pointer"}}>
          <span>{label}</span>
          <span
            onClick={() => setTweak(k, !tweaks[k])}
            style={{
              width:34,height:20,borderRadius:999,position:"relative",
              background: tweaks[k] ? "var(--gold)" : "rgba(255,255,255,0.1)",
              transition:"all .2s"
            }}>
            <span style={{
              position:"absolute",top:2,left: tweaks[k] ? 16 : 2,
              width:16,height:16,borderRadius:"50%",background:"#04080F",
              transition:"all .2s"
            }}/>
          </span>
        </label>
      ))}
    </div>
  );
}

// ---------- APP ----------
function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // route: { view: 'roles' | 'roster' | 'detail' | 'leaderboard' | 'compare', role?, id? }
  const [route, setRoute] = useState({ view: "roles" });

  // Apply accent to root
  useEffect(() => {
    const a = ACCENTS[tweaks.accent] || ACCENTS.gold;
    document.documentElement.style.setProperty("--gold", a.edge);
    document.documentElement.style.setProperty("--gold-2", a.edge2);
    document.documentElement.style.setProperty("--gold-deep", a.deep);
  }, [tweaks.accent]);

  useEffect(() => {
    document.body.classList.toggle("no-grid", !tweaks.ambientGrid);
  }, [tweaks.ambientGrid]);

  const goTo = (view, extra = {}) => setRoute({ view, ...extra });

  return (
    <div className="app" data-screen-label={`01 ${route.view}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">L</div>
          <div className="brand-text">
            <b>Leverage Homes</b>
            <span>Player Cards · Q1 2026</span>
          </div>
        </div>
        <nav className="nav-tabs">
          <button className={`nav-tab ${["roles","roster","detail"].includes(route.view) ? "active":""}`} onClick={() => goTo("roles")}>Squad</button>
          <button className={`nav-tab ${route.view === "leaderboard" ? "active":""}`} onClick={() => goTo("leaderboard")}>Leaderboard</button>
          <button className={`nav-tab ${route.view === "compare" ? "active":""}`} onClick={() => goTo("compare")}>Compare</button>
        </nav>
        <div className="quarter-pill"><span className="dot"/>Live · YTD 2026</div>
      </header>

      {route.view === "roles" && (
        <RoleLanding onPick={(role) => goTo("roster", { role })}/>
      )}
      {route.view === "roster" && (
        <Roster role={route.role}
          onPickName={(id) => goTo("detail", { role: route.role, id })}
          onBack={() => goTo("roles")}/>
      )}
      {route.view === "detail" && (
        <Detail playerId={route.id} role={route.role}
          tweaks={tweaks}
          onBack={() => goTo("roster", { role: route.role })}/>
      )}
      {route.view === "leaderboard" && (
        <Leaderboard onPick={(p) => goTo("detail", {
          role: p.role.includes("Vice") ? "vp" : "am",
          id: p.id
        })}/>
      )}
      {route.view === "compare" && <Compare/>}

      <TweaksPanel tweaks={tweaks} setTweak={setTweak}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
