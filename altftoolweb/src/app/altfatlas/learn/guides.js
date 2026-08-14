/*
 * AltF Atlas — editorial guides.
 *
 * These exist to answer the questions a directory raises but cannot answer
 * inside an entry: how to judge a tool you have never heard of, why half the
 * classic lists are dead, and what "free" is actually doing in a pricing page.
 * They are also the E-E-A-T layer — the methodology guide states in public how
 * entries get in and what gets one removed.
 *
 * `body` entries are plain paragraphs. Keeping them as strings rather than
 * JSX means the same content can be reused in llms.txt and the answer-engine
 * manifest without a renderer.
 */

export const GUIDES = [
  {
    slug: "how-to-tell-if-a-web-tool-is-safe",
    title: "How to tell if a free web tool is safe to use",
    description:
      "Six checks that take under a minute and catch most of the ways a free online tool can cost you something.",
    readMinutes: 6,
    updated: "2026-07-29",
    intro:
      "Every free tool is paid for by something. Usually that is ads or an upgrade path, which is fine. Occasionally it is your file, your email address, or your attention in a way you did not agree to. These checks take under a minute and catch most of it.",
    sections: [
      {
        heading: "Find out whether the file leaves your machine",
        body: [
          "This is the single most useful fact about any tool that takes a file. Open the network tab in your browser's developer tools, drop the file in, and watch. If nothing large goes out, the processing is happening on your device and the file never travelled.",
          "A faster proxy: load the page, disconnect from the network, then try the tool. Anything that still works is doing the job locally. Tools built this way usually say so, because it is their main selling point — but the disconnect test is the version you do not have to take anyone's word for.",
        ],
      },
      {
        heading:
          "Read the sentence about deletion, not the one about encryption",
        body: [
          "Almost every upload-based tool advertises encryption in transit. That is table stakes and tells you nothing about what happens after the file arrives. The sentence worth finding is the one about retention: how long the file is kept, and whether deletion is automatic or something you have to request.",
          '"Files are deleted after one hour" is a real commitment. "We take your privacy seriously" is not a commitment at all.',
        ],
      },
      {
        heading: "Check where the wall is before you start, not after",
        body: [
          "The expensive version of a free tool is the one that lets you do forty minutes of work and then asks for a card to export. Before investing any effort, find the download or export step and confirm what it produces — a watermark, a resolution cap, and a format restriction are the three most common walls.",
          "A tool that shows its limits up front is usually more honest about everything else too.",
        ],
      },
      {
        heading:
          "Be suspicious of tools that want more permission than the job needs",
        body: [
          "A background remover does not need access to your contacts. A PDF merger does not need to connect to your cloud drive to merge two files you already have. Permission requests that exceed the task are the clearest signal that the product is collecting rather than serving.",
          "The same applies to sign-in walls: if a tool insists on an account before doing something that is technically possible without one, the account is the product.",
        ],
      },
      {
        heading: "Look at whether anyone is still maintaining it",
        body: [
          "A blog with a post from four years ago, a broken support link and a copyright date in the past are all cheap to check and reliably correlated. An unmaintained tool is not necessarily unsafe, but it will not be patched, and it is the category most likely to vanish or change hands quietly.",
          "Domain age cuts both ways: a very new domain offering a service that normally costs money deserves more scepticism than an old one.",
        ],
      },
      {
        heading: 'Never paste secrets into a tool to "test" it',
        body: [
          "The most common real-world leak from web tools is not a breach, it is someone pasting a live API key into a JSON formatter or a production database dump into an online SQL beautifier to see whether the tool works. Test with fake data that has the same shape.",
          "If a tool needs a credential to do its job at all, that is a decision to make deliberately, with a scoped key you can revoke — not something to discover halfway through.",
        ],
      },
    ],
    takeaways: [
      "Disconnect from the network and retry — anything that still works never uploaded your file.",
      "Retention policy beats encryption claims. Look for a stated deletion window.",
      "Find the export step before you start working, not after.",
      "Permissions beyond the task, and accounts required for tasks that do not need one, are both signals.",
      "Test with fake data shaped like the real thing.",
    ],
  },
  {
    slug: "why-useful-website-lists-go-dead",
    title: "Why half of every 'useful websites' list is already dead",
    description:
      "Link rot is not random. Certain categories of website die predictably, and knowing which ones tells you what to bookmark.",
    readMinutes: 7,
    updated: "2026-07-29",
    intro:
      "The viral useful-website lists of the late 2000s recommended a few hundred sites between them. Open one today and roughly half the links are dead domains, parked pages or redirects to something unrelated. The interesting part is that the deaths are not evenly distributed — some kinds of site are structurally fragile and others are structurally durable, and the difference is predictable enough to be worth knowing before you bookmark anything.",
    sections: [
      {
        heading: "What died: anything whose value was other people",
        body: [
          "Social bookmarking was the biggest single casualty. A dozen services competed to be the place where you saved and tagged links, and their entire value came from the number of other people using them. Below a critical mass they became useless, and once they became useless the decline was self-reinforcing. Almost none survive.",
          "The same logic took out the standalone video communities, the social music discovery services and the Q&A sites that were not the biggest Q&A site. In every case the product worked fine; it just could not survive being second.",
        ],
      },
      {
        heading: "What died: anything built on a platform that went away",
        body: [
          "A large group of the classic entries were Flash applications. When Flash was discontinued they stopped working overnight regardless of whether anyone was still maintaining them. Sites built on a single third-party API — a maps provider, a social network's feed, a music catalogue — went the same way whenever that provider changed terms.",
          "The lesson is not that platforms are bad. It is that a tool inherits the lifespan of the thing it depends on most.",
        ],
      },
      {
        heading: "What survived: single-purpose utilities",
        body: [
          "Tools that do one narrow thing, need no network effect and cost almost nothing to run have a remarkable survival rate. A converter, a colour picker, a timer, a regex tester — these have no reason to shut down, because there is nothing to sustain except a static page and a small amount of compute.",
          "The best of them have gotten more robust rather than less: many that used to upload a file now do the work in the browser, which makes them cheaper to run and better for the user at the same time.",
        ],
      },
      {
        heading: "What survived: archives and institutions",
        body: [
          "Public libraries, university course archives and the big preservation projects have outlasted nearly every commercial entry on the original lists. They are funded differently, they have a mandate rather than a market, and their content gets more valuable with age rather than less.",
          "If you want a bookmark that will still work in a decade, this is the category to pick from.",
        ],
      },
      {
        heading: "What this means for how you bookmark",
        body: [
          "Prefer tools with no network effect for anything you rely on. Prefer tools that work offline for anything you rely on urgently. Assume anything whose value is a community will either become the dominant one or disappear, with very little middle ground.",
          "And record what a bookmark was for, not just its URL. When it eventually dies, the note is what lets you find the replacement in thirty seconds instead of reconstructing the question from a dead domain name.",
        ],
      },
    ],
    takeaways: [
      "Network-effect products died; single-purpose utilities survived.",
      "A tool inherits the lifespan of its largest dependency.",
      "Archives and publicly funded institutions outlast almost everything commercial.",
      "Save what a bookmark was for, not just where it pointed.",
    ],
  },
  {
    slug: "tools-that-never-upload-your-file",
    title: "How browser tools work without ever uploading your file",
    description:
      "WebAssembly moved real image, video and PDF processing into the tab. Here is what that changes and how to verify it.",
    readMinutes: 6,
    updated: "2026-07-29",
    intro:
      "For most of the web's history, an online tool that processed a file worked the only way it could: you uploaded, a server did the work, you downloaded the result. That is no longer necessary for a large class of tasks, and the difference matters most for exactly the files you would least like to upload.",
    sections: [
      {
        heading: "What changed",
        body: [
          "WebAssembly lets browsers run compiled code at close to native speed. That made it practical to port the same libraries servers had been using — image codecs, PDF engines, video transcoders, even entire database engines — directly into a web page.",
          "Alongside it, the File System Access API and Canvas gave pages a way to read and write local files properly, and WebRTC gave two browsers a way to send data to each other without a server holding it in the middle. Together these cover most of what a file-processing tool needs.",
        ],
      },
      {
        heading: "What it changes for you",
        body: [
          "The obvious gain is privacy: a scanned passport, a bank statement, a medical report or an unreleased document processed on-device has not been transmitted anywhere, so there is no retention policy to read and no breach that can involve it.",
          "The less obvious gains are speed and size. There is no upload wait and no download wait, so a large file is often faster locally than remotely even on modest hardware. And because the operator is not paying for bandwidth or compute, on-device tools tend to have far more generous limits — frequently none at all.",
        ],
      },
      {
        heading: "Where it does not work",
        body: [
          "Anything that needs a large model, a licensed database or a lot of sustained compute still belongs on a server. High-quality machine translation, most video transcoding at scale, and anything that has to check your input against a dataset the tool cannot ship to you are all genuinely server-side problems.",
          "Battery and memory are real constraints too. A phone will run out of memory on a file a laptop handles comfortably, which is why some tools offer on-device processing on desktop and fall back to upload on mobile — worth knowing, because the privacy property silently changes with the device.",
        ],
      },
      {
        heading: "How to verify the claim",
        body: [
          "Load the page, turn off your network connection, then use the tool. If it completes, nothing was uploaded — there was nowhere for the file to go. This is the whole test, it takes ten seconds, and it cannot be faked.",
          "For a more precise view, open the network panel in developer tools before you drop the file in and watch the outbound request sizes. A tool doing the work locally sends nothing larger than a few kilobytes of telemetry.",
        ],
      },
    ],
    takeaways: [
      "WebAssembly moved image, PDF, video and database work into the browser tab.",
      "On-device tools usually have larger limits, because bandwidth and compute cost the operator nothing.",
      "Large models and licensed datasets are still genuinely server-side problems.",
      "Verify by disconnecting from the network and retrying — this test cannot be faked.",
    ],
  },
  {
    slug: "what-free-actually-means",
    title: "What 'free' actually means on a web tool's pricing page",
    description:
      "Five different business models all use the same word. Telling them apart before you start saves the wasted hour.",
    readMinutes: 5,
    updated: "2026-07-29",
    intro:
      '"Free" on a pricing page covers at least five arrangements that behave completely differently once you are forty minutes into a piece of work. The distinction the Atlas cares about is simple: what does this cost me before it does the job at all?',
    sections: [
      {
        heading: "Genuinely open",
        body: [
          "No account, no email, no limit worth mentioning. Almost always a single-purpose utility with low running costs, often funded by ads, a donation link or a larger product it advertises. This is the most durable arrangement on the web and the one worth building habits around.",
          "The catch, where there is one, is capability rather than cost: an open tool typically does one thing and has no way to save your work.",
        ],
      },
      {
        heading: "Free but you must register",
        body: [
          "The tool costs nothing but wants an identity first. Sometimes that is genuinely necessary — anything that saves state across sessions needs to know who you are. Often it is not, and the account exists to build a mailing list.",
          "The useful question is whether the account unlocks something you actually need. If the job is one-shot and the account only exists so you can be emailed later, that is a cost with no benefit attached.",
        ],
      },
      {
        heading: "Freemium with a usable free tier",
        body: [
          "There is a real free tier that does real work, and paid plans for volume, teams or advanced features. This is the healthiest paid model, and the one where you should look hardest at exactly where the wall sits — usually a monthly quota, a project count, or an export format.",
          "The trap is a free tier generous enough to build a habit on and narrow enough that the habit becomes a subscription. That is not dishonest, but it is worth noticing before you migrate anything important into it.",
        ],
      },
      {
        heading: "Free trial dressed as a free tier",
        body: [
          "Fourteen days of everything, then nothing. Perfectly legitimate, but it is not a free tool, and a directory that lists it as one is wasting your time. Check whether the free plan still exists after the trial ends — the pricing page usually has a column for it, or conspicuously does not.",
        ],
      },
      {
        heading: "Free to use, paid to leave",
        body: [
          "The tool is free, but getting your data out is not — export is a paid feature, or the export format is deliberately awkward. This is the version worth avoiding entirely for anything you will accumulate over time.",
          "Before putting a year of anything into a free tool, find the export button and press it once. If it produces a file you can open somewhere else, the tool is safe to commit to. If it does not, treat everything you put in as temporary.",
        ],
      },
    ],
    takeaways: [
      "Ask what it costs before it works, not what it costs at the top tier.",
      "An account that only exists to email you later is a cost with no benefit.",
      "Find where the wall sits before you build a habit on the free tier.",
      "Press the export button once before committing anything long-term.",
    ],
  },
  {
    slug: "how-altf-atlas-is-maintained",
    title: "How AltF Atlas is maintained",
    description:
      "What gets an entry in, what gets one removed, and why every entry carries a stated limitation.",
    readMinutes: 4,
    updated: "2026-07-29",
    intro:
      "A directory is only as useful as its editing rules, so these are ours in public. AltF Atlas is a curated list, not a crawl — every entry was opened and used, and every entry can be removed.",
    sections: [
      {
        heading: "What gets an entry in",
        body: [
          "An entry has to be the best answer, or a meaningfully different answer, to a question someone actually asks. Three near-identical PDF mergers is worse for a reader than one, so near-duplicates are cut rather than collected — the value of a curated list is what it leaves out.",
          "It also has to work in a browser tab with no installation and no server of your own. That is the boundary of the whole product; a desktop application, however good, belongs in the software directory instead.",
        ],
      },
      {
        heading: "Why every entry states a limitation",
        body: [
          "A directory where everything is described as excellent carries no information. The `Where it stops` sentence on every entry is the reason to believe the rest of it: a size cap, a watermark, a missing export format, an account requirement.",
          'Where a tool genuinely has no meaningful limit, the field says what it does not do instead. It is never left empty, and it is never filled with "no limits".',
        ],
      },
      {
        heading: "How access and privacy are recorded",
        body: [
          "Access is recorded as what the site costs you before it does its main job — open, free account, or freemium — rather than what the top tier costs. That is the fact that determines whether a tool is useful to you in the next five minutes.",
          "Processing is recorded as on-device only when the work genuinely happens in the browser and the file is not uploaded. This is a privacy claim, so where there is any doubt the entry says hosted. A wrong on-device claim is worse than a missing one.",
        ],
      },
      {
        heading: "What gets an entry removed",
        body: [
          'Shutting down does not remove an entry — it moves it to the archive with a named successor, because "what replaced this?" is a question that outlives the site. Entries are removed outright only when they become actively harmful: aggressive dark patterns, a paywall in front of what was the free feature, or a change of ownership that turns a tool into an ad vector.',
          "Nothing in the Atlas is a paid placement, and no entry can be bought. Where AltFTool has its own tool for the same job, the entry links to it alongside the external site rather than in place of it.",
        ],
      },
    ],
    takeaways: [
      "Curated, not crawled — every entry was opened and used.",
      "Near-duplicates are cut. What a list leaves out is what makes it worth reading.",
      "Access records what a site costs before it works, not what the top tier costs.",
      "Shutting down moves an entry to the archive; only becoming harmful removes it.",
    ],
  },
  {
    slug: "building-a-no-install-toolkit",
    title: "Building a toolkit you can carry to any computer",
    description:
      "How to assemble a working setup that lives entirely in a browser — and what genuinely still needs installing.",
    readMinutes: 6,
    updated: "2026-07-29",
    intro:
      "A borrowed laptop, a locked-down work machine, a library computer, a tablet. The case for a browser-only toolkit is that it survives all of them. Assembling one well is mostly a matter of choosing along two axes — does it need an account, and does it need the network — and knowing which trade you are making.",
    sections: [
      {
        heading: "Start with the things you would notice losing",
        body: [
          "Do not begin by collecting tools. Begin by listing the five things you did on a computer last week that you would be stuck without: writing something, editing an image, opening a PDF, moving a file to someone, looking something up. Fill those five, then stop.",
          "A toolkit of five things you use is worth more than forty bookmarks you have to search through, and search-through-your-own-bookmarks is the failure mode every large collection eventually reaches.",
        ],
      },
      {
        heading: "Split it into the account layer and the open layer",
        body: [
          "The account layer is where your state lives — notes, documents, files, tasks. Pick as few of these as you can, because each one is a login to remember on a machine that will not have your password manager.",
          "The open layer is everything else: converters, editors, calculators, checkers. These should need no account at all, so they work identically on any machine, including one you have thirty seconds on.",
        ],
      },
      {
        heading: "Prefer tools that work offline where you can",
        body: [
          "Anything doing its processing on-device usually keeps working when the connection does not. On patchy hotel wi-fi or a train, that is the difference between finishing something and not. It is also the strongest privacy property available in a browser, so you are picking up two benefits from one choice.",
          "Several such tools are installable as progressive web apps, which gives you an icon and an offline cache without an actual installation — the closest thing to having your software with you.",
        ],
      },
      {
        heading: "Solve the transfer problem once",
        body: [
          "The recurring friction in a browser-only setup is moving a file between the machine you are on and the one you own. Pick one method and learn it properly: a browser-to-browser transfer for large files, an expiring link for anything you need to hand to someone else, and a self-destructing note for a credential you have to move.",
          "Email attachment limits are what most people fall back on and are the worst option available on every axis.",
        ],
      },
      {
        heading: "What still genuinely needs installing",
        body: [
          "Sustained heavy video work, large-scale local development, anything needing deep operating-system access, and any professional workflow with a colour-managed or hardware-accelerated pipeline. Browser tools have closed a remarkable amount of this gap, but they have not closed all of it, and pretending otherwise wastes an afternoon.",
          "The honest framing: a browser toolkit covers everything up to the point where the work becomes your full-time job. Past that, install something.",
        ],
      },
    ],
    takeaways: [
      "Fill the five things you would be stuck without, then stop.",
      "Keep the account layer as small as possible; make the rest need no login.",
      "On-device tools give you offline capability and privacy from the same choice.",
      "Pick one file-transfer method and learn it properly.",
      "Heavy video, real development and colour-managed work still need an installation.",
    ],
  },
];

export const GUIDE_BY_SLUG = Object.fromEntries(
  GUIDES.map((guide) => [guide.slug, guide]),
);

export const GUIDE_SLUGS = GUIDES.map((guide) => guide.slug);
