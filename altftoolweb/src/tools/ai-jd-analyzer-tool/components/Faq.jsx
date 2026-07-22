import React, { useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardActionArea,
    Collapse,
    IconButton,

} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function FAQ({ isDark }) {
    const [openIndex, setOpenIndex] = useState(null);



    const theme = {
        bg: isDark ? "#0d1117" : "#f9fafb",
        cardBg: isDark ? "#161b22" : "#ffffff",
        text: isDark ? "#e6edf3" : "#1f2937",
        textMuted: isDark ? "#9ca3af" : "#6b7280",
        border: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
        accent: "#ff5722",
    };

    const faqs = [
        {
            question: "What does AI Job Description Analyzer do?",
            answer:
                "It uses AI to analyze job descriptions, detect issues, highlight missing skills, check readability, and rewrite professionally.",
        },
        {
            question: "What kind of problems can it detect?",
            answer:
                "The AI detects unclear phrases, bias, skill gaps, unrealistic requirements, missing responsibilities, jargon-heavy content, and outdated terminology.",
        },
        {
            question: "Who can use this tool?",
            answer:
                "HR teams, recruiters, developers, managers, freelancers — anyone writing job descriptions.",
        },
        {
            question: "Does it support multiple job roles?",
            answer:
                "Yes! The AI adapts to Developer, Analyst, Designer, HR Manager, and any custom roles.",
        },
        {
            question: "Is my job description stored?",
            answer:
                "No. Nothing is stored or tracked. Everything stays in your browser only.",
        },
        {
            question: "Is it free?",
            answer: "Yes! Unlimited JD analysis without login or signup.",
        },
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <Box
            id="faq"
            sx={{
                py: 10,
                px: 2,
                background: theme.bg,
            }}
        >
            <Box maxWidth="900px" mx="auto">
                {/* Title Section */}
                <Box textAlign="center" mb={8}>
                    <Box
                        sx={{
                            display: "inline-block",
                            color: theme.accent,
                            borderRadius: "20px",
                            border: `1px solid ${isDark
                                ? "rgba(255, 87, 34, 0.25)"
                                : "rgba(255, 87, 34, 0.2)"}`,
                            background: isDark
                                ? "rgba(255, 87, 34, 0.1)"
                                : "rgba(255, 87, 34, 0.08)",
                            px: 3,
                            py: 1,
                            fontWeight: 700,
                            fontSize: "13px",
                            letterSpacing: "0.08em",
                        }}
                    >
                        FAQ
                    </Box>

                    <Typography
                        variant="h3"
                        fontWeight={800}
                        mt={2}
                        mb={1}
                        sx={{
                            color: theme.text,
                            fontSize: { xs: "32px", sm: "44px" },
                        }}
                    >
                        Frequently Asked Questions
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: "18px",
                            color: theme.textMuted,
                            maxWidth: "650px",
                            mx: "auto",
                            lineHeight: 1.7,
                        }}
                    >
                        Everything you need to know about the AI Job Description Analyzer Tool.
                    </Typography>
                </Box>

                {/* FAQ List */}
                <Box display="flex" flexDirection="column" gap={2}>
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <Card
                                key={index}
                                sx={{
                                    background: theme.cardBg,
                                    borderRadius: "16px",
                                    border: `1px solid ${isOpen ? theme.accent : theme.border}`,
                                    transition: "all 0.3s ease",
                                }}
                            >
                                <CardActionArea
                                    onClick={() => toggleFAQ(index)}
                                    sx={{
                                        px: 3,
                                        py: 3,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: "18px",
                                            fontWeight: 600,
                                            color: theme.text,
                                        }}
                                    >
                                        {faq.question}
                                    </Typography>

                                    <IconButton
                                        disableRipple
                                        sx={{
                                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                                            transition: "0.3s",
                                            color: isOpen ? theme.accent : theme.textMuted,
                                        }}
                                    >
                                        <ExpandMoreIcon />
                                    </IconButton>
                                </CardActionArea>

                                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                    <Box
                                        px={3}
                                        pb={3}
                                        sx={{
                                            color: theme.textMuted,
                                            fontSize: "16px",
                                            lineHeight: 1.7,
                                        }}
                                    >
                                        {faq.answer}
                                    </Box>
                                </Collapse>
                            </Card>
                        );
                    })}
                </Box>


            </Box>
        </Box>
    );
}
