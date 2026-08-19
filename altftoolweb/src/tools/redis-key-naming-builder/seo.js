const seo = {
  title: "Redis Key Builder: app:env:tenant:entity:id",
  metaDescription:
    "Build a colon-separated Redis key convention with env, tenant and version segments and cluster hash tags, checked against 128 characters.",
  steps: [
    "Enter the App namespace, Entity (object type), Sample object id and an optional Trailing attribute, then choose a Separator.",
    "Switch on the Environment segment, Tenant segment (multi-tenant), Schema version segment and Redis Cluster hash tag {…} as your scheme needs.",
    "Read the worked example key, its Template and the character count against the 128-character guideline, then press Copy convention.",
  ],
  intro:
    "This builder designs a namespaced Redis key convention — app:env:tenant:entity:id:attribute — following the object-type:id scheme recommended in the Redis documentation, with colon separators, optional schema-version segments and Redis Cluster hash tags. Every segment is validated against practical key hygiene: no whitespace or control characters, no separator collisions, no stray braces, case-consistency, and a length check against a 128-character team guideline (Redis itself allows up to 512 MB). It is for teams standardising cache and session keys before ad-hoc names spread through the codebase.",
  useCases: [
    "Defining one key scheme like shop:prod:user:1000:profile that every service in the team follows for cache entries",
    "Adding a {tenant} hash tag so all keys of one customer land in the same Redis Cluster slot and per-tenant MGET and transactions keep working",
    "Introducing a v2 version segment so a changed serialisation format can roll out without colliding with v1 keys",
  ],
  benefits: [
    ["Documented convention", "Produces both a template with placeholders and a worked example you can paste into a style guide."],
    ["Cluster-aware", "Hash tags are placed on the tenant or the entity+id pair, with a warning about hot-spotting a single slot."],
    ["Hygiene checks", "Whitespace, separator collisions, braces, mixed case and over-long keys are caught before they ship."],
  ],
  faqs: [
    [
      "What is the naming convention for Redis keys?",
      "The Redis documentation recommends colon-separated object-type:id schemes such as user:1000 or user:1000:followers, keeping keys short but readable. Most teams prepend an application namespace and environment (shop:prod:user:1000) so multiple apps can safely share one Redis instance.",
    ],
    [
      "How long can a Redis key be?",
      "Up to 512 MB — Redis keys are binary-safe strings. In practice the docs advise against long keys because every lookup pays for the key's memory and comparison cost; a common team guideline is to stay under roughly 128 characters, which this tool checks against.",
    ],
    [
      "What is a Redis hash tag and when do I need one?",
      "In Redis Cluster, the hash slot is computed from the substring between the first { and the next } in the key — the hash tag. Keys sharing a tag, like {acme}:cart:1 and {acme}:cart:2, map to the same slot, which is required for multi-key commands such as MGET, SUNION or MULTI transactions across those keys. On a single non-clustered Redis instance hash tags change nothing.",
    ],
    [
      "Are Redis keys case-sensitive?",
      "Yes — user:1000 and User:1000 are two different keys. That is why this builder warns on mixed-case segments: an all-lower-case convention removes an entire class of cache-miss bugs caused by inconsistent casing between services.",
    ],
  ],
};

export default seo;
