import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BrainCircuit,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Chrome,
  Code2,
  Compass,
  GitCompareArrows,
  Globe2,
  ImageIcon,
  Info,
  Layers3,
  LockKeyhole,
  MonitorSmartphone,
  Rocket,
  ScanSearch,
  SearchCheck,
  ShieldCheck,
  Star,
  UsersRound,
  Zap,
} from "lucide-react";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import "../../styles/landing.css";
import "./about.css";

const toolCount = Object.keys(toolMetaMap).length;

const platformStats = [
  { value: "Growing", label: "User Community", icon: UsersRound },
  { value: `${toolCount.toLocaleString()}+`, label: "Curated Tools", icon: Layers3 },
  { value: "Trusted", label: "By Our Users", icon: Star },
];

const floatingCategories = [
  { label: "Browser Extensions", icon: Chrome, position: "about-float-chrome" },
  { label: "AI", icon: BrainCircuit, position: "about-float-ai" },
  { label: "Apps", icon: MonitorSmartphone, position: "about-float-apps" },
  { label: "Development", icon: Code2, position: "about-float-dev" },
  { label: "Productivity", icon: Zap, position: "about-float-productivity" },
  { label: "Security", icon: LockKeyhole, position: "about-float-security" },
];

const communityAvatars = [
  { src: "/personality/testimonials/image2.jpg", alt: "AltF Tools community member" },
  { src: "/personality/testimonials/image3.jpg", alt: "AltF Tools community member" },
  { src: "/academy/feedback/rahul.jpg", alt: "AltF Tools community member" },
];

const processSteps = [
  {
    number: "01",
    title: "Discover",
    text: "Browse apps, browser extensions, AI tools, and software by category.",
    icon: ScanSearch,
  },
  {
    number: "02",
    title: "Compare",
    text: "Compare features, ratings, reviews, and pricing before choosing.",
    icon: GitCompareArrows,
  },
  {
    number: "03",
    title: "Choose",
    text: "Select the best tool that matches your workflow and requirements.",
    icon: BadgeCheck,
  },
  {
    number: "04",
    title: "Boost Productivity",
    text: "Install the right tools and improve your daily workflow instantly.",
    icon: Rocket,
  },
];

const missionPoints = [
  {
    title: "Simplify Discovery",
    text: "Make finding useful digital tools fast, clear, and hassle-free.",
    icon: SearchCheck,
  },
  {
    title: "Build Trust",
    text: "Highlight reliable tools with useful context, ratings, and categories.",
    icon: ShieldCheck,
  },
  {
    title: "Support Better Work",
    text: "Help people save time, reduce friction, and choose tools with confidence.",
    icon: Rocket,
  },
];

const offerItems = [
  {
    title: "Browser Extensions",
    text: "Helpful add-ons for productivity, security, writing, and workflow tasks.",
    icon: Chrome,
  },
  {
    title: "AI Tools",
    text: "Curated AI utilities for writing, research, design, code, and automation.",
    icon: BrainCircuit,
  },
  {
    title: "Mobile Apps",
    text: "Useful Android, iOS, and web apps for everyday work and personal tasks.",
    icon: MonitorSmartphone,
  },
  {
    title: "PDF & Image Tools",
    text: "Fast utilities for documents, images, conversion, compression, and cleanup.",
    icon: ImageIcon,
  },
  {
    title: "Developer Resources",
    text: "Practical tools for JSON, code, APIs, testing, formatting, and debugging.",
    icon: Code2,
  },
  {
    title: "Guides & Reviews",
    text: "Editorial picks and simple guides to help you choose better software.",
    icon: BookOpenText,
  },
];

const chooseFeatures = [
  "Carefully Curated",
  "Regularly Updated",
  "Community Trusted",
  "Fast Discovery",
  "Clean Experience",
  "Built for Everyone",
];

const testimonials = [
  {
    quote:
      "AltF Tools helps me find focused utilities without digging through noisy directories. It saves real time every week.",
    name: "Alex Morgan",
    role: "Developer",
    avatar: "/personality/testimonials/image2.jpg",
  },
  {
    quote:
      "The collections are clean, practical, and easy to compare. I use it whenever I need a trusted design or content tool.",
    name: "Priya Sharma",
    role: "Designer",
    avatar: "/personality/testimonials/image3.jpg",
  },
  {
    quote:
      "I discovered apps and extensions that made my study workflow much faster. Everything feels simple and reliable.",
    name: "James Carter",
    role: "Student",
    avatar: "/academy/feedback/rahul.jpg",
  },
  {
    quote:
      "The tool pages are direct and useful. I can compare options quickly and move back to my work without friction.",
    name: "Maya Chen",
    role: "Product Manager",
    avatar: "/personality/testimonials/image1.jpg",
  },
  {
    quote:
      "AltF Tools makes everyday digital work feel organized. The categories, reviews, and quick links are easy to trust.",
    name: "Amit Verma",
    role: "Founder",
    avatar: "/academy/feedback/amit.png",
  },
  {
    quote:
      "I use it to find browser extensions and quick utilities for client work. The experience is clean and predictable.",
    name: "Sofia Reed",
    role: "Marketing Lead",
    avatar: "/personality/testimonials/image3.jpg",
  },
];

export default function About() {
  const testimonialSlides = [...testimonials, ...testimonials];

  return (
    <main className="altf-home altf-about">
      <section className="about-hero-banner">
        <div className="about-hero-overlay" />
        <div className="about-hero-content">
          <h1>About AltF Tools</h1>
          <nav aria-label="Breadcrumb" className="about-breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span>About Us</span>
          </nav>
          <p>
            Discover smarter apps, browser extensions, AI tools, and resources
            designed to simplify everyday workflows.
          </p>
          <span className="about-hero-line" aria-hidden="true" />
        </div>
      </section>

      <section className="about-section about-intro-section">
        <div className="about-container about-intro-grid">
          <div className="about-copy-block">
            <div className="home-reference-badge">
              <Info className="h-4 w-4" strokeWidth={2.35} />
              About AltF Tools
            </div>
            <h2>
              Helping You Discover{" "}
              <span>Better Digital Tools.</span>
            </h2>
            <p>
              AltF Tools is a curated platform for discovering browser
              extensions, web apps, AI tools, desktop software, mobile apps, and
              developer resources. We help users find reliable tools that
              improve productivity without unnecessary complexity.
            </p>

            <div className="about-stat-grid" aria-label="AltF Tools statistics">
              {platformStats.map((item) => {
                const Icon = item.icon;

                return (
                  <div className="about-stat-card" key={item.label}>
                    <span className="about-stat-icon">
                      <Icon className="h-5 w-5" strokeWidth={2.25} />
                    </span>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            <Link href="/tools/all" className="home-ref-primary-btn about-primary-cta">
              Explore Tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="about-visual-card about-platform-visual">
            <Image
              src="/assets/home-about-visual-transparent.png"
              alt="AltF Tools curated tool discovery workspace"
              width={520}
              height={480}
              priority
              className="about-main-person about-main-lady"
            />
            <div className="about-community-badge">
              <span className="about-avatar-stack" aria-hidden="true">
                {communityAvatars.map((avatar) => (
                  <span key={avatar.src}>
                    <Image
                      src={avatar.src}
                      alt={avatar.alt}
                      width={36}
                      height={36}
                    />
                  </span>
                ))}
              </span>
              Trusted by a growing community
            </div>
            {floatingCategories.map((item) => {
              const Icon = item.icon;

              return (
                <span
                  className={`about-floating-chip ${item.position}`}
                  key={item.label}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.25} />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <section className="about-section about-mission-section">
        <div className="about-container about-mission-grid">
          <div className="about-copy-block">
            <div className="home-reference-badge">
              <Rocket className="h-4 w-4" strokeWidth={2.35} />
              Our Mission
            </div>
            <h2>
              Make Tool Discovery{" "}
              <span>Simple And Trustworthy.</span>
            </h2>
            <p>
              Our mission is to help people find the right tools without wasting
              time across scattered websites, noisy recommendations, or confusing
              product pages. AltF Tools brings useful choices together with a
              clean experience built for quick decisions.
            </p>
          </div>

          <div className="about-mission-card-grid">
            {missionPoints.map((item) => {
              const Icon = item.icon;

              return (
                <article className="about-mission-card" key={item.title}>
                  <span>
                    <Icon className="h-6 w-6" strokeWidth={2.25} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="about-section about-offer-section">
        <div className="about-container">
          <div className="about-section-heading">
            <div className="home-reference-badge">
              <Layers3 className="h-4 w-4" strokeWidth={2.35} />
              What We Offer
            </div>
            <h2>
              Everything You Need To{" "}
              <span>Work Smarter.</span>
            </h2>
          </div>

          <div className="about-offer-grid">
            {offerItems.map((item) => {
              const Icon = item.icon;

              return (
                <article className="about-offer-card" key={item.title}>
                  <span className="about-offer-icon">
                    <Icon className="h-6 w-6" strokeWidth={2.25} />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                  <span className="about-offer-arrow" aria-hidden="true">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="about-section about-process-section">
        <div className="about-container">
          <div className="about-section-heading">
            <div className="home-reference-badge">
              <Compass className="h-4 w-4" strokeWidth={2.35} />
              OUR PROCESS
            </div>
            <h2>How AltF Tools Works</h2>
            <p className="about-process-subtitle">
              Discover, compare and choose the perfect productivity tools in
              four simple steps.
            </p>
          </div>

          <div className="about-process-track">
            {processSteps.map((step) => {
              const Icon = step.icon;

              return (
                <article className="about-process-step" key={step.number}>
                  <span className="about-step-number">{step.number}</span>
                  <span className="about-step-circle">
                    <Icon className="h-10 w-10" strokeWidth={2.05} />
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="about-section about-why-section">
        <div className="about-container about-why-grid">
          <div className="about-copy-block">
            <div className="home-reference-badge">
              <ShieldCheck className="h-4 w-4" strokeWidth={2.35} />
              Why Choose AltF Tools
            </div>
            <h2>
              Why Thousands Choose{" "}
              <span>AltF Tools</span>
            </h2>

            <div className="about-feature-grid">
              {chooseFeatures.map((feature) => (
                <div className="about-feature-card" key={feature}>
                  <span>
                    <CheckCircle2 className="h-5 w-5" strokeWidth={2.45} />
                  </span>
                  <div>
                    <h3>{feature}</h3>
                    <p>{getFeatureText(feature)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/tools/all" className="home-ref-primary-btn about-primary-cta">
              Browse Categories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="about-visual-card about-choose-visual">
            <div className="about-visual-orb about-visual-orb-square" aria-hidden="true" />
            <Image
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82"
              alt="Team collaborating with laptops while choosing digital tools"
              width={1200}
              height={900}
              className="about-choose-person about-choose-photo"
              sizes="(max-width: 768px) 88vw, 42vw"
            />
            <div className="about-help-card">
              <span>
                <Globe2 className="h-6 w-6" strokeWidth={2.25} />
              </span>
              <div>
                <strong>Need Help?</strong>
                <p>Explore our guides and resources.</p>
                <Link href="/blogs">
                  Open Guides
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section about-review-section">
        <div className="about-container">
          <div className="about-section-heading">
            <div className="home-reference-badge">
              <UsersRound className="h-4 w-4" strokeWidth={2.35} />
              Community Reviews
            </div>
            <h2>What Our Community Says</h2>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--muted) px-3 py-1 text-xs font-medium text-(--muted-foreground)">
              Sample testimonials shown for illustration — not verified customer submissions
            </p>
          </div>

          <div className="about-testimonial-slider" aria-label="Community review slider">
            <div className="about-testimonial-track">
              {testimonialSlides.map((item, index) => (
                <article className="about-testimonial-card" key={`${item.name}-${index}`}>
                  <div className="about-stars" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className="h-4 w-4"
                        fill="currentColor"
                        strokeWidth={1.6}
                      />
                    ))}
                  </div>
                  <p>&ldquo;{item.quote}&rdquo;</p>
                  <div className="about-reviewer">
                    <Image
                      src={item.avatar}
                      alt=""
                      width={52}
                      height={52}
                      className="about-reviewer-avatar"
                    />
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.role}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="about-testimonial-pagination" aria-hidden="true">
            {testimonials.map((item) => (
              <span key={item.name} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function getFeatureText(feature) {
  const descriptions = {
    "Carefully Curated": "Every tool is selected for practical usefulness.",
    "Regularly Updated": "New apps, extensions, and resources are added often.",
    "Community Trusted": "Ratings and feedback help surface reliable options.",
    "Fast Discovery": "Find the right tool quickly without endless searching.",
    "Clean Experience": "A focused interface built without unnecessary clutter.",
    "Built for Everyone": "Useful for developers, creators, students, and teams.",
  };

  return descriptions[feature];
}
