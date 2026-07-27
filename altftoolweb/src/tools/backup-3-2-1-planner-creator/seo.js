const seo = {
  intro:
    "The 3-2-1 backup rule says keep three copies of your data, on two different types of media, with one copy off site. This planner applies that rule to a footage library that is still growing: it projects your storage in TB over a chosen horizon, adds free-space headroom, works out how many drives each copy needs, prices the cloud copy month by month as the library grows, and estimates how long a full restore would take over your drive bus and your internet link.",
  useCases: [
    "Work out how many 18 TB drives a two-year plan needs when you add 500 GB of footage a month.",
    "Compare the cost of a rotated off-site drive against a cloud archive billed per TB per month.",
    "Show a client or producer the real recovery time before agreeing to a delivery deadline after a failure.",
    "Budget storage spend per month instead of being surprised by a large one-off drive purchase.",
  ],
  benefits: [
    ["Sized, not guessed", "Capacity is projected forward with your growth rate and includes free-space headroom."],
    ["Cloud cost that grows", "Monthly cloud spend is summed month by month as the library grows, not charged at the end-state size."],
    ["Restore reality check", "Shows how many hours or days a full recovery takes locally and over your connection."],
  ],
  faqs: [
    [
      "What is the 3-2-1 backup rule?",
      "Three copies of your data, on two different media types, with one copy off site. It was popularised by photographer Peter Krogh and is echoed in US-CERT guidance, and it works because it survives the three common failure modes: a drive dying, a machine or controller failing, and a fire, theft or flood at one address.",
    ],
    [
      "Is RAID a backup?",
      "No. RAID protects against a disk failing, not against deletion, ransomware, corruption or a controller taking the whole array down. It replaces copy one in a 3-2-1 plan; you still need the second local copy and the off-site copy.",
    ],
    [
      "How much free space should I leave on a backup drive?",
      "Around 20% is a sensible default. Both spinning disks and SSDs slow down and fragment as a volume passes roughly 80-90% full, and a target with no headroom cannot absorb the next shoot without an emergency purchase.",
    ],
    [
      "How long does it take to restore from the cloud?",
      "At 100 Mbps you move roughly 45 GB an hour, so a 20 TB library takes about 440 hours — over two weeks of continuous download. That is why most providers also offer a physical drive shipment for large restores, and why the local second copy is the one you actually recover from.",
    ],
  ],
};

export default seo;
