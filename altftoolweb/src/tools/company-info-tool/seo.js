const seo = {
  intro:
    "The Company Info Explorer looks up a company name against the DuckDuckGo Instant Answer API and returns the encyclopedic summary, its named source, the infobox fields such as founding date, headquarters and industry, and a list of related topics with links. It is a fast first-pass research step for anyone about to write a pitch, a competitor sheet or a candidate brief who wants the basic facts and a citable source in one screen. The lookup sends your query to a public API, so it is not a local-only tool and returns whatever that index holds rather than filings-grade financial data.",
  useCases: [
    "You have a sales call in ten minutes with a company you have never heard of and need its industry, founding year and one-line description before you dial.",
    "You are building a competitor comparison sheet and want each rival's summary plus a source URL you can cite in the doc rather than a link you half-remember.",
    "A recruiter sends you an offer from an unfamiliar employer and you want to see the parent company, headquarters location and related brands before replying.",
  ],
  benefits: [
    [
      "Source is always named",
      "Every summary shows which source it came from and links straight to the original page, so nothing lands in your notes without attribution.",
    ],
    [
      "Structured fields, not just prose",
      "When the instant answer carries an infobox, its label-value pairs are laid out as a grid instead of being buried inside a paragraph.",
    ],
    [
      "Related topics for the ambiguous names",
      "Companies that share a name with a place, a person or a product return the disambiguation list, so you can tell which entity you actually found.",
    ],
  ],
  faqs: [
    [
      "where does the company data come from",
      "The DuckDuckGo Instant Answer API, requested with format=json and no_html=1, which draws its abstracts largely from Wikipedia and similar reference sources. The response fields shown here are the heading, abstract text, abstract source, abstract URL, infobox entries and related topics.",
    ],
    [
      "why did my search return no description",
      "The Instant Answer API only has an abstract for entities it recognises, so private companies, small businesses and very new startups usually come back empty even though the request succeeded. Trying the legal entity name, or the parent brand rather than a product line, is the fix that works most often.",
    ],
    [
      "does this show revenue, headcount or stock price",
      "No. It returns only the reference summary and whatever infobox fields the source carries, which can include founding year, founders, headquarters and industry but not live financials. For revenue, filings or market data, go to the company's investor relations page or a regulator's filing database.",
    ],
    [
      "is my search query private",
      "No. The company name you type is sent over the network to the DuckDuckGo Instant Answer API through a public CORS proxy, so treat the query as visible to third parties. Avoid entering anything confidential, such as an unannounced acquisition target.",
    ],
  ],
};

export default seo;
