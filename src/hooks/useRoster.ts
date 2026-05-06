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
        const json = await res.json() as { vps: Record<string, unknown>[]; ams: Record<string, unknown>[]; quarter?: string; updatedAt?: string };
        const normalized: RosterData = {
          updatedAt: json.updatedAt || new Date().toISOString(),
          quarter: json.quarter || 'Q1 2026',
          vps: (json.vps || []).map(p => normalizePlayer(p, 'vp')),
          ams: (json.ams || []).map(p => normalizePlayer(p, 'am')),
        };
        setData(normalized);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: normalized, timestamp: Date.now() }));
      } catch {
        setError('Could not load live data — showing cached stats.');
        // Keep static data already in state
      }

      setLoading(false);
    }

    fetchRoster();
  }, []);

  return { vps: data.vps, ams: data.ams, quarter: data.quarter, loading, error };
}
