const seo = {
  intro:
    "A Spotify data export is not one request but three separate tiers, each with its own confirmation email and its own wait: account data, which Spotify quotes at about 5 days, and extended streaming history and technical log information, both quoted at up to 30 days. This planner shows which tier each file belongs to, estimates how many individual play records your history holds from your daily listening time and average track length, and flags the files that reveal your routine rather than your taste. Apple Music, YouTube Music and Amazon Music are requested through their own portals, not through Spotify.",
  useCases: [
    "Request only playlists and library when migrating to another service, instead of waiting a month for a full listening history you do not need.",
    "Estimate how many play records the extended history will contain before opening a multi-gigabyte JSON file in a spreadsheet.",
    "Pull the inferences file to see which advertising segments the service has placed you in.",
    "Get the extended history for a personal listening-stats project, with the timestamps and skip reasons that the yearly recap leaves out.",
  ],
  benefits: [
    ["Three tiers, made explicit", "Shows which request each file needs, so nothing is quietly left out of the archive."],
    ["Play-count sizing", "Turns your daily listening habit into a concrete record count and archive size."],
    ["Points at the risky file", "The extended history carries IP addresses and per-play timestamps; that is called out plainly."],
  ],
  faqs: [
    [
      "How do I download my Spotify data?",
      "Sign in on Spotify's privacy page and use the download-your-data form. Tick the tiers you want, then confirm each one from the email Spotify sends; a tier whose confirmation link is never clicked is never prepared.",
    ],
    [
      "How long does Spotify take to send my data?",
      "Spotify quotes about 5 days for the account-data tier and up to 30 days for extended streaming history and technical log information. Requesting all three at once is faster than doing them one after another, because the clocks run in parallel.",
    ],
    [
      "What is in the Spotify extended streaming history?",
      "One JSON record for every play going back to your first listen, with the timestamp, track, milliseconds played, platform, country, IP address, and flags for shuffle, skip and the reason the track started and ended. It is the most revealing file in the archive because it maps your daily routine, not just your taste.",
    ],
    [
      "Can I export Apple Music or YouTube Music the same way?",
      "No. Apple Music history is requested through Apple's privacy portal, YouTube Music through Google Takeout, and Amazon Music through Amazon's Data Privacy page. Each has its own scope and its own timeline. This page is informational only and not legal advice.",
    ],
  ],
};

export default seo;
