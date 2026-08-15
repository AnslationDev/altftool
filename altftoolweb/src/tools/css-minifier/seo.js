const seo = {
  title: "CSS Minifier - Compress CSS and See Exact Bytes",
  metaDescription:
    "Strips comments and whitespace only, so selectors and values are untouched. Reports exact byte savings; /*! license banners can be kept.",
  intro:
    "The CSS Minifier compresses a stylesheet by stripping comments, collapsing every run of whitespace to a single space, removing the spaces around braces, semicolons and commas, and dropping the final semicolon before each closing brace. It then reports the original size, the minified size, the bytes saved and the percentage saved to one decimal place, all measured on the real UTF-8 byte length. A toggle keeps /*! banner comments intact so licence headers survive compression.",
  useCases: [
    "You are about to ship a hand-written stylesheet that never goes through a bundler and want to know whether minifying it saves enough bytes to be worth doing.",
    "A vendor CSS file carries a licence banner you are contractually required to keep, so you need the comment starting with /*! preserved while everything else is stripped.",
    "You are checking a PageSpeed complaint about unminified CSS and need the before-and-after byte count for one specific file to confirm the warning is worth acting on.",
  ],
  benefits: [
    ["Licence banners survive", "Comments opened with /*! are set aside before stripping and restored afterwards, the same convention build tools use to keep legal headers in minified output."],
    ["Real byte accounting", "Sizes are measured as encoded bytes rather than character counts, so the saving reported is the saving your server actually transfers."],
    ["Non-destructive by design", "It only removes whitespace and comments — selectors, property names, values and rule order are left exactly as written, so nothing can be renamed out from under you."],
  ],
  faqs: [
    [
      "How much smaller does minifying CSS usually make a file?",
      "For hand-formatted stylesheets the saving is typically in the 10-30% range, and the tool reports your exact figure to one decimal place alongside the byte counts. Heavily commented files save more; files that are already compact save very little.",
    ],
    [
      "Will minifying change how my CSS behaves?",
      "No. Only comments and insignificant whitespace are removed, plus the redundant semicolon before a closing brace, which CSS treats as optional. Selectors, properties, values, specificity and source order are untouched.",
    ],
    [
      "How do I stop my licence comment from being deleted?",
      "Write it as an important comment — open it with /*! instead of /* — and leave the preserve-comments option on. Those blocks are pulled out before the strip pass and put back afterwards; every ordinary /* ... */ comment is removed.",
    ],
    [
      "Does this shorten hex colours or merge duplicate rules?",
      "No — it is a whitespace and comment minifier only, so #ffffff stays #ffffff and two rules with the same selector stay separate. For structural optimisation like colour shortening, longhand collapsing or dead-rule removal you need a full optimiser such as cssnano.",
    ],
  ],
};

export default seo;
