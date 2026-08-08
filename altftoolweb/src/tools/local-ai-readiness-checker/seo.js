const seo = {
  title: "Can My PC Run a Local LLM? RAM, VRAM & Disk Check",
  steps: [
    "Type System Memory (RAM GB), Accelerator Memory (VRAM GB), Free Disk Storage (GB) and Logical CPU Cores, then pick Apple Metal, NVIDIA CUDA, AMD ROCm or CPU only.",
    "Press Compare Thresholds & Calculate Readiness to mark each of the four workload profiles as meeting, close to, or below its published thresholds.",
    "Read the model grid from TinyLlama 1.1B to DeepSeek R1 Distill 14B, then take the CSV Report or Markdown Summary export.",
  ],
  intro:
    "The Local AI Readiness Checker compares the RAM, accelerator memory, free disk space and logical CPU cores you enter against four published workload profiles — CPU-only experimentation (8 GB RAM, 4 cores), routine local text work (16 GB, 6 cores), GPU-accelerated text work (16 GB RAM plus 6 GB VRAM), and local media generation (32 GB RAM plus 8 GB VRAM) — and marks each one as meeting, close to, or below its thresholds. It also grades a catalogue of nine open local models from TinyLlama 1.1B up to DeepSeek R1 Distill 14B against the same specs. It is for anyone deciding whether their existing machine can run a local LLM before they download twenty gigabytes of weights.",
  useCases: [
    "You want to run an 8B model like Llama 3.1 or Mistral 7B locally and need to know whether 16 GB of RAM without a discrete GPU is genuinely enough or only marginal.",
    "You are specifying a new laptop and want to see exactly how much RAM and VRAM separates 'routine local text work' from 'local media generation' before you pay for the upgrade.",
    "A colleague recommended Ollama, LM Studio or WebLLM and you want to check which of those frameworks matches your acceleration backend — CUDA, Metal, ROCm or DirectML — and your memory.",
  ],
  benefits: [
    [
      "Publishes the thresholds instead of hiding them",
      "Every profile shows its exact RAM, VRAM, disk and core requirement plus your shortfall or headroom in each field, so you can see what is actually blocking you.",
    ],
    [
      "Distinguishes 'close' from 'below'",
      "A profile is marked close-to-thresholds only when a single numeric requirement is short and you have at least 75% of it, so a near-miss reads differently from a real gap.",
    ],
    [
      "Optional browser capability read, not a device scan",
      "It can report WebGPU, WebGL2, WebAssembly, SharedArrayBuffer, IndexedDB and reported core count to prefill the form, while the assessment itself runs on the numbers you confirm.",
    ],
  ],
  faqs: [
    [
      "How much RAM do I need to run a local LLM?",
      "8 GB with 4 cores and 10 GB of free disk covers CPU-only experimentation with small models; 16 GB with 6 cores is the threshold for routine local text work; and 32 GB with 8 GB of accelerator memory is where local media generation starts. Model-specific minimums range from 4 GB RAM for TinyLlama 1.1B to 32 GB for a 14B reasoning model.",
    ],
    [
      "Can I run a 7B or 8B model without a dedicated GPU?",
      "Usually yes, at reduced speed. Models like Llama 3.1 8B, Mistral 7B Instruct and Qwen 2.5 7B are listed with a 16 GB RAM minimum, a 6 GB VRAM preference and about 10 GB of disk at Q4_K_M quantisation. Without acceleration the checker treats these as workable but slower rather than recommended.",
    ],
    [
      "Does this tool scan my computer?",
      "No. The workload assessment uses only the specifications you type in, and the exported summary explicitly records that the device was not scanned and no model was actually loaded or benchmarked. The optional browser panel reads standard web APIs such as navigator.hardwareConcurrency, which report approximate values, not hardware truth.",
    ],
    [
      "Which local AI framework should I use?",
      "It depends on your acceleration backend and interface preference: Ollama and llama.cpp cover CUDA, Metal, ROCm and DirectML from the command line, LM Studio and Jan.ai offer desktop GUIs, and WebLLM runs entirely in the browser on WebGPU. llama.cpp has the lowest listed floor at 4 GB RAM; the rest start at 8 GB.",
    ],
  ],
};

export default seo;
