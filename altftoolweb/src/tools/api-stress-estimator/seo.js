const seo = {
  title: "API Stress Estimator — Free Capacity & Latency Calculator",
  h1: "API Stress Estimator",
  metaDescription:
    "Model your API as an M/M/c queue: utilisation, p50–p99 latency and the worker count your latency budget needs. Free, in-browser, no traffic sent.",
  intro:
    "The API Stress Estimator models your service as an M/M/c queue — c identical workers serving one shared FIFO queue, Poisson arrivals at λ requests per second, and a mean service time of 1/μ — and returns utilisation, the Erlang C probability that a request has to wait, mean queue wait, mean response time and p50/p90/p95/p99 tail latency. Erlang C is computed through the numerically stable Erlang B recursion (so a 500-worker pool doesn't overflow the way the a^c/c! form does), requests in flight come from Little's law, and the percentiles come from inverting the exact FCFS sojourn-time survival function by 200-step bisection. It also answers the reverse question: the smallest worker pool that keeps a chosen percentile inside a latency budget, searched up to 4,096 workers. Every number is computed in JavaScript in your browser — the tool never sends a single request to the API you're sizing.",
  useCases: [
    "Sizing a service before launch — checking whether 60 workers averaging 80 ms can absorb a campaign spike from 500 to 2,500 requests per second",
    "Justifying an instance count in a capacity review with utilisation, queueing probability and p99 rather than a gut feel",
    "Setting an autoscaling target by finding the pool size that keeps p99 inside a 400 ms SLO before the policy is written",
  ],
  benefits: [
    [
      "Closed-form queueing theory, not a rule of thumb",
      "Erlang C for the chance a request queues, Little's law for requests in flight, and the exact FCFS sojourn-time distribution for p50, p90, p95 and p99 — the same maths a capacity review runs on paper.",
    ],
    [
      "Answers the sizing question in reverse",
      "Give it a latency budget and a percentile and it searches worker counts up to 4,096 for the smallest pool that holds the budget: 43 workers for p99 under 400 ms at 500 req/s and 80 ms per request.",
    ],
    [
      "Numerically stable at large pool sizes",
      "It uses the Erlang B recursion rather than a^c/c!, which overflows to Infinity for perfectly ordinary inputs like 200 workers at 150 erlangs.",
    ],
    [
      "Says plainly when you're past capacity",
      "Above 100% utilisation it refuses to print a latency and names the fix instead — the worker count to run, or the average response time you'd have to reach.",
    ],
  ],
  faqs: [
    [
      "How many requests per second can my API handle?",
      "Workers divided by average service time. Sixty workers averaging 80 ms handle 60 ÷ 0.08 = 750 requests per second at 100% utilisation, but the tool reports the usable figure — 525 req/s, the capacity at its 70% design target — because the remaining 30% is what absorbs bursts without a latency spike.",
    ],
    [
      "How do I estimate API load without running a real stress test?",
      "Give the model three numbers: request rate, average server time per request, and total concurrent workers (instances × concurrency). It solves the M/M/c queue for utilisation, the probability a request has to wait, mean response time and p50–p99 latency, so you get a capacity answer in seconds instead of standing up a load-generation rig.",
    ],
    [
      "Does this tool send traffic to my API?",
      "No. There's no endpoint field and no network call — you enter a request rate, a service time and a worker count, and the entire calculation runs in JavaScript in your browser. Nothing is sent to your API or to a server.",
    ],
    [
      "What utilisation should I run my API at?",
      "Around 70%, which is the design target the tool uses. It bands the result as Comfortable below 50%, Healthy below 70%, Watch closely below 80%, Near capacity below 90% and Overloaded at 90% and above. The cost of ignoring it is concrete: at 500 req/s and 80 ms per request, going from 80% utilisation (50 workers) to 95% (42 workers) raises the mean queue wait from 0.7 ms to 26.8 ms.",
    ],
    [
      "How many workers do I need to hit a p99 latency SLO?",
      "Enter the budget and pick the percentile, and the tool returns the smallest pool that meets it — for 500 req/s at 80 ms with a 400 ms p99 budget, that's 43 workers, achieving 388 ms. If the budget is impossible it says so: no pool size reaches a p99 of 300 ms when one request averages 80 ms, because exponential service time alone puts p99 at −ln(0.01) × 80 ms = 368 ms.",
    ],
    [
      "What is offered load in erlangs?",
      "It's the arrival rate divided by the service rate, λ/μ, and it equals the number of workers busy on average. At 500 requests per second and 80 ms per request the offered load is 40 erlangs, so 40 workers are occupied at all times and every worker above that number is headroom.",
    ],
    [
      "What does the M/M/c model assume, and how wrong will it be?",
      "It assumes Poisson arrivals, exponentially distributed service times, one shared FIFO queue, and no timeouts or retries. Real traffic is burstier and real service times have fatter tails, and both make queueing worse — so treat these numbers as an optimistic floor, then confirm with a load test against the real service.",
    ],
    [
      "Is the API Stress Estimator free?",
      "Yes — free, with no signup and no usage limit. The model runs entirely client-side, and the Copy result button puts the full summary (utilisation, erlangs, queueing probability, mean and tail latency, safe capacity and headroom) on your clipboard as plain text.",
    ],
  ],
  steps: [
    "Enter your request rate in requests per second, the average server time one request takes in milliseconds, and your total concurrent workers (instances × concurrency).",
    "Read utilisation and its risk band, then work down the table: offered load in erlangs, the chance a request queues, mean queue wait, mean response time and the p50, p90, p95 and p99 rows.",
    "Set a latency budget and the percentile it applies to for the smallest pool that meets it, check the ×2, ×5 and ×10 traffic scenarios below, then copy the summary into your capacity review.",
  ],
};

export default seo;
