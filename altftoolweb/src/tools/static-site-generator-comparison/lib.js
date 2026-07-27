/**
 * Static site generator comparison.
 *
 * There is no single "fastest" generator, only a fit for one project. This
 * module holds a fact table for seven widely used generators and scores them
 * against weights you set, using a plain weighted mean:
 *
 *   score = 100 x sum(weight_i x rating_i) / (5 x sum(weight_i))
 *
 * Ratings are on a 1-5 scale and describe documented, checkable properties of
 * each project (its language and runtime, which rendering modes it ships,
 * how much JavaScript reaches the browser by default, which component
 * frameworks it accepts). They are judgements about capability, not benchmark
 * timings, so no invented numbers appear in the score.
 *
 * Build-time projection is kept separate and deliberately takes your own
 * milliseconds-per-page measurement, because real build time depends far more
 * on your images, data fetching and CI machine than on the generator name.
 */

/** Rating scale used by every criterion below. */
export const RATING_LABELS = {
  5: "Excellent",
  4: "Strong",
  3: "Adequate",
  2: "Limited",
  1: "Weak",
};

export const CRITERIA = [
  {
    id: "buildSpeed",
    label: "Build speed",
    help: "How quickly the generator turns content into HTML at the scale it is designed for.",
  },
  {
    id: "clientJs",
    label: "Little client JavaScript",
    help: "How close to zero the shipped JS is before you add anything yourself.",
  },
  {
    id: "dynamic",
    label: "Dynamic rendering",
    help: "Server rendering, incremental regeneration, form actions and API routes.",
  },
  {
    id: "ecosystem",
    label: "Ecosystem and maintenance",
    help: "Plugins, integrations, hosting support and how actively the project ships.",
  },
  {
    id: "authoring",
    label: "Content authoring",
    help: "Markdown handling, schemas, collections and how pleasant editors find it.",
  },
  {
    id: "componentReuse",
    label: "Component reuse",
    help: "How easily existing UI components drop into pages.",
  },
  {
    id: "scale",
    label: "Large-site scale",
    help: "Behaviour once a site passes roughly ten thousand pages.",
  },
];

/**
 * The fact table.
 *
 * `indicativeMsPerPage` is only a starting value for the build-time
 * projection below and is meant to be replaced with a measurement from your
 * own repository — it is an order-of-magnitude placeholder in the UI, never
 * part of the score.
 */
export const GENERATORS = [
  {
    id: "hugo",
    name: "Hugo",
    language: "Go",
    runtime: "Single compiled binary, no Node required",
    templating: "Go templates, Markdown with front matter",
    renderModes: ["Static (SSG)"],
    frameworks: ["none"],
    indicativeMsPerPage: 2,
    ratings: {
      buildSpeed: 5,
      clientJs: 5,
      dynamic: 1,
      ecosystem: 3,
      authoring: 4,
      componentReuse: 1,
      scale: 5,
    },
    note: "Compiles to one binary and does no JavaScript bundling, which is why very large content sites build in seconds. There is no server rendering: anything dynamic has to be a separate service or client-side fetch.",
  },
  {
    id: "eleventy",
    name: "Eleventy (11ty)",
    language: "JavaScript",
    runtime: "Node.js",
    templating: "Markdown, Nunjucks, Liquid, Handlebars, JS, WebC and more",
    renderModes: ["Static (SSG)"],
    frameworks: ["none"],
    indicativeMsPerPage: 8,
    ratings: {
      buildSpeed: 4,
      clientJs: 5,
      dynamic: 2,
      ecosystem: 3,
      authoring: 5,
      componentReuse: 2,
      scale: 4,
    },
    note: "Ships no client JavaScript and no bundler at all, so the output is exactly the HTML you wrote. Template-language freedom makes it the easiest migration target from an older static site.",
  },
  {
    id: "astro",
    name: "Astro",
    language: "JavaScript / TypeScript",
    runtime: "Node.js with Vite",
    templating: ".astro components, Markdown and MDX, typed content collections",
    renderModes: ["Static (SSG)", "Server (SSR via adapters)", "Server islands"],
    frameworks: ["react", "vue", "svelte", "solid", "preact", "none"],
    indicativeMsPerPage: 15,
    ratings: {
      buildSpeed: 4,
      clientJs: 5,
      dynamic: 4,
      ecosystem: 4,
      authoring: 5,
      componentReuse: 5,
      scale: 4,
    },
    note: "Renders to HTML by default and hydrates only the components you mark as islands. It is the one generator here that lets React, Vue and Svelte components live in the same project.",
  },
  {
    id: "nextjs",
    name: "Next.js",
    language: "JavaScript / TypeScript",
    runtime: "Node.js, with a Rust compiler (SWC / Turbopack)",
    templating: "React components, MDX via plugin",
    renderModes: ["Static (SSG)", "Server (SSR)", "Incremental (ISR)", "Streaming RSC"],
    frameworks: ["react"],
    indicativeMsPerPage: 60,
    ratings: {
      buildSpeed: 2,
      clientJs: 2,
      dynamic: 5,
      ecosystem: 5,
      authoring: 3,
      componentReuse: 4,
      scale: 3,
    },
    note: "The most capable rendering model of the group: static, server, incremental and streaming in one app. The cost is a React runtime in the browser and build times that grow noticeably past a few thousand static pages.",
  },
  {
    id: "sveltekit",
    name: "SvelteKit",
    language: "JavaScript / TypeScript",
    runtime: "Node.js with Vite",
    templating: "Svelte components, Markdown via mdsvex",
    renderModes: ["Static (SSG via adapter-static)", "Server (SSR)", "Form actions"],
    frameworks: ["svelte"],
    indicativeMsPerPage: 25,
    ratings: {
      buildSpeed: 4,
      clientJs: 4,
      dynamic: 5,
      ecosystem: 3,
      authoring: 3,
      componentReuse: 3,
      scale: 4,
    },
    note: "Svelte compiles components away instead of shipping a virtual DOM, so hydrated pages carry less JavaScript than the React options. Adapters target Node, Cloudflare, Vercel, Netlify or a plain static folder.",
  },
  {
    id: "gatsby",
    name: "Gatsby",
    language: "JavaScript / TypeScript",
    runtime: "Node.js with webpack and a GraphQL data layer",
    templating: "React components, MDX",
    renderModes: ["Static (SSG)", "Deferred static (DSG)", "Server (SSR)"],
    frameworks: ["react"],
    indicativeMsPerPage: 120,
    ratings: {
      buildSpeed: 1,
      clientJs: 2,
      dynamic: 3,
      ecosystem: 3,
      authoring: 3,
      componentReuse: 4,
      scale: 2,
    },
    note: "Every source goes through a GraphQL data layer before webpack builds the pages, which is powerful but the slowest pipeline here. Gatsby 5 shipped in 2022 and there has been no major release since Netlify acquired the company in 2023, so treat it as a maintenance-mode choice.",
  },
  {
    id: "jekyll",
    name: "Jekyll",
    language: "Ruby",
    runtime: "Ruby with Bundler",
    templating: "Liquid templates, Markdown with front matter",
    renderModes: ["Static (SSG)"],
    frameworks: ["none"],
    indicativeMsPerPage: 40,
    ratings: {
      buildSpeed: 2,
      clientJs: 5,
      dynamic: 1,
      ecosystem: 3,
      authoring: 4,
      componentReuse: 1,
      scale: 2,
    },
    note: "The only generator GitHub Pages builds natively, so a repository of Markdown publishes with no CI at all. Ruby and Liquid make it slow on large sites and awkward if the rest of your stack is JavaScript.",
  },
];

export const FRAMEWORK_CHOICES = [
  { id: "any", label: "No preference" },
  { id: "react", label: "React components" },
  { id: "vue", label: "Vue components" },
  { id: "svelte", label: "Svelte components" },
  { id: "none", label: "No component framework — templates only" },
];

/** Weight presets, expressed on the same 0-5 scale the sliders use. */
export const PRESETS = [
  {
    id: "docs",
    label: "Documentation site",
    weights: { buildSpeed: 5, clientJs: 4, dynamic: 1, ecosystem: 3, authoring: 5, componentReuse: 2, scale: 4 },
  },
  {
    id: "marketing",
    label: "Marketing site",
    weights: { buildSpeed: 3, clientJs: 5, dynamic: 2, ecosystem: 3, authoring: 4, componentReuse: 4, scale: 2 },
  },
  {
    id: "blog",
    label: "Personal blog",
    weights: { buildSpeed: 4, clientJs: 5, dynamic: 1, ecosystem: 2, authoring: 5, componentReuse: 1, scale: 2 },
  },
  {
    id: "app",
    label: "Content site with logged-in areas",
    weights: { buildSpeed: 2, clientJs: 2, dynamic: 5, ecosystem: 5, authoring: 3, componentReuse: 5, scale: 3 },
  },
  {
    id: "ecommerce",
    label: "Large catalogue / ecommerce",
    weights: { buildSpeed: 4, clientJs: 4, dynamic: 5, ecosystem: 4, authoring: 3, componentReuse: 4, scale: 5 },
  },
];

/** A generator counts as capable of dynamic rendering at this rating or above. */
export const DYNAMIC_RATING_THRESHOLD = 3;
export const MAX_RATING = 5;

/**
 * Score every generator against a set of weights.
 *
 * @param {object} input
 * @param {Record<string, number>} input.weights   0-5 per criterion id
 * @param {boolean} input.requireDynamic           must support SSR / ISR
 * @param {string}  input.framework                one of FRAMEWORK_CHOICES ids
 * @returns {{error:string}|{ranked:object[], best:object, excluded:object[], totalWeight:number}}
 */
export function compareGenerators({ weights = {}, requireDynamic = false, framework = "any" } = {}) {
  const active = CRITERIA.map((criterion) => {
    const raw = Number(weights[criterion.id]);
    return { id: criterion.id, label: criterion.label, weight: Number.isFinite(raw) ? raw : 0 };
  });

  if (active.some((item) => item.weight < 0 || item.weight > MAX_RATING)) {
    return { error: "Every weight has to sit between 0 and 5." };
  }

  const totalWeight = active.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) {
    return { error: "Give at least one criterion a weight above zero, otherwise there is nothing to rank on." };
  }

  if (!FRAMEWORK_CHOICES.some((choice) => choice.id === framework)) {
    return { error: "Pick a component framework preference from the list." };
  }

  const ranked = [];
  const excluded = [];

  for (const generator of GENERATORS) {
    if (requireDynamic && generator.ratings.dynamic < DYNAMIC_RATING_THRESHOLD) {
      excluded.push({ ...generator, blocked: "has no built-in server or incremental rendering" });
      continue;
    }
    if (framework !== "any" && !generator.frameworks.includes(framework)) {
      excluded.push({
        ...generator,
        blocked: `does not take ${framework === "none" ? "template-only" : framework} components`,
      });
      continue;
    }

    let weighted = 0;
    const contributions = [];
    for (const item of active) {
      const rating = generator.ratings[item.id];
      const part = item.weight * rating;
      weighted += part;
      contributions.push({ id: item.id, label: item.label, weight: item.weight, rating, part });
    }

    const score = (100 * weighted) / (MAX_RATING * totalWeight);
    contributions.sort((a, b) => b.part - a.part);

    ranked.push({
      ...generator,
      score: Math.round(score * 10) / 10,
      weighted,
      contributions,
      topDrivers: contributions.filter((c) => c.weight > 0).slice(0, 3),
    });
  }

  if (ranked.length === 0) {
    return {
      error:
        "Nothing left after those requirements. Server rendering plus a template-only setup is not something these generators offer together.",
    };
  }

  ranked.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return { ranked, best: ranked[0], excluded, totalWeight };
}

export const MS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;
export const DAYS_PER_MONTH = 30;

/**
 * Project build wall-clock and monthly CI minutes from your own measurement.
 *
 *   build seconds  = pages x ms per page / 1000
 *   CI minutes/mo  = build minutes x builds per day x 30
 *
 * @param {object} input
 * @param {number} input.pages          number of pages the generator emits
 * @param {number} input.msPerPage      measured milliseconds per page
 * @param {number} input.buildsPerDay   deploys plus preview builds per day
 * @param {number} input.fixedSeconds   install, cache restore and upload time
 */
export function projectBuildTime({ pages, msPerPage, buildsPerDay = 1, fixedSeconds = 0 } = {}) {
  const values = [pages, msPerPage, buildsPerDay, fixedSeconds].map(Number);
  if (values.some((value) => !Number.isFinite(value))) {
    return { error: "Enter numbers for pages, milliseconds per page, builds per day and fixed overhead." };
  }
  const [pageCount, perPage, builds, fixed] = values;
  if (pageCount <= 0) return { error: "A site needs at least one page." };
  if (perPage <= 0) return { error: "Milliseconds per page must be greater than zero." };
  if (builds <= 0) return { error: "Builds per day must be at least one." };
  if (fixed < 0) return { error: "Fixed overhead cannot be negative." };

  const renderSeconds = (pageCount * perPage) / MS_PER_SECOND;
  const buildSeconds = renderSeconds + fixed;
  const buildMinutes = buildSeconds / SECONDS_PER_MINUTE;
  const monthlyMinutes = buildMinutes * builds * DAYS_PER_MONTH;

  return {
    renderSeconds,
    buildSeconds,
    buildMinutes,
    monthlyMinutes,
    fixedShare: buildSeconds > 0 ? (fixed / buildSeconds) * 100 : 0,
  };
}

export function generatorById(id) {
  return GENERATORS.find((item) => item.id === id) || null;
}

export function presetById(id) {
  return PRESETS.find((item) => item.id === id) || null;
}
