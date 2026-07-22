import React from "react";
import { Box, Container, Typography } from "@mui/material";

// ===== ICONS (inline SVGs) =====
const ShieldAI = ({ stroke = "currentColor" }) => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
        <path d="M12 22s7-4 7-10V6l-7-3-7 3v6c0 6 7 10 7 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const Browser = ({ stroke = "currentColor" }) => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <line x1="2" y1="7" x2="22" y2="7" />
        <circle cx="6" cy="5" r="1" />
        <circle cx="9" cy="5" r="1" />
    </svg>
);

const Lock = ({ stroke = "currentColor" }) => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

// ==================== MAIN COMPONENT ====================
export default function Privacy({ isDark = false }) {


    const theme = {
        bg: isDark ? "#0d1117" : "#f9fafb",
        cardBg: isDark ? "#161b22" : "#ffffff",
        text: isDark ? "#e6edf3" : "#1f2937",
        textMuted: isDark ? "#9ca3af" : "#6b7280",
        border: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
        accent: "#ff5722",
        accentAlt: "#7c3aed",
    };


    const privacyFeatures = [
        {
            icon: <Browser stroke="#fff" />,
            title: "Runs 100% in Your Browser",
            description: "All analysis and rewriting happen locally on your device—no uploads required.",
            gradient: `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
        },
        {
            icon: <Lock stroke="#fff" />,
            title: "No Logs or Tracking",
            description: "We don't save, store, transmit, or sell your job descriptions or analysis outputs.",
            gradient: `linear-gradient(135deg, #a855f7, #ec4899)`,
        },
        {
            icon: <ShieldAI stroke="#fff" />,
            title: "AI Safety & Encryption",
            description: "All rewrites and suggestions remain private and can be exported locally only.",
            gradient: `linear-gradient(135deg, #06b6d4, #6366f1)`,
        },
    ];


    React.useEffect(() => {
        const prevBg = document.body.style.backgroundColor;
        const prevColor = document.body.style.color;
        document.body.style.backgroundColor = theme.bg;
        document.body.style.color = theme.text;


        return () => {
            document.body.style.backgroundColor = prevBg;
            document.body.style.color = prevColor;
        };
    }, [isDark, theme.bg, theme.text]);


    const iconBoxStyle = {
        width: 80,
        height: 80,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        marginBottom: "20px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        transition: "transform 0.45s ease, box-shadow 0.35s",
        position: "relative",
        zIndex: 2,
    };


    const cardBaseSx = {
        borderRadius: "16px",
        padding: { xs: "28px 20px", md: "40px 32px" },
        textAlign: "center",
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        transition: "all 0.3s ease",
        cursor: "pointer",

        boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.2)" : "0 4px 12px rgba(0,0,0,0.05)",

    };


    const badgeStyle = {
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 22px",
        borderRadius: "20px",
        color: theme.accent,
        fontWeight: 700,
        fontSize: 13,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        background: isDark
            ? "rgba(255, 87, 34, 0.1)"
            : "rgba(255, 87, 34, 0.08)",
        border: `1px solid ${isDark ? "rgba(255, 87, 34, 0.2)" : "rgba(255, 87, 34, 0.15)"}`,
        mb: 2,
    };


    const headingStyle = {
        fontWeight: 800,
        lineHeight: 1.2,
        marginBottom: 2,
        color: theme.text,
    };

    return (
        <Box
            id="privacy"
            component="section"
            aria-labelledby="privacy-heading"
            sx={{
                px: { xs: 3, md: 6 },
                py: { xs: 8, md: 12 },
                position: "relative",
                overflow: "hidden",
                background: theme.bg,
            }}
        >

            <Box
                sx={{
                    position: "absolute",
                    top: "-10%",
                    left: "-8%",
                    width: { xs: 240, md: 420 },
                    height: { xs: 240, md: 420 },
                    background: isDark
                        ? "radial-gradient(circle, rgba(255,95,109,0.04) 0%, transparent 60%)"
                        : "radial-gradient(circle, rgba(255,120,78,0.12) 0%, transparent 60%)",
                    borderRadius: "50%",
                    filter: "blur(90px)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    bottom: "-10%",
                    right: "-6%",
                    width: { xs: 240, md: 420 },
                    height: { xs: 240, md: 420 },
                    background: isDark
                        ? "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 60%)"
                        : "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 60%)",
                    borderRadius: "50%",
                    filter: "blur(110px)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            {/* Container */}
            <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
                {/* Header */}
                <Box textAlign="center" mb={{ xs: 6, md: 10 }}>
                    <Box display="flex" justifyContent="center" mb={3}>
                        <Box sx={badgeStyle}>🔐 Privacy First</Box>
                    </Box>

                    <Typography
                        id="privacy-heading"
                        component="h2"
                        sx={{
                            ...headingStyle,
                            fontSize: { xs: "32px", md: "44px" },
                            maxWidth: 1000,
                            mx: "auto",
                            color: theme.text,
                        }}
                    >
                        A Secure Way to Analyze Job Descriptions
                    </Typography>

                    <Typography
                        sx={{
                            color: theme.textMuted,
                            fontSize: "18px",
                            maxWidth: 880,
                            mx: "auto",
                            lineHeight: 1.7,
                        }}
                    >
                        Our AI Job Description Analyzer is built with a privacy-first architecture — every
                        analysis, comparison, and rewrite runs locally on your device unless you explicitly
                        export or share the result.
                    </Typography>
                </Box>


                <Box display="flex" justifyContent="center" mb={{ xs: 6, md: 10 }}>
                    <Box
                        sx={{
                            width: { xs: 160, md: 200 },
                            height: { xs: 160, md: 200 },
                            borderRadius: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                            transform: "translateZ(0)",

                        }}
                    >
                        <Box
                            sx={{
                                width: 110,
                                height: 110,
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: isDark
                                    ? "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))"
                                    : "rgba(255,255,255,0.2)",
                                boxShadow: isDark ? "inset 0 1px 0 rgba(255,255,255,0.08)" : "none",
                            }}
                        >
                            <ShieldAI stroke="#fff" />
                        </Box>
                    </Box>
                </Box>

                {/* Subtitle */}
                <Box textAlign="center" mb={{ xs: 4, md: 8 }}>
                    <Typography sx={{ color: theme.textMuted, maxWidth: 920, mx: "auto", fontSize: "15px" }}>
                        Your job descriptions stay on your machine. No servers, no hidden tracking, and no data
                        retention unless you choose to export or save.
                    </Typography>
                </Box>

                {/* Feature Cards Grid */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
                        gap: { xs: 3, md: 4 },
                        alignItems: "stretch",
                    }}
                >
                    {privacyFeatures.map((f, idx) => (
                        <Box
                            key={f.title}
                            sx={{
                                ...cardBaseSx,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                "&:hover": {
                                    transform: "translateY(-4px)",
                                    boxShadow: isDark
                                        ? "0 12px 32px rgba(0,0,0,0.4)"
                                        : "0 12px 32px rgba(0,0,0,0.1)",
                                    borderColor: theme.accent,
                                },
                            }}
                        >
                            {/* Icon Box */}
                            <Box
                                sx={{
                                    ...iconBoxStyle,
                                    background: f.gradient,
                                }}
                                aria-hidden
                            >
                                {React.cloneElement(f.icon, { stroke: "#fff" })}
                            </Box>

                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 700, mb: 1.5, color: theme.text, fontSize: "20px" }}
                            >
                                {f.title}
                            </Typography>

                            <Typography sx={{ color: theme.textMuted, fontSize: "15px", maxWidth: 340 }}>
                                {f.description}
                            </Typography>
                        </Box>
                    ))}
                </Box>


            </Container>

        </Box>
    );
}