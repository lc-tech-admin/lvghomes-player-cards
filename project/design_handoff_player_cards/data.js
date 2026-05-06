// Leverage Homes — roster + YTD stats
// Stats reflect screenshot data where available; others use plausible placeholders
// (Q1 2026 YTD). Edit freely or wire to a Google Sheet later.

window.LH_DATA = (() => {
  // VPs use slightly different stat set per spec
  const VP_STAT_KEYS = [
    "appts", "contracts", "icp5", "arip", "dealReview",
    "closedPct", "closedRevAttr", "closedRevQtr", "pipeline"
  ];
  const AM_STAT_KEYS = [
    "appts", "icp5", "arip", "dealReviewLM", "dealReviewLLM",
    "closedPct", "closedRevAttr", "closedRevQtr", "pipeline"
  ];

  // Grade weights (from sheet) used for the Overall calc.
  // Sums to ~100% of weighted contribution.
  const WEIGHTS = {
    icp5:           { weight: 12,   target: 0.50 },     // not in sheet weight col but contributes
    arip:           { weight: 23,   target: 0.075 },
    dealReview:     { weight: 21.6, target: 0.50 },
    dealReviewLM:   { weight: 21.6, target: 0.50 },
    dealReviewLLM:  { weight: 5.4,  target: 0.50 },
    closedPct:      { weight: 7.5,  target: 0.015 },
    closedRevAttr:  { weight: 7.5,  target: 35000 },
    closedRevQtr:   { weight: 20,   target: 350000 },
    pipeline:       { weight: 15,   target: 800000 },
    appts:          { weight: 5,    target: 360 },
    contracts:      { weight: 5,    target: 60 },
  };

  // Roster — VPs
  const vps = [
    {
      id: "sam",
      name: "Sam Dogbe",
      role: "Vice President",
      stats: {
        appts: 281, contracts: 109, icp5: 0.4804, arip: 0.1352,
        dealReview: 0.6364, closedPct: 0.0107,
        closedRevAttr: 182845.30, closedRevQtr: 571379.50, pipeline: 1561915.87
      }
    },
    {
      id: "joey",
      name: "Joey Szal",
      role: "Vice President",
      stats: {
        appts: 363, contracts: 118, icp5: 0.3554, arip: 0.0882,
        dealReview: 0.5161, closedPct: 0.0083,
        closedRevAttr: 89980.51, closedRevQtr: 338809.41, pipeline: 524000.00
      }
    },
    {
      id: "ray",
      name: "Ray O'Donnell",
      role: "Vice President",
      stats: {
        appts: 214, contracts: 94, icp5: 0.2757, arip: 0.0561,
        dealReview: 0.8333, closedPct: 0.0047,
        closedRevAttr: 9850.00, closedRevQtr: 178500.10, pipeline: 408090.00
      }
    },
  ];

  // Roster — AMs (Bhavin/Erick/Nick from sheet, others plausible)
  const ams = [
    {
      id: "bhavin",
      name: "Bhavin Shroff",
      role: "Acquisition Manager",
      stats: {
        appts: 312, icp5: 0.7030, arip: 0.0891,
        dealReviewLM: 0.5429, dealReviewLLM: 0.4615, closedPct: 0.0198,
        closedRevAttr: 102154.94, closedRevQtr: 513870.32, pipeline: 746202.82
      }
    },
    {
      id: "erick",
      name: "Erick Bonilla",
      role: "Acquisition Manager",
      stats: {
        appts: 338, icp5: 0.3296, arip: 0.0615,
        dealReviewLM: 0.50, dealReviewLLM: 0.40, closedPct: 0.0223,
        closedRevAttr: 205134.44, closedRevQtr: 485891.41, pipeline: 558163.94
      }
    },
    {
      id: "nick",
      name: "Nick Miller",
      role: "Acquisition Manager",
      stats: {
        appts: 380, icp5: 0.4162, arip: 0.0865,
        dealReviewLM: 0.7436, dealReviewLLM: 0.1429, closedPct: 0.0108,
        closedRevAttr: 31149.29, closedRevQtr: 369501.46, pipeline: 1236322.50
      }
    },
    {
      id: "oscar",
      name: "Oscar Malik",
      role: "Acquisition Manager",
      stats: {
        appts: 264, icp5: 0.4521, arip: 0.0712,
        dealReviewLM: 0.5882, dealReviewLLM: 0.3500, closedPct: 0.0152,
        closedRevAttr: 64200.00, closedRevQtr: 298400.00, pipeline: 612000.00
      }
    },
    {
      id: "irish",
      name: "Irish Manoguid",
      role: "Acquisition Manager",
      stats: {
        appts: 295, icp5: 0.5104, arip: 0.0950,
        dealReviewLM: 0.6111, dealReviewLLM: 0.4200, closedPct: 0.0203,
        closedRevAttr: 88450.00, closedRevQtr: 421300.00, pipeline: 854000.00
      }
    },
    {
      id: "francis",
      name: "Francis Qhobosheane",
      role: "Acquisition Manager",
      stats: {
        appts: 198, icp5: 0.3232, arip: 0.0455,
        dealReviewLM: 0.4500, dealReviewLLM: 0.2800, closedPct: 0.0091,
        closedRevAttr: 22400.00, closedRevQtr: 142100.00, pipeline: 318000.00
      }
    },
    {
      id: "rodney",
      name: "Rodney Malloy",
      role: "Acquisition Manager",
      stats: {
        appts: 110, icp5: 0.4066, arip: 0.0,
        dealReviewLM: 0.0, dealReviewLLM: 0.0, closedPct: 0.0,
        closedRevAttr: 0, closedRevQtr: 0, pipeline: 0
      }
    },
    {
      id: "billy",
      name: "Billy Liapis",
      role: "Acquisition Manager",
      stats: {
        appts: 247, icp5: 0.4830, arip: 0.0805,
        dealReviewLM: 0.5750, dealReviewLLM: 0.4000, closedPct: 0.0162,
        closedRevAttr: 51200.00, closedRevQtr: 312800.00, pipeline: 698000.00
      }
    },
    {
      id: "luke",
      name: "Luke Nam",
      role: "Acquisition Manager",
      stats: {
        appts: 321, icp5: 0.5530, arip: 0.1105,
        dealReviewLM: 0.6500, dealReviewLLM: 0.4800, closedPct: 0.0249,
        closedRevAttr: 142800.00, closedRevQtr: 488200.00, pipeline: 921000.00
      }
    },
    {
      id: "brian",
      name: "Brian Chacon",
      role: "Acquisition Manager",
      stats: {
        appts: 178, icp5: 0.3596, arip: 0.0521,
        dealReviewLM: 0.4800, dealReviewLLM: 0.3100, closedPct: 0.0112,
        closedRevAttr: 28600.00, closedRevQtr: 184900.00, pipeline: 392000.00
      }
    },
  ];

  // STAT METADATA (label, format, key)
  const STAT_META = {
    appts:          { label: "APPTs Attended",           kind: "int",     icon: "calendar" },
    contracts:      { label: "Contracts Sent",           kind: "int",     icon: "doc" },
    icp5:           { label: "5+ ICP",                   kind: "pct",     icon: "users" },
    arip:           { label: "ARIP",                     kind: "pct",     icon: "trend" },
    dealReview:     { label: "Deal Review",              kind: "pct",     icon: "review" },
    dealReviewLM:   { label: "Deal Review LM",           kind: "pct",     icon: "review" },
    dealReviewLLM:  { label: "Deal Review LLM",          kind: "pct",     icon: "review" },
    closedPct:      { label: "Closed",                   kind: "pct",     icon: "check" },
    closedRevAttr:  { label: "Closed Rev (Attributed)",  kind: "money",   icon: "money" },
    closedRevQtr:   { label: "Closed Rev (Quarter)",     kind: "money",   icon: "money" },
    pipeline:       { label: "Projected Pipeline",       kind: "money",   icon: "pipe" },
  };

  return { vps, ams, WEIGHTS, STAT_META, VP_STAT_KEYS, AM_STAT_KEYS };
})();
