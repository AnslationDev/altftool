const seo = {
  title: "Kafka Topic Naming Builder — Convention & Rule",
  metaDescription:
    "Compose Kafka topic names from domain, entity, event and version, then derive retry, dead-letter, consumer-group and ACL names — broker rules checked.",
  steps: [
    "Pick a Naming template, Separator and Case, then fill the \"Domain (bounded context)\", Entity, Event type and Schema version fields.",
    "Choose the Retry topics ladder — none, \"5 min and 30 min\", or \"5 min, 30 min and 2 h\" — and tick \"Add a dead-letter topic\".",
    "Read the Topic name with its length out of 249 characters, the Companion topics table and the \"Legal on any Kafka broker\" validation line, then press \"Copy names\".",
  ],
  intro:
    "A Kafka topic naming builder composes a topic name from ordered segments — message type, domain, entity, event type and schema version — and validates the result against the rules the broker actually enforces: a 249-character limit, the legal charset [a-zA-Z0-9._-], the reserved \"__\" prefix, and the dot-versus-underscore collision Kafka rejects at creation time. It also derives the matching retry, dead-letter, consumer-group and ACL-prefix names so a whole topic family stays consistent.",
  useCases: [
    "Agreeing a naming convention before the first production topic is created, when renaming is still free",
    "Generating the retry and dead-letter topic names for a consumer that needs a delayed-retry ladder",
    "Working out the prefix an ACL or Terraform module should grant so one team owns its whole namespace",
  ],
  benefits: [
    ["Broker rules checked", "Length, charset, reserved prefix and the metric-namespace collision are validated, not assumed."],
    ["Whole family at once", "Main, retry tiers, dead-letter, consumer group and ACL prefix are derived from the same segments."],
    ["Version in the name", "A schema version segment lets a breaking change ship as a new topic instead of a broken consumer."],
  ],
  faqs: [
    [
      "What are the rules for Kafka topic names?",
      "A topic name may be up to 249 characters, may contain only ASCII letters, digits, dot, underscore and hyphen, and cannot be empty, \".\" or \"..\". The 249 limit exists because the log directory on disk is named \"<topic>-<partition>\" and must fit inside the usual 255-character filesystem limit.",
    ],
    [
      "Why can't I use both dots and underscores in a Kafka topic name?",
      "Kafka's metrics namespace replaces dots with underscores, so \"a.b\" and \"a_b\" would report under the same metric name. The broker therefore treats them as colliding and refuses to create the second topic. Pick one separator for the whole cluster and never mix them.",
    ],
    [
      "Should a Kafka topic name include the environment?",
      "Only if one cluster genuinely serves more than one environment. If dev, staging and production each have their own cluster, an environment segment is dead weight that also breaks MirrorMaker-style replication where the same name should exist on both sides.",
    ],
    [
      "How do you version a Kafka topic?",
      "Put a version segment such as v1 at the end of the name and treat a backwards-incompatible schema change as a new topic — producers dual-write to v1 and v2 until every consumer has moved, then v1 is retired. Compatible changes (adding an optional field) stay on the same topic and are handled by schema registry compatibility rules.",
    ],
  ],
};

export default seo;
