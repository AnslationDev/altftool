const seo = {
  title: "Vector Index Size Calculator With HNSW and IVF Overhead",
  metaDescription:
    "Size a vector index from count, dimensions and data type: adds HNSW graph links (M × 2 × 4 bytes/vector), IVF ids and centroids, metadata and replicas.",
  steps: [
    "Enter Number of vectors (or tap the 100K, 1M, 10M, 100M presets) and Dimensions per vector, then pick a Data type such as float32.",
    "Choose HNSW or IVF as the Index type and set HNSW M (links per node), Metadata per vector (bytes) and Replicas (total copies).",
    "Read the Estimated total index size in IEC units, broken into raw vector data, index overhead as a % of data, metadata and per replica.",
  ],
  intro:
    "This calculator estimates the total storage a vector index needs from vector count, dimensions and data type: raw data is count × dimensions × bytes per dimension, and index overhead follows the Faiss sizing rules (HNSW adds M × 2 × 4 bytes of graph links per vector; IVF adds 8-byte ids plus a 4×√N centroid table, the conservative end of Faiss's recommended 4×√N-16×√N range). It is for engineers capacity-planning a Pinecone, Qdrant, Milvus, pgvector or Faiss deployment who need a defensible RAM and disk figure before provisioning.",
  useCases: [
    "Sizing the RAM needed for 10 million 1536-dimension float32 embeddings in an HNSW index before choosing a managed vector database tier",
    "Comparing float32 against int8 storage for a 100M-vector product catalogue to decide whether scalar quantisation is worth the recall trade-off",
    "Working out how much extra storage two replicas and 256 bytes of per-vector metadata add to a planned Qdrant cluster",
  ],
  benefits: [
    ["Index overhead included", "HNSW graph links (M × 2 × 4 bytes per vector) and IVF ids plus centroids are added on top of the raw data, not ignored."],
    ["Every data type covered", "float64 down to 1-bit binary quantisation, with metadata bytes and replica count folded into the total."],
    ["Grounded in Faiss rules", "The arithmetic follows the published Faiss index sizing guidelines rather than a vendor's marketing calculator."],
  ],
  faqs: [
    [
      "How do I calculate the size of a vector database index?",
      "Multiply vector count × dimensions × bytes per dimension for the raw data (4 bytes per dimension for float32), then add index overhead: an HNSW graph adds roughly M × 2 × 4 bytes per vector (128 bytes at the default M=16), and IVF adds an 8-byte id per vector plus about 4×√N float32 centroids (the conservative end of Faiss's recommended 4×√N-16×√N range). Finally multiply by your replica count.",
    ],
    [
      "How much memory do 1 million OpenAI embeddings need?",
      "About 5.7 GiB of raw data for 1 million text-embedding-3-small vectors (1,536 dims × 4 bytes × 1M), plus roughly 122 MiB of HNSW graph overhead at M=16 and whatever metadata you store per vector. Most engines also want 20% or more free headroom, so plan around 8 GiB of RAM per replica.",
    ],
    [
      "How much overhead does an HNSW index add?",
      "Roughly M × 2 × 4 bytes per vector — 128 bytes at the common default M=16 — following the Faiss guideline that HNSW memory per vector is d × 4 + M × 2 × 4 bytes. For a 1536-dimension float32 vector (6,144 bytes) that is only about 2% extra, but for short or quantised vectors the graph can exceed the data itself.",
    ],
    [
      "Does quantisation reduce vector index size?",
      "Yes — int8 scalar quantisation cuts raw vector data to a quarter of float32 and binary quantisation to one thirty-second, but graph overhead and metadata do not shrink with it. That is why a binary-quantised HNSW index carries a much heavier proportional link cost: 128 bytes of graph per vector versus 192 bytes of data for a 1536-dimension binary vector, so the graph is two-thirds as large as the data itself — a far bigger share than at float32 precision, where the same 128 bytes of graph is only about 2% of the 6,144 bytes of data.",
    ],
  ],
};

export default seo;
