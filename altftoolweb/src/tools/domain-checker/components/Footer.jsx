import React from "react";
import { Box } from "@mui/material";


// ===== ICON COMPONENTS =====
const Shield = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
);

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

// ===== FOOTER COMPONENT =====
export default function Footer({ isDark }) {
    const theme = {
        // bg: isDark ? "#0a0e27" : "#f8f9fa",
        cardBg: isDark ? "#141b3d" : "#ffffff",
        bg: isDark
          ? "linear-gradient(135deg, #1a102b 0%, #3a1f5d 50%, #5b21b6 100%)"
          : "linear-gradient(135deg, #e0f2fe 0%, #c7d2fe 50%, #f3e8ff 100%)",
        text: isDark ? "#e8eaed" : "#1a1a1a",
        textMuted: isDark ? "#9ca3af" : "#6b6b6b",
        border: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
        accent: isDark ? "#3b82f6" : "#2563eb",
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
    };

    return (
        <Box component="footer">
            <Box
                sx={{
                    maxWidth: "1400px",
                    mx: "auto",
                    px: 4,
                }}
            >
                {/* --- UPPER SECTION --- */}
                <Box sx={{ py: { xs: 5, md: 7 } }}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: 6,
                        }}
                    >
                        {/* LOGO + SOCIALS */}
                        <Box sx={{ maxWidth: 360 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                                <div style={{ color: theme.accent }}>
                                    <Shield />
                                </div>
                                <h3 style={{
                                    fontSize: "24px",
                                    fontWeight: 600,
                                    margin: 0,
                                    letterSpacing: "-0.02em",
                                    background: !isDark
                                        ? "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)"
                                        : "none",
                                    WebkitBackgroundClip: !isDark ? "text" : "unset",
                                    WebkitTextFillColor: isDark ? "#fff" : "transparent",

                                }}>
                                    DomainChecker
                                </h3>

                            </Box>

                            <p
                                style={{
                                    color: theme.textMuted,
                                    lineHeight: 1.7,
                                    fontSize: "15px",
                                    marginBottom: "24px",
                                }}
                            >
                               Instantly check domain availability and verify ownership.
                                <br />
                                Secure, fast, and built for modern web developers.
                            </p>

                            <Box sx={{ display: "flex", gap: "10px" }}>
                                {[Twitter, GitHub, LinkedIn].map((Icon, idx) => (
                                    <button
                                        key={idx}
                                        style={iconButtonStyle}
                                        aria-label="Social Media"
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = theme.accent;
                                            e.currentTarget.style.color = "#ffffff";
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

                        {/* FOOTER LINKS */}
                        {[

                            { title: "Quick Links", links: ["Features", "FAQ", "Privacy"] },
                        ].map((section) => (
                            <Box key={section.title}>
                                <h4
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: 700,
                                        color: theme.text,
                                        marginBottom: "20px",
                                        letterSpacing: "0.05em",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {section.title}
                                </h4>

                                <nav
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px",
                                    }}
                                >
                                    {section.links.map((link) => (
                                        <a
                                            key={link}
                                            href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                                            style={{
                                                color: theme.textMuted,
                                                textDecoration: "none",
                                                fontSize: "15px",
                                                transition: "color 0.25s ease",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = theme.accent)}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
                                        >
                                            {link}
                                        </a>
                                    ))}

                                </nav>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* --- BOTTOM BAR --- */}
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
                    <p
                        style={{
                            color: theme.textMuted,
                            fontSize: "14px",
                            margin: 0,
                        }}
                    >
                        © {new Date().getFullYear()} DomainChecker. All rights reserved.
                    </p>

                    <Box sx={{ display: "flex", gap: "24px" }}>
                        {["Privacy", "Terms", "Security"].map((item) => (
                            <a
                                key={item}
                                href="#"
                                style={{
                                    color: theme.textMuted,
                                    textDecoration: "none",
                                    fontSize: "14px",
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
