import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useRoster } from './hooks/useRoster';
import { RoleLanding } from './views/RoleLanding';
import { Roster } from './views/Roster';
import { Detail } from './views/Detail';
import { Leaderboard } from './views/Leaderboard';
import { Compare } from './views/Compare';

function TopBar({ error, onRefresh, refreshing }: { error: string | null; onRefresh: () => void; refreshing: boolean }) {
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh live data from Google Sheets"
          style={{
            background: 'none', border: '1.5px solid var(--border)',
            borderRadius: 8, padding: '5px 10px', cursor: refreshing ? 'default' : 'pointer',
            color: 'var(--text-2)', fontSize: 12, fontFamily: 'var(--font-ui)',
            letterSpacing: '0.06em', opacity: refreshing ? 0.5 : 1,
            display: 'flex', alignItems: 'center', gap: 5, transition: 'opacity .15s',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}>
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>

        <div className="quarter-pill">
          <span className="dot" />
          {error ? (
            <span style={{ color: 'var(--bronze-2)', fontSize: 11 }}>Offline · static data</span>
          ) : (
            'Live · YTD 2026'
          )}
        </div>
      </div>
    </header>
  );
}

function AppInner() {
  const { vps, ams, loading, error, refresh } = useRoster();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--gold', '#3BBFA0');
    document.documentElement.style.setProperty('--gold-2', '#5FE0BC');
    document.documentElement.style.setProperty('--gold-deep', '#1B6F5C');
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 2000);
  }

  return (
    <div className="app">
      <TopBar error={error} onRefresh={handleRefresh} refreshing={refreshing || loading} />
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
