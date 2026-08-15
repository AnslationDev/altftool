const seo = {
  title: "Concurrency vs RPS Calculator (Little's Law L = λW)",
  metaDescription:
    "Solve Little's Law in any direction: users, req/s or response time from the other two, with think time separating virtual users from in-flight load.",
  steps: [
    "Choose what to Solve for — concurrent users, requests per second, or response time — then enter the other two values.",
    "Set think time between requests (ms): 0 for raw in-flight concurrency, or a realistic pause to size load-test virtual users.",
    "Read the solved figure from Little's Law L = λ × W, compare requests actually in flight against users idle in think time, and click Copy result.",
  ],
  intro:
    "This calculator converts between concurrent users, requests per second and average response time using Little's Law (L = λ × W), the queueing-theory identity that holds for any stable system. It is built for performance engineers and backend developers sizing load tests, connection pools and worker counts, and it separates true in-flight concurrency from virtual users who spend part of each cycle in think time.",
  useCases: [
    "A performance engineer working out how many k6 or JMeter virtual users are needed to sustain 100 req/s against a 200 ms endpoint with 1 second of think time",
    "A backend developer translating a marketing claim of \"10,000 concurrent users\" into the actual requests per second the API must survive",
    "An SRE sizing a connection pool or worker pool from target throughput and observed p50 latency, since pool size must cover requests in flight",
  ],
  benefits: [
    ["Solve any direction", "Give any two of users, RPS and response time and get the third — the same identity rearranged, never a guess."],
    ["Think-time aware", "Distinguishes requests in flight (RPS × response time) from virtual users needed (RPS × full cycle), which differ by orders of magnitude on real sites."],
    ["Distribution-free", "Little's Law needs no assumption about traffic shape — it holds for averages in any stable system, which is why every load-testing guide uses it."],
  ],
  faqs: [
    [
      "How do I convert concurrent users to requests per second?",
      "Divide users by the time each user's full request cycle takes: RPS = users ÷ (response time + think time), both in seconds — Little's Law rearranged. 1,000 users with a 0.2 s response and 9.8 s of think time produce only 100 req/s, which is why user counts alone say little about server load.",
    ],
    [
      "What is Little's Law in performance testing?",
      "Little's Law states L = λ × W: the average number of requests in a system equals arrival rate times average time in the system. Its power is that it is distribution-free — it holds for any stable, non-saturated system regardless of traffic pattern — so load-testing tools use it to size virtual-user counts for a target throughput.",
    ],
    [
      "Are 100 concurrent users the same as 100 requests per second?",
      "No. 100 concurrent users generate 100 req/s only if each user completes exactly one request per second; with a 200 ms response time and no think time, 100 users would actually drive about 500 req/s, while with 5 seconds of think time they drive roughly 19 req/s. The conversion always depends on the per-user cycle time.",
    ],
    [
      "What does think time mean in a load test?",
      "Think time is the pause a simulated user takes between requests, modelling reading a page or filling a form. It raises the number of virtual users needed for a given RPS without raising in-flight load — set it to 0 to stress raw concurrency, or to a realistic 3–10 seconds to mimic human browsing behaviour.",
    ],
  ],
};

export default seo;
