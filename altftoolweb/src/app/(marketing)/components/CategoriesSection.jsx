"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import ManagedImage from "@/components/ui/ManagedImage";
import useHydrated from "@/hooks/useHydrated";

const sections = [
  {
    tag: "EFFICIENCY & AUTOMATION",
    title: "Be Productive",
    description:
      "Discover powerful and intelligent tools designed to simplify complex tasks, automate repetitive work, and enhance productivity. Our platform brings together smart solutions that help creators, developers, and businesses streamline their daily workflows with speed, efficiency, and reliability.",

    points: [
      "Advanced task automation and smart scheduling systems to save time",
      "Professional file management, document handling, and image processing tools",
      "Seamless workflow enhancers with integrations for modern productivity apps",
      "AI-powered utilities that reduce manual effort and increase accuracy",
    ],
    button: "Explore Productivity Tools",
    href: "/tools",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1400&auto=format&fit=crop",
    badge: "POPULAR",
  },
  {
    tag: "ENTERTAINMENT & FUN",
    title: "Take a Break",
    description:
      "Explore exciting mini games and browser-based entertainment designed for quick fun and relaxation. Whether you want to challenge your brain, compete with friends, or simply take a break, our collection of lightweight games runs instantly in your browser without downloads.",

    points: [
      "Curated collection of casual games, puzzles, and arcade classics",
      "Challenging brain teasers and strategy games for mental workouts",
      "Interactive multiplayer mini games to compete with friends",
      "New titles added regularly to keep the experience fresh",
      "Instant play with no installs, accounts, or setup required",
    ],
    button: "Explore Games",
    href: "/games",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1400&auto=format&fit=crop",
    badge: "TRENDING",
  },
  {
    tag: "LATEST INSIGHTS",
    title: "Stay Updated",
    description:
      "Stay informed with expertly curated newsletters and editorial content tailored to your interests. Get the latest insights, trending tools, and valuable resources delivered in a simple and engaging format.",

    points: [
      "Weekly roundups featuring the best tools, updates, and discoveries",
      "Exclusive deals, discounts, and product launches",
      "Industry insights and thought leadership from experts",
      "Interviews with creators, developers, and innovators",
      "Behind-the-scenes stories about emerging technologies",
      "Carefully curated content to help you stay ahead of trends",
    ],
    button: "Explore News",
    href: "/news",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1400&auto=format&fit=crop",
    badge: "DAILY",
  },
  {
    tag: "CURATED CONTENT",
    title: "Deals",
    description:
      "Discover the best online deals, discounts, and exclusive offers across tools, games, and digital services. Save money while accessing high-quality products recommended by our team.",

    points: [
      "Handpicked deals from trusted platforms and creators",
      "Limited-time offers on premium tools and subscriptions",
      "Seasonal promotions and exclusive community discounts",
      "Daily updates to highlight the latest trending deals",
      "Verified offers to ensure authenticity and value",
      "A centralized place to discover the best online bargains",
    ],
    button: "Subscribe to Updates",
    href: "/exclusivedeals",
    image:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1400&auto=format&fit=crop",
    badge: "WEEKLY",
  },
];

export default function FeaturedCategories() {
  const { theme } = useTheme();
  const mounted = useHydrated();

  if (!mounted) return null;
  return (
    <section className="section" >
      <div className=" mx-auto  px-0 space-y-8">

        {/* Header */}
        <div className="section-header animate-fade">
          <h2 className="section-title">
            Explore Tools by{" "}
            <span className="text-[var(--primary)]">Category</span>
          </h2>

          <p className="section-subtitle">
            Choose your focus and discover tools tailored to your needs.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-16 md:space-y-24 mt-12">
          {sections.map((item, index) => {
            const reverse = index % 2 === 1;

            return (
              <div
                key={index}
                className={`grid lg:grid-cols-2 gap-10 lg:gap-14 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
              >
                {/* Image */}
                <div
                  className={`relative group ${reverse ? "animate-slide-left" : "animate-slide-right"
                    }`}
                >
                  <ManagedImage
                    src={item.image}
                    alt={item.title}
                    className="rounded-2xl w-full object-cover  transition duration-300 group-hover:scale-[1.02]"
                  />

                  <span className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full bg-[var(--badge-bg)] shadow ${theme === "dark" ? "text-white" : "text-[var(--primary)]"} `}>
                    {item.badge}
                  </span>
                </div>

                {/* Content */}
                <div
                  className={`max-w-xl ${reverse ? "animate-slide-right" : "animate-slide-left"
                    }`}
                >
                  <p className={`text-xs md:text-sm font-semibold mb-2 ${theme === "dark" ? "text-[var(--secondary-foreground)]" : "text-[var(--primary)]"
                    } `}>
                    {item.tag}
                  </p>

                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-[var(--foreground)]">
                    {item.title}
                  </h3>

                  <p className="mb-6 text-sm md:text-base text-[var(--secondary-foreground)]">
                    {item.description}
                  </p>

                  <ul className="space-y-3 mb-6">
                    {item.points.map((point, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm md:text-base text-[var(--foreground)]"
                      >
                        <CheckCircle className="w-5 h-5 text-[var(--primary)] mt-1 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      href={item.href}
                      className="px-6 py-3 rounded-full text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)] transition hover:opacity-90 active:scale-95"
                    >
                      {item.button}
                    </Link>

                    <Link
                      href={item.href}
                      className={`text-sm font-medium  hover:underline ${theme === "dark" ? "text-[var(--secondary-foreground)]" : "text-[var(--primary)]"}`}
                    >
                      Learn More →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
