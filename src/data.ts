import type { Player, StatMeta } from './types';

export const STATIC_VPS: Player[] = [
  {
    id: 'sam',
    name: 'Sam Dogbe',
    role: 'Vice President',
    stats: {
      appts: 421, contracts: 166, icp5: 0.4489, arip: 0.1259,
      dealReview: 0.6333, closedPct: 0.0166,
      closedRevAttr: 372392.23, closedRevQtr: 680168.74, pipeline: 1273451.74,
    },
  },
  {
    id: 'joey',
    name: 'Joey Szal',
    role: 'Vice President',
    stats: {
      appts: 528, contracts: 169, icp5: 0.3466, arip: 0.0814,
      dealReview: 0.5833, closedPct: 0.0095,
      closedRevAttr: 224122.13, closedRevQtr: 401691.41, pipeline: 433447.50,
    },
  },
  {
    id: 'ray',
    name: "Ray O'Donnell",
    role: 'Vice President',
    stats: {
      appts: 373, contracts: 161, icp5: 0.2574, arip: 0.0590,
      dealReview: 0.6800, closedPct: 0.0080,
      closedRevAttr: 40999.29, closedRevQtr: 236224.64, pipeline: 490000.00,
    },
  },
];

export const STATIC_AMS: Player[] = [
  {
    id: 'bhavin',
    name: 'Bhavin Shroff',
    role: 'Acquisition Manager',
    stats: {
      appts: 313, icp5: 0.7059, arip: 0.0882,
      dealReviewLM: 0.5429, dealReviewLLM: 0.4615, closedPct: 0.0196,
      closedRevAttr: 102154.94, closedRevQtr: 513870.32, pipeline: 766202.82,
    },
  },
  {
    id: 'erick',
    name: 'Erick Bonilla',
    role: 'Acquisition Manager',
    stats: {
      appts: 342, icp5: 0.3297, arip: 0.0659,
      dealReviewLM: 0.50, dealReviewLLM: 0.40, closedPct: 0.0220,
      closedRevAttr: 205134.44, closedRevQtr: 485891.41, pipeline: 578163.94,
    },
  },
  {
    id: 'nick',
    name: 'Nick Miller',
    role: 'Acquisition Manager',
    stats: {
      appts: 381, icp5: 0.4140, arip: 0.0860,
      dealReviewLM: 0.7436, dealReviewLLM: 0.1429, closedPct: 0.0108,
      closedRevAttr: 31149.29, closedRevQtr: 369501.46, pipeline: 1148672.50,
    },
  },
  {
    id: 'rodney',
    name: 'Rodney Malloy',
    role: 'Acquisition Manager',
    stats: {
      appts: 116, icp5: 0.4043, arip: 0.0,
      dealReviewLM: 0.0, dealReviewLLM: 0.0, closedPct: 0.0,
      closedRevAttr: 0, closedRevQtr: 0, pipeline: 50000,
    },
  },
  {
    id: 'francis',
    name: 'Francis Qhobosheane',
    role: 'Acquisition Manager',
    stats: {
      appts: 146, icp5: 0.2184, arip: 0.0460,
      dealReviewLM: 0.3333, dealReviewLLM: 0.0, closedPct: 0.0115,
      closedRevAttr: 30200, closedRevQtr: 30200, pipeline: 45000,
    },
  },
  {
    id: 'luke',
    name: 'Luke Nam',
    role: 'Acquisition Manager',
    stats: {
      appts: 0, icp5: 0.0, arip: 0.0,
      dealReviewLM: 1.0, dealReviewLLM: 0.0, closedPct: 0.0,
      closedRevAttr: 0, closedRevQtr: 0, pipeline: 50000,
    },
  },
  {
    id: 'billy',
    name: 'Billy Liapis',
    role: 'Acquisition Manager',
    stats: {
      appts: 0, icp5: 0.0, arip: 0.0,
      dealReviewLM: 0.0, dealReviewLLM: 1.0, closedPct: 0.0,
      closedRevAttr: 0, closedRevQtr: 0, pipeline: 85000,
    },
  },
];

export const VP_WEIGHTS: Record<string, { weight: number; target: number }> = {
  arip:          { weight: 30,   target: 0.10 },
  dealReview:    { weight: 30,   target: 0.50 },
  closedPct:     { weight: 5,    target: 0.015 },
  closedRevAttr: { weight: 5,    target: 400000 },
  closedRevQtr:  { weight: 25,   target: 600000 },
  pipeline:      { weight: 5,    target: 1500000 },
};

export const AM_WEIGHTS: Record<string, { weight: number; target: number }> = {
  arip:          { weight: 23,   target: 0.075 },
  dealReviewLM:  { weight: 21.6, target: 0.50 },
  dealReviewLLM: { weight: 5.4,  target: 0.50 },
  closedPct:     { weight: 7.5,  target: 0.015 },
  closedRevAttr: { weight: 7.5,  target: 35000 },
  closedRevQtr:  { weight: 20,   target: 350000 },
  pipeline:      { weight: 15,   target: 800000 },
};

// backward compat alias
export const WEIGHTS = AM_WEIGHTS;

export const STAT_META: Record<string, StatMeta> = {
  appts:         { label: 'APPTs Attended',            kind: 'int',   icon: 'calendar' },
  contracts:     { label: 'Contracts Sent',            kind: 'int',   icon: 'doc' },
  icp5:          { label: '5+ ICP',                    kind: 'pct',   icon: 'users' },
  arip:          { label: 'ARIP',                      kind: 'pct',   icon: 'trend' },
  dealReview:    { label: 'Deal Review',               kind: 'pct',   icon: 'review' },
  dealReviewLM:  { label: 'Deal Review LM',            kind: 'pct',   icon: 'review' },
  dealReviewLLM: { label: 'Deal Review LLM',           kind: 'pct',   icon: 'review' },
  closedPct:     { label: 'Closed',                    kind: 'pct',   icon: 'check' },
  closedRevAttr: { label: 'Closed Rev (Attributed)',   kind: 'money', icon: 'money' },
  closedRevQtr:  { label: 'Closed Rev (Quarter)',      kind: 'money', icon: 'money' },
  pipeline:      { label: 'Projected Pipeline',        kind: 'money', icon: 'pipe' },
};
