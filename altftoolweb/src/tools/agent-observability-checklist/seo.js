const seo = {
  title: "Agent Observability Checklist for OTel gen_ai",
  metaDescription:
    "Score what your LLM agent traces against the gen_ai.* conventions - spans, metrics, logs, evals, redaction - then size a sampling and storage plan.",
  steps: [
    "Under '1. What does this agent do?' tick the traits that apply, such as Handles personal data, Calls tools or external APIs, Retrieves from a knowledge base, Regulated domain or High traffic; each one escalates which signals become required.",
    "Under '2. Tick what you already emit' check off the signals in each pillar (Traces, Metrics, Logs & versions, Evaluation, Privacy & safety), for example 'One root span per agent run' and 'Token usage split by input and output'.",
    "Read the Observability readiness percentage with 'Required signals missing' and the weakest pillar, fill in '3. Sampling and storage budget' (Agent runs per day, Traces you want to keep per day, Retention, Average trace size) for a head rate and stored volume, then press 'Copy plan'.",
  ],
  intro:
    "An agent observability checklist turns a vague 'add logging' ticket into a named list of spans, metrics, logs, evaluations and redaction rules, then scores how many of them your agent already emits. Signal names follow the OpenTelemetry semantic conventions for generative AI systems — the gen_ai.* namespace used by most tracing backends — so the plan maps onto whatever collector you already run. It is aimed at engineers taking an LLM agent from a working demo to something on call rotation can actually debug.",
  useCases: [
    "Writing the observability section of a design doc before an agent goes to production",
    "Auditing an existing agent after an incident where nobody could reproduce the failing run",
    "Deciding a sampling rate and storage budget when an agent grows from thousands to millions of runs a day",
    "Agreeing with a privacy or security reviewer exactly which fields get hashed, masked or never logged",
  ],
  benefits: [
    ["Scored, not vibes", "Weighted readiness score shows how far the required signals are from complete."],
    ["Profile-aware", "Turning on traits like tool use or regulated domain escalates the signals that actually matter."],
    ["Sampling with real numbers", "Head rate, sampled runs per day and stored volume computed from your traffic and retention."],
  ],
  faqs: [
    [
      "What should I log for an LLM agent in production?",
      "At minimum: one root span per run carrying a stable run id, a child span per model call with the requested and responding model ids, a child span per tool call, token usage split into input and output, operation duration as a histogram, and the prompt template version. Prompt and completion text should sit behind an explicit content-capture flag rather than being on by default.",
    ],
    [
      "What is the OpenTelemetry standard for AI agent tracing?",
      "OpenTelemetry publishes semantic conventions for generative AI systems that define the gen_ai.* attribute namespace — for example gen_ai.operation.name, gen_ai.request.model, gen_ai.response.model and gen_ai.tool.name — plus the instruments gen_ai.client.token.usage and gen_ai.client.operation.duration. Message content capture is opt-in, precisely because prompts often contain personal data.",
    ],
    [
      "What sampling rate should I use for agent traces?",
      "Pick a daily trace budget first, then set the head rate to budget divided by runs per day: 20,000 traces a day out of 1,000,000 runs is a 2% head rate. Layer tail sampling on top that keeps 100% of errors, runs slower than your p95 target, guardrail blocks and negative feedback, since those are the runs you will actually open.",
    ],
    [
      "How do I keep personal data out of agent traces?",
      "Redact inside a span processor or exporter so raw text never leaves your process, keep card numbers, government IDs and API keys out of telemetry entirely, hash identifiers you need for joins, and truncate IP addresses or round coordinates to about two decimal places (roughly 1.1 km). Set a short retention window on raw messages and make deletion automatic. This is informational guidance, not legal advice — confirm your obligations with a privacy professional.",
    ],
  ],
};

export default seo;
