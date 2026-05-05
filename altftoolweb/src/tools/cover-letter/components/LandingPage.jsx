"use client";



import React from "react";
import { Sparkles, Zap, Brain, CheckCircle, Edit3 } from "lucide-react";

const Landing = ({ onGetStarted, isDark }) => {
  const features = [
    {
      Icon: Brain,
      title: "AI-Powered",
      description: "Advanced language models craft personalized cover letters",
      color: "#6366f1",
    },
    {
      Icon: Zap,
      title: "Lightning Fast",
      description: "Generate professional letters in seconds, not hours",
      color: "#ec4899",
    },
    {
      Icon: Edit3,
      title: "Fully Customizable",
      description: "Edit and refine the generated content to match your style",
      color: "#8b5cf6",
    },
    {
      Icon: CheckCircle,
      title: "Job-Specific",
      description: "Tailored content that matches the job requirements perfectly",
      color: "#10b981",
    },
  ];

 
  return (
    <div
      className="max-w-312 mx-auto px-[clamp(16px,3vw,24px)]"

    >
      {/* Hero Section */}
      <div className="text-center ]"
>
        <div
          className="
  inline-flex items-center gap-2 
  py-2 px-5 mb-8
  rounded-3xl
  border border-(--primary)
  text-[clamp(0.75rem,2vw,1rem)]"

        >
          <Sparkles size={18} className="text-(--primary)" />
          <span className="text-(--primary)">AI-Powered Cover Letter Generation</span>
        </div>

        <h1
          className="heading text-center animate-fade-up"
        >
          Create Perfect Cover Letters in Seconds
        </h1>

        <p
         className="description text-center  animate-fade-up mb-12"
        >
          Leverage the power of AI to generate professional, <br/> job-specific cover 
          letters that help you stand out from the competition.
        </p>

        {/* Buttons */}
        <div
          className="flex gap-4 justify-center flex-wrap"

        >
          <button
            onClick={onGetStarted}
           className="py-3 px-8 text-[clamp(1rem,2vw,1.1rem)] font-semibold rounded-xl bg-(--primary) text-white cursor-pointer transition-all duration-300 "

            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 12px 24px rgba(99, 102, 241, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Get Started Free
          </button>

         
        </div>
      </div>

      {/* Features Section */}
      {/* <div style={{ marginBottom: "clamp(60px, 10vw, 100px)" }}>
        <h2
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "48px",
          }}
        >
          Why Choose CoverAI?
        </h2> */}

        {/* Responsive Grid */}
        {/* <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "24px",
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                padding: "28px",
                border:"1px solid #e5e7eb",
                borderRadius: "14px",
                textAlign: "center",
                transition: "0.3s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = `0 12px 24px ${feature.color}40`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "12px",
                  
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 18px",
                }}
              >
                <feature.Icon size={34} color="#6366f1" />
              </div>
              <h3
                style={{
                  fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
                  color: isDark ? "#94a3b8" : "#64748b",
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div> */}
      {/* </div> */}
 
    </div>
  );
};

export default Landing;
