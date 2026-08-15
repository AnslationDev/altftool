const seo = {
  title: "Facebook & Instagram Data Download: Size and Risk Plan",
  metaDescription:
    "Size a Meta 'Download your information' request first: pick categories, HTML or JSON and media quality, then see archive size and download time.",
  steps: [
    "Tick the categories under 1. Choose what to include, or use Select all / Deselect all.",
    "Under 2. Set the export options give Account age (years), Your download speed (Mbps), Media quality and File format — HTML or JSON.",
    "Estimated archive size appears with the download time, Largest single category and Sensitivity of this selection out of 100, then Copy plan.",
  ],
  intro:
    "This planner sizes a Meta \"Download your information\" request before you submit it, using Meta's real export controls: category selection, HTML or JSON format, Low/Medium/High media quality and account age as the size driver. It estimates the archive size, the download time at your line speed, and how sensitive the selection is, so you know whether you are about to pull down 200 MB of activity logs or 60 GB of photos. Useful when migrating away from Facebook or Instagram, auditing ad profiling, or preparing evidence before deleting an account.",
  useCases: [
    "Export only 'Your activity off Meta' and 'Ads information' to see which websites and advertisers have been feeding data about you to Meta.",
    "Size a full Messenger and Instagram DM archive before a phone migration, and pick JSON so the messages are searchable.",
    "Drop media quality to Low when you only need the text records, cutting a multi-gigabyte export to a few hundred megabytes.",
    "Check the security and login file for unfamiliar IP addresses or devices after a suspected account compromise.",
  ],
  benefits: [
    ["Uses Meta's real options", "Format, media quality and per-category scope mirror the actual Accounts Center flow."],
    ["Time as well as size", "Converts the estimate into a download time at your own connection speed."],
    ["Risk-ranked categories", "Each category carries a 1-5 sensitivity rating so you can leave the riskiest files out."],
  ],
  faqs: [
    [
      "How do I download my Facebook and Instagram data?",
      "Open Accounts Center, go to Your information and permissions, then Download your information. Choose the profiles, the categories, a date range, HTML or JSON, and a media quality; Meta emails you when the file is ready, which can take from minutes to a few days depending on scope.",
    ],
    [
      "Should I choose HTML or JSON for a Meta download?",
      "Pick HTML if you want to browse the archive by clicking through pages, and JSON if a script, another service or a bulk search will read it. JSON is also the smaller of the two for text-heavy categories because it drops the HTML markup and styling.",
    ],
    [
      "What is 'Your activity off Meta' in the download?",
      "It is the record of activity that other apps and websites sent to Meta about you, such as pages viewed or purchases made outside Facebook and Instagram. It is usually the most surprising file in the archive and it is worth reading before anything else.",
    ],
    [
      "How long does Meta take to prepare the file, and how long can I download it?",
      "Small text-only selections often finish in minutes, while a full all-time export with high-quality media can take several days. The finished file is only available for a limited window and Meta asks for your password again before the download starts, so save it promptly. For a formal access request, data-protection law generally gives a controller one month to respond; this page is informational and not legal advice.",
    ],
  ],
};

export default seo;
