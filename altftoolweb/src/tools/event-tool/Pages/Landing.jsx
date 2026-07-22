import React, { useState } from "react";
import {
  Calendar,
  BookOpen,
  Users,
  Trophy,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

const Landing = ({ isDark, setCurrentPage }) => {
  const [activeAccordion, setActiveAccordion] = useState(null);

  const features = [
    {
      icon: Calendar,
      title: "Search Any Date",
      description:
        "Jump to any day in history and explore events that shaped the world.",
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    },
    {
      icon: BookOpen,
      title: "Deep Facts",
      description:
        "Access detailed descriptions, timelines, and historical context.",
      gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
    },
    {
      icon: Users,
      title: "Births & Deaths",
      description:
        "Find famous personalities born or died on your selected date.",
      gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    },
    {
      icon: Trophy,
      title: "Global Milestones",
      description:
        "View major events, revolutions, inventions, and world-changing breakthroughs.",
      gradient: "linear-gradient(135deg, #10b981, #22c55e)",
    },
  ];

  const faqs = [
    {
      q: "How far back can I search?",
      a: "You can explore events from thousands of years back to present day.",
    },
    {
      q: "Is the information accurate?",
      a: "Yes, all data is sourced from trusted & verified historical databases.",
    },
    {
      q: "Can I check today's date?",
      a: "Absolutely — see everything that happened on this exact day in history.",
    },
    {
      q: "Do you show global events?",
      a: "Yes, events from all countries are included for a worldwide perspective.",
    },
    {
      q: "Is it free?",
      a: "Yes, the entire platform is 100% free forever.",
    },
  ];

  return (
    <div>
      {/* HERO SECTION */}
      <section
        style={{
          padding: "100px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Floating Background Glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, #6366f1aa, transparent 70%)",
            filter: "blur(70px)",
            zIndex: -1,
          }}
        ></div>

        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2.8rem, 6vw, 4.8rem)",
              fontWeight: 900,
              marginBottom: "16px",
              background:
                "linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f43f5e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.1,
            }}
          >
            Unlock the Past.
            <br />
            Discover Every Moment.
          </h1>

          <p
            style={{
              fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
              color: isDark ? "#cbd5e1" : "#475569",
              marginBottom: "48px",
              lineHeight: "1.7",
            }}
          >
            Dive into centuries of human history — from ancient civilizations to
            modern-day milestones.
          </p>

          {/* BUTTONS */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setCurrentPage("event")}
              style={{
                padding: "16px 40px",
                fontSize: "1.1rem",
                fontWeight: 700,
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg, #6366f1, #ec4899, #f43f5e)",
                border: "none",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                transition: "0.25s",
                boxShadow:
                  "0 8px 25px rgba(99,102,241,0.35), 0 4px 12px rgba(236,72,153,0.25)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              Start Exploring <ArrowRight size={22} />
            </button>

            <button
              onClick={() => setCurrentPage("event")}
              style={{
                padding: "16px 40px",
                fontSize: "1.1rem",
                fontWeight: 700,
                borderRadius: "14px",
                border: `2px solid ${
                  isDark ? "#94a3b8" : "#475569"
                }`,
                background: "transparent",
                color: isDark ? "#e2e8f0" : "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                transition: "0.25s",
              }}
            >
              <Calendar size={22} /> Today in History
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
     <section className={`py-14 sm:py-20 px-4
  ${isDark ? "bg-slate-900/60" : "bg-white/70"} backdrop-blur`}>

  <div className="max-w-7xl mx-auto">
    <h2 className="text-center font-extrabold mb-12
      text-[clamp(2rem,5vw,3rem)]">
      Powerful Features
    </h2>

    <div className="grid gap-6 sm:gap-8
      grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

      {features.map((f, i) => (
        <div
          key={i}
          className={`p-6 sm:p-8 rounded-xl text-center
            transition-transform duration-300
            hover:-translate-y-2
            ${isDark
              ? "bg-slate-800/70 border border-white/10"
              : "bg-white/90 border border-black/5"}
          `}
        >
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl
            flex items-center justify-center mx-auto mb-5 shadow-lg"
            style={{ background: f.gradient }}
          >
            <f.icon size={28} className="text-white sm:text-[32px]" />
          </div>

          <h3 className="font-bold text-lg sm:text-xl mb-2">
            {f.title}
          </h3>

          <p className="text-sm sm:text-base leading-relaxed
            text-slate-500 dark:text-slate-300">
            {f.description}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* FAQ */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3rem)",
              textAlign: "center",
              marginBottom: "48px",
              fontWeight: 800,
            }}
          >
            Frequently Asked Questions
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={{
                  background: isDark
                    ? "rgba(30,41,59,0.75)"
                    : "rgba(255,255,255,0.9)",
                  border: `1px solid ${
                    isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"
                  }`,
                  borderRadius: "14px",
                  overflow: "hidden",
                }}
              >
                {/* Question Button */}
                <button
                  onClick={() =>
                    setActiveAccordion(
                      activeAccordion === index ? null : index
                    )
                  }
                  style={{
                    width: '100%',
    padding: '24px 28px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    textAlign: 'left',
    outline: 'none',
    borderRadius: 0,
                  }}
                    className="plain-button-override"
                >
                  {faq.q}
                  <ChevronDown
                    size={24}
                    style={{
                      transform:
                        activeAccordion === index
                          ? "rotate(180deg)"
                          : "rotate(0)",
                      transition: "0.3s",
                    }}
                  />
                </button>

                {/* Answer */}
                {activeAccordion === index && (
                  <div
                    style={{
                      padding: "0 26px 22px",
                      color: isDark ? "#cbd5e1" : "#64748b",
                      lineHeight: 1.7,
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
