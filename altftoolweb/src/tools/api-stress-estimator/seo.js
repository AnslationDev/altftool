const seo = {
  intro:
    "This API stress estimator models a service as an M/M/c queue — c identical workers, Poisson arrivals at λ requests per second and a mean service time of 1/μ — and returns utilisation, the Erlang C probability that a request has to wait, mean response time and p50/p90/p95/p99 tail latency. It also solves the reverse question: the smallest worker pool that keeps a chosen percentile inside a latency budget. It is for engineers sizing a service before a launch, and for anyone who has to justify an instance count in a capacity review.",
  useCases: [
    "Check whether 60 workers at 80 ms average can absorb a campaign spike from 500 to 2,500 requests per second.",
    "Find the pool size that keeps p99 under a 400 ms SLO before writing the autoscaling policy.",
    "Show a review why utilisation of 90% is not 'plenty of headroom' — the queueing term dominates response time there.",
  ],
  benefits: [
    ["Closed-form queueing theory", "Erlang C, Little's law and the exact FCFS sojourn-time distribution, not a rule of thumb."],
    ["Numerically stable at scale", "Uses the Erlang B recursion, so 500-worker pools do not overflow the way the factorial form does."],
    ["Says when you are past capacity", "Above 100% utilisation it refuses to print a latency and tells you the worker count or service time that fixes it."],
  ],
  faqs: [
    [
      "How many requests per second can my API handle?",
      "Capacity equals workers ÷ average service time. Sixty workers averaging 80 ms handle 60 ÷ 0.08 = 750 requests per second at 100% utilisation, but design to about 70% — 525 requests per second — because the remaining 30% is what absorbs bursts without a latency spike.",
    ],
    [
      "Why does latency explode near 100% utilisation and not before?",
      "Because mean queue wait is C ÷ (cμ − λ), and the denominator is the spare capacity. At 90% utilisation the spare capacity is a tenth of what it was at 50%, so the same extra request costs roughly ten times the wait. This is why 70% is the usual design target and 80% the usual alert threshold.",
    ],
    [
      "What does the M/M/c model assume?",
      "Poisson arrivals, exponentially distributed service times, one shared FIFO queue, no request timeouts and no retries. Real traffic is burstier and real service times have fatter tails, both of which make queueing worse — so treat the numbers here as an optimistic floor and confirm with a load test.",
    ],
    [
      "What is offered load in erlangs?",
      "It is arrival rate divided by service rate, λ/μ, and equals the number of workers permanently busy on average. At 500 requests per second and 80 ms per request the offered load is 40 erlangs, so 40 workers are busy at all times and anything above that number is headroom.",
    ],
  ],
};

export default seo;
