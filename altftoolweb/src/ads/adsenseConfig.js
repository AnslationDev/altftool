export const ADSENSE_CLIENT = "ca-pub-5858966346488022";
export const ADSENSE_PUBLISHER_ID = "pub-5858966346488022";
export const ADSENSE_SCRIPT_SRC =
  `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

const PRODUCTION_HOSTS = new Set(["altftool.com", "www.altftool.com"]);

function normalizeHostname(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  const candidate = value.trim().toLowerCase();
  try {
    return new URL(
      candidate.includes("://") ? candidate : `https://${candidate}`,
    ).hostname;
  } catch {
    return "";
  }
}

export function isAdsenseProductionHost(value) {
  return PRODUCTION_HOSTS.has(normalizeHostname(value));
}

export function isAdsenseProductionDeployment(env = process.env) {
  if (env.NODE_ENV === "development" || env.NODE_ENV === "test") return false;

  if (env.VERCEL_ENV) {
    return env.VERCEL_ENV === "production";
  }

  if (env.AWS_BRANCH) {
    return env.AWS_BRANCH === "main";
  }

  return isAdsenseProductionHost(env.NEXT_PUBLIC_SITE_URL);
}
