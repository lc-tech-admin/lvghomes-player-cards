import { useState, useEffect } from 'react';
import { STATIC_VPS, STATIC_AMS } from '../data';
import type { Player, RosterData } from '../types';

const CACHE_KEY = 'lh-roster-cache';
const CACHE_TTL = 5 * 60 * 1000;

function normalizePlayer(p: Record<string, unknown>, role: 'vp' | 'am'): Player {
  const name = String(p.name || '');
  return {
    id: String(p.id || name.toLowerCase().replace(/[^a-z0-9]/g, '-')),
    name,
    role: role === 'vp' ? 'Vice President' : 'Acquisition Manager',
    stats: (p.stats as Player['stats']) || {},
  };
}

export function useRoster() {
  const [data, setData] = useState<RosterData>({
    updatedAt: new Date().toISOString(),
    quarter: 'Q1 2026',
    vps: STATIC_VPS,
    ams: STATIC_AMS,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const SHEET_URL: string | undefined = import.meta.env.VITE_SHEET_URL;
    if (!SHEET_URL) return;

    async function fetchRoster() {
      setLoading(true);
      setError(null);

      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached) as { data: RosterData; timestamp: number };
          if (Date.now() - timestamp < CACHE_TTL) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore bad cache
      }

      try {
        const res = await fetch(SHEET_URL as string, { cache: 'no-store' });
        const json = await res.json() as { vps?: Record<string, unknown>[]; ams?: Record<string, unknown>[]; quarter?: string; updatedAt?: string };

        // Guard against malformed or empty responses overwriting static data
        if (!Array.isArray(json.vps) && !Array.isArray(json.ams)) {
          throw new Error('Unexpected response format from Apps Script');
        }

        const normalized: RosterData = {
          updatedAt: json.updatedAt || new Date().toISOString(),
          quarter: json.quarter || 'Q1 2026',
          vps: (json.vps || []).map(p => normalizePlayer(p, 'vp')),
          ams: (json.ams || []).map(p => normalizePlayer(p, 'am')),
        };

        if (normalized.vps.length === 0 && normalized.ams.length === 0) {
          throw new Error('Apps Script returned 0 players — check column indices');
        }

        setData(normalized);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: normalized, timestamp: Date.now() }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not load live data';
        setError(msg);
        // Keep static data already in state
      }

      setLoading(false);
    }

    fetchRoster();
  }, []);

  function refresh() {
    try { localStorage.removeItem(CACHE_KEY); } catch {}
    setLoading(true);
    setError(null);
    const SHEET_URL: string | undefined = import.meta.env.VITE_SHEET_URL;
    if (!SHEET_URL) { setLoading(false); return; }
    fetch(SHEET_URL, { cache: 'no-store' })
      .then(r => r.json())
      .then((json: { vps?: Record<string, unknown>[]; ams?: Record<string, unknown>[]; quarter?: string; updatedAt?: string }) => {
        if (!Array.isArray(json.vps) && !Array.isArray(json.ams)) throw new Error('bad format');
        const normalized: RosterData = {
          updatedAt: json.updatedAt || new Date().toISOString(),
          quarter: json.quarter || 'Q1 2026',
          vps: (json.vps || []).map(p => normalizePlayer(p, 'vp')),
          ams: (json.ams || []).map(p => normalizePlayer(p, 'am')),
        };
        if (normalized.vps.length === 0 && normalized.ams.length === 0) throw new Error('empty');
        setData(normalized);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: normalized, timestamp: Date.now() }));
        setError(null);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Refresh failed'))
      .finally(() => setLoading(false));
  }

  return { vps: data.vps, ams: data.ams, quarter: data.quarter, loading, error, refresh };
}
