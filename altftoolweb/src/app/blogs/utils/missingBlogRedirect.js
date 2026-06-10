const DIRECT_MISSING_BLOG_REDIRECTS = {
  "ats-friendly-resume-templates": "/blogs/simple-resume-templates-that-look-clean-and-modern",
  "base64": "/tools/all?search=base64",
  "best": "/blogs?q=best",
  "best-": "/blogs?q=best",
  "bes": "/blogs?q=best",
  "best-ai-tools-for-coding-and-development": "/blogs?q=ai%20coding%20development",
  "best-productivity-tools-for-programmers": "/blogs?q=programmer%20productivity%20tools",
  "best-schema": "/blogs?q=schema",
  "best-utm": "/blogs?q=utm",
  "best-veed": "/blogs?q=veed",
  "business": "/blogs/category/business",
  "c": "/blogs?q=code",
  "json": "/tools/all?search=json",
  "percentage": "/tools/all?search=percentage",
  "resume-templates-for-freshers": "/blogs/simple-resume-templates-that-look-clean-and-modern",
  "what": "/blogs?q=ai%20systems",
};

export function normalizeMissingBlogSlug(slug = "") {
  return String(slug)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getMissingBlogRedirect(slug = "") {
  const normalizedSlug = normalizeMissingBlogSlug(slug);
  if (!normalizedSlug) return "/blogs";
  return DIRECT_MISSING_BLOG_REDIRECTS[normalizedSlug] || "";
}
