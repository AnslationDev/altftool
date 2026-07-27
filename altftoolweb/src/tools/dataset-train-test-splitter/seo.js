const seo = {
  intro:
    "This tool splits a JSONL dataset into train, validation and test files using a seeded Fisher–Yates shuffle, so the same seed always reproduces the exact same split. Split sizes are apportioned with the largest-remainder method, so the three counts always add up to the full record count. It is built for anyone preparing fine-tuning or evaluation data who wants a reproducible split without writing a script.",
  useCases: [
    "Splitting a fine-tuning JSONL file into 80/10/10 train, validation and test sets before uploading to an LLM fine-tuning API",
    "Re-creating an identical split months later by reusing the same seed, so old and new model runs are comparable",
    "Cleaning a scraped dataset by skipping lines that fail JSON parsing while splitting the valid records",
  ],
  benefits: [
    ["Reproducible by seed", "A seeded mulberry32 PRNG drives the shuffle — same data plus same seed equals byte-identical output files."],
    ["Counts always add up", "Largest-remainder apportionment guarantees train + validation + test equals the total, even for awkward percentages."],
    ["Private by design", "Parsing, shuffling and file generation all happen in the browser; the dataset is never uploaded."],
  ],
  faqs: [
    [
      "What is a good train validation test split ratio?",
      "80/10/10 is the common default for datasets of a few thousand records or more; 70/15/15 gives more evaluation signal for smaller sets. For very large datasets (millions of rows), validation and test sets of a fixed few thousand records each are usually enough, so the ratio can be far more train-heavy.",
    ],
    [
      "Why should I set a seed when splitting a dataset?",
      "A seed makes the shuffle deterministic, so anyone can regenerate the identical split from the same data. Without it, every run produces a different partition and metrics from different runs are not comparable, because each model would be evaluated on different held-out examples.",
    ],
    [
      "Should I shuffle before splitting the dataset?",
      "Almost always yes. Datasets are often ordered by source, date or label, and an unshuffled split then concentrates one kind of record in the test set, biasing the evaluation. The main exception is time-series data, where you should split chronologically instead to avoid training on the future — turn shuffling off for that case.",
    ],
    [
      "What is the JSONL format for training data?",
      "JSONL (JSON Lines) is a text file with one complete JSON object per line and no commas between lines. Most fine-tuning APIs, including OpenAI's and many open-source trainers, expect this layout — for example one {\"messages\": [...]} or {\"prompt\": ..., \"completion\": ...} object per line. This tool treats every non-empty line as one record and can skip lines that do not parse.",
    ],
  ],
};

export default seo;
