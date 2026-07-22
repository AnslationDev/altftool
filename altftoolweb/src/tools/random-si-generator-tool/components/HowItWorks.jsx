import React from "react";
import { Box, Typography } from "@mui/material";
import {
    Lightbulb as IdeaIcon,
    AutoAwesome as MagicIcon,
    TrendingUp as TrendIcon,
} from "@mui/icons-material";

export default function HowItWorks({ darkMode }) {
    const theme = {
        bg: darkMode ? "#0d1117" : "#ffffff",
        cardBg: darkMode ? "#161b22" : "#f3f4f6",
        text: darkMode ? "#e6edf3" : "#1f2937",
        textMuted: darkMode ? "#9ca3af" : "#6b7280",
        accent: "#7c3aed",
    };

    const steps = [
        {
            icon: <IdeaIcon sx={{ fontSize: 36 }} />,
            title: "1. Enter Your Keywords",
            desc: "Describe your interests, industry, skills, or market. The AI uses this to understand your direction.",
        },
        {
            icon: <MagicIcon sx={{ fontSize: 36 }} />,
            title: "2. AI Generates Ideas",
            desc: "Our engine analyzes trends, business models & competitors, producing unique high-value startup ideas.",
        },
        {
            icon: <TrendIcon sx={{ fontSize: 36 }} />,
            title: "3. Get Full Insights",
            desc: "Receive name ideas, market potential, monetization models, and execution steps instantly.",
        },
    ];

    return (
        <Box id="how-it-works" sx={{  py: 10, px: 3 }}>
            <Box sx={{ maxWidth: "1300px", mx: "auto", textAlign: "center" }}>
                {/* Title */}
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        mb: 6,
                        background: "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    How It Works
                </Typography>

                {/* Steps Grid */}
                <Box
                    sx={{
                        display: "grid",
                        gap: 4,
                        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    }}
                >
                    {steps.map((step, index) => (
                        <Box
                            key={index}
                            sx={{
                                p: 4,
                                borderRadius: 3,
                                background: theme.cardBg,
                                border: `1px solid ${darkMode ? "#292e36" : "#e5e7eb"}`,
                                textAlign: "center",
                                transition: "0.3s",
                                "&:hover": {
                                    transform: "translateY(-6px)",
                                    boxShadow: darkMode
                                        ? "0 10px 30px rgba(0,0,0,0.4)"
                                        : "0 10px 25px rgba(0,0,0,0.1)",
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 60,
                                    height: 60,
                                    mx: "auto",
                                    mb: 2,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    background: "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)",
                                }}
                            >
                                {step.icon}
                            </Box>

                            <Typography sx={{ fontSize: 18, fontWeight: 700, color: theme.text }}>
                                {step.title}
                            </Typography>

                            <Typography
                                sx={{
                                    color: theme.textMuted,
                                    mt: 1,
                                    fontSize: 15,
                                    lineHeight: 1.6,
                                }}
                            >
                                {step.desc}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
