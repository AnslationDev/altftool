const seo = {
  title: "Pub/Sub vs Queue vs Kafka: Scored in 9 Questions",
  metaDescription:
    "Answer nine questions on consumers, replay, ordering, retention and retry, and get work queue, pub/sub, partitioned log and event bus ranked with reasons.",
  steps: [
    "Answer the nine questions on consumer count, replay, ordering, retention, throughput, processing model, routing, latency and per-message controls.",
    "Answers that are hard constraints rule a pattern out completely — asking to replay from the beginning knocks out the work queue instead of just lowering it.",
    "Read the Recommended pattern with its percentage fit, Typical technologies, Runner-up and Confidence, plus 'Full ranking and why' listing For and Against.",
  ],
  intro:
    "This decision helper scores four messaging patterns — work queue, pub/sub topic, partitioned log and event bus — against nine properties of your workload: consumer count, replay needs, ordering, retention, throughput, processing model, routing, latency and per-message retry control. Answers that are hard constraints rather than preferences rule a pattern out entirely, so a request to replay from the beginning removes plain queues instead of merely marking them down. Every score is shown, so you can argue with the rubric rather than trust it.",
  useCases: [
    "Deciding whether a new service-to-service integration should use SQS, SNS, Kafka or EventBridge",
    "Justifying a messaging choice in an architecture decision record with the trade-offs written down",
    "Checking whether an existing queue is being asked to do a job that really needs a replayable log",
  ],
  benefits: [
    ["Constraints beat preferences", "Replay-from-zero or multi-week retention removes patterns that physically cannot do it."],
    ["Reasoning shown", "Each pattern lists the answers that helped and hurt it, so the recommendation is reviewable."],
    ["Honest ties", "A margin under five points is reported as too close to call rather than dressed up as a decision."],
  ],
  faqs: [
    [
      "What is the difference between a message queue and pub/sub?",
      "A queue delivers each message to exactly one consumer, so adding workers spreads the load; pub/sub delivers a copy to every subscriber, so adding subscribers multiplies the work. Queues suit task distribution, pub/sub suits notification. If you find yourself creating one queue per consumer, you wanted pub/sub.",
    ],
    [
      "When should I use Kafka instead of a queue?",
      "When consumers need to replay history, when you need ordering per key at high throughput, or when the message log is the system of record rather than a hand-off. Kafka keeps messages for a configured retention regardless of consumption, which is exactly what a queue does not do — an acknowledged queue message is gone.",
    ],
    [
      "Can pub/sub messages be replayed?",
      "Only within the retention the service keeps, and usually only for subscriptions that already existed. Google Cloud Pub/Sub retains unacknowledged messages for up to 7 days and can optionally retain acknowledged ones for replay; Amazon SNS does not retain anything itself. A subscription created today will not see yesterday's events.",
    ],
    [
      "What is an event bus and how is it different from a topic?",
      "An event bus routes on content: producers publish one event and the bus evaluates rules against its attributes to decide which targets receive it, so a new consumer subscribes without the producer changing. A topic is a fixed channel — consumers get everything published to it and filter themselves. Buses like Amazon EventBridge trade a little latency for that routing.",
    ],
  ],
};

export default seo;
