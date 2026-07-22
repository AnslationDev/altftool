import React, { useState } from "react";

// ===== ICON COMPONENTS =====
const MenuIcon = () => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const CloseIcon = () => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const SparklesIcon = () => (
    <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 3v18M3 12h18M6.5 6.5l11 11M6.5 17.5l11-11" />
    </svg>
);

// ===== HEADER COMPONENT =====
export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    const theme = {
        bg: "#ffffff",
        cardBg: "#ffffff",
        text: "#1f2937",
        textMuted: "#6b7280",
        border: "rgba(0,0,0,0.08)",
        accent: "#ff5722",
    };

    const navLinkStyle = {
        fontSize: "15px",
        fontWeight: 500,
        color: theme.textMuted,
        cursor: "pointer",
        transition: "color 0.25s ease",
        textDecoration: "none",
        display: "block",
    };

    const iconButtonStyle = {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        border: "none",
        background: theme.cardBg,
        color: theme.textMuted,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.25s ease",
        flexShrink: 0,
    };

    const mobileMenuStyle = {
        position: "sticky",
        top: "75px",
        left: 0,
        right: 0,
        background: theme.bg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "24px 32px",
        display: menuOpen ? "flex" : "none",
        flexDirection: "column",
        gap: "20px",
        borderBottom: `1px solid ${theme.border}`,
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
        zIndex: 99,
    };

    return (
        <>
            <header
                style={{
                    background: theme.bg,
                    borderBottom: `1px solid ${theme.border}`,
                    position: "sticky",
                     top: { xs: "116px", md: "64px" },

                }}
            >
                <div
                    style={{
                        maxWidth: "1400px",
                        margin: "0 auto",
                        padding: "0 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: "75px",
                    }}
                >
                    {/* LOGO */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                background: `linear-gradient(135deg, ${theme.accent}, #7c3aed)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(255, 87, 34, 0.3)",
                                color: "#ffffff",
                            }}
                        >
                            <SparklesIcon />
                        </div>
                        <div>
                            <h1
                                style={{
                                    fontSize: "20px",
                                    fontWeight: 700,
                                    color: theme.text,
                                    margin: 0,
                                    lineHeight: 1,
                                }}
                            >
                                CareerLens AI
                            </h1>

                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "32px",
                        }}
                        className="desktop-nav"
                    >
                        {["Features", "How It Works", "FAQ", "Privacy"].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                                style={navLinkStyle}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.color = theme.accent)
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color = theme.textMuted)
                                }
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            style={{
                                ...iconButtonStyle,
                                display: "none",
                            }}
                            className="mobile-menu-btn"
                            aria-label="Toggle Menu"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = theme.accent;
                                e.currentTarget.style.color = "#ffffff";
                                e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = theme.cardBg;
                                e.currentTarget.style.color = theme.textMuted;
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        >
                            {menuOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <div style={mobileMenuStyle}>
                {[ "Features", "How It Works", "FAQ", "Privacy"].map((item) => (
                    <a
                        key={item}
                        href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                        style={{
                            ...navLinkStyle,
                            padding: "12px 0",
                            fontSize: "16px",
                        }}
                        onClick={() => setMenuOpen(false)}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.color = theme.accent)
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.color = theme.textMuted)
                        }
                    >
                        {item}
                    </a>
                ))}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: inline-flex !important;
                    }
                }

                @media (min-width: 769px) {
                    .mobile-menu-btn {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
}
