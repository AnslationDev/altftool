import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  setDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";

const PROJECT_ID = "alphobia";

// Firestore Helper Reference builders
const col = (...segments) => collection(db, "projects", PROJECT_ID, ...segments);
const docRef = (...segments) => doc(db, "projects", PROJECT_ID, ...segments);

// ----------------------------------------------------
// DEFAULT DUMMY DATA FOR INITIALIZATION
// ----------------------------------------------------

const DEFAULT_HOME = {
  hero: {
    tag: "Global Expansion Leaders",
    title: "Empowering Global Growth Through Data.",
    subtitle: "We fuse high-stakes consultancy intelligence with digital agency agility to scale enterprise performance across four continents.",
    heroImage: "/HeroImg.jpeg",
    button1Text: "Book a Strategy Call",
    button1Link: "contact",
    button2Text: "Our Approach",
    button2Link: "about",
    verifiedBy: ["Google Premier", "HubSpot Elite", "Meta Business"]
  },
  trustedBy: {
    title: "Pioneering the future with global industry leaders",
    companies: [
      { id: "amazon", name: "Amazon", domain: "amazon.com" },
      { id: "shopify", name: "Shopify", domain: "shopify.com" },
      { id: "adobe", name: "Adobe", domain: "adobe.com" },
      { id: "canva", name: "Canva", domain: "canva.com" },
      { id: "hostinger", name: "Hostinger", domain: "hostinger.com" },
      { id: "google", name: "Google", domain: "google.com" },
      { id: "microsoft", name: "Microsoft", domain: "microsoft.com" },
      { id: "hubspot", name: "HubSpot", domain: "hubspot.com" },
      { id: "meta", name: "Meta", domain: "meta.com" },
      { id: "semrush", name: "Semrush", domain: "semrush.com" },
    ]
  },
  capabilitiesHeader: {
    title: "Core Capabilities",
    subtitle: "From foundational SEO to high-frequency programmatic advertising, we provide the full spectrum of digital velocity."
  },
  executionProtocol: {
    title: "Our Execution Protocol",
    subtitle: "A five-stage lifecycle designed for aggressive market capture and sustained ROI.",
    steps: [
      { num: "01", name: "Discovery", desc: "Deep-dive audit into current ecosystems and competitor vulnerabilities." },
      { num: "02", name: "Strategy", desc: "Tailored growth roadmap with defined KPIs and channel mix priorities." },
      { num: "03", name: "Execution", desc: "Rapid deployment of high-performance campaign creative assets." },
      { num: "04", name: "Optimization", desc: "Real-time multivariate testing and algorithmic budget reallocation." },
      { num: "05", name: "Growth", desc: "Scaling successful protocols across global consumer territories." }
    ]
  },
  whyChooseUs: {
    row1: {
      title: "Data-Driven DNA",
      desc: "We don't guess. We model. Our proprietary Kinetic Engine analyzes billions of data points to predict market shifts before they happen, allowing your brand to move faster than the competition.",
      img: "https://images.pexels.com/photos/7621381/pexels-photo-7621381.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
      bullets: ["Proprietary AI predictive modeling", "Real-time performance transparency"]
    },
    row2: {
      title: "Certified Global Experts",
      desc: "Our team consists of senior-level consultants and tactical specialists located in primary financial hubs. We speak the language of global enterprise and understand regional market nuances.",
      img: "https://images.pexels.com/photos/34804001/pexels-photo-34804001.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
      bullets: ["15+ years average industry experience", "Multilingual campaign management"]
    }
  }
};

const DEFAULT_ABOUT = {
  header: {
    badge: "Who We Are",
    title: "We're the Trust Layer for Smarter B2B Growth",
    subtitle: "Combining analytical precision with digital agility to deploy high-performance marketing ecosystems that compound value month over month."
  },
  values: [
    { title: "Our Mission", text: "Empower global enterprise brands to capture the future of their markets through precision B2B performance marketing and unified data attribution." },
    { title: "Our Vision", text: "To define the definitive standard in global B2B digital transformation, providing complete metrics transparency and high-stakes growth engineering." },
    { title: "Our Promise", text: "We never guess, we model. We distribute resources based on proven metrics and absolute client transparency, aligning incentives for win-win results." }
  ],
  timelineHeader: {
    title: "From Consultancy to Global Powerhouse",
    subtitle: "Our milestone journey engineering digital velocity."
  },
  timeline: [
    { year: "2019", title: "Founding in London", text: "Alphobia begins as a small boutique consultancy of three growth engineers specializing in programmatic marketing." },
    { year: "2021", title: "Attribution Dashboard Launch", text: "We release our custom performance attribution framework, aggregating multi-channel insights for client-side scaling." },
    { year: "2024", title: "Global Expansion", text: "Opening tactical offices in New York and Singapore to support B2B clients across four continents, surpassing $50M managed ad spend." },
    { year: "2026", title: "Kinetic Network Integration", text: "Expanding publisher networks to 12.4k+ verified partners and setting industry-leading benchmarks for B2B ROAS." }
  ],
  teamHeader: {
    title: "Our Leadership Team",
    subtitle: "Growth consultants and technical engineers aligning values with campaign performance."
  }
};

const DEFAULT_SERVICES = [
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    route: "digital-marketing",
    icon: "insights",
    tagline: "Omnichannel strategies aligning brand identity with aggressive performance metrics.",
    description: "We don't just drive traffic; we engineer growth. Our data-centric approach leverages advanced analytics and creative precision to scale your global digital presence.",
    results: "+312% avg. organic traffic in 9 months",
    heroImage: "/digital-marketing-hero.png",
    metrics: [
      { label: "ROAS", value: "4.2x", detail: "Campaign Blended" },
      { label: "CTR", value: "3.8%", detail: "Average Click Rate" },
      { label: "CPA", value: "-$12", detail: "Target Reduction" }
    ],
    capabilities: [
      { name: "SEO Architecture", desc: "Technical optimization and authoritative content structures designed for search dominance.", bullets: ["Core Web Vitals Optimization", "Semantic Content Strategy"] },
      { name: "Social Precision", desc: "High-performance paid social campaigns and organic brand building that converts.", bullets: ["Audience Segmentation", "Viral Content Frameworks"] },
      { name: "Editorial Edge", desc: "Strategic storytelling that establishes industry authority and nurtures pipeline growth.", bullets: ["B2B Thought Leadership", "Video Sales Letters (VSL)"] },
      { name: "Email Lifecycle", desc: "Automated nurture sequences that maximize LTV and reduce customer acquisition costs.", bullets: ["Behavior-Triggered Flows", "AI-Personalized Messaging"] }
    ],
    framework: {
      title: "The Kinetic Growth Framework",
      steps: [
        { num: "01", name: "Audit & Infrastructure", desc: "We dismantle your current funnel to identify friction points and deploy advanced tracking pixels for data integrity." },
        { num: "02", name: "Omnichannel Testing", desc: "Rapid A/B testing across creative, messaging, and platforms to find the highest-ROI entry points." },
        { num: "03", name: "Aggressive Scaling", desc: "Capital deployment into winning variants, utilizing algorithm-friendly bidding strategies for global reach." }
      ],
      image: "https://images.pexels.com/photos/577210/pexels-photo-577210.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=500"
    },
    successMetrics: [
      { icon: "payments", tag: "+28% YoY", title: "Average CAC reduction", value: "$42.50", width: "66%" },
      { icon: "trending_up", tag: "Record High", title: "Customer LTV Growth", value: "320%", width: "75%" },
      { icon: "visibility", tag: "Viral Reach", title: "Brand Awareness Score", value: "9.2/10", width: "50%" }
    ],
    comparisonTable: [
      { capability: "SEO Optimization", standard: "Standard On-Page", kinetic: "Advanced Semantic Architecture" },
      { capability: "Ad Spend Management", standard: "Up to $50k/mo", kinetic: "Unlimited Scaling" },
      { capability: "Creative Development", standard: "Template-Based", kinetic: "Custom Motion & 3D Assets" },
      { capability: "Reporting Frequency", standard: "Monthly", kinetic: "Real-time Live Dashboard" },
      { capability: "Dedicated Growth Officer", standard: "—", kinetic: "Included (24/7 Access)" }
    ],
    faqs: [
      { q: "How quickly can we expect to see ROI?", a: "While SEO efforts take 3-6 months for full maturation, our paid media strategies typically yield measurable attribution and ROI within the first 30 days of campaign launch." },
      { q: "Do you handle international marketing?", a: "Yes, Alphobia operates globally. We have specialized localization teams that manage multi-currency and multi-language campaigns across 12+ primary markets." },
      { q: "What platforms do you specialize in?", a: "Our core focus is on high-intent platforms: Google Search, LinkedIn Ads for B2B, Meta for high-scale B2C, and TikTok for Gen-Z reach, backed by Klaviyo for email automation." }
    ]
  },
  {
    id: "affiliate-marketing",
    name: "Affiliate Marketing",
    route: "affiliate-marketing",
    icon: "account_tree",
    tagline: "Global partnership networks built for sustainable, performance-based conversion growth.",
    description: "Execute high-performance partner ecosystems with precision. Our corporate-grade affiliate management platform turns influence into measurable ROI through automated compliance and intelligent attribution.",
    results: "400% Lead Volume Increase",
    heroImage: "/affiliated-marketing-hero.png",
    metrics: [
      { label: "ROAS", value: "3.5x", detail: "Partner Blended" },
      { label: "Publishers", value: "12k+", detail: "Active Partners" },
      { label: "CPA", value: "-18%", detail: "Avg Acquisition Cost" }
    ],
    capabilities: [
      { name: "Strategic Mapping", desc: "Alignment of your product categories with high-authority vertical leaders and niche experts.", bullets: ["Niche Vetting", "Tiered Commissions"] },
      { name: "Quality Vetting", desc: "Multi-layered compliance checks to ensure traffic quality, brand safety, and ethical standard adherence.", bullets: ["Fraud Detection", "Compliance Monitoring"] },
      { name: "Lifecycle Management", desc: "Ongoing optimization, incentive scaling, and dedicated account support for top-tier performers.", bullets: ["Active Optimization", "Partner Support"] },
      { name: "Attribution Modeling", desc: "Transparent tracking that allocates value to the right touchpoints dynamically.", bullets: ["Multi-Touch Modeling", "Transparency Engines"] }
    ],
    framework: {
      title: "Partner Setup Protocol",
      steps: [
        { num: "01", name: "Recruitment", desc: "Enrolling niche-specific authorities, content creators, and comparison portals." },
        { num: "02", name: "Activation", desc: "Providing co-branded creatives, discount codes, and deep-linking tools." },
        { num: "03", name: "Attribution", desc: "Monitoring and optimizing payouts using multi-touch transaction routing." }
      ],
      image: "https://images.pexels.com/photos/3182765/pexels-photo-3182765.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=500"
    },
    successMetrics: [
      { icon: "handshake", tag: "Global Growth", title: "Active Partners Vetted", value: "12,400+", width: "90%" },
      { icon: "trending_up", tag: "CPA Reduction", title: "Blended Acquisition Saving", value: "28%", width: "70%" },
      { icon: "insights", tag: "Conversion Scale", title: "Lead Volume Expansion", value: "4.0x", width: "85%" }
    ],
    comparisonTable: [
      { capability: "Partner Screening", standard: "Manual Review", kinetic: "AI Compliance Filtering" },
      { capability: "Commission Tiers", standard: "Flat Rates", kinetic: "Dynamic Performance-Based" },
      { capability: "Fraud Protection", standard: "Post-Audit", kinetic: "Real-time Action Blocking" },
      { capability: "Attribution Setup", standard: "Last Click", kinetic: "Fractional Multi-Touch" }
    ],
    faqs: [
      { q: "What is your vetting process?", a: "We run a strict verification protocol scanning traffic quality, historical compliance, and brand alignment before approving any publisher." },
      { q: "How are payouts calculated?", a: "Payouts can be structured dynamically based on fractional contribution, lead quality grades, or flat CPA models." }
    ]
  },
  {
    id: "advertising-programs",
    name: "Advertising Programs",
    route: "advertising-programs",
    icon: "campaign",
    tagline: "Precision-targeted campaigns across programmatic, social, and search ecosystems.",
    description: "Leverage the power of algorithmic bidding and behavioral intelligence. We don't just buy ads; we engineer high-performance ecosystems that scale with your ambitions.",
    results: "5.8x average blended ROAS",
    heroImage: "/advertisment-marketing-hero.png",
    metrics: [
      { label: "Blended ROAS", value: "5.8x", detail: "Campaign Blended" },
      { label: "Managed Spend", value: "$50M+", detail: "Optimized Ad Spend" },
      { label: "Reach", value: "500M+", detail: "Annual Impressions" }
    ],
    capabilities: [
      { name: "Google Search & Display", desc: "Granular keyword segmentation and automated bidding scripts that maximize search intent.", bullets: ["Keywords Harvesting", "Automated Scripts"] },
      { name: "LinkedIn B2B Ads", desc: "Account-Based Marketing (ABM) precision targeting for C-suite decision makers.", bullets: ["ABM Integration", "Decision Maker Lists"] },
      { name: "Meta Ecosystem", desc: "Full-funnel social commerce leveraging Instagram and Facebook interest graphs.", bullets: ["Interest Lookalikes", "Full-Funnel Socials"] },
      { name: "Programmatic RTB", desc: "Real-time bidding across premium publishers, Connected TV (CTV), and DOOH.", bullets: ["Real-time Bidding", "CTV Integrations"] }
    ],
    framework: {
      title: "Algorithmic Placement Strategy",
      steps: [
        { num: "01", name: "Audience Profiling", desc: "Defining ABM accounts, job title criteria, and lookalike segments." },
        { num: "02", name: "Creative Suite", desc: "Creating high-CTR videos, interactive carousels, and value-based lead magnets." },
        { num: "03", name: "Bidding Optimization", desc: "Applying predictive bid adjustment scripts to capture low-competition inventory." }
      ],
      image: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=500"
    },
    successMetrics: [
      { icon: "pie_chart", tag: "Target Precision", title: "Target ABM Matches", value: "94%", width: "94%" },
      { icon: "speed", tag: "Optimized Bid", title: "Average CPC Discount", value: "-34%", width: "80%" },
      { icon: "show_chart", tag: "Yield Metric", title: "Blended ROAS Blended", value: "5.8x", width: "90%" }
    ],
    comparisonTable: [
      { capability: "Targeting Resolution", standard: "Broad Interests", kinetic: "Granular IP + ABM Lists" },
      { capability: "Creative Variants", standard: "2-3 Static Ads", kinetic: "25+ Dynamic Multivariates" },
      { capability: "Bid Adjustments", standard: "Daily Checks", kinetic: "Real-time Algorithmic Scripts" },
      { capability: "Publisher Inventory", standard: "Open Exchanges", kinetic: "Direct PMP + Premium Networks" }
    ],
    faqs: [
      { q: "What is your target size?", a: "We manage campaigns ranging from $10k/month test budgets up to multi-million dollar global enterprise runs." },
      { q: "Do you provide custom design assets?", a: "Yes, our creative lab builds interactive banner sets, video clips, and landing copy tailored to conversions." }
    ]
  }
];

const DEFAULT_CASE_STUDIES = [
  {
    id: "fintech-lead-gen",
    slug: "fintech-lead-gen",
    title: "400% Lead Volume Increase for Series C Neobank",
    client: "Finstrat Neobank",
    sector: "Fintech",
    results: "400% Lead Growth",
    description: "How we scaled a publisher network of 150+ high-authority finance blogs to dominate market share and reduce CPA by 28%.",
    image: "https://images.pexels.com/photos/32642488/pexels-photo-32642488.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    details: "By establishing granular attribution modeling and dynamic compensation tiers, we aligned partner incentives directly with high-quality user deposits, unlocking a massive scalable growth channel."
  },
  {
    id: "luxury-apparel-expansion",
    slug: "luxury-apparel-expansion",
    title: "Global Expansion Strategy for Luxury Apparel Brand",
    client: "Vivid Media & Fashion",
    sector: "E-Commerce",
    results: "3.2x ROI Boost",
    description: "Expanding a boutique label into 12 new European markets via local fashion influencer networks and localized paid campaigns.",
    image: "https://images.pexels.com/photos/28271086/pexels-photo-28271086.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    details: "We built a localized micro-influencer collective combined with targeted meta lookalike campaign retargeting, scaling monthly active users across Europe without diluting the brand's premium value."
  },
  {
    id: "saas-abm-dominance",
    slug: "saas-abm-dominance",
    title: "ABM Campaigns Drive $14M Pipeline for Enterprise SaaS",
    client: "TechCorp Global",
    sector: "Enterprise SaaS",
    results: "$14M Pipeline Created",
    description: "Targeting Fortune 500 decision-makers using hyper-personalized LinkedIn campaigns and executive content tracks.",
    image: "https://images.pexels.com/photos/34803966/pexels-photo-34803966.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    details: "By coordinating custom programmatic advertising with tailored thought-leadership essays, we penetrated high-barrier target accounts, creating massive brand awareness in the enterprise tech space."
  }
];

const DEFAULT_INSIGHTS = [
  {
    id: "insight-1",
    slug: "b2b-seo-attribution-guide",
    title: "Omnichannel Attribution: Solving First-Touch vs Last-Touch",
    excerpt: "Stop relying on basic analytics dashboards. Learn how to map complex enterprise conversion funnels using multi-touch modeling.",
    tag: "Data Studies",
    image: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    author: "Marcus Chen",
    date: "2026-06-15T09:00:00Z",
    readTime: 8,
    content: "Enterprise purchasing lifecycles are rarely linear. A decision-maker might click an organic search result, read a whitepaper, see a retargeting ad on LinkedIn, and eventually click a brand search ad weeks later to schedule a demo. If your marketing team evaluates channel performance on last-click attribution alone, you are likely underfunding top-of-funnel channels and overpaying for branded search. Multi-touch attribution modeling distributes credit across the entire conversion path, giving you the real ROI of your marketing spend."
  },
  {
    id: "insight-2",
    slug: "programmatic-rtb-scaling-2026",
    title: "Programmatic RTB: Best Practices for High-Value Lead Gen",
    excerpt: "How real-time bidding platforms and dynamic out-of-home networks are changing the B2B marketing landscape.",
    tag: "Trends",
    image: "https://images.pexels.com/photos/34804001/pexels-photo-34804001.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    author: "Priya Sharma",
    date: "2026-06-28T10:30:00Z",
    readTime: 6,
    content: "Real-time bidding (RTB) has transitioned from a simple banner-ad clearance mechanism into a highly sophisticated targeting engine. Modern programmatic platforms allow growth teams to serve dynamic creatives to specific IP clusters, targeting corporate offices or industry conferences directly. Combined with connected TV (CTV) advertising, programmatic RTB delivers high-frequency impressions to high-value decision-makers, bypassing the noise of traditional social networks."
  }
];

const DEFAULT_INDUSTRIES = [
  { id: "saas", name: "SaaS & Cloud Tech", icon: "cloud", description: "Strategic growth consulting and automated funnel design for high-scale software models." },
  { id: "fintech", name: "Fintech & Banking", icon: "payments", description: "Compliance-safe performance marketing matching user acquisition with strict CPA limits." },
  { id: "ecommerce", name: "D2C & E-Commerce", icon: "shopping_bag", description: "Global scale across search and social channels, maximizing customer lifetime value." },
  { id: "logistics", name: "Global Logistics", icon: "local_shipping", description: "Targeting enterprise supply-chain decision makers using Account-Based Marketing (ABM)." }
];

const DEFAULT_TEAM = [
  { id: "team-1", name: "Ava Lindqvist", role: "Co-founder & CEO", color: "#0F172A", bio: "Ex-growth executive at two unicorns. Leads the consultancy team from London.", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=750&q=80" },
  { id: "team-2", name: "Marcus Chen", role: "Co-founder & CTO", color: "#0058be", bio: "Built our unified performance attribution engine. Oversees analytics infrastructure.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=750&q=80" },
  { id: "team-3", name: "Priya Sharma", role: "VP, Growth Services", color: "#64748b", bio: "Leads tactical operations across paid media. 12+ years of enterprise growth experience.", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&h=750&q=80" }
];

const DEFAULT_TESTIMONIALS = [
  { id: "test-1", quote: "Alphobia completely re-architected our performance dashboard. We now have 100% transparency into our global ad accounts.", author: "Director of Marketing, TechCorp" },
  { id: "test-2", quote: "Their programmatic bidding scripts saved us 30% in ad spend in the first month while increasing overall lead volume by 2x.", author: "VP Growth, FinStrat" }
];

const DEFAULT_STATS = {
  impressions: "500M+",
  adSpend: "$50M+",
  avgRoi: "300%",
  headline: [
    { label: "Global Impressions", value: 500000000, suffix: "+", prefix: "" },
    { label: "Managed Ad Spend", value: 50000000, suffix: "+", prefix: "$" },
    { label: "Avg Client ROI", value: 300, suffix: "%", prefix: "" },
    { label: "Active Publisher Partners", value: 12400, suffix: "+", prefix: "" }
  ]
};

const DEFAULT_CONTACT = {
  header: {
    badge: "Contact Us",
    title: "Start Your Growth Protocol",
    subtitle: "Speak directly with a growth engineer to build your global campaign strategy."
  },
  details: {
    email: "growth@alphobia.com",
    phone: "+44 20 7946 0958",
    address: "18 Finsbury Square, London EC2A 1AH, United Kingdom",
    officeHours: "Monday - Friday, 9:00 AM - 6:00 PM GMT"
  }
};

// Map of default initializers
const FALLBACKS = {
  home: DEFAULT_HOME,
  about: DEFAULT_ABOUT,
  services: DEFAULT_SERVICES,
  caseStudies: DEFAULT_CASE_STUDIES,
  insights: DEFAULT_INSIGHTS,
  industries: DEFAULT_INDUSTRIES,
  team: DEFAULT_TEAM,
  testimonials: DEFAULT_TESTIMONIALS,
  stats: DEFAULT_STATS,
  contact: DEFAULT_CONTACT,
};

// ----------------------------------------------------
// FIRESTORE READ & WRITE UTILITIES
// ----------------------------------------------------

/**
 * Fetch document page data (e.g., home, about, services).
 * Auto-creates document with dummy fallbacks if missing.
 */
export async function fetchPageData(pageId) {
  try {
    const docRefInstance = docRef("pageData", pageId);
    const snap = await getDoc(docRefInstance);
    if (!snap.exists()) {
      const fallback = FALLBACKS[pageId] || {};
      if (Array.isArray(fallback)) {
        await setDoc(docRefInstance, { ...fallback });
      } else {
        await setDoc(docRefInstance, fallback);
      }
      return fallback;
    }
    const data = snap.data();
    if (pageId === "services" && data && !Array.isArray(data)) {
      const values = Object.values(data).filter((v) => typeof v === "object" && v !== null && v.id);
      if (values.length > 0) return values;
    }
    return data;
  } catch (err) {
    console.error(`fetchPageData error for page ${pageId}:`, err);
    return FALLBACKS[pageId] || {};
  }
}

/**
 * Update document page data.
 */
export async function savePageData(pageId, data) {
  const docRefInstance = docRef("pageData", pageId);
  await setDoc(docRefInstance, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Fetch all Case Studies. Initializes defaults if collection is empty.
 */
export async function fetchCaseStudies() {
  try {
    const snap = await getDocs(col("caseStudies"));
    if (snap.empty) {
      // Initialize defaults
      const items = FALLBACKS.caseStudies;
      await Promise.all(
        items.map((item) => setDoc(docRef("caseStudies", item.id), item))
      );
      return items;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("fetchCaseStudies error:", err);
    return FALLBACKS.caseStudies;
  }
}

export async function saveCaseStudy(id, data) {
  await setDoc(docRef("caseStudies", id), {
    ...data,
    id,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCaseStudy(id) {
  await deleteDoc(docRef("caseStudies", id));
}

/**
 * Fetch all Insights (Blogs). Initializes defaults if collection is empty.
 */
export async function fetchInsights() {
  try {
    const snap = await getDocs(col("insights"));
    if (snap.empty) {
      const items = FALLBACKS.insights;
      await Promise.all(
        items.map((item) => setDoc(docRef("insights", item.id), item))
      );
      return items;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("fetchInsights error:", err);
    return FALLBACKS.insights;
  }
}

export async function saveInsight(id, data) {
  await setDoc(docRef("insights", id), {
    ...data,
    id,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteInsight(id) {
  await deleteDoc(docRef("insights", id));
}

/**
 * Fetch Industries.
 */
export async function fetchIndustries() {
  try {
    const snap = await getDocs(col("industries"));
    if (snap.empty) {
      const items = FALLBACKS.industries;
      await Promise.all(
        items.map((item) => setDoc(docRef("industries", item.id), item))
      );
      return items;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("fetchIndustries error:", err);
    return FALLBACKS.industries;
  }
}

export async function saveIndustry(id, data) {
  await setDoc(docRef("industries", id), {
    ...data,
    id,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteIndustry(id) {
  await deleteDoc(docRef("industries", id));
}

/**
 * Fetch Team.
 */
export async function fetchTeam() {
  try {
    const snap = await getDocs(col("team"));
    if (snap.empty) {
      const items = FALLBACKS.team;
      await Promise.all(
        items.map((item) => setDoc(docRef("team", item.id), item))
      );
      return items;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("fetchTeam error:", err);
    return FALLBACKS.team;
  }
}

export async function saveTeamMember(id, data) {
  await setDoc(docRef("team", id), {
    ...data,
    id,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTeamMember(id) {
  await deleteDoc(docRef("team", id));
}

/**
 * Fetch Testimonials.
 */
export async function fetchTestimonials() {
  try {
    const snap = await getDocs(col("testimonials"));
    if (snap.empty) {
      const items = FALLBACKS.testimonials;
      await Promise.all(
        items.map((item) => setDoc(docRef("testimonials", item.id), item))
      );
      return items;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("fetchTestimonials error:", err);
    return FALLBACKS.testimonials;
  }
}

export async function saveTestimonial(id, data) {
  await setDoc(docRef("testimonials", id), {
    ...data,
    id,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTestimonial(id) {
  await deleteDoc(docRef("testimonials", id));
}

/**
 * Fetch Stats.
 */
export async function fetchStats() {
  return fetchPageData("stats");
}

export async function saveStats(data) {
  return savePageData("stats", data);
}

// ----------------------------------------------------
// STORAGE ASSET UPLOAD
// ----------------------------------------------------

export function uploadAsset({ file, path = "assets", onProgress, onTaskReady }) {
  return new Promise((resolve, reject) => {
    const uniqueName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `projects/${PROJECT_ID}/${path}/${uniqueName}`);
    const task = uploadBytesResumable(storageRef, file);

    if (onTaskReady) onTaskReady(task);

    task.on(
      "state_changed",
      (snap) => {
        if (onProgress) {
          onProgress(
            Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
          );
        }
      },
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, path: task.snapshot.ref.fullPath, name: file.name });
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

export async function deleteAsset(storagePath) {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn("deleteAsset storage deletion error:", err);
  }
}

export function getFullDummyData() {
  return FALLBACKS;
}

/**
 * Resets all project data (PageData documents and collection-based documents)
 * back to the default dummy (FALLBACKS) state.
 */
export async function resetProjectData() {
  // 1. Reset PageData documents
  const pageDocs = ["home", "about", "services", "stats", "contact"];
  for (const pageId of pageDocs) {
    const docRefInstance = docRef("pageData", pageId);
    const data = FALLBACKS[pageId];
    if (Array.isArray(data)) {
      await setDoc(docRefInstance, { ...data });
    } else {
      await setDoc(docRefInstance, data);
    }
  }

  // Helper to reset collection data
  const resetCollection = async (colName, defaultItems) => {
    const snap = await getDocs(col(colName));
    for (const d of snap.docs) {
      await deleteDoc(docRef(colName, d.id));
    }
    for (const item of defaultItems) {
      await setDoc(docRef(colName, item.id), item);
    }
  };

  // 2. Reset collection-based data
  await resetCollection("caseStudies", DEFAULT_CASE_STUDIES);
  await resetCollection("insights", DEFAULT_INSIGHTS);
  await resetCollection("industries", DEFAULT_INDUSTRIES);
  await resetCollection("team", DEFAULT_TEAM);
  await resetCollection("testimonials", DEFAULT_TESTIMONIALS);
}

// ----------------------------------------------------
// CONTACT FORM SUBMISSIONS  (local JSON file via Alphobia Vite API)
// ----------------------------------------------------

/** Base URL of the Alphobia dev server's contacts API. */
const CONTACTS_API = "http://localhost:5173/api/contacts";

/**
 * Fetch all contact submissions (newest first).
 * Reads from the local contacts.json file via the Alphobia Vite dev server.
 */
export async function fetchContactSubmissions() {
  try {
    const res = await fetch(CONTACTS_API, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchContactSubmissions error:", err);
    return [];
  }
}

/**
 * Update the status of a contact submission (e.g., "new" → "replied").
 */
export async function updateSubmissionStatus(id, status) {
  const res = await fetch(CONTACTS_API, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
  if (!res.ok) throw new Error(`PATCH failed: HTTP ${res.status}`);
}

/**
 * Delete a contact submission by id.
 */
export async function deleteContactSubmission(id) {
  const res = await fetch(CONTACTS_API, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error(`DELETE failed: HTTP ${res.status}`);
}
