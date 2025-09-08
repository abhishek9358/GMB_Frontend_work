export interface BusinessLike {
  id: string;
  name: string;
  category?: string;
}

function hash(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getSelectedBusiness(): BusinessLike {
  try {
    const saved = localStorage.getItem("selectedBusiness");
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    id: "1",
    name: "A R Techno Solutions",
    category: "Welding Equipment Dealers",
  };
}

export function generatePerformance(days = 90) {
  const biz = getSelectedBusiness();
  const seed = hash(biz.name + biz.id);
  const rnd = mulberry32(seed);
  const timeline: { date: string; clicks: number; impressions: number; ctr: number; position: number }[] = [];
  let baseClicks = 6 + Math.floor(rnd() * 8);
  let baseImpr = 200 + Math.floor(rnd() * 400);
  let pos = 25 + Math.floor(rnd() * 15);
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const w = Math.sin((i / 7) * Math.PI * 2) * 0.2 + 1; // weekly seasonality
    const clicks = Math.max(0, Math.round((baseClicks + rnd() * 5) * w));
    const impressions = Math.max(clicks, Math.round((baseImpr + rnd() * 120) * w));
    const ctr = impressions ? (clicks / impressions) * 100 : 0;
    pos = Math.max(5, pos + (rnd() - 0.5) * 1.2);
    timeline.push({ date: d.toISOString().slice(0, 10), clicks, impressions, ctr, position: pos });
  }
  const totalClicks = timeline.reduce((a, b) => a + b.clicks, 0);
  const totalImpr = timeline.reduce((a, b) => a + b.impressions, 0);
  const avgCtr = totalImpr ? (totalClicks / totalImpr) * 100 : 0;
  const avgPos = timeline.reduce((a, b) => a + b.position, 0) / timeline.length;

  const queriesSeed = [
    "brand name",
    "service near me",
    "best service",
    "company reviews",
    "pricing",
    "phone number",
    "address",
    "opening hours",
  ];
  const topQueries = queriesSeed.map((q, i) => {
    const c = Math.max(0, Math.round(totalClicks / (8 + i) + rnd() * 30));
    const im = Math.max(c, Math.round(totalImpr / (8 + i) + rnd() * 300));
    const ctrq = im ? (c / im) * 100 : 0;
    const posq = Math.max(3, avgPos + (rnd() - 0.5) * 10);
    return { query: `${biz.name.toLowerCase()} ${q}`, clicks: c, impressions: im, ctr: ctrq, position: posq };
  });

  return {
    business: biz,
    period: `${days} days`,
    totals: { clicks: totalClicks, impressions: totalImpr, ctr: avgCtr, position: avgPos },
    timeline,
    topQueries,
  };
}

function toDomainFromName(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${slug || "business"}.com`;
}

// export function generateIndexing() {
//   const perf = generatePerformance(30);
//   const rnd = mulberry32(hash(perf.business.name) ^ 0xabc123);
//   const totalKnown = 600 + Math.floor(rnd() * 1200);
//   const indexed = Math.round(totalKnown * (0.6 + rnd() * 0.35));
//   const notIndexed = totalKnown - indexed;
//   const reasons = [
//     "Crawled – currently not indexed",
//     "Discovered – currently not indexed",
//     "Excluded by 'noindex' tag",
//     "Alternate page with proper canonical tag",
//     "Page with redirect",
//     "Not found (404)",
//   ];
//   const issues = reasons.slice(0, 5).map((r) => ({ reason: r, pages: Math.max(1, Math.round(notIndexed / 6 + rnd() * 80)) }));
//   const domain = toDomainFromName(perf.business.name);
//   const suggestedUrls = ["/", "/services", "/pricing", "/about", "/contact"].map((p) => `https://${domain}${p}`);
//   return { business: perf.business, totalKnown, indexed, notIndexed, issues, suggestedUrls };
// }


export function generateIndexing() {
  const perf = generatePerformance(30);
  const rnd = mulberry32(hash(perf.business.name) ^ 0xabc123);
  const totalKnown = 600 + Math.floor(rnd() * 1200);
  const indexed = Math.round(totalKnown * (0.6 + rnd() * 0.35));
  const notIndexed = totalKnown - indexed;
  
  // Generate timeline data for index coverage over time
  const timeline: { date: string; indexed: number; notIndexed: number; total: number }[] = [];
  const today = new Date();
  let currentIndexed = Math.max(1, Math.round(indexed * 0.7)); // Start with 70% of final indexed count
  let currentTotal = Math.max(10, Math.round(totalKnown * 0.8)); // Start with 80% of final total
  
  try {
    for (let i = 89; i >= 0; i--) { // 90 days of data
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      // Gradual increase in both total pages discovered and indexed pages
      const progress = (89 - i) / 89; // 0 to 1 over time
      const growthVariation = (rnd() - 0.5) * 0.1; // Small random variation
      
      // Total pages grow over time as Google discovers more
      currentTotal = Math.max(10, Math.round(totalKnown * (0.8 + progress * 0.2 + growthVariation)));
      
      // Indexed pages grow faster initially, then slow down
      const indexingRate = Math.max(0.1, Math.min(0.95, 0.7 + progress * 0.25 + Math.sin(progress * Math.PI) * 0.05));
      currentIndexed = Math.max(1, Math.round(Math.min(currentTotal * indexingRate, indexed * (0.7 + progress * 0.3))));
      
      // Ensure indexed doesn't exceed total
      currentIndexed = Math.min(currentIndexed, currentTotal);
      const currentNotIndexed = Math.max(0, currentTotal - currentIndexed);
      
      timeline.push({
        date: d.toISOString().slice(0, 10),
        indexed: currentIndexed,
        notIndexed: currentNotIndexed,
        total: currentTotal
      });
    }
  } catch (error) {
    console.error('Error generating timeline:', error);
    // Fallback timeline data if generation fails
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      timeline.push({
        date: d.toISOString().slice(0, 10),
        indexed: Math.round(indexed * (0.8 + (29-i) * 0.007)),
        notIndexed: Math.round(notIndexed * (1.2 - (29-i) * 0.007)),
        total: totalKnown
      });
    }
  }
  
  const reasons = [
    "Crawled – currently not indexed",
    "Discovered – currently not indexed",
    "Excluded by 'noindex' tag",
    "Alternate page with proper canonical tag",
    "Page with redirect",
    "Not found (404)",
  ];
  const issues = reasons.slice(0, 5).map((r) => ({ 
    reason: r, 
    pages: Math.max(1, Math.round(notIndexed / 6 + rnd() * 80)) 
  }));
  const domain = toDomainFromName(perf.business.name);
  const suggestedUrls = ["/", "/services", "/pricing", "/about", "/contact"].map((p) => `https://${domain}${p}`);
  
  return { 
    business: perf.business, 
    totalKnown, 
    indexed, 
    notIndexed, 
    issues, 
    suggestedUrls,
    timeline: timeline.length > 0 ? timeline : []
  };
}

export function generateOverview() {
  const perf = generatePerformance(90);
  const indexing = generateIndexing();
  return {
    business: perf.business,
    period: perf.period,
    performance: perf.totals,
    indexing: { indexed: indexing.indexed, notIndexed: indexing.notIndexed },
    coreWebVitals: {
      mobile: { good: 117, needsImprovement: 34, poor: 0 },
      desktop: { good: 151, needsImprovement: 0, poor: 0 },
    },
  };
}


