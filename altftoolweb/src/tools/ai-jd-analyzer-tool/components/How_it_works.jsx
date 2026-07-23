"use client";

import React from "react";
import { Box, Container, Typography } from "@mui/material";

// ===== ICON COMPONENTS =====
const UploadIcon = () => (
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
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const AnalyzeIcon = () => (
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
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </svg>
);

const ResultsIcon = () => (
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
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

const RewriteIcon = () => (
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
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const CheckIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default function HowItWorks({ isDark }) {
    const theme = {
        bg: isDark ? "#0d1117" : "#f9fafb",
        cardBg: isDark ? "#161b22" : "#ffffff",
        text: isDark ? "#e6edf3" : "#1f2937",
        textMuted: isDark ? "#9ca3af" : "#6b7280",
        border: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
        accent: "#ff5722",
    };

    const steps = [
        {
            icon: <UploadIcon />,
            number: "01",
            title: "Upload Job Description",
            description:
                "Paste your job description text or upload a document. Our system supports multiple formats and instantly processes your content.",
            features: [
                "Copy-paste text directly",
                "Upload PDF/DOC files",
                "Instant processing",
            ],
        },
        {
            icon: <AnalyzeIcon />,
            number: "02",
            title: "AI Analysis",
            description:
                "Our advanced AI engine analyzes your JD across multiple dimensions including clarity, inclusivity, structure, and effectiveness.",
            features: [
                "Bias & discrimination detection",
                "Readability assessment",
                "SEO optimization check",
            ],
        },
        {
            icon: <ResultsIcon />,
            number: "03",
            title: "Get Detailed Report",
            description:
                "Receive a comprehensive analysis with scores, identified issues, and actionable recommendations for improvement.",
            features: [
                "Overall quality score",
                "Issue categorization",
                "Priority recommendations",
            ],
        },
        {
            icon: <RewriteIcon />,
            number: "04",
            title: "AI-Powered Rewrite",
            description:
                "Get a professionally rewritten job description that addresses all identified issues and follows best practices.",
            features: [
                "Inclusive language",
                "Clear structure",
                "Optimized for candidates",
            ],
        },
    ];

    return (
        <Box
            id="how-it-works"
            sx={{
                background: theme.bg,
                py: { xs: 8, md: 12 },

            }}
        >
            <Container maxWidth="lg">
                {/* HEADER */}
                <Box sx={{ textAlign: "center", mb: { xs: 6, md: 10 } }}>
                    <Typography
                        sx={{
                            display: "inline-block",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: theme.accent,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            mb: 2,
                            px: 3,
                            py: 1,
                            borderRadius: "20px",
                            background: isDark
                                ? "rgba(255, 87, 34, 0.1)"
                                : "rgba(255, 87, 34, 0.08)",
                            border: `1px solid ${isDark ? "rgba(255, 87, 34, 0.2)" : "rgba(255, 87, 34, 0.15)"}`,
                        }}
                    >
                        How It Works
                    </Typography>

                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: "32px", md: "44px" },
                            fontWeight: 800,
                            color: theme.text,
                            mb: 2,
                            lineHeight: 1.2,
                        }}
                    >
                        Simple, Fast, & Effective
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: "18px",
                            color: theme.textMuted,
                            maxWidth: "600px",
                            mx: "auto",
                            lineHeight: 1.7,
                        }}
                    >
                        Transform your job descriptions in just four easy steps with our
                        AI-powered analysis and rewriting tool.
                    </Typography>
                </Box>

                {/* STEPS */}
                <Box sx={{ position: "relative" }}>
                    {/* Connecting Line */}
                    <Box
                        sx={{
                            display: { xs: "none", md: "block" },
                            position: "absolute",
                            top: "80px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "80%",
                            height: "2px",
                            background: `linear-gradient(90deg, transparent, ${theme.border} 10%, ${theme.border} 90%, transparent)`,
                            zIndex: 0,
                        }}
                    />

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                                md: "repeat(4, 1fr)",
                            },
                            gap: 4,
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        {steps.map((step, index) => (
                            <Box
                                key={index}
                                sx={{
                                    position: "relative",
                                    textAlign: "center",
                                }}
                            >
                                {/* Icon Circle */}
                                <Box
                                    sx={{
                                        width: "80px",
                                        height: "80px",
                                        borderRadius: "50%",
                                        background: `linear-gradient(135deg, ${theme.accent}, #7c3aed)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#ffffff",
                                        margin: "0 auto 20px",
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                                        position: "relative",
                                        zIndex: 2,
                                    }}
                                >
                                    {step.icon}
                                </Box>

                                {/* Step Number */}
                                <Typography
                                    sx={{
                                        fontSize: "48px",
                                        fontWeight: 900,
                                        color: isDark
                                            ? "rgba(255, 255, 255, 0.03)"
                                            : "rgba(0, 0, 0, 0.03)",
                                        position: "absolute",
                                        top: "-10px",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        zIndex: 0,
                                        pointerEvents: "none",
                                    }}
                                >
                                    {step.number}
                                </Typography>

                                {/* Content Card */}
                                <Box
                                    sx={{
                                        height:"330px",
                                        background: theme.cardBg,
                                        border: `1px solid ${theme.border}`,
                                        borderRadius: "16px",
                                        padding: "24px",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: isDark
                                                ? "0 12px 32px rgba(0,0,0,0.4)"
                                                : "0 12px 32px rgba(0,0,0,0.1)",
                                            borderColor: theme.accent,
                                        },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: "20px",
                                            fontWeight: 700,
                                            color: theme.text,
                                            mb: 2,
                                        }}
                                    >
                                        {step.title}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "15px",
                                            color: theme.textMuted,
                                            lineHeight: 1.7,
                                            mb: 3,
                                        }}
                                    >
                                        {step.description}
                                    </Typography>

                                    {/* Features List */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 1.5,
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        {step.features.map((feature, i) => (
                                            <Box
                                                key={i}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: "20px",
                                                        height: "20px",
                                                        borderRadius: "50%",
                                                        background: isDark
                                                            ? "rgba(255, 87, 34, 0.15)"
                                                            : "rgba(255, 87, 34, 0.1)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: theme.accent,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <CheckIcon />
                                                </Box>
                                                <Typography
                                                    sx={{
                                                        fontSize: "14px",
                                                        color: theme.textMuted,
                                                        textAlign: "left",
                                                    }}
                                                >
                                                    {feature}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* CTA SECTION */}
                <Box
                    sx={{
                        textAlign: "center",
                        mt: { xs: 8, md: 12 },
                        p: { xs: 4, md: 6 },
                        background: `linear-gradient(135deg, ${theme.accent}, #7c3aed)`,
                        borderRadius: "24px",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            fontSize: { xs: "28px", md: "36px" },
                            fontWeight: 800,
                            color: "#ffffff",
                            mb: 2,
                        }}
                    >
                        Ready to Improve Your Job Descriptions?
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: "18px",
                            color: "rgba(255, 255, 255, 0.9)",
                            mb: 4,
                            maxWidth: "600px",
                            mx: "auto",
                        }}
                    >
                        Start analyzing and rewriting your job descriptions today with our
                        powerful AI tool.
                    </Typography>

                    <button
                        onClick={() =>
                            window.scrollTo({
                                top: document.getElementById("analyzer")?.offsetTop || 0,
                                behavior: "smooth",
                            })
                        }
                        style={{
                            background: "#ffffff",
                            color: theme.accent,
                            border: "none",
                            padding: "16px 40px",
                            borderRadius: "12px",
                            fontSize: "16px",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.25s ease",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                                "0 12px 32px rgba(0,0,0,0.2)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                                "0 8px 24px rgba(0,0,0,0.15)";
                        }}
                    >
                        Try It Now - It's Free
                    </button>
                </Box>
            </Container>
        </Box>
    );
}
