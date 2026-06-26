const TRUE_VALUES = new Set(["1", "true", "yes", "on", "enabled"]);
const PUBLIC_FEATURE_FLAGS = {
  ad_fix_viewport: process.env.NEXT_PUBLIC_AD_FIX_VIEWPORT,
  blog_export: process.env.NEXT_PUBLIC_BLOG_EXPORT,
  blog_preview: process.env.NEXT_PUBLIC_BLOG_PREVIEW,
  fix_ckeditor_write: process.env.NEXT_PUBLIC_FIX_CKEDITOR_WRITE,
};

function readFlagSet(value = "") {
  return new Set(
    String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export function isFeatureEnabled(name, env = process.env) {
  if (!name) return false;

  const direct = PUBLIC_FEATURE_FLAGS[name] ?? env[name.toUpperCase()];
  if (direct !== undefined) return TRUE_VALUES.has(String(direct).toLowerCase());

  const publicFlags = readFlagSet(env.NEXT_PUBLIC_ALTFT_FEATURES);
  const serverFlags = readFlagSet(env.ALTFT_FEATURES);

  return publicFlags.has(name) || serverFlags.has(name);
}
