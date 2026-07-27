const seo = {
  intro:
    "Coding Model Picker ranks five ways to run a coding assistant — a hosted frontier model, the same model inside your own cloud tenant, open weights on your GPUs, open weights on an inference provider, and a small quantised model on your laptop — against ten weighted criteria. The score is plain arithmetic: each criterion gets an importance of 0-3 from your answers, each option a 0-5 rating on structural properties such as offline capability, weight availability and billing model, and the result is the weighted total as a percentage of the maximum. Useful when a team has to justify a choice on privacy, repo scale and budget rather than on a leaderboard.",
  useCases: [
    "Decide whether an air-gapped team can use anything other than self-hosted open weights.",
    "Check whether a large monorepo justifies paying per token for a long-context frontier model.",
    "Compare a laptop-local model against a hosted one for high-volume inline completion.",
    "Show a security reviewer exactly which requirement ruled each option out, and why.",
  ],
  benefits: [
    ["Shows its working", "Every point is traceable to a weight and a rating, so you can argue with the inputs instead of a black box."],
    ["Hard constraints first", "Air-gapped policies and a fine-tuning requirement eliminate options outright rather than just lowering a score."],
    ["No benchmark claims", "Ratings describe properties that do not change with the next model release, such as whether weights are downloadable."],
  ],
  faqs: [
    [
      "Should I use a hosted model or self-host an open-weight model for coding?",
      "Host it yourself when code cannot leave your network, when you need to fine-tune on your own repositories, or when volume is high enough that fixed GPU cost beats per-token billing. Use a hosted frontier model when the work is large multi-file refactoring or a big monorepo, where the strongest reasoning and the largest context windows matter more than the running cost.",
    ],
    [
      "Can a local model on my laptop replace a cloud coding assistant?",
      "For inline completion, boilerplate and small functions, a 7B-14B quantised model in a local runner is fast, free at the margin and fully offline. It falls behind on long files and multi-step refactors, because a laptop-sized context window and parameter count cannot hold a large change set — most teams end up using a local model for completion and a larger model for reasoning.",
    ],
    [
      "What does 'open-weight' mean and why does it matter here?",
      "Open-weight means the model parameters are downloadable, so you can run the model on your own hardware and fine-tune it. It is not the same as open source: the licence may still restrict commercial use or redistribution. It matters because only open weights can satisfy an air-gapped policy or a genuine fine-tuning requirement.",
    ],
    [
      "How do I stop my source code being used for training?",
      "Check the provider's terms rather than the marketing page: business and enterprise tiers usually state that inputs are not used for training by default, while free consumer tiers often do not. Running the model in your own cloud account or on your own hardware removes the question entirely, which is why those options score highest on the privacy criterion.",
    ],
  ],
};

export default seo;
