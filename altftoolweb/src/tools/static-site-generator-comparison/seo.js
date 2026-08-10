const seo = {
  title: "Compare 7 Static Site Generators by Your Own Weights",
  metaDescription:
    "Weight build speed, client JS, rendering and scale to rank Next.js, Astro, Hugo, Eleventy, Gatsby, SvelteKit and Jekyll, then project CI minutes.",
  steps: [
    "Under 'Start from a project type' choose Documentation site, Marketing site, Personal blog, Content site with logged-in areas or Large catalogue / ecommerce, or move the seven 0-5 sliders (Build speed, Little client JavaScript, Dynamic rendering, Ecosystem and maintenance, Content authoring, Component reuse, Large-site scale) yourself.",
    "Narrow the field with 'Component framework you already use' and the 'I need server rendering' checkbox, which rules out generators that cannot do SSR or incremental regeneration.",
    "Read 'Best fit for these weights' with its score out of 100 and the full ranking, then enter Milliseconds per page, Pages generated and Builds per day to get Total build wall clock and CI minutes per month; 'Copy result' copies the ranking and projection.",
  ],
  intro:
    "This comparison scores seven static site generators — Next.js, Astro, Hugo, Eleventy, Gatsby, SvelteKit and Jekyll — against weights you set across build speed, shipped JavaScript, rendering modes, ecosystem, authoring, component reuse and large-site scale. The ranking is a weighted mean of 1-5 capability ratings, so moving a slider immediately shows which generator the trade-off actually favours. A separate projection turns your own measured milliseconds per page into build wall clock and monthly CI minutes.",
  useCases: [
    "Deciding whether a 20,000-page documentation site should move off a React generator to Hugo",
    "Justifying Astro over Next.js for a marketing site where Lighthouse scores are the brief",
    "Estimating CI minutes before committing to a generator whose builds run on every pull request",
  ],
  benefits: [
    ["Weights, not opinions", "You set what matters; the ranking follows the arithmetic rather than a blog post."],
    ["Hard requirements filter", "Needing server rendering or React components removes the generators that cannot provide them."],
    ["Honest build estimates", "Build time comes from your measurement, not a benchmark from someone else's machine."],
  ],
  faqs: [
    [
      "Which static site generator has the fastest builds?",
      "Hugo, by a wide margin on content-heavy sites. It is a single compiled Go binary that does no JavaScript bundling, so the work per page is template execution and file writing only. Node-based generators add module resolution and a bundler pass, and Gatsby additionally runs every source through a GraphQL data layer, which is why it is the slowest of the seven.",
    ],
    [
      "Should I use Astro or Next.js?",
      "Choose Astro when the site is mostly content and you want zero JavaScript on pages that do not need it; choose Next.js when large parts of the app are interactive, authenticated or need incremental regeneration. Astro renders to HTML by default and hydrates only the components you mark as islands, and it accepts React, Vue, Svelte and Solid components in the same project.",
    ],
    [
      "Is Gatsby still worth starting a new project on?",
      "It is hard to recommend for a new build. Gatsby 5 shipped in 2022 and there has been no major release since Netlify acquired the company in 2023, so the plugin ecosystem is ageing while the alternatives ship regularly. Existing Gatsby sites are fine to maintain, but a new content site gets faster builds and less client JavaScript from Astro or Eleventy.",
    ],
    [
      "Which generator works with GitHub Pages without a CI pipeline?",
      "Jekyll is the only one GitHub Pages builds natively — push Markdown and the site publishes with no workflow file. Every other generator here can still deploy to GitHub Pages, but you have to run the build yourself in a GitHub Actions workflow and publish the output directory.",
    ],
  ],
};

export default seo;
