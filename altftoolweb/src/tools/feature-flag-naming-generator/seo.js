const seo = {
  title: "Feature Flag Name Generator: Expiry & Lint Rules",
  metaDescription:
    "Build a flag key from type prefix, team, description and expiry date — linted for negative names and keys over 64 characters, in six case conventions.",
  steps: [
    "Describe what the flag gates and the owning team, then pick a Flag type — release toggle, experiment, operational kill switch or permission gate — and an optional planned removal date.",
    "Choose a Case convention (kebab-case, snake_case, camelCase, PascalCase, SCREAMING_SNAKE or dot.case) and toggle the type-prefix and team segments; the key regenerates on every change.",
    "Copy the finished flag key with 'Copy result', review lint warnings for negative or vague names and keys over 64 characters, or copy any variant from the 'Every case convention' table.",
  ],
  intro:
    "This generator builds a consistent feature flag key from four parts — a type prefix (release, exp, ops or perm), the owning team, what the flag gates, and a planned removal date for temporary flags. It follows Pete Hodgson's feature-toggle taxonomy and the naming guidance published by LaunchDarkly, Unleash and Flagsmith, and lints the result for negative names, vague words and keys over 64 characters, in any of six case conventions.",
  useCases: [
    "A platform team standardising flag names before rolling LaunchDarkly, Unleash or a homegrown flag service out to every squad",
    "A developer creating a release toggle who wants the expiry date baked into the key so the cleanup ticket is obvious",
    "A tech lead writing a naming convention doc who needs the same flag rendered in kebab-case, snake_case, camelCase and SCREAMING_SNAKE for different languages",
  ],
  benefits: [
    ["Type-aware structure", "Release and experiment flags get expiry tags; operational kill switches and permission gates stay evergreen."],
    ["Built-in lint rules", "Warns on negative names like disable-x, vague words like temp or v2, and keys past 64 characters."],
    ["Six case styles at once", "One input renders kebab, snake, camel, Pascal, SCREAMING_SNAKE and dot.case keys with per-row copy."],
  ],
  faqs: [
    [
      "What is a good naming convention for feature flags?",
      "A widely used pattern is type-team-description, optionally ending with a removal date for temporary flags — for example release-payments-guest-checkout-20261001. The exact separators matter less than consistency: every flag in the codebase should encode its category, its owner and what it gates.",
    ],
    [
      "Should feature flags be named positively or negatively?",
      "Positively — the flag ON should mean the behaviour is enabled. Names like disable-legacy-search force code to check a double negative (if not disabled), which is a well-documented source of inverted-logic bugs when defaults change.",
    ],
    [
      "Should a feature flag name include an expiry or removal date?",
      "Yes for temporary flags. Release toggles and experiment flags are meant to be deleted once rollout or the test completes, and a date tag such as 20261001 in the key makes stale flags visible in any dashboard sort. Operational kill switches and permission flags are long-lived by design and should not carry one.",
    ],
    [
      "What are the four types of feature flags?",
      "Pete Hodgson's taxonomy on martinfowler.com defines release toggles (ship code dark, roll out gradually), experiment toggles (A/B tests), operational toggles (kill switches and circuit breakers) and permission toggles (plan or cohort gates). The first two are short-lived; the last two can live as long as the product does.",
    ],
  ],
};

export default seo;
