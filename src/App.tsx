import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useRoster } from './hooks/useRoster';
import { RoleLanding } from './views/RoleLanding';
import { Roster } from './views/Roster';
import { Detail } from './views/Detail';
import { Leaderboard } from './views/Leaderboard';
import { Compare } from './views/Compare';

function TopBar({ error }: { error: string | null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const squadActive = ['/', '/roster/vp', '/roster/am'].includes(location.pathname) ||
    location.pathname.startsWith('/player/');

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">L</div>
        <div className="brand-text">
          <b>Leverage Homes</b>
          <span>Player Cards · Q1 2026</span>
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${squadActive ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          Squad
        </button>
        <NavLink to="/leaderboard" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
          Leaderboard
        </NavLink>
        <NavLink to="/compare" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
          Compare
        </NavLink>
      </nav>

      <div className="quarter-pill">
        <span className="dot" />
        {error ? (
          <span style={{ color: 'var(--bronze-2)', fontSize: 11 }}>Offline · static data</span>
        ) : (
          'Live · YTD 2026'
        )}
      </div>
    </header>
  );
}

function AppInner() {
  const { vps, ams, loading, error } = useRoster();

  useEffect(() => {
    // Apply emerald accent as default
    document.documentElement.style.setProperty('--gold', '#3BBFA0');
    document.documentElement.style.setProperty('--gold-2', '#5FE0BC');
    document.documentElement.style.setProperty('--gold-deep', '#1B6F5C');
  }, []);

  return (
    <div className="app">
      <TopBar error={error} />
      {loading && (
        <div style={{
          textAlign: 'center', padding: '40px 0', color: 'var(--text-3)',
          fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>
          Loading live data…
        </div>
      )}
      <Routes>
        <Route path="/" element={<RoleLanding vps={vps} ams={ams} />} />
        <Route path="/roster/:role" element={<Roster vps={vps} ams={ams} />} />
        <Route path="/player/:role/:id" element={<Detail vps={vps} ams={ams} />} />
        <Route path="/leaderboard" element={<Leaderboard vps={vps} ams={ams} />} />
        <Route path="/compare" element={<Compare vps={vps} ams={ams} />} />
      </Routes>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter basename="/lvghomes-player-cards">
      <AppInner />
    </BrowserRouter>
  );
}
