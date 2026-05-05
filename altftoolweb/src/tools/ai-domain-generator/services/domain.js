

export function scoreBrandability(sld){
  
  const len = sld.length;
  let score = 100;
  score -= Math.max(0, len - 8) * 4;
  score -= (sld.match(/-/g)?.length ?? 0) * 10;
  score -= (sld.match(/[0-9]/g)?.length ?? 0) * 6;
  if (/[aeiou]/.test(sld)) score += 3;
  if (/^[a-z]+$/.test(sld)) score += 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function keywordBreakdown(idea, sld) {
  const words = idea
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const parts = [];
  for (const w of words) {
    if (w.length >= 3 && sld.includes(normalizeToSld(w))) parts.push(w);
  }
  if (parts.length === 0) {
    // fallback: split by hyphen or common chunks
    parts.push(...sld.split("-").filter(Boolean).slice(0, 4));
  }
  return Array.from(new Set(parts)).slice(0, 6);
}

export function buildDetails(idea, domain){
  const sld = domain.sld;

  const similar = [
    `${sld}hq${domain.tld}`,
    `${sld}app${domain.tld}`,
    `${sld}now${domain.tld}`,
    `${sld}labs${domain.tld}`,
    `${sld}studio${domain.tld}`,
  ].slice(0, 5);

  return {
    domain: domain.name,
    length: sld.length,
    keywordBreakdown: keywordBreakdown(idea, sld),
    brandScore: scoreBrandability(sld),
    similar,
  };
}

export function availabilityColor( a) {
  switch (a) {
    case "available":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "taken":
      return "text-rose-700 bg-rose-50 border-rose-200";
    case "premium":
      return "text-amber-800 bg-amber-50 border-amber-200";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200";
  }
}

export function availabilityLabel(a) {
  switch (a) {
    case "available":
      return "Available";
    case "taken":
      return "Taken";
    case "premium":
      return "Premium";
    default:
      return "Checking…";
  }
}

export function styleLabel(style) {
  switch (style) {
    case "brandable":
      return "Brandable";
    case "seo":
      return "SEO";
    case "short":
      return "Short";
    case "startup":
      return "Startup";
  }
}