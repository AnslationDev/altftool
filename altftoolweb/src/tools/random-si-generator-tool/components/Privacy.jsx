import React from "react";
import { Box, Container, Typography, useTheme, Paper } from "@mui/material";

// Note: Removed the unused 'useMuiTheme as useMuiTheme' alias. Using standard useTheme.

// ===== ICONS (inline SVGs) =====
const ShieldAI = ({ stroke = "currentColor" }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s7-4 7-10V6l-7-3-7 3v6c0 6 7 10 7 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const CloudOff = ({ stroke = "currentColor" }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.61 14.15A10 10 0 0 0 16.5 6H13a3 3 0 0 0-3-3l-2.61 2.61M5.03 17.5A4 4 0 1 1 5 17" />
        <path d="M14.5 13.5a4 4 0 0 0-3.5 1.5M2 2l20 20" />
    </svg>
);

const Browser = ({ stroke = "currentColor" }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <line x1="2" y1="7" x2="22" y2="7" />
        <line x1="6" y1="11" x2="6" y2="15" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="13" />
    </svg>
);

const Lock = ({ stroke = "currentColor" }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="16" r="1" />
    </svg>
);

// ==================== MAIN COMPONENT ====================
// isDark prop is only needed if you are not using MUI's ThemeProvider correctly.
// For best practice, we use useTheme().palette.mode to determine dark/light mode.
export default function Privacy() {
    const theme = useTheme(); // Use standard MUI theme hook
    const isDark = theme.palette.mode === 'dark';

    // MUI Palette mapping for dynamic colors
    const colors = {
        bg: theme.palette.background.default,
        cardBg: theme.palette.background.paper, // Use paper for card background
        text: theme.palette.text.primary,
        textMuted: theme.palette.text.secondary,
        accent: theme.palette.primary.main,
        border: theme.palette.divider,

        // Define shadow dynamically
        shadow: isDark
            ? "0 4px 12px rgba(0,0,0,0.6)"
            : "0 4px 12px rgba(0,0,0,0.06)",
    };

    // Privacy features items (content focused for AI JD Analyzer)
    const privacyFeatures = [
        {
            icon: <Browser />,
            title: "Local Processing Only",
            description: "All analysis is performed directly in your web browser. Your data never leaves your device.",
        },
        {
            icon: <CloudOff />,
            title: "Zero Server Storage",
            description: "Job descriptions are not transmitted, stored, or logged on our servers at any time.",
        },
        {
            icon: <Lock />,
            title: "No Tracking & Analytics",
            description: "We use no third-party cookies, tracking scripts, or analytical tools on this page.",
        },
        {
            icon: <ShieldAI />,
            title: "Encrypted & Confidential",
            description: "All communication (if any) is secured via HTTPS/TLS, keeping data confidential.",
        },
    ];

    // Card style - Minimalist, Defined Border
    const cardBaseSx = {
        borderRadius: 3,
        padding: { xs: "24px", md: "32px" },
        textAlign: "left",
        background: colors.cardBg,
        border: `2px solid ${colors.border}`,
        boxShadow: colors.shadow,
        transition: "transform 0.3s ease, border-color 0.3s ease",

        "&:hover": {
            transform: "translateY(-4px)",
            borderColor: colors.accent,
        },
    };

    // Icon Box Styles
    const iconBoxStyle = {
        width: 56,
        height: 56,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 2,
        // Dynamic background for icon container
        background: isDark ? theme.palette.action.hover : theme.palette.primary.light + '1A', // Subtler accent background
        color: colors.accent,
        boxShadow: isDark ? 'none' : theme.shadows[1],
    }

    return (
        <Box
            id="privacy"
            component="section"
            aria-labelledby="privacy-heading"
            sx={{
                px: { xs: 3, md: 6 },
                py: { xs: 8, md: 16 },
                background: colors.bg, // Ensure background uses theme color
                color: colors.text,
            }}
        >
            <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>

                {/* Header */}
                <Box textAlign="center" mb={{ xs: 6, md: 10 }}>

                    <Typography
                        id="privacy-heading"
                        component="h2"
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: "32px", md: "52px" },
                            marginBottom: 2,
                            color: colors.accent, // Main heading is accent color
                        }}
                    >
                        Security & Privacy
                    </Typography>

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: colors.text,
                            marginBottom: 3,
                            fontSize: { xs: "20px", md: "28px" },
                        }}
                    >
                        A Zero-Data Approach to JD Analysis
                    </Typography>

                    <Typography
                        sx={{
                            color: colors.textMuted,
                            fontSize: { xs: 16, md: 19 },
                            maxWidth: 900,
                            mx: "auto",
                            lineHeight: 1.7
                        }}
                    >
                        We built this tool for recruiters and hiring managers who need peace of mind. Your confidential job details are processed securely and locally, prioritizing your privacy above all else.
                    </Typography>
                </Box>

                {/* Feature Cards Grid */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
                        gap: { xs: 3, md: 4 },
                        alignItems: "stretch",
                    }}
                >
                    {privacyFeatures.map((f, idx) => (
                        <Paper // Use Paper component for better theme integration
                            key={f.title}
                            elevation={0}
                            sx={{
                                ...cardBaseSx,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                justifyContent: "flex-start",
                            }}
                        >
                            {/* Icon Box */}
                            <Box sx={iconBoxStyle} aria-hidden>
                                {/* Clone element to pass the accent color and set size */}
                                {React.cloneElement(f.icon, { stroke: colors.accent, width: "24", height: "24" })}
                            </Box>

                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    mb: 1,
                                    color: colors.text,
                                    fontSize: 18,
                                    textAlign: 'left'
                                }}
                            >
                                {f.title}
                            </Typography>

                            <Typography sx={{ color: colors.textMuted, fontSize: 14, textAlign: 'left' }}>
                                {f.description}
                            </Typography>
                        </Paper>
                    ))}
                </Box>

            </Container>
        </Box>
    );
}
