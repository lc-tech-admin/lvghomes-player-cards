import { useState, useEffect } from 'react';
import { STATIC_VPS, STATIC_AMS } from '../data';
import { setLiveWeights } from '../live-weights';
import type { Player, RosterData } from '../types';

const CACHE_KEY = 'lh-roster-cache';
const CACHE_TTL = 5 * 60 * 1000;

type WeightMap = Record<string, { weight: number; target: number }>;
type ApiResponse = {
  vps?: Record<string, unknown>[];
  ams?: Record<string, unknown>[];
  vpWeights?: WeightMap;
  amWeights?: WeightMap;
  quarter?: string;
  updatedAt?: string;
};

function normalizePlayer(p: Record<string, unknown>, role: 'vp' | 'am'): Player {
  const name = String(p.name || '');
  return {
    id: String(p.id || name.toLowerCase().replace(/[^a-z0-9]/g, '-')),
    name,
    role: role === 'vp' ? 'Vice President' : 'Acquisition Manager',
    stats: (p.stats as Player['stats']) || {},
  };
}

function applyLiveWeights(json: ApiResponse) {
  if (json.vpWeights && json.amWeights) {
    setLiveWeights(json.vpWeights, json.amWeights);
  }
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
          const { data: cachedData, weights, timestamp } = JSON.parse(cached) as {
            data: RosterData; weights?: { vp: WeightMap; am: WeightMap }; timestamp: number
          };
          if (Date.now() - timestamp < CACHE_TTL) {
            if (weights) setLiveWeights(weights.vp, weights.am);
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
        const json = await res.json() as ApiResponse;

        if (!Array.isArray(json.vps) && !Array.isArray(json.ams)) {
          throw new Error('Unexpected response format from Apps Script');
        }

        applyLiveWeights(json);

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
        const cachePayload = {
          data: normalized,
          weights: json.vpWeights && json.amWeights
            ? { vp: json.vpWeights, am: json.amWeights }
            : undefined,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not load live data';
        setError(msg);
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
      .then((json: ApiResponse) => {
        if (!Array.isArray(json.vps) && !Array.isArray(json.ams)) throw new Error('bad format');
        applyLiveWeights(json);
        const normalized: RosterData = {
          updatedAt: json.updatedAt || new Date().toISOString(),
          quarter: json.quarter || 'Q1 2026',
          vps: (json.vps || []).map(p => normalizePlayer(p, 'vp')),
          ams: (json.ams || []).map(p => normalizePlayer(p, 'am')),
        };
        if (normalized.vps.length === 0 && normalized.ams.length === 0) throw new Error('empty');
        setData(normalized);
        const cachePayload = {
          data: normalized,
          weights: json.vpWeights && json.amWeights
            ? { vp: json.vpWeights, am: json.amWeights }
            : undefined,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
        setError(null);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Refresh failed'))
      .finally(() => setLoading(false));
  }

  return { vps: data.vps, ams: data.ams, quarter: data.quarter, loading, error, refresh };
}
