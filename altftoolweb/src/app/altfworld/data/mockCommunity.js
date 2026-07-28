const accents = ["coral", "violet", "amber", "blue", "mint", "rose"];
const icons = ["↗", "✦", "◒", "◇", "⌁", "◌", "◐", "⌘", "⊹", "◈"];
const categorySeed = [
  ["Growth Lab", "Experiments, audience growth, and sustainable digital momentum."],
  ["Creator Studio", "Turn ideas into content, products, and a lasting creative practice."],
  ["Indie Business", "Small teams, smart systems, and businesses built with intention."],
  ["Product Workshop", "Research, design, launch, and improve useful digital products."],
  ["Freelance Craft", "A generous corner for independent work and client partnerships."],
  ["Community Room", "Introductions, wins, recommendations, and conversations beyond work."],
  ["Writing Desk", "Writing practices, editorial choices, and ideas worth returning to."],
  ["Audience Garden", "Build trust, attention, and a meaningful relationship with readers."],
  ["Launch Pad", "Plan quieter launches, gather feedback, and learn from every release."],
  ["Research Club", "Customer interviews, useful patterns, and evidence before opinions."],
  ["Systems Shelf", "Tools, workflows, and habits that make focused work more possible."],
  ["Visual Field", "Thoughtful design, brand expression, and visual problem solving."],
  ["Newsletter Table", "Email notes, reader rituals, and small publishing experiments."],
  ["Podcast Corner", "Audio stories, interview craft, and building a listening practice."],
  ["Video Bench", "Video strategy, production systems, and creative confidence."],
  ["SEO Observatory", "Search behavior, discoverability, and evergreen information design."],
  ["Social Signals", "Community-first social media ideas and platform experiments."],
  ["No-Code Nook", "Useful automations and accessible ways to make digital tools."],
  ["Developer Den", "Build logs, technical choices, and open questions for makers."],
  ["Data Diaries", "Friendly analytics, meaningful measurement, and curious analysis."],
  ["Ecommerce Atelier", "Shop stories, product pages, and the people behind purchases."],
  ["Client Commons", "Proposal notes, expectations, and relationships that last."],
  ["Career Compass", "Independent careers, role changes, and learning in the open."],
  ["Money Garden", "Sustainable pricing, financial clarity, and calmer business models."],
  ["Operations Studio", "Behind-the-scenes systems for teams that want room to breathe."],
  ["Leadership Lounge", "Thoughtful management, trust, and healthy team conversations."],
  ["Remote Rituals", "Distributed teamwork, home offices, and staying connected."],
  ["Accessibility Lab", "More inclusive products, content, and community practices."],
  ["Ethics Circle", "Responsible growth, useful boundaries, and principled decisions."],
  ["Learning Loop", "Courses, books, habits, and ways to keep getting better."],
  ["Wellbeing Window", "Rest, energy, and creating without losing yourself in the work."],
  ["Focus Field", "Attention, deep work, and designing a day you can actually live."],
  ["Toolshed", "Reviews, set-ups, and carefully chosen software recommendations."],
  ["AI Studio", "Human-centered experiments with emerging creative technology."],
  ["Brand Hearth", "Positioning, voice, and brands that feel like real people."],
  ["Sales Salon", "Conversations, offers, and respectful ways to invite a yes."],
  ["Partnership Place", "Collaborations, referrals, and finding good people to build with."],
  ["Event Hall", "Workshops, gatherings, and making online moments feel warm."],
  ["Local Loop", "Independent work through a local lens, wherever you are."],
  ["Story Circle", "Personal stories, business narratives, and lessons from the middle."],
  ["Feedback Room", "Kind critiques, product testing, and a clearer outside perspective."],
  ["Idea Greenhouse", "Early sketches, unfinished thoughts, and possibilities to explore."],
  ["Resource Exchange", "Templates, checklists, and practical things made to be shared."],
  ["Book Club", "What the community is reading, highlighting, and putting into practice."],
  ["Studio Visits", "Behind the scenes with people whose work is worth learning from."],
  ["Global Table", "Working across cultures, time zones, and different lived experiences."],
  ["Sustainability Space", "Long-term thinking for digital work, business, and communities."],
  ["Open Source Corner", "Sharing knowledge, collaborative projects, and public-good tools."],
  ["Future Notes", "Signals, questions, and small bets on where independent work is going."],
  ["Off Topic", "The wonderfully unrelated things that still bring people together."]
];

const firstNames = ["Mira", "Jon", "Tara", "Nora", "Elena", "Leo", "Ari", "Sana", "Theo", "Ivy", "Ravi", "Mina", "Cal", "June", "Omar", "Wren", "Bea", "Finn", "Nia", "Ezra", "Lina", "Kai", "Ava", "Noah", "Zoe", "Milo", "Ada", "Sam", "Cleo", "Remy", "Jules", "Anya", "Sol", "Mae", "Drew", "Nico", "Rhea", "Pia", "Eli", "Uma"];
const lastNames = ["Chen", "Bell", "Singh", "Fields", "Ray", "Harper", "Woods", "Miller", "Jordan", "Vale", "Park", "Carter", "Quinn", "Bennett", "Stone", "Rowan", "Shaw", "Brooks", "Lane", "Morgan", "Cole", "Reed", "Sloan", "Khan", "Yates", "Rivera", "Ellis", "Dawson", "Hart", "Moss"];
const countries = ["Canada", "United Kingdom", "India", "United States", "Spain", "Australia", "Germany", "Brazil", "Japan", "Kenya", "Netherlands", "Mexico", "Singapore", "Sweden", "New Zealand", "Philippines"];
const roles = ["Community Builder", "Product Generalist", "Independent Designer", "Tiny Company Founder", "Growth Researcher", "Community Host", "Writer & Strategist", "Creative Technologist", "Research Partner", "Service Designer", "Systems Coach", "Digital Maker"];
const bios = [
  "Making small, useful things and leaving honest notes about the process.",
  "Here for thoughtful conversations about work that feels more human.",
  "Independent by choice, curious by default, and usually making a helpful list.",
  "Building a gentler work practice one useful experiment at a time.",
  "Designer, researcher, and enthusiastic collector of better questions.",
  "Sharing the pieces of the process that are easy to overlook but matter most."
];
const threadOpeners = ["A small experiment with", "What I learned from", "A calmer approach to", "Notes from my first month of", "The practical case for", "How I am rethinking", "A field guide to", "Questions about", "The habit that changed", "An honest update on"];
const threadSubjects = ["a weekly publishing rhythm", "working with fewer tools", "a customer research ritual", "pricing a thoughtful service", "launching without urgency", "building a useful resource", "finding the right project scope", "making time for deep work", "a reader-first newsletter", "better feedback conversations", "a smaller product roadmap", "working in public with care", "turning notes into something useful", "a more sustainable client pipeline", "the first version of a good idea"];
const threadTags = ["Playbook", "Discussion", "Case study", "Field notes", "Guide", "Experiment", "Question", "Community"];
const listingTypes = ["Templates", "Services", "Strategy", "Research", "Tools"];
const resourceTypes = ["Guide", "Template", "Essay", "Checklist", "Workshop"];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const featuredUsers = [
  { username: "mirachen", name: "Mira Chen", initials: "MC", tone: "coral", role: "Community Builder", level: "Orbit 8", posts: 1248, reputation: 918, country: "Canada", joined: "May 2020", bio: "Writer, strategist, and chronic list-maker. Here for sustainable ways to make thoughtful work visible.", badges: ["Thoughtful", "Guide", "Early member"] },
  { username: "jonbell", name: "Jon Bell", initials: "JB", tone: "blue", role: "Product Generalist", level: "Orbit 6", posts: 842, reputation: 641, country: "United Kingdom", joined: "August 2021", bio: "I help small teams make clearer product decisions. Usually sketching workflows or making coffee.", badges: ["Maker", "Helpful"] },
  { username: "tarasingh", name: "Tara Singh", initials: "TS", tone: "mint", role: "Independent Designer", level: "Orbit 7", posts: 981, reputation: 762, country: "India", joined: "January 2021", bio: "Designer and independent consultant sharing the useful bits from a decade of client work.", badges: ["Mentor", "Kindred"] },
  { username: "norafields", name: "Nora Fields", initials: "NF", tone: "amber", role: "Tiny Company Founder", level: "Orbit 5", posts: 657, reputation: 492, country: "United States", joined: "March 2022", bio: "Building small, useful things for curious people. Working in public, imperfectly.", badges: ["Founder", "Optimist"] },
  { username: "elenaray", name: "Elena Ray", initials: "ER", tone: "violet", role: "Growth Researcher", level: "Orbit 5", posts: 530, reputation: 468, country: "Spain", joined: "November 2022", bio: "Researcher with a soft spot for meaningful metrics and honest experiments.", badges: ["Researcher", "Contributor"] },
  { username: "leoharper", name: "Leo Harper", initials: "LH", tone: "rose", role: "Community Host", level: "Orbit 4", posts: 405, reputation: 391, country: "Australia", joined: "June 2023", bio: "A friendly internet neighbor. I host conversations for people making their own way.", badges: ["Host", "Cheerleader"] }
];

const users = Array.from({ length: 5000 }, (_, index) => {
  if (index < featuredUsers.length) return featuredUsers[index];
  const first = firstNames[index % firstNames.length];
  const last = lastNames[(index * 7) % lastNames.length];
  const serial = String(index + 1).padStart(4, "0");
  return {
    username: `${slugify(first)}-${slugify(last)}-${serial}`,
    name: `${first} ${last}`,
    initials: `${first[0]}${last[0]}`,
    tone: accents[index % accents.length],
    role: roles[index % roles.length],
    level: `Orbit ${1 + (index % 9)}`,
    posts: 14 + ((index * 37) % 2900),
    reputation: 8 + ((index * 53) % 2400),
    country: countries[index % countries.length],
    joined: `${["January", "March", "May", "July", "September", "November"][index % 6]} ${2019 + (index % 7)}`,
    bio: bios[index % bios.length],
    badges: [["Contributor", "Helpful"], ["Maker", "Curious"], ["Thoughtful", "Early member"], ["Guide", "Kindred"]][index % 4]
  };
});

const categories = categorySeed.map(([name, description], index) => {
  const slug = slugify(name);
  const leadingUser = users[index % users.length];
  const accent = accents[index % accents.length];
  const baseThreads = 470 + ((index * 71) % 290);
  return {
    slug,
    name,
    icon: icons[index % icons.length],
    description,
    threads: baseThreads,
    posts: baseThreads * (7 + (index % 6)),
    accent,
    latest: `${threadOpeners[index % threadOpeners.length]} ${threadSubjects[index % threadSubjects.length]}`,
    latestUser: leadingUser.name,
    subcategories: ["General conversation", "Playbooks & field notes", "Questions & feedback"].map((label, subIndex) => ({
      slug: `${slug}-${["general", "playbooks", "questions"][subIndex]}`,
      name: `${name} · ${label}`,
      description: `${label} from the ${name} community.`,
      threads: 120 + ((index * 31 + subIndex * 57) % 320)
    }))
  };
});

const featuredThreads = [
  { slug: "designing-a-content-system-that-leaves-room-for-life", title: "Designing a content system that leaves room for life", category: "Creator Studio", categorySlug: "creator-studio", author: "Mira Chen", handle: "mirachen", initials: "MC", tone: "coral", date: "Today, 10:24 AM", lastReply: "12 min ago", replies: 42, views: 1840, tag: "Playbook", excerpt: "The weekly rhythm I use to keep publishing without turning every evening into a production sprint.", pinned: true },
  { slug: "the-quiet-launch-checklist", title: "The quiet launch checklist: 14 things to do before you share", category: "Product Workshop", categorySlug: "product-workshop", author: "Jon Bell", handle: "jonbell", initials: "JB", tone: "blue", date: "Today, 9:10 AM", lastReply: "28 min ago", replies: 31, views: 1294, tag: "Guide", excerpt: "A lightweight checklist for making first impressions feel considered rather than rushed." },
  { slug: "how-i-found-three-great-clients-without-daily-posting", title: "How I found three great clients without daily posting", category: "Freelance Craft", categorySlug: "freelance-craft", author: "Tara Singh", handle: "tarasingh", initials: "TS", tone: "mint", date: "Yesterday", lastReply: "43 min ago", replies: 18, views: 956, tag: "Case study", excerpt: "A referral-first approach that replaced my exhausting social media routine." },
  { slug: "what-made-your-first-digital-product-click", title: "What made your first digital product click with people?", category: "Indie Business", categorySlug: "indie-business", author: "Nora Fields", handle: "norafields", initials: "NF", tone: "amber", date: "Yesterday", lastReply: "1 hr ago", replies: 67, views: 2330, tag: "Discussion", excerpt: "A place to unpack the small decisions that created real momentum." },
  { slug: "my-three-part-newsletter-experiment", title: "My three-part newsletter experiment (and the numbers behind it)", category: "Growth Lab", categorySlug: "growth-lab", author: "Elena Ray", handle: "elenaray", initials: "ER", tone: "violet", date: "Monday", lastReply: "2 hrs ago", replies: 24, views: 1739, tag: "Experiment", excerpt: "A transparent look at subject lines, reader response, and the follow-up that mattered most." },
  { slug: "weekend-wins-small-steps-count", title: "Weekend wins — small steps count", category: "Community Room", categorySlug: "community-room", author: "Leo Harper", handle: "leoharper", initials: "LH", tone: "rose", date: "Saturday", lastReply: "3 hrs ago", replies: 92, views: 3015, tag: "Community", excerpt: "Share a small win from your week and help someone else keep going." }
];

const threads = Array.from({ length: 30000 }, (_, index) => {
  if (index < featuredThreads.length) return featuredThreads[index];
  const category = categories[index % categories.length];
  const author = users[(index * 13) % users.length];
  const opener = threadOpeners[index % threadOpeners.length];
  const subject = threadSubjects[(index * 3) % threadSubjects.length];
  const title = `${opener} ${subject}`;
  return {
    slug: `thread-${String(index + 1).padStart(5, "0")}-${slugify(title)}`,
    title,
    category: category.name,
    categorySlug: category.slug,
    author: author.name,
    handle: author.username,
    initials: author.initials,
    tone: author.tone,
    date: index % 5 === 0 ? "Today" : `${1 + (index % 28)} days ago`,
    lastReply: index % 4 === 0 ? `${5 + (index % 52)} min ago` : `${1 + (index % 23)} hrs ago`,
    replies: 1 + ((index * 17) % 340),
    views: 40 + ((index * 149) % 18400),
    tag: threadTags[index % threadTags.length],
    excerpt: `A mock conversation about ${subject}, shared in ${category.name} with practical context and room for generous feedback.`,
    pinned: index % 997 === 0
  };
});

const featuredListings = [
  { slug: "brand-voice-workshop", title: "Brand Voice Workshop", seller: "Mira Chen", price: "$149", rating: 4.9, sales: 124, category: "Strategy", tag: "Verified", accent: "coral", description: "A clear, collaborative session to uncover language your customers recognize." },
  { slug: "launch-page-notion-kit", title: "Launch Page Notion Kit", seller: "Jon Bell", price: "$34", rating: 4.8, sales: 389, category: "Templates", tag: "Popular", accent: "blue", description: "Plan a calmer launch with practical checklists, timelines, and reusable copy prompts." },
  { slug: "client-discovery-sprint", title: "Client Discovery Sprint", seller: "Tara Singh", price: "$220", rating: 5, sales: 76, category: "Services", tag: "Verified", accent: "mint", description: "A focused one-week sprint for getting to the real problem before design begins." },
  { slug: "newsletter-metrics-dashboard", title: "Newsletter Metrics Dashboard", seller: "Elena Ray", price: "$28", rating: 4.9, sales: 518, category: "Templates", tag: "New", accent: "violet", description: "A clear, beautiful home for the metrics that make your next email better." }
];
const listingSubjects = ["Client Kickoff Kit", "Editorial Calendar", "Research Interview Pack", "Offer Clarity Session", "Brand Story Workbook", "Feedback Dashboard", "Community Welcome Kit", "Focus Sprint", "Launch Signal Board", "Service Menu Builder"];
const listings = Array.from({ length: 2000 }, (_, index) => {
  if (index < featuredListings.length) return featuredListings[index];
  const seller = users[(index * 11) % users.length];
  const category = listingTypes[index % listingTypes.length];
  return {
    slug: `listing-${String(index + 1).padStart(4, "0")}-${slugify(listingSubjects[index % listingSubjects.length])}`,
    title: `${listingSubjects[index % listingSubjects.length]} ${index > 10 ? `No. ${index + 1}` : ""}`.trim(),
    seller: seller.name,
    price: `$${18 + ((index * 13) % 480)}`,
    rating: Number((4.3 + ((index % 8) * 0.1)).toFixed(1)),
    sales: 8 + ((index * 19) % 1200),
    category,
    tag: index % 6 === 0 ? "New" : index % 3 === 0 ? "Popular" : "Verified",
    accent: accents[index % accents.length],
    description: `A mock ${category.toLowerCase()} offering for independent people who want a more useful way to approach their next project.`
  };
});

const resourceSubjects = ["Thoughtful launch field guide", "Client kickoff questions", "Measuring community health", "A weekly planning ritual", "The smallest useful roadmap", "Finding a clear project brief", "A library of helpful prompts", "Working with reader feedback", "A calmer research framework", "Your independent work toolkit"];
const resources = Array.from({ length: 1000 }, (_, index) => ({
  title: index === 0 ? "The thoughtful launch field guide" : index === 1 ? "A library of client kickoff questions" : index === 2 ? "Measuring community health without losing the human part" : `${resourceSubjects[index % resourceSubjects.length]} · Edition ${Math.ceil((index + 1) / resourceSubjects.length)}`,
  type: resourceTypes[index % resourceTypes.length],
  minutes: `${6 + ((index * 7) % 28)} min read`,
  category: categories[(index * 3) % categories.length].name,
  description: `A practical mock resource with grounded ideas, prompts, and examples for people learning through their own work.`
}));

export function getRepliesForThread(threadSlug, count = 12) {
  return Array.from({ length: Math.min(count, 250000) }, (_, index) => {
    const author = users[(index * 17 + threadSlug.length) % users.length];
    return {
      id: `${threadSlug}-reply-${index + 1}`,
      author,
      body: `Mock reply ${index + 1}: a useful perspective shared with care, context, and an invitation to keep exploring the idea.`,
      createdAt: `${index + 1} hours ago`,
      reactions: (index * 7) % 36
    };
  });
}

const community = {
  stats: { members: "5,000", threads: "30,000", posts: "250,000", online: "1,284", categories: 50, subcategories: 150, listings: "2,000", resources: "1,000" },
  categories,
  users,
  threads,
  listings,
  resources,
  getRepliesForThread
};

export default community;
