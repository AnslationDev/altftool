const seo = {
  intro:
    "This packing list works out the two things creators actually get wrong — power and storage — then builds the gear list around them. Batteries come from ceil(record minutes × safety factor ÷ battery runtime) with a two-battery floor, and card capacity from GB = Mbps × minutes × 60 ÷ 8 ÷ 1000, so a 100 Mbps camera recording for an hour needs 45 GB. It also totals the pack weight and converts battery capacity to watt-hours for airline rules.",
  useCases: [
    "Check whether three batteries really cover a two-hour interview before you leave the house.",
    "Work out how many cards a 400 Mbps All-Intra shoot day will fill.",
    "Build a location list that swaps mains extensions for power banks when there is no socket.",
    "Convert an mAh figure to watt-hours before flying with spare camera batteries.",
  ],
  benefits: [
    ["Power and storage calculated", "The counts come from your record time and bitrate, not from a generic list."],
    ["Conditional gear", "Outdoors, after dark, no mains and multiple cameras each change what appears."],
    ["Weight before you lift it", "Every line carries a typical weight so the bag total is visible up front."],
  ],
  faqs: [
    [
      "How many camera batteries should I take on a shoot?",
      "Take enough to cover your rolling record time with about 50% headroom, and never fewer than two. For two hours of recording on a battery that lasts an hour, that is three per body — cold weather, high frame rates and constant monitoring all shorten runtime further.",
    ],
    [
      "How much storage does one hour of 4K video need?",
      "Multiply the bitrate in Mbps by 450 to get gigabytes per hour: 100 Mbps 4K is about 45 GB an hour, 400 Mbps All-Intra about 180 GB, and 880 Mbps ProRes 422 HQ about 396 GB. Double it if you are recording to two cards or two cameras.",
    ],
    [
      "Can I take camera batteries on a plane?",
      "Spare lithium-ion batteries must go in carry-on baggage, never in the hold. Under 100 Wh each they normally need no approval; 100 to 160 Wh requires airline approval and is usually capped at two spares; above 160 Wh they are not allowed in passenger baggage at all.",
    ],
    [
      "How do I convert mAh to watt-hours?",
      "Watt-hours = volts × amp-hours, so divide mAh by 1000 first. A 7.2 V, 6600 mAh camera battery is 47.5 Wh; a 14.8 V, 10,000 mAh V-mount is 148 Wh and needs airline approval.",
    ],
  ],
};

export default seo;
