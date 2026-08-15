const seo = {
  title: "Proxy Editing Storage Calculator for ProRes Workflows",
  metaDescription:
    "Sizes originals, proxies, render previews and cache separately, from ProRes rates scaled by pixel count. Only originals multiply across backups.",
  intro:
    "This calculator sizes every kind of file a proxy editing workflow puts on disk: camera originals (footage hours × acquisition data rate), proxies (the same hours at a codec rate scaled to the proxy's own pixel count), render previews (timeline length × preview codec rate, not footage length), and media cache as a share of the source media. It uses Apple's published ProRes target rates at 1920×1080 29.97 as the reference point — 45 Mb/s for Proxy, 102 for LT, 147 for 422 — and scales them by pixel rate. Backup copies multiply only the originals, because proxies, previews and cache can all be regenerated.",
  useCases: [
    "Specifying the working drive for a documentary with 40 hours of 4K rushes before the shoot starts",
    "Checking whether quarter-resolution ProRes Proxy will fit alongside originals on an existing SSD",
    "Budgeting total archive capacity for a 3-2-1 backup policy across a year of client projects",
  ],
  benefits: [
    ["Sizes each layer separately", "Originals, proxies, previews and cache are calculated from their own inputs, not one blanket multiplier."],
    ["Proxy rate follows pixel count", "Halving linear resolution quarters the pixels, and the proxy data rate follows, as it does in practice."],
    ["Backups counted correctly", "Only the originals are duplicated across copies, so archive estimates are not inflated by regenerable files."],
  ],
  faqs: [
    [
      "How much storage does one hour of 4K footage need?",
      "It depends only on the data rate, not the resolution label. At 150 Mb/s an hour takes 67.5 GB; at an all-intra 400 Mb/s it takes 180 GB; at ProRes 422 HQ for 4K, around 880 Mb/s, it takes about 396 GB. Multiply the megabits per second by 450 to get gigabytes per hour.",
    ],
    [
      "How much space do ProRes proxies take?",
      "Far less than the originals, because the data rate falls with the pixel count. ProRes Proxy is 45 Mb/s at 1920×1080 29.97, so quarter-resolution proxies of UHD footage run under 10 Mb/s — roughly 4 GB per hour, which is a saving of well over 90% against typical camera originals.",
    ],
    [
      "Do I need to back up my proxies and render files?",
      "No. Proxies, render previews and media cache are all derived from the camera originals and can be rebuilt at any time, so backing them up wastes archive space. Protect the originals and the project files; regenerate everything else if a drive fails.",
    ],
    [
      "How full should an editing drive get?",
      "Leave roughly 20% free. Both spinning disks and SSDs slow down as they fill — SSDs lose write performance once the controller runs short of free blocks — and an edit needs room for cache and previews that grow as you work. Size the drive from your media total divided by 0.8.",
    ],
  ],
};

export default seo;
