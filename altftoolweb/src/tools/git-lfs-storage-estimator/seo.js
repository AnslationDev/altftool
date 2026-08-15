const seo = {
  title: "Git LFS Storage, Bandwidth and Data-Pack Cost Estimator",
  metaDescription:
    "Projects LFS storage from versions kept forever, clone bandwidth from the working set, and the cost in $5 GitHub data packs beyond the 1 GiB free tier.",
  steps: [
    "Enter LFS-tracked files at HEAD, Average file size (MiB) and New versions per file per month.",
    "Set the Projection horizon (months) and Fresh clones per month (incl. CI).",
    "Read Estimated GitHub LFS cost per month with Storage on server, Monthly clone bandwidth and Data packs needed, then press Copy result.",
  ],
  intro:
    "This calculator estimates Git LFS server storage, monthly bandwidth and cost from five inputs: tracked file count, average file size, new versions per file per month, a projection horizon and clone frequency. The model reflects how LFS actually behaves — every pushed version is stored forever by default, while a fresh clone downloads only the current version of each file — and prices the result in GitHub data packs ($5/month for 50 GiB storage plus 50 GiB bandwidth, beyond the 1 GiB free tier). It is for game, media and ML teams sizing LFS before committing their first large binaries.",
  useCases: [
    "A game studio projecting how fast weekly texture and audio updates will grow LFS storage over a year",
    "A team whose CI clones the repository on every build estimating the real bandwidth bill that causes",
    "Comparing keeping large ML model checkpoints in LFS versus moving them to object storage",
  ],
  benefits: [
    ["Version-growth aware", "Accounts for LFS keeping every pushed version, the factor that quietly dominates storage."],
    ["Bandwidth from clones", "Multiplies your clone rate (including CI) by the working set to expose the recurring cost."],
    ["Data-pack maths", "Converts overages into whole GitHub data packs and shows whether storage or bandwidth binds."],
  ],
  faqs: [
    [
      "How much free storage does GitHub give for Git LFS?",
      "Every GitHub account gets 1 GiB of free LFS storage and 1 GiB per month of free bandwidth. Beyond that, GitHub's published scheme sells data packs at $5 per month, each adding 50 GiB of storage and 50 GiB of monthly bandwidth. GitHub has also announced metered LFS billing on some plans, so confirm the current model on your account.",
    ],
    [
      "Does Git LFS store every version of a file?",
      "Yes — each time a tracked file changes and is pushed, the server keeps the new object alongside all previous ones, and old versions are not garbage-collected by default. A 100 MiB asset updated weekly adds roughly 5 GiB of server storage per year on its own, which is why version frequency matters more than initial size.",
    ],
    [
      "Does cloning a Git LFS repo download all old versions?",
      "No. A standard git clone downloads the full git history but only the LFS objects needed for the checked-out commit — the current version of each tracked file. That is why this estimator computes clone bandwidth as clones × working-set size rather than clones × total storage.",
    ],
    [
      "Do CI builds count against LFS bandwidth?",
      "Yes — every CI job that does a fresh clone (or a cache-miss checkout) downloads the LFS working set and it counts against the bandwidth quota. Teams are often surprised that CI, not developers, dominates their LFS bandwidth; caching LFS objects in the CI runner is the standard mitigation.",
    ],
  ],
};

export default seo;
