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
import "../../styles/landing.css";
import "./about.css";
import { getAnswerEngineSnapshot } from "@/platform/seo/answerEngineManifest";

/**
 * Three figures this page can actually stand behind.
 *
 * It used to print "100K+ Monthly Users", "5,000+ Curated Tools" and "4.9/5
 * User Rating". There is no analytics figure, no ratings mechanism and no
 * review store anywhere in this repo that could produce the first or the third,
 * and the second overstated the registry by about 30% — it holds 3,816 tools,
 * not 5,000. This is the page a directory reviewer and a journalist read first,
 * and an inflated rating is the kind of thing that gets a listing rejected.
 *
 * The two counts are read from the registries at render time so they cannot go
 * stale, and the third states a property of the product rather than a metric
 * about its audience.
 */
function getPlatformStats() {
  const snapshot = getAnswerEngineSnapshot();
  return [
    {
      value: snapshot.toolCount.toLocaleString("en-IN"),
      label: "Tools in the catalog",
      icon: Layers3,
    },
    {
      value: String(snapshot.categoryCounts.length),
      label: "Categories",
      icon: Star,
    },
    { value: "No sign-up", label: "To use any of them", icon: UsersRound },
  ];
}

const floatingCategories = [
  { label: "Browser Extensions", icon: Chrome, position: "about-float-chrome" },
  { label: "AI", icon: BrainCircuit, position: "about-float-ai" },
  { label: "Apps", icon: MonitorSmartphone, position: "about-float-apps" },
  { label: "Development", icon: Code2, position: "about-float-dev" },
  { label: "Productivity", icon: Zap, position: "about-float-productivity" },
  { label: "Security", icon: LockKeyhole, position: "about-float-security" },
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

export default function About() {
  const platformStats = getPlatformStats();

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
            {/*
              The avatar stack that sat here showed three faces borrowed from
              other parts of the site — two stock testimonial photos and the
              academy's feedback photo of a real, different person — under the
              caption "Trusted by 100K+ users". No such figure exists, and the
              faces were not users. The badge now states something true.
            */}
            <div className="about-community-badge">
              Free, in your browser, with no account
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

      {/*
        The "What Our Community Says" section is gone.
        It carried six reviews with invented names and roles — "Alex Morgan,
        Developer", "Priya Sharma, Designer", "James Carter, Student", "Maya
        Chen, Product Manager", "Amit Verma, Founder", "Sofia Reed, Marketing
        Lead" — each stamped five stars, and each avatar borrowed from another
        part of the site (two from /personality/testimonials, two from the
        academy's own feedback photos of different people). Nobody wrote any of
        those quotes.

        This is the page a directory reviewer opens before approving a listing
        and a journalist opens before writing about us, so it is the worst place
        on the site to keep fabricated endorsements. Restore the section when
        there are real reviews to put in it, with permission from the people who
        wrote them.
      */}
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
