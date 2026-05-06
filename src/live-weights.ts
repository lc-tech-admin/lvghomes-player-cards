type WeightMap = Record<string, { weight: number; target: number }>;

let _vp: WeightMap | null = null;
let _am: WeightMap | null = null;

export function setLiveWeights(vp: WeightMap, am: WeightMap) {
  _vp = Object.keys(vp).length > 0 ? vp : null;
  _am = Object.keys(am).length > 0 ? am : null;
}

export function getLiveVPWeights(): WeightMap | null { return _vp; }
export function getLiveAMWeights(): WeightMap | null { return _am; }
