// Weighted Overall calculation: sum of (clamp(stat / target, 0, 1.25) * weight)
// scaled to 0..99. Designed to feel rewarding but punish zeros.
window.LH_OVERALL = (() => {
  const W = window.LH_DATA.WEIGHTS;

  function ratio(value, target) {
    if (!target || target <= 0) return 0;
    const r = value / target;
    // soft cap at 125% so blowout numbers can push above 99 territory
    return Math.max(0, Math.min(r, 1.25));
  }

  function compute(player) {
    const keys = Object.keys(player.stats).filter(k => W[k]);
    let totalWeight = 0;
    let earned = 0;
    const breakdown = {};
    keys.forEach(k => {
      const { weight, target } = W[k];
      const r = ratio(player.stats[k], target);
      totalWeight += weight;
      earned += r * weight;
      breakdown[k] = { ratio: r, weight, target, value: player.stats[k] };
    });
    if (totalWeight === 0) return { overall: 0, breakdown };
    // normalize to 0..99
    const normalized = (earned / totalWeight) * 99;
    // a tiny bonus curve so 80% performance feels like 80, not flat
    const overall = Math.round(Math.min(99, normalized * 1.05));
    return { overall: Math.max(1, overall), breakdown };
  }

  function tier(overall) {
    if (overall >= 90) return "diamond";
    if (overall >= 80) return "gold";
    if (overall >= 70) return "silver";
    return "bronze";
  }

  function tierLabel(t) {
    return ({ diamond: "DIAMOND", gold: "GOLD", silver: "SILVER", bronze: "BRONZE" })[t];
  }

  return { compute, tier, tierLabel };
})();
