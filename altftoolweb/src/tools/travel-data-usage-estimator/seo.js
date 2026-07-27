const seo = {
  intro:
    "This estimator converts your daily phone habits into a megabyte figure for a whole trip, using the published consumption rates for each activity: about 5 MB per hour of turn-by-turn navigation, 0.7 GB per hour of standard-definition video, 72 MB per hour of 160 kbps music, 5 MB per minute of video calling and 60 MB per minute of 1080p video backup. It adds a configurable network-overhead allowance for headers and retries on weak roaming signal, then recommends a pack size with 20% head-room. It is for travellers choosing between a roaming add-on, an eSIM data plan and a local SIM before they leave.",
  useCases: [
    "Sizing a travel eSIM before a two-week trip when the options jump from 5 GB to 10 GB to 20 GB",
    "Deciding whether leaving photo and video auto-backup on mobile data will burn a roaming pack in three days",
    "Working out whether a family of four sharing one hotspot needs a 50 GB plan or can manage on 20 GB",
  ],
  benefits: [
    [
      "Rates you can check",
      "Every activity uses a documented per-hour or per-minute figure rather than a vague guess.",
    ],
    [
      "Shows the real culprit",
      "The breakdown ranks activities by share, so you can see that video streaming or backup dominates everything else.",
    ],
    [
      "Sized in operator units",
      "Totals are in decimal GB (1 GB = 1000 MB), which is how roaming packs and eSIM plans are sold.",
    ],
  ],
  faqs: [
    [
      "How much data does Google Maps use per hour?",
      "About 5 MB per hour of turn-by-turn navigation. Maps streams compressed vector tiles and traffic updates rather than images, so a full day of driving costs roughly 40 MB. Downloading an offline map area first cuts even that to near zero.",
    ],
    [
      "How many GB do I need for a one-week holiday?",
      "For a typical traveller who uses maps, messaging, some social scrolling and light streaming, 5 to 10 GB covers a week. Streaming one hour of HD video a day alone adds about 8.4 GB over seven days, so the answer swings entirely on whether you watch video on mobile data.",
    ],
    [
      "Does uploading photos to iCloud or Google Photos use a lot of mobile data?",
      "Yes — it is often the largest single item. A HEIC photo is around 2 MB and a JPEG around 3.5 MB, but recorded video is the real cost: 1080p at 30 fps is about 60 MB per minute and 4K about 190 MB per minute. Setting backup to Wi-Fi only is the single biggest saving on a trip.",
    ],
    [
      "Why is my actual roaming usage higher than the estimate?",
      "Real usage runs above payload because of TCP and TLS headers, retried requests on a weak roaming signal, app background refresh and OS updates. The tool applies a 10% overhead by default; raise it towards 15-20% if you expect patchy coverage, and check your carrier's own usage meter rather than the phone's counter, since the two are measured differently.",
    ],
  ],
};

export default seo;
