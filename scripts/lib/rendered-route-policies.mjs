export function compileNoindexResponseHeaderRules(routesManifest = {}) {
  const rules = [];

  for (const entry of routesManifest.headers || []) {
    const hasNoindexHeader = (entry.headers || []).some(
      (header) =>
        String(header.key || "").toLowerCase() === "x-robots-tag" &&
        /\bnoindex\b/i.test(String(header.value || "")),
    );
    if (!hasNoindexHeader || !entry.regex) continue;

    rules.push({
      source: entry.source || "",
      pattern: new RegExp(entry.regex),
    });
  }

  return rules;
}

export function hasNoindexResponseHeader(route, rules = []) {
  return rules.some((rule) => rule.pattern.test(route));
}
