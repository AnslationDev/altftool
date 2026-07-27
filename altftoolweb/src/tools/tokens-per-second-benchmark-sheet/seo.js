const seo = {
  intro:
    "Tokens Per Second Benchmark Sheet turns the raw timings a local LLM runner prints into decode throughput, prefill throughput and time to first token, and compares them against the memory-bandwidth ceiling for that model. Weight footprint is calculated from parameter count and the effective bits per weight of the quantisation format — 4.83 bpw for Q4_K_M, 5.69 for Q5_K_M, 8.5 for Q8_0 — and the ceiling is simply memory bandwidth divided by that footprint, because single-stream decoding must read every weight once per token. It is for anyone comparing the same model across machines, or the same machine across quantisations.",
  useCases: [
    "Checking whether 40 tokens a second on a 200 GB/s machine is close to the hardware limit or leaving performance on the table.",
    "Comparing Q4_K_M against Q5_K_M on the same GPU to see exactly what the extra quality costs in speed and memory.",
    "Recording the same model on a laptop, a desktop and a server and pasting the comparison table into a README.",
    "Separating a slow prompt-eval phase from a slow generation phase when a long-context run feels sluggish.",
  ],
  benefits: [
    ["Prefill and decode split", "The two phases have completely different bottlenecks and are reported separately."],
    ["Real bits per weight", "Uses the published effective bpw of each llama.cpp format, not a rounded 4 or 5 bits."],
    ["Hardware ceiling", "Shows the bandwidth-limited maximum so you know whether tuning will help at all."],
  ],
  faqs: [
    [
      "What is a good tokens per second for a local LLM?",
      "It depends almost entirely on model size and memory bandwidth, not on the model's name. Divide your memory bandwidth in GB/s by the model's size in GB for the ceiling: a 4.2 GB Q4_K_M 7B model on 200 GB/s hardware tops out near 47 tokens a second, so 40 measured is an excellent result and 12 means something is wrong.",
    ],
    [
      "Why is prompt processing so much faster than generation?",
      "Prefill processes all prompt tokens in parallel, so it is compute-bound and can reach thousands of tokens a second. Generation produces one token at a time and must re-read every weight from memory for each one, which makes it memory-bandwidth-bound and one to two orders of magnitude slower.",
    ],
    [
      "How much memory does a quantised model need?",
      "Multiply the parameter count in billions by the format's effective bits per weight, then divide by 8, for gigabytes of weights: an 8B model at Q4_K_M is about 4.8 GB. Add roughly 20 percent for KV cache, activations and runtime, and considerably more for long contexts, since KV cache grows linearly with context length.",
    ],
    [
      "What does Q4_K_M actually mean?",
      "It is a llama.cpp k-quant format that stores most weights in 4 bits but keeps some tensors at higher precision, giving an effective 4.83 bits per weight overall. The K means k-quant blocks with per-block scales, and the M is the medium variant — S and L trade size against quality in the same family.",
    ],
  ],
};

export default seo;
