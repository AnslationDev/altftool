import React from "react";
import { Calendar, BookOpen, Users, Trophy, MapPin } from "lucide-react";

const Footer = ({ isDark }) => {
  const darkBG = "rgba(15,15,15,0.92)";
  const lightBG = "rgba(255,255,255,0.92)";

  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";

  const sections = {
    Explore: ["Today in History", "Random Date", "Popular Events", "Timeline"],
    Resources: ["Documentation", "API Reference", "Blog", "Sources"],
    Company: ["About Us", "Careers", "Press", "Partners"],
  };

  return (
    <footer
      style={{
        width: "100%",
        padding: "60px 24px 30px",
        background: isDark ? darkBG : lightBG,
        borderTop: `1px solid ${
          isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
        }`,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          maxWidth: "1350px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          gap: "60px",
          flexWrap: "wrap",
        }}
      >
        {/* LEFT SIDE — BRAND */}
        <div style={{ flex: "1 1 350px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                background: isDark ? "#e2e8f0" : "#0f172a",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar size={26} color={isDark ? "black" : "white"} />
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "1.9rem",
                fontWeight: "800",
                color: textPrimary,
              }}
            >
              HistoryFinder
            </h2>
          </div>

          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.7,
              maxWidth: "380px",
              color: textSecondary,
            }}
          >
            Dive deep into history. Explore global events, famous births, and
            every iconic moment in time — instantly.
          </p>

          {/* Social Icons */}
          <div style={{ display: "flex", gap: "14px", marginTop: "20px" }}>
            {[BookOpen, Users, Trophy, MapPin].map((Icon, i) => (
              <div
                key={i}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.08)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transition: "0.25s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.background = isDark
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.08)";
                }}
              >
                <Icon size={20} color={textPrimary} />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE — ALL COLUMNS */}
        <div
          style={{
            flex: "2 1 600px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "30px",
          }}
        >
          {Object.entries(sections).map(([title, items]) => (
            <div key={title}>
              <h3
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "18px",
                  color: textPrimary,
                }}
              >
                {title}
              </h3>

              {items.map((link) => (
                <div
                  key={link}
                  style={{
                    marginBottom: "10px",
                    fontSize: "0.95rem",
                    color: textSecondary,
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = textPrimary;
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = textSecondary;
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  {link}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM */}
      <div
        style={{
          marginTop: "40px",
          paddingTop: "20px",
          borderTop: `1px solid ${
            isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"
          }`,
          textAlign: "center",
          color: textSecondary,
          fontSize: "0.9rem",
        }}
      >
        © {new Date().getFullYear()} HistoryFinder — All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
