const seo = {
  title: "Cosine Similarity Calculator for Embeddings",
  metaDescription:
    "Paste two vectors — JSON arrays or comma, space or newline separated, up to 20,000 dimensions — and get cosine, dot product, L2, L1 and the angle.",
  steps: [
    "Paste your embeddings into Vector A and Vector B — JSON arrays or comma, space or newline separated, up to 20,000 dimensions.",
    "Read the cosine similarity headline plus dot product, Euclidean (L2) and Manhattan (L1) distances, both norms and the angle in degrees.",
    "Click Copy result for the full comparison summary, or Reset to restore the example vectors.",
  ],
  intro:
    "This calculator computes the cosine similarity between two vectors — the dot product divided by the product of their L2 norms, giving a value between −1 and 1 that measures direction rather than magnitude. Alongside it you get the raw dot product, Euclidean (L2) and Manhattan (L1) distances, and the angle in degrees. It is built for developers working with text or image embeddings who want to sanity-check what their vector database is returning.",
  useCases: [
    "Checking why a RAG retrieval ranked one chunk above another by comparing their embedding similarities to the query vector",
    "Verifying that two embeddings produced by the same model for near-duplicate texts really score above 0.95",
    "Debugging a vector search pipeline by confirming the distance metric (cosine vs Euclidean vs dot product) matches what the index was built with",
  ],
  benefits: [
    ["Four metrics at once", "Cosine, dot product, Euclidean and Manhattan distance from a single paste — no notebook needed."],
    ["Forgiving input", "Accepts JSON arrays, comma-, space- or newline-separated numbers, up to 20,000 dimensions."],
    ["Runs locally", "All arithmetic happens in your browser; embedding values are never uploaded anywhere."],
  ],
  faqs: [
    [
      "How is cosine similarity calculated?",
      "Cosine similarity is the dot product of the two vectors divided by the product of their lengths: cos(θ) = (a·b) / (‖a‖ × ‖b‖). The result ranges from −1 (opposite directions) through 0 (orthogonal) to 1 (identical direction). Because it divides out magnitude, two vectors of very different lengths can still score 1 if they point the same way.",
    ],
    [
      "What is a good cosine similarity score for embeddings?",
      "It depends on the model, but for modern text embeddings scores above roughly 0.8 usually indicate closely related content and above 0.95 near-duplicates. Scores are not comparable across models — a 0.7 from one embedding model can mean something different from a 0.7 from another, so always calibrate thresholds against your own data.",
    ],
    [
      "What is the difference between cosine similarity and dot product?",
      "The dot product includes vector magnitude while cosine similarity normalises it away. If both vectors are unit-normalised (length 1), the two are exactly equal — which is why many vector databases store normalised embeddings and use the cheaper dot product internally. For unnormalised vectors, a long vector can win on dot product while pointing in a less similar direction.",
    ],
    [
      "Why is cosine similarity undefined for a zero vector?",
      "Because the formula divides by the vector norms, and a zero vector has norm 0, making the division undefined. This calculator reports an error for an all-zeros vector instead of returning a misleading number. It withholds all metrics, including Euclidean and Manhattan distance, whenever either vector is all zeros, since the comparison itself is treated as invalid input.",
    ],
  ],
};

export default seo;
