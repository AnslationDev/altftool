





const cache = new Map();
const TTL_MS = 1000 * 60 * 10;

function pseudoAvailability(domain) {
  
  let h = 0;
  for (let i = 0; i < domain.length; i++) h = (h * 31 + domain.charCodeAt(i)) >>> 0;
  const r = h % 100;
  if (r < 58) return "taken";
  if (r < 78) return "premium";
  return "available";
}

export async function checkAvailability(domain) {
  const now = Date.now();
  const hit = cache.get(domain);
  if (hit && now - hit.at < TTL_MS) return hit.status;

  // Simulate network latency and occasional failure.
  await new Promise((r) => setTimeout(r, 450 + (domain.length % 5) * 120));
  const fail = domain.length % 17 === 0;
  if (fail) throw new Error("availability_api_failed");

  const status = pseudoAvailability(domain);
  cache.set(domain, { status, at: now });
  return status;
}

export function getCachedAvailability(domain) {
  const hit = cache.get(domain);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) return null;
  return hit.status;
}