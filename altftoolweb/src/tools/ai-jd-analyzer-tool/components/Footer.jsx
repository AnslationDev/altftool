import React from "react";
import { Box } from "@mui/material";

// ===== ICON COMPONENTS =====
const Twitter = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
);

const GitHub = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
    </svg>
);

const LinkedIn = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
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
export default function Footer({ isDark }) {
    const theme = {
        bg: isDark ? "#0d1117" : "#f9fafb",
        cardBg: isDark ? "#161b22" : "#ffffff",
        text: isDark ? "#e6edf3" : "#1f2937",
        textMuted: isDark ? "#9ca3af" : "#6b7280",
        border: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
        accent: "#ff5722",
    };

    const iconButtonStyle = {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: theme.cardBg,
        border: "1px solid transparent",
        color: theme.textMuted,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.25s ease",
    };

    return (
        <Box component="footer" sx={{ background: theme.bg }}>
            <Box sx={{ maxWidth: "1400px", mx: "auto", px: 4 }}>
                {/* TOP SECTION */}
                <Box sx={{ py: { xs: 5, md: 7 } }}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: 6,
                        }}
                    >
                        {/* LOGO + SOCIAL */}
                        <Box sx={{ maxWidth: 360 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    mb: 2,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                    }}
                                >
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
                            </Box>

                            <p
                                style={{
                                    color: theme.textMuted,
                                    lineHeight: 1.7,
                                    fontSize: "15px",
                                    marginBottom: "24px",
                                }}
                            >
                                Smart tool that evaluates job descriptions, detects issues,
                                scores quality, and rewrites professionally using powerful AI.
                            </p>

                            <Box sx={{ display: "flex", gap: 1.5 }}>
                                {[Twitter, GitHub, LinkedIn].map((Icon, i) => (
                                    <button
                                        key={i}
                                        style={iconButtonStyle}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = theme.accent;
                                            e.currentTarget.style.color = "#fff";
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = theme.cardBg;
                                            e.currentTarget.style.color = theme.textMuted;
                                            e.currentTarget.style.transform = "translateY(0)";
                                        }}
                                    >
                                        <Icon />
                                    </button>
                                ))}
                            </Box>
                        </Box>

                        {/* LINK SECTIONS - MODIFIED */}
                        {[
                            {
                                title: "Quick Links",

                                links: [
                                    "Features",
                                    "How_it_works",
                                    "FAQ",
                                    "Privacy",
                                ],
                            },
                        ].map((section) => (
                            <Box key={section.title}>
                                <h4
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: "700",
                                        color: theme.text,
                                        marginBottom: 20,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                    }}
                                >
                                    {section.title}
                                </h4>

                                <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {section.links.map((link) => (
                                        <a
                                            key={link}
                                            href={`#${link.toLowerCase().replace(/_/g, '-')}`}
                                            style={{
                                                fontSize: "15px",
                                                color: theme.textMuted,
                                                textDecoration: "none",
                                                transition: "color 0.25s ease",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = theme.accent)}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
                                        >

                                            {link.replace(/_/g, ' ')}
                                        </a>
                                    ))}
                                </nav>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* BOTTOM BAR */}
                <Box
                    sx={{
                        borderTop: `1px solid ${theme.border}`,
                        py: 3,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    <p style={{ color: theme.textMuted, fontSize: 14, margin: 0 }}>
                        © {new Date().getFullYear()} AI Job Description Analyzer — All rights reserved.
                    </p>

                    <Box sx={{ display: "flex", gap: 3 }}>
                        {["Privacy", "Terms", "Security"].map((item) => (
                            <a
                                key={item}

                                href={`#${item.toLowerCase()}`}
                                style={{
                                    color: theme.textMuted,
                                    textDecoration: "none",
                                    fontSize: 14,
                                    transition: "color 0.25s ease",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = theme.accent)}
                                onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
                            >
                                {item}
                            </a>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}