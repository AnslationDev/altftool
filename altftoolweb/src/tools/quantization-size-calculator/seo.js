const seo = {
  intro:
    "The Quantization Size Calculator estimates a language model's weight-file size with the formula size = parameters × bits-per-weight ÷ 8, across FP32, FP16, Q8_0, Q6_K, Q5_K, Q4_K, Q3_K and Q2_K. Bits-per-weight figures come from the exact llama.cpp GGUF block layouts — for example Q8_0 stores 34 bytes per 32 weights, which is 8.5 bits per weight. It is built for people running local models with Ollama, llama.cpp or LM Studio who need to know whether a given quant will fit their RAM or VRAM before downloading it.",
  useCases: [
    "Checking whether a 70B model at Q4_K (about 39 GB of weights) can fit on a 48 GB GPU before starting a 40 GB download",
    "Comparing how much disk and memory a 7B model saves going from FP16 (14 GB) to Q4_K (about 3.9 GB)",
    "Planning which quantization of a 13B model fits alongside the OS on a 16 GB laptop",
  ],
  benefits: [
    ["Exact bits-per-weight", "GGUF figures are derived from the real llama.cpp block structures — Q8_0 is 8.5, Q6_K is 6.5625, Q4_K is 4.5 bits per weight — not rounded guesses."],
    ["GB and GiB side by side", "See both decimal gigabytes (download-page style) and binary gibibytes (what your OS reports)."],
    ["Savings vs FP16", "Every format shows its percentage saving against half precision, the usual distribution format."],
  ],
  faqs: [
    [
      "How do I calculate the file size of a quantized LLM?",
      "Multiply the parameter count by the bits per weight and divide by 8. A 7B model at FP16 (16 bits/weight) is 7 × 10⁹ × 16 ÷ 8 = 14 GB of weights; the same model at GGUF Q4_K (4.5 bits/weight) is about 3.9 GB. Real files run a few percent larger because of metadata and tensors kept at higher precision.",
    ],
    [
      "How big is a 70B model with 4-bit quantization?",
      "About 39 GB of weights: 70 × 10⁹ parameters × 4.5 bits/weight ÷ 8 ≈ 39.4 GB (36.7 GiB). At FP16 the same model needs about 140 GB, so 4-bit quantization cuts the footprint by roughly 72%. You still need additional memory for the KV cache when running it.",
    ],
    [
      "Why is Q8_0 8.5 bits per weight instead of 8?",
      "Because GGUF Q8_0 stores weights in blocks of 32 with a 2-byte FP16 scale per block: 32 int8 values plus 2 scale bytes is 34 bytes per 32 weights, which works out to exactly 8.5 bits per weight. Every GGUF format carries similar per-block scale overhead, which is why Q4_K is 4.5 bits rather than a flat 4.",
    ],
    [
      "Does the quantized file size equal the RAM needed to run the model?",
      "No — the file size is the floor, not the total. Inference also needs the KV cache, which grows with context length and can add several gigabytes at long contexts, plus compute buffers and your OS overhead. A practical rule is to leave at least 1–2 GB of headroom beyond the file size for small contexts, and more for long ones.",
    ],
  ],
};

export default seo;
