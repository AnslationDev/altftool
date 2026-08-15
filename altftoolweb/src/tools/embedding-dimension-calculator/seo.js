const seo = {
  title: "Embedding Dimension & Vector Memory Calculator",
  metaDescription:
    "Size embeddings exactly: dimensions x bytes per dimension, from float64 to 1-bit binary, per vector and per 1K/1M/10M, with OpenAI and Cohere presets.",
  steps: [
    "Enter \"Embedding dimensions\" or tap a model preset such as OpenAI text-embedding-3-small (1,536) or all-MiniLM-L6-v2 (384), then pick a \"Storage precision\" from float64 (8 bytes/dim) to binary (1 bit/dim).",
    "Optionally add \"Metadata per vector (bytes)\" for ids, source text or JSON stored beside each embedding.",
    "Read \"Memory per vector\" with per-1,000, per-1,000,000 and per-10,000,000 totals and the every-precision comparison table, then press \"Copy result\".",
  ],
  intro:
    "This calculator computes the exact memory one embedding vector occupies — dimensions multiplied by bytes per dimension, so a 1536-dimension float32 embedding takes 6,144 bytes. It is built for engineers sizing a RAG pipeline or vector database who need per-vector, per-thousand and per-million figures before choosing a model or a quantisation scheme, across float64, float32, float16, bfloat16, int8 and binary storage.",
  useCases: [
    "Comparing OpenAI text-embedding-3-small (1536 dims) against text-embedding-3-large (3072 dims) to see the storage cost of the accuracy upgrade before committing",
    "Estimating how much RAM 10 million document embeddings need in float32 versus int8 before picking a Pinecone or pgvector instance size",
    "Checking how many bytes binary quantisation actually saves on a 1024-dimension Cohere embedding when a reranker handles final scoring",
  ],
  benefits: [
    ["Exact bytes, not estimates", "Vector size is deterministic arithmetic: ceil(dimensions × bits per dim ÷ 8), reported per vector and at 1K, 1M and 10M scale."],
    ["Every precision side by side", "One table shows the same vector in float64 down to 1-bit binary, with the percentage saved versus float32."],
    ["Model presets built in", "One tap loads the published dimension counts of OpenAI, Cohere, BGE, E5 and MiniLM embedding models."],
  ],
  faqs: [
    [
      "How much memory does a 1536-dimension embedding use?",
      "6,144 bytes (6 KiB) in float32, because each of the 1,536 dimensions takes 4 bytes. The same vector is 3,072 bytes in float16, 1,536 bytes in int8 and 192 bytes with binary quantisation. A million such float32 vectors need about 5.7 GiB before any index overhead.",
    ],
    [
      "What precision do vector databases store embeddings in by default?",
      "float32 (4 bytes per dimension) is the default in Faiss, pgvector, Milvus, Qdrant and most managed services. Many of them offer scalar (int8) or binary quantisation as an opt-in to cut memory by 4x to 32x, usually at a small recall cost that a reranking step can recover.",
    ],
    [
      "How is embedding storage size calculated?",
      "Multiply the dimension count by the bytes per dimension of the storage format: dimensions × 8 for float64, × 4 for float32, × 2 for float16 or bfloat16, × 1 for int8, and ÷ 8 for binary (one bit per dimension). Add whatever metadata — ids, source text, JSON — you store alongside each vector.",
    ],
    [
      "Does reducing embedding dimensions reduce storage linearly?",
      "Yes — storage scales exactly linearly with dimensions, so truncating OpenAI text-embedding-3-large from 3072 to 1024 dimensions cuts vector storage by two-thirds. Models trained with Matryoshka representation learning are designed so shortened vectors keep most of their retrieval quality.",
    ],
  ],
};

export default seo;
