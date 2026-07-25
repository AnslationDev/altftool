function stableHash(value = "") {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function entryKey(entry = {}) {
  return `${entry.app || "web"}:${entry.route || ""}`;
}

export function parseRouteQaShard(value) {
  const input = String(value || "").trim();
  if (!input) return null;

  const match = input.match(/^(\d+)\/(\d+)$/);
  if (!match) {
    throw new Error(
      `Invalid route QA shard "${input}". Use a one-based value such as 1/4.`,
    );
  }

  const index = Number(match[1]);
  const total = Number(match[2]);
  if (
    !Number.isSafeInteger(index) ||
    !Number.isSafeInteger(total) ||
    total < 1 ||
    index < 1 ||
    index > total
  ) {
    throw new Error(
      `Invalid route QA shard "${input}". The index must be between 1 and ${total || 1}.`,
    );
  }

  return {
    index,
    total,
    label: `${index}/${total}`,
  };
}

export function routeQaShardNumber(entry, total) {
  if (!Number.isSafeInteger(total) || total < 1) {
    throw new Error("Route QA shard total must be a positive integer.");
  }
  return (stableHash(entryKey(entry)) % total) + 1;
}

export function selectRouteQaShard(entries, shard) {
  if (!shard) return [...entries];
  return entries.filter(
    (entry) => routeQaShardNumber(entry, shard.total) === shard.index,
  );
}
