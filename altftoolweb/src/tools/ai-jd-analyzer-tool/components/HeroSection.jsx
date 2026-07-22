import React from "react";
import { Box, Typography, Paper, Stack } from "@mui/material";

const HeroSection = () => {
    const brandGradient =
        "linear-gradient(135deg, #FF5C24 0%, #FF2F7A 40%, #8A2BE2 100%)";

    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "70vh",

                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "space-between",

                px: { xs: 2, sm: 3, md: 6 },
                py: { xs: 4, md: 6 },

                gap: { xs: 4, md: 0 },
            }}
        >
            {/* LEFT SIDE */}
            <Box
                sx={{
                    maxWidth: { xs: "100%", md: "45%" },
                    textAlign: { xs: "center", md: "left" },
                }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        fontWeight: 800,
                        lineHeight: 1.1,
                        background: brandGradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",

                        fontSize: { xs: "30px", sm: "36px", md: "48px" },
                    }}
                >
                    Reveal the Hidden Journey Behind Every Job Description
                </Typography>

                <Typography
                    variant="h6"
                    sx={{
                        mt: 2,
                        color: "#4a4a4a",
                        fontWeight: 500,
                        maxWidth: { xs: "100%", md: "85%" },

                        fontSize: { xs: "15px", sm: "17px", md: "18px" },
                        textAlign: { xs: "center", md: "left" }, // MOBILE CENTER
                    }}
                >
                    Instantly visualize job roles, understand expectations, and
                    uncover every insight hidden inside a JD.
                </Typography>
            </Box>

            {/* RIGHT SIDE */}
            <Paper
                elevation={10}
                sx={{
                    width: { xs: "100%", sm: 420, md: 380 }, // MOBILE FULL WIDTH
                    borderRadius: 4,
                    p: { xs: 3, md: 3 },

                    background: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 20px 40px rgba(255, 60, 120, 0.25)",

                    mx: { xs: "auto", md: 0 }, // CENTER ON MOBILE
                }}
            >
                <Typography
                    variant="subtitle2"
                    sx={{
                        mb: 2,
                        fontWeight: 600,
                        textAlign: { xs: "center", md: "left" }, // MOBILE CENTER
                    }}
                >
                    Analysis Steps
                </Typography>

                <Stack spacing={2}>
                    {[
                        { num: 1, text: "Extracting Skills" },
                        { num: 2, text: "Analyzing Responsibilities" },
                        { num: 3, text: "Identifying Role Expectations" },
                        { num: 4, text: "Generating Summary" },
                    ].map((step) => (
                        <Paper
                            key={step.num}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background: "white",
                                border: "1px solid #f0f0f0",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        background: brandGradient,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontWeight: 700,
                                        boxShadow:
                                            "0 4px 10px rgba(255, 60, 120, 0.35)",
                                    }}
                                >
                                    {step.num}
                                </Box>

                                <Typography fontWeight={600}>
                                    {step.text}
                                </Typography>
                            </Box>

                            <Typography
                                sx={{ fontSize: "0.8rem", opacity: 0.7 }}
                            >
                                {20 + step.num * 30}ms
                            </Typography>
                        </Paper>
                    ))}
                </Stack>

                <Typography
                    sx={{
                        textAlign: "right",
                        mt: 2,
                        fontWeight: 700,
                        background: brandGradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Total: 250ms
                </Typography>
            </Paper>
        </Box>
    );
};

export default HeroSection;
