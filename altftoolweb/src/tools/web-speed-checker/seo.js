const seo = {
  title: "Website Speed Test — Free Lighthouse Score",
  h1: "Web Speed Checker — Free Website Speed Test",
  metaDescription:
    "Free website speed test: enter a URL and get the Lighthouse performance score, LCP, page weight and request count from Google's PageSpeed API. No signup.",
  intro:
    "Web Speed Checker runs a real Lighthouse audit on any publicly reachable URL. The page sends your address to a server route that proxies Google's PageSpeed Insights v5 API (runPagespeed) with a hosted API key, then reads four figures straight out of the returned Lighthouse report: the performance category score multiplied by 100, the largest-contentful-paint audit's display value, total-byte-weight for page size, and the number of items in the network-requests audit. It also lists the first five audits that scored below a perfect 1 as plain-language optimisation suggestions, with markdown link syntax stripped from Google's wording. Because the audit runs on Google's infrastructure rather than in your browser, the URL you submit is sent to the PageSpeed Insights API — this is not a local-only tool.",
  useCases: [
    "Get a Lighthouse performance score for a page before and after a deploy, without installing Node or opening DevTools.",
    "Check what a landing page actually weighs and how many requests it fires when a client says the site \"feels slow\".",
    "Pull the top five failing Lighthouse audits for a URL as a starting checklist for optimisation work.",
  ],
  benefits: [
    [
      "Real Lighthouse data, not a ping",
      "The score, LCP, page weight and request count all come from Google's PageSpeed Insights v5 report — the same audit engine behind the official tool, not a stopwatch on a HEAD request.",
    ],
    [
      "Four numbers instead of a full report",
      "Performance score out of 100 (colour-coded green at 90+, amber at 50-89, red below 50), largest contentful paint, total byte weight and total network requests, on one row of cards.",
    ],
    [
      "Fixes surfaced automatically",
      "The first five audits that scored below 1 are listed with Google's own explanation of each, with markdown links stripped so the text reads cleanly.",
    ],
    [
      "Free, no account, no API key",
      "Nothing to sign up for and no key of your own — the key sits on the server. Checks are capped at 20 per minute per IP, and an identical URL rechecked inside 5 minutes returns the cached report.",
    ],
  ],
  faqs: [
    [
      "How do I test my website speed for free?",
      "Paste the full URL — it has to start with http:// or https:// — and press Check Speed. The tool sends it to Google's PageSpeed Insights v5 API and returns a Lighthouse performance score out of 100, the largest contentful paint time, total page weight and the number of network requests. No account, install or API key of your own is required.",
    ],
    [
      "What is a good website performance score?",
      "90 and above is good, 50-89 needs work, and below 50 is poor — the same bands Lighthouse uses, which this tool colour-codes green, amber and red. The score is a weighted blend of lab metrics, so it can shift by several points between runs on an unchanged page.",
    ],
    [
      "Does this test mobile or desktop speed?",
      "Desktop. The request omits the strategy parameter, so Google returns its default report, and there is no mobile/desktop switch in the interface. For a mobile-specific run, use PageSpeed Insights directly with the mobile strategy selected.",
    ],
    [
      "Is my URL sent to a server, or does this run in my browser?",
      "It is sent to a server. Unlike browser-only tools, a speed test needs the page loaded from outside, so your URL goes to Google's PageSpeed Insights API and Google's machines fetch and audit the page. AltFTool stores nothing; the response is simply cached for 5 minutes, so an immediate repeat of the same URL returns the earlier report.",
    ],
    [
      "Why did my speed test fail or time out?",
      "Usually because the page is not publicly reachable or the audit ran long. Google fetches the URL itself, so localhost addresses, staging sites behind a login, IP-restricted pages and anything that blocks Google's fetcher will fail. The request is also aborted after 12 seconds, and you are limited to 20 checks per minute per IP address before requests are refused.",
    ],
    [
      "What does the Load Time figure actually measure?",
      "It is largest contentful paint (LCP) from the Lighthouse report — the point at which the biggest visible element in the viewport finishes rendering, not the moment every asset has downloaded. Google's Core Web Vitals threshold treats 2.5 seconds or less as good.",
    ],
    [
      "Why does the score change every time I run it?",
      "Lighthouse is a lab test, so results move with network conditions, CPU contention on the testing machine, ad and third-party script variance, and any A/B test on your own site. Compare a few runs rather than trusting one, and remember that rechecking the same URL within 5 minutes returns the cached result instead of a fresh audit.",
    ],
    [
      "Does it show Core Web Vitals field data from real users?",
      "No — only lab metrics. The interface displays the Lighthouse audit values (performance score, LCP, total byte weight, request count). The Chrome UX Report field data that the PageSpeed Insights API also returns is not surfaced on this page.",
    ],
  ],
  steps: [
    "Type or paste the full page URL into the box — it must begin with http:// or https:// and be reachable from the public internet.",
    "Press Check Speed and wait while Google's PageSpeed Insights API runs the Lighthouse audit on that page.",
    "Read the four metric cards — performance score, load time (LCP), page size and requests — then work through the five optimisation suggestions listed beneath them.",
  ],
};

export default seo;
