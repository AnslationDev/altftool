"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Code2, Target, Zap } from "lucide-react";

/* Solid Card — visible in light & dark */
const Card = ({ children, className = "" }) => (
  <div
    className={`
      rounded-xl
      bg-(--card)
      shadow-lg
      ${className}
    `}
  >
    {children}
  </div>
);

export default function About() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) flex flex-col ">
      <main className="flex-grow ">
        <section className="flex justify-center section ">
          <div className=" mx-auto space-y-12  ">
            {/* Hero */}
            <div className="text-center space-y-4 ">
              <h1 className="section-title text-(--primary)">
                About AltF Tools
              </h1>
              <p className="section-subtitle">
                Developer-first micro tools for real productivity
              </p>
            </div>

            {/* Intro */}
            <Card className="p-8">
              <p className="text-(--muted-foreground) leading-relaxed">
                <strong>AltF Tools</strong> is a focused collection of browser-based
                microtools built to eliminate friction in everyday development
                workflows.
                Designed for speed, clarity, and reliability, each tool helps you
                solve a specific problem without distractions.

                No noise. No bloat. Just tools that work.
              </p>
            </Card>

            {/* Highlights */}
            <div className="grid md:grid-cols-3 gap-6">
              <Highlight
                icon={Code2}
                title="Developer First"
                text="Built by developers to solve real, recurring problems."
              />
              <Highlight
                icon={Zap}
                title="Instant & Secure"
                text="Runs entirely in your browser. No uploads. No tracking."
              />
              <Highlight
                icon={Target}
                title="Purpose Built"
                text="Each tool does exactly one thing — and does it well."
              />
            </div>

            {/* Content */}
            <Card className="p-8 space-y-8">
              <Section title="1. Our Mission">
                <p>
                  To help developers move faster by removing repetitive,
                  low-value tasks through simple, reliable tools.
                </p>
                <p>
                  We believe developers should spend their time building products,
                  not fighting utilities, ads, or unnecessary complexity.
                </p>
              </Section>


              <Section title="2. What Makes AltF Different">
                <ul className="list-disc pl-5 space-y-2">
                  <li>No sign-ups required</li>
                  <li>No unnecessary features</li>
                  <li>No dark patterns or data selling</li>
                  <li>Runs fast even on low-end devices</li>
                  <li>Clean UI built for long usage sessions</li>
                </ul>
              </Section>


              <Section title="3. Our Story">
                <p>
                  AltF Tools started as a personal toolbox — scripts reused daily
                  during development. Rebuilding the same logic again and again
                  was a waste of time.
                </p>
                <p>
                  What began as a few utilities has grown into 100+ focused tools
                  covering formatting, generation, conversion, and validation.
                </p>
                <p>
                  Rewriting the same helpers for formatting, validation, and quick
                  checks became a productivity drain.
                </p>
                <p>
                  What began as a few utilities has grown into 100+ focused tools
                  covering formatting, generation, conversion, and validation.
                </p>
              </Section>


              <Section title="4. Philosophy">
                <p>
                  Small tools. Clear purpose. Zero distractions. If a tool can’t
                  justify its existence, it doesn’t ship.
                </p>
                <p>
                  If a feature doesn’t directly help solve a real problem,
                  it doesn’t belong.
                </p>
                <p>
                  Every tool is judged by one question:
                  <em> “Does this save time?”</em>
                </p>
              </Section>


              <Section title="5. Future Direction">
                <p>
                  AltF Tools will continue expanding cautiously — prioritizing
                  quality, performance, and usefulness over raw tool count.
                </p>
                <p>
                  Upcoming improvements focus on better discoverability,
                  smarter categorization, and refined UX — not just more tools.
                </p>
              </Section>


              <Section title="6. Contact">
                <p>Email: <strong>altftool@gmail.com</strong></p>
                <p>Website: <strong>www.altftool.com</strong></p>

              </Section>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

/* Reusable blocks */

const Highlight = ({ icon: Icon, title, text }) => (
  <Card className="p-6 text-center space-y-4">
    <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center">
      <Icon className="w-6 h-6 text-(--primary)" />
    </div>
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-sm text-(--muted-foreground)">{text}</p>
  </Card>
);

const Section = ({ title, children }) => (
  <div className="space-y-3 ">
    <h3 className="text-xl md:text-2xl font-semibold">{title}</h3>
    <div className="text-(--muted-foreground) leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

