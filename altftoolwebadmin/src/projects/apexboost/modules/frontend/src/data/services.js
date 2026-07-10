import {
  Search,
  Share2,
  PenTool,
  Mail,
  Users,
  Target,
  Repeat,
  LineChart,
  Handshake,
  Network,
  Link2,
  Percent,
  Ticket,
  Megaphone,
  Globe,
  ThumbsUp,
  Camera,
  Play,
  MonitorSmartphone,
  Eye,
  TrendingUp,
  MousePointerClick,
} from "lucide-react";

/**
 * The THREE core service pillars of the agency.
 * Strictly: Digital Marketing · Affiliate Marketing · Advertising Marketing
 */
export const services = [
  {
    id: "digital",
    icon: Search,
    title: "Digital Marketing",
    tagline: "Build a magnetic, always-on growth engine.",
    description:
      "We grow your organic presence, nurture audiences and turn attention into revenue with a full-funnel digital strategy engineered for compounding ROI.",
    accent: "from-brand to-brand-cyan",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=2000&q=80",
    features: [
      "Full-funnel strategy",
      "SEO & content engines",
      "Lifecycle email automation",
      "Conversion rate optimization",
    ],
    items: [
      { title: "Search Engine Optimization", icon: Search, desc: "Dominate search results and drive high-intent organic traffic.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80" },
      { title: "Search Engine Marketing", icon: TrendingUp, desc: "Capture demand instantly with targeted search campaigns.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80" },
      { title: "Social Media Marketing", icon: Share2, desc: "Build brand loyalty and engage audiences across platforms.", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80" },
      { title: "Content Marketing", icon: PenTool, desc: "Create compelling narratives that educate and convert.", image: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?auto=format&fit=crop&w=600&q=80" },
      { title: "Email Marketing", icon: Mail, desc: "Nurture leads and drive repeat sales with automated flows.", image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=600&q=80" },
      { title: "Influencer Marketing", icon: Users, desc: "Leverage trusted voices to amplify your brand's reach.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80" },
      { title: "Lead Generation", icon: Target, desc: "Fill your pipeline with qualified, high-quality prospects.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80" },
      { title: "Conversion Optimization", icon: Repeat, desc: "Turn more of your existing traffic into paying customers.", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80" },
      { title: "Marketing Automation", icon: MousePointerClick, desc: "Scale your efforts with smart, triggered workflows.", image: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?auto=format&fit=crop&w=600&q=80" },
      { title: "Analytics & Reporting", icon: LineChart, desc: "Gain crystal-clear visibility into what drives your growth.", image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=600&q=80" },
    ],
  },
  {
    id: "affiliate",
    icon: Handshake,
    title: "Affiliate Marketing",
    tagline: "Scale revenue through a performance partner network.",
    description:
      "We design, launch and scale profitable affiliate programs — recruiting the right partners and paying only for measurable results that move your bottom line.",
    accent: "from-brand-purple to-brand",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=2000&q=80",
    features: [
      "Custom affiliate setup",
      "Vetted partner recruitment",
      "Fraud-proof tracking",
      "Commission strategy",
    ],
    items: [
      { title: "Affiliate Program Setup", icon: Network, desc: "Launch customized programs tailored to your margins.", image: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?auto=format&fit=crop&w=600&q=80" },
      { title: "Affiliate Recruitment", icon: Users, desc: "Source and onboard high-performing niche partners.", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80" },
      { title: "Affiliate Strategy", icon: Target, desc: "Design commission structures that incentivize volume.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80" },
      { title: "Partner Network", icon: Handshake, desc: "Tap into our exclusive database of vetted affiliates.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80" },
      { title: "Affiliate Tracking", icon: Link2, desc: "Implement fraud-proof tracking for precise attribution.", image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=600&q=80" },
      { title: "Commission Management", icon: Percent, desc: "Automate payouts and manage tier-based incentives.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80" },
      { title: "Referral Marketing", icon: Share2, desc: "Turn your best customers into vocal brand advocates.", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80" },
      { title: "Coupon Marketing", icon: Ticket, desc: "Deploy strategic discounts without hurting brand equity.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80" },
      { title: "Affiliate Analytics", icon: LineChart, desc: "Monitor partner ROI and campaign performance in real-time.", image: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?auto=format&fit=crop&w=600&q=80" },
      { title: "Performance Optimization", icon: TrendingUp, desc: "Continuously refine offers to maximize affiliate yield.", image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=600&q=80" },
    ],
  },
  {
    id: "advertising",
    icon: Megaphone,
    title: "Advertising Marketing",
    tagline: "Launch high-converting paid campaigns at scale.",
    description:
      "From Google to Meta to YouTube, we architect paid campaigns that profitably acquire customers — obsessed with lowering CPA and maximizing ROAS.",
    accent: "from-brand-cyan to-brand-purple",
    image: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?auto=format&fit=crop&w=2000&q=80",
    features: [
      "Cross-channel ad management",
      "Creative testing at scale",
      "Retargeting & remarketing",
      "Profitable scaling",
    ],
    items: [
      { title: "Google Ads", icon: Globe, desc: "Capture high-intent searches with precise SEM strategies.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80" },
      { title: "Facebook Ads", icon: ThumbsUp, desc: "Scale revenue with visually compelling social campaigns.", image: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?auto=format&fit=crop&w=600&q=80" },
      { title: "Instagram Ads", icon: Camera, desc: "Engage visual shoppers and drive mobile conversions.", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80" },
      { title: "Meta Ads", icon: Megaphone, desc: "Leverage advanced algorithms for cross-network reach.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80" },
      { title: "YouTube Ads", icon: Play, desc: "Tell your brand story with high-impact video ads.", image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=600&q=80" },
      { title: "Display Advertising", icon: MonitorSmartphone, desc: "Build awareness across the web with striking banners.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80" },
      { title: "Native Advertising", icon: PenTool, desc: "Blend in seamlessly with content to bypass ad blindness.", image: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?auto=format&fit=crop&w=600&q=80" },
      { title: "Remarketing", icon: Eye, desc: "Bring back bounced visitors and recover lost sales.", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80" },
      { title: "PPC Campaigns", icon: MousePointerClick, desc: "Pay only for performance with rigorous bid management.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80" },
      { title: "Performance Advertising", icon: TrendingUp, desc: "Data-driven media buying obsessed with ROAS.", image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=600&q=80" },
    ],
  },
];

// Flat list of all sub-services for the filterable grid
export const allServices = services.flatMap((s) =>
  s.items.map((it) => ({ ...it, category: s.title })),
);
