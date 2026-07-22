import React from "react";
import { Calendar, Sun, Moon, Menu } from "lucide-react";

const Header = ({ isDark, setIsDark, currentPage, setCurrentPage }) => {
  const [open, setOpen] = React.useState(false);

  const textColor = isDark ? "#ffffff" : "#111827";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(18px)",
        background: isDark
          ? "rgba(17, 24, 39, 0.85)"
          : "rgba(255, 255, 255, 0.85)",
        borderBottom: `1px solid ${
          isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
        }`,
        transition: "0.25s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          padding: "14px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* LOGO + TITLE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
          }}
          onClick={() => setCurrentPage("landing")}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: isDark ? "#1e293b" : "#f3f4f6",
              border: isDark
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Calendar size={22} color={textColor} />
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
              fontWeight: 800,
              color: textColor,
              letterSpacing: "0.5px",
            }}
          >
            HistoryFinder
          </h1>
        </div>

        {/* RIGHT SECTION (Toggle + Desktop Nav + Mobile Menu Button) */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

          {/* ALWAYS VISIBLE THEME TOGGLE */}
          <button
            onClick={() => setIsDark(!isDark)}
            style={{
              padding: "10px",
              borderRadius: "10px",
              background: isDark
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,0,0,0.06)",
              border: "none",
              cursor: "pointer",
              color: textColor,
            }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* DESKTOP NAV */}
          <nav
            className="desktop-nav"
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            {[
              { id: "landing", label: "Home" },
              { id: "event", label: "Events" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setCurrentPage(btn.id)}
                style={{
                  padding: "10px 20px",
                  fontSize: "0.95rem",
                  borderRadius: "8px",
                  border:
                    currentPage === btn.id
                      ? `2px solid ${isDark ? "#38bdf8" : "#2563eb"}`
                      : "2px solid transparent",
                  background:
                    currentPage === btn.id
                      ? isDark
                        ? "rgba(56, 189, 248, 0.15)"
                        : "rgba(37, 99, 235, 0.12)"
                      : "transparent",
                  color:
                    currentPage === btn.id
                      ? isDark
                        ? "#38bdf8"
                        : "#2563eb"
                      : textColor,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "0.2s",
                }}
              >
                {btn.label}
              </button>
            ))}
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            className="mobile-btn"
            onClick={() => setOpen(!open)}
            style={{
              display: "none",
              padding: 10,
              borderRadius: 10,
              border: "none",
              background: isDark
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,0,0,0.06)",
              color: textColor,
              cursor: "pointer",
            }}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div
          className="mobile-menu"
          style={{
            padding: "16px 22px",
            display: "none",
            borderTop: `1px solid ${
              isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
            }`,
          }}
        >
          {["landing", "event"].map((p) => (
            <button
              key={p}
              onClick={() => {
                setCurrentPage(p);
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "8px",
                marginBottom: "10px",
                background:
                  currentPage === p
                    ? isDark
                      ? "#1e3a8a"
                      : "#dbeafe"
                    : "transparent",
                color:
                  currentPage === p
                    ? isDark
                      ? "white"
                      : "#1e3a8a"
                    : textColor,
                textAlign: "left",
                border: "none",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              {p === "landing" ? "Home" : "Events"}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-btn { display: block !important; }
          .mobile-menu { display: block !important; }
        }
      `}</style>
    </header>
  );
};

export default Header;



// 7B2CcykLdNlyXOR+OG2qgw==1qihR8mLJaQO0lnb
