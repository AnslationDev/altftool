const seo = {
  title: "Cache Hit Ratio Calculator with AMAT Latency Model",
  metaDescription:
    "Turn cache hits and misses into hit ratio, AMAT effective latency, speedup and the requests per second that still reach your backend.",
  steps: [
    "Enter Cache hits and Cache misses (for Redis, the keyspace_hits and keyspace_misses counters from INFO), plus Cache lookup latency (ms) and Backend fetch latency (ms).",
    "Optionally fill the Traffic rate (requests/second) field to size how much load still reaches the origin at your hit ratio.",
    "Read the Hit ratio headline with the Effective latency (AMAT), Speedup and Backend requests/second rows, then press Copy result or Reset.",
  ],
  intro:
    "This calculator computes a cache's hit ratio — hits ÷ (hits + misses) — and turns it into the numbers that matter for capacity planning: effective request latency via the AMAT formula (hit time + miss rate × miss penalty, from Hennessy & Patterson), the speedup versus running uncached, and the share of traffic that still reaches the backend. Feed it counters from Redis INFO, Memcached stats, a CDN dashboard or an application cache and it shows what the cache is really buying you.",
  useCases: [
    "Reading keyspace_hits and keyspace_misses from Redis INFO and translating them into backend load reduction for a capacity review",
    "Estimating how much p50 latency improves if a cache tuning change lifts the hit ratio from 85% to 95%",
    "Sizing a database connection pool by computing how many requests per second still miss the cache at peak traffic",
  ],
  benefits: [
    ["Real latency model", "Uses AMAT (hit time + miss rate × miss penalty) rather than pretending misses cost nothing."],
    ["Backend load figures", "Shows the exact requests/second your origin still serves at a given traffic rate and hit ratio."],
    ["Sanity warnings", "Flags configurations where the cache lookup is slower than the backend it fronts."],
  ],
  faqs: [
    [
      "How do I calculate cache hit ratio?",
      "Hit ratio = hits ÷ (hits + misses). For example 900 hits and 100 misses give 900/1000 = 90%. In Redis the counters are keyspace_hits and keyspace_misses in INFO stats; in Memcached they are get_hits and get_misses.",
    ],
    [
      "What is a good cache hit ratio?",
      "It depends on workload, but content and CDN caches commonly target 90%+ while database query caches may sit lower. The marginal value is nonlinear: going from 90% to 99% cuts backend traffic by another factor of ten (10% of requests down to 1%), which is why the last few percentage points matter most.",
    ],
    [
      "What is the AMAT formula for cache latency?",
      "AMAT (average memory access time) = hit time + miss rate × miss penalty, from Hennessy and Patterson's computer architecture texts. With a 2 ms cache, a 50 ms backend and a 90% hit ratio: 2 + 0.10 × 50 = 7 ms average, a 7.1× speedup over the uncached 50 ms.",
    ],
    [
      "How much backend load does a cache remove?",
      "Exactly the hit ratio: at 90% hits only 10% of requests reach the backend, so 1,000 req/s of traffic becomes 100 req/s of origin load. This calculator multiplies your traffic rate by the miss ratio to give the residual backend requests per second.",
    ],
  ],
};

export default seo;
