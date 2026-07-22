import React from "react";
import { Box, Typography} from "@mui/material";
import {
    Lightbulb as LightbulbIcon,
} from "@mui/icons-material";

// ===== SOCIAL ICONS =====
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

export default function Footer({ darkMode }) {
    // ----- Theme Colors -----
    const theme = {
        bg: darkMode ? "#0d1117" : "#f9fafb",
        cardBg: darkMode ? "#161b22" : "#ffffff",
        text: darkMode ? "#e6edf3" : "#1f2937",
        textMuted: darkMode ? "#9ca3af" : "#6b7280",
        accent: "#7c3aed",
        border: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    };

    const socialButton = {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: theme.cardBg,
        border: "1px solid transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.textMuted,
        cursor: "pointer",
        transition: "all .25s ease",
    };

    // 🔑 UPDATED: This array contains the correct link text and anchor hrefs
    const section = [
        { text: 'How It Works', href: '#how-it-works' },
        { text: 'Generate', href: '#generate' },
        { text: 'FAQ', href: '#faq' },
        { text: 'Privacy', href: '#privacy' },
    ];

    return (
        <Box component="footer" sx={{ background: theme.bg, pt: 6 }}>
            <Box sx={{ maxWidth: "1300px", mx: "auto", px: 3 }}>

                {/* TOP SECTION */}
                <Box sx={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>

                    {/* LOGO + TEXT */}
                    <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    background: "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <LightbulbIcon sx={{ color: "#fff", fontSize: 28 }} />
                            </Box>

                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    background: "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                Startup Idea Generator
                            </Typography>
                        </Box>

                        <Typography sx={{ color: theme.textMuted, mt: 2, fontSize: "15px", lineHeight: 1.7 }}>
                            Generate your next million-dollar startup idea <br></br> instantly with AI-powered idea creation.
                        </Typography>

                        {/* SOCIAL ICONS */}
                        <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
                            {[Twitter, GitHub, LinkedIn].map((Icon, i) => (
                                <Box
                                    key={i}
                                    component="button"
                                    style={socialButton}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = theme.accent;
                                        e.currentTarget.style.color = "#fff";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = theme.cardBg;
                                        e.currentTarget.style.color = theme.textMuted;
                                    }}
                                >
                                    <Icon />
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* LINK SECTIONS */}
                    {[
                        {
                            title: "Quick Links",
                            links: section, // 🔑 Using the section array here
                        },

                    ].map((linkSection) => ( // ⚠️ Renamed from 'section' to 'linkSection' for clarity
                        <Box key={linkSection.title}>
                            <Typography
                                sx={{
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    color: theme.text,
                                    mb: 2,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                }}
                            >
                                {linkSection.title}
                            </Typography>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                {linkSection.links.map((linkItem) => ( // 🔑 Now mapping over objects {text, href}
                                    <Typography
                                        key={linkItem.text}
                                        component="a"
                                        href={linkItem.href} // 🔑 Use the correct href for navigation
                                        sx={{
                                            fontSize: "15px",
                                            color: theme.textMuted,
                                            textDecoration: "none",
                                            transition: ".25s",
                                            "&:hover": { color: theme.accent }
                                        }}
                                    >
                                        {linkItem.text} {/* 🔑 Use the correct text */}
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* BOTTOM BAR */}
            <Box
                sx={{
                    borderTop: `1px solid ${theme.border}`,
                    py: 3,
                    mt: 5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    px: 3,
                }}
            >
                <Typography sx={{ color: theme.textMuted, fontSize: 14 }}>
                    © {new Date().getFullYear()} Startup Idea Generator — Built for creators.
                </Typography>

                <Box sx={{ display: "flex", gap: 3 }}>
                    {["Privacy", "Terms", "Security"].map((item) => (
                        <Typography
                            key={item}
                            component="a"
                            href={`#${item.toLowerCase()}`} // 💡 Added simple href for bottom links
                            sx={{
                                color: theme.textMuted,
                                fontSize: 14,
                                textDecoration: "none",
                                transition: ".25s",
                                "&:hover": { color: theme.accent }
                            }}
                        >
                            {item}
                        </Typography>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
