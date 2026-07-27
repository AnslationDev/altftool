const seo = {
  intro:
    "A blue-green deployment checklist generator that turns your switch mechanism, schema strategy and latency baseline into an ordered cutover plan with numeric abort triggers. It sizes the DNS propagation wait at twice the record TTL — the margin that covers resolvers caching an answer for its full TTL under RFC 1035 — and builds the canary ramp from the standard 1/5/10/25/50/100 ladder used by progressive delivery controllers. Intended for the engineer who owns the cutover and needs a plan reviewers can argue with before the window opens.",
  useCases: [
    "Writing the cutover section of a change ticket for a release that swaps an ALB target group between two identical fleets",
    "Deciding how long the old environment must stay running after a DNS swap when the record TTL is 60 seconds",
    "Agreeing the exact error-rate and p95 numbers that trigger an automatic rollback, before the release rather than during it",
  ],
  benefits: [
    ["Triggers, not opinions", "Abort thresholds come out as concrete percentages and milliseconds derived from your own baseline."],
    ["Catches the state problems", "Flags in-memory sessions, breaking migrations and long-lived sockets that quietly break a swap."],
    ["Copy into the ticket", "Exports as a markdown task list so the plan lives with the change record."],
  ],
  faqs: [
    [
      "How long should I keep the blue environment running after cutover?",
      "At least twice the DNS record TTL if you switched via DNS, and through your full soak period in every case. Resolvers may serve the cached answer until the TTL expires, and some clamp low TTLs upward, so a 60-second TTL means keeping blue healthy for around two minutes minimum — plus however long you need to be confident green is stable.",
    ],
    [
      "What is the difference between blue-green and canary deployment?",
      "Blue-green runs two complete environments and moves all traffic at once; canary moves a percentage at a time to a smaller new fleet. In practice most teams combine them — a full-size green environment with a weighted ramp such as 10%, 25%, 50%, 100% — which is what this tool plans when you set more than one ramp step.",
    ],
    [
      "Can blue and green share the same database?",
      "Yes, but only if every schema change is backward compatible. Use expand/contract: add nullable columns and new tables first, deploy code that works with both shapes, and run the drop or rename in a separate later release. A breaking change in one release removes your rollback path, because reverting to blue would mean restoring from backup.",
    ],
    [
      "Do users get logged out during a blue-green cutover?",
      "Only if sessions live in the memory of individual instances. With a shared store such as Redis or a database, or with signed cookies and JWTs, sessions survive the swap as long as green uses the same cookie name, domain and signing key. Test this with a browser that was already signed in before the swap, not a fresh one.",
    ],
  ],
};

export default seo;
