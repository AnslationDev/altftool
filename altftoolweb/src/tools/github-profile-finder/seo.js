const seo = {
  intro:
    "GitHub Profile Finder looks up any public GitHub username or organisation through GitHub's own REST API and returns the profile card — bio, company, location, website, join date, public repo count, followers, following and gists — alongside that account's 30 most recently updated repositories. From those repos it ranks the top 8 by stars plus forks and works out a language split as the share of repos written in each language. It is for anyone sizing up a developer, a candidate or an open-source organisation without clicking through half a dozen GitHub tabs.",
  useCases: [
    "You are screening a candidate who listed a GitHub handle on their CV and want to see, in one screen, what they actually publish, how active the repos are and which languages dominate.",
    "You are evaluating whether an open-source organisation is worth depending on and want its top repositories ranked by stars plus forks rather than by last-pushed date.",
    "You are writing a talk or a newsletter item about a maintainer and need their follower count, join date and headline projects without scraping the profile page by hand.",
  ],
  benefits: [
    [
      "Ranks repos by real traction",
      "Repositories are sorted by stars plus forks combined, so a widely-forked utility is not buried under a project that merely got a recent commit.",
    ],
    [
      "Language split you can read at a glance",
      "The top six languages are shown as a percentage of the fetched repositories that declare that language, with GitHub's familiar per-language colours.",
    ],
    [
      "Explains failures instead of spinning",
      "A missing username returns a plain 'user not found' message and a 403 is reported as a rate-limit hit, so you know whether to fix the spelling or wait.",
    ],
  ],
  faqs: [
    [
      "Where does the data come from and how fresh is it?",
      "Directly from GitHub's public REST API — one call to the users endpoint and one to that user's repos endpoint — so the figures are whatever GitHub is serving at the moment you search. Nothing is cached or stored by the tool.",
    ],
    [
      "Why do I get a rate limit error?",
      "Because the lookup is unauthenticated, and GitHub caps unauthenticated REST requests per IP address — 60 per hour under its published limits — while each search here uses two of them. If you hit the cap, wait for the hour window to roll over; sharing an office or VPN IP makes it arrive sooner.",
    ],
    [
      "How many repositories does it actually look at?",
      "It fetches the 30 most recently updated public repositories, displays the top 8 of those by stars plus forks, and derives the language chart from the same 30. So for a very prolific account the language split reflects recent work rather than a lifetime total.",
    ],
    [
      "Can it show private repositories or contribution graphs?",
      "No. Only public data exposed by the unauthenticated API is available, so private repos, private contributions and the contribution heatmap are out of scope. Public repo count, followers, following and public gists come straight from the profile record.",
    ],
  ],
};

export default seo;
