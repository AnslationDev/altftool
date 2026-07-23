"use client";

// import React, { useState } from "react";
// import { Box, Typography } from "@mui/material";

// // === ICONS (same animations, new meaning) ===
// const Lightning = ({ gradient }) => (
//     <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
//         <defs>
//             <linearGradient id="lightning-grad" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" stopColor={gradient[0]} />
//                 <stop offset="100%" stopColor={gradient[1]} />
//             </linearGradient>
//         </defs>

//         <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="url(#lightning-grad)" />
//     </svg>
// );

// const Eye = ({ gradient }) => (
//     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#eye-grad)" strokeWidth="2">
//         <defs>
//             <linearGradient id="eye-grad" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" stopColor={gradient[0]} />
//                 <stop offset="100%" stopColor={gradient[1]} />
//             </linearGradient>
//         </defs>
//         <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
//         <circle cx="12" cy="12" r="3" />
//     </svg>
// );

// const AlertCircle = ({ gradient }) => (
//     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#alert-grad)" strokeWidth="2">
//         <defs>
//             <linearGradient id="alert-grad" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" stopColor={gradient[0]} />
//                 <stop offset="100%" stopColor={gradient[1]} />
//             </linearGradient>
//         </defs>
//         <circle cx="12" cy="12" r="10" />
//         <line x1="12" y1="8" x2="12" y2="12" />
//         <line x1="12" y1="16" x2="12.01" y2="16" />
//     </svg>
// );

// const Shield = ({ gradient }) => (
//     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#shield-grad)" strokeWidth="2">
//         <defs>
//             <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" stopColor={gradient[0]} />
//                 <stop offset="100%" stopColor={gradient[1]} />
//             </linearGradient>
//         </defs>
//         <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//     </svg>
// );

// const Lock = ({ gradient }) => (
//     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#lock-grad)" strokeWidth="2">
//         <defs>
//             <linearGradient id="lock-grad" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" stopColor={gradient[0]} />
//                 <stop offset="100%" stopColor={gradient[1]} />
//             </linearGradient>
//         </defs>
//         <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//         <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//     </svg>
// );

// const Zap = ({ gradient }) => (
//     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#zap-grad)" strokeWidth="2">
//         <defs>
//             <linearGradient id="zap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" stopColor={gradient[0]} />
//                 <stop offset="100%" stopColor={gradient[1]} />
//             </linearGradient>
//         </defs>
//         <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
//     </svg>
// );

// export default function Features() {
//     const [clickedCard, setClickedCard] = useState(null);

//     // --- FIXED THEME (Light Mode Only) ---
//     const theme = {
//         bg: "#f9fafb",
//         cardBg: "#ffffff",
//         text: "#1f2937",
//         textMuted: "#6b7280",
//         border: "rgba(0,0,0,0.08)",
//         accent: "#ff5722",
//     };

//     const features = [
//         {
//             icon: Lightning,
//             iconGradient: ["#14b8a6", "#0d9488"],
//             title: "Instant JD Analysis",
//             description: "Get instant AI-powered breakdown of any job description.",
//             color: "#14b8a6",
//         },
//         {
//             icon: Eye,
//             iconGradient: ["#a855f7", "#9333ea"],
//             title: "Skill Gap Detection",
//             description: "Automatically identify missing, weak, or duplicated skills.",
//             color: "#a855f7",
//         },
//         {
//             icon: AlertCircle,
//             iconGradient: ["#6366f1", "#4f46e5"],
//             title: "Red Flag Finder",
//             description: "Detect vague responsibilities, unrealistic expectations, or bias.",
//             color: "#6366f1",
//         },
//         {
//             icon: Shield,
//             iconGradient: ["#14b8a6", "#06b6d4"],
//             title: "Role Benchmarking",
//             description: "Compare JDs with industry-standard patterns and templates.",
//             color: "#14b8a6",
//         },
//         {
//             icon: Lock,
//             iconGradient: ["#a855f7", "#ec4899"],
//             title: "AI Rewrite Engine",
//             description: "Rewrite the JD in a clean, professional, HR-friendly tone.",
//             color: "#a855f7",
//         },
//         {
//             icon: Zap,
//             iconGradient: ["#6366f1", "#8b5cf6"],
//             title: "Smart Keyword Boost",
//             description: "Enhance ATS optimization with missing keywords and metrics.",
//             color: "#6366f1",
//         },
//     ];

//     const handleCardClick = (index) => {
//         setClickedCard(index);
//         setTimeout(() => setClickedCard(null), 600);
//     };

//     return (
//         <Box
//             id="features"
//             sx={{ background: theme.bg, py: { xs: 8, md: 12 }, color: theme.text }}
//         >
//             {/* HEADER */}
//             <Box textAlign="center" mb={{ xs: 6, md: 10 }}>
//                 <Box
//                     display="inline-flex"
//                     alignItems="center"
//                     gap={1}
//                     px={3}
//                     py={1}
//                     borderRadius="20px"
//                     sx={{
//                         fontSize: "13px",
//                         fontWeight: 700,
//                         color: theme.accent,
//                         textTransform: "uppercase",
//                         letterSpacing: "0.1em",
//                         mb: 2,
//                         background: "rgba(255, 87, 34, 0.08)",
//                         border: "1px solid rgba(255, 87, 34, 0.15)",
//                     }}
//                 >
//                     ⚡ AI-Powered JD Features
//                 </Box>

//                 <Typography
//                     variant="h2"
//                     sx={{
//                         fontSize: { xs: "32px", md: "44px" },
//                         fontWeight: 800,
//                         color: theme.text,
//                         mb: 2,
//                         lineHeight: 1.2,
//                         letterSpacing: "-0.02em",
//                     }}
//                 >
//                     Why AI JD Analyzer?
//                 </Typography>

//                 <Typography
//                     sx={{
//                         fontSize: "18px",
//                         color: theme.textMuted,
//                         maxWidth: "600px",
//                         mx: "auto",
//                         lineHeight: 1.7,
//                     }}
//                 >
//                     Smart tools for analyzing, rewriting, and improving job descriptions.
//                 </Typography>
//             </Box>

//             {/* GRID */}
//             <Box
//                 sx={{
//                     display: "grid",
//                     gridTemplateColumns: {
//                         xs: "1fr",
//                         sm: "1fr 1fr",
//                         md: "1fr 1fr 1fr",
//                     },
//                     gap: 4,
//                     maxWidth: "1200px",
//                     mx: "auto",
//                     px: { xs: 2, sm: 4, md: 0 },
//                 }}
//             >
//                 {features.map((feature, i) => {
//                     const IconComponent = feature.icon;

//                     return (
//                         <Box
//                             key={i}
//                             onClick={() => handleCardClick(i)}
//                             sx={{
//                                 background: theme.cardBg,
//                                 border: `1px solid ${theme.border}`,
//                                 borderRadius: "16px",
//                                 p: 4,
//                                 cursor: "pointer",
//                                 overflow: "hidden",
//                                 transition: "all 0.4s",
//                                 position: "relative",

//                                 "&:hover": {
//                                     transform: "translateY(-8px)",
//                                     borderColor: feature.color,
//                                     boxShadow: `0 12px 32px rgba(0,0,0,0.1)`,
//                                 },
//                                 "&:hover .icon-box": {
//                                     transform: "rotate(360deg) scale(1.1)",
//                                 },
//                                 "&::before": {
//                                     content: '""',
//                                     position: "absolute",
//                                     top: 0,
//                                     left: clickedCard === i ? 0 : "-100%",
//                                     width: "100%",
//                                     height: "100%",
//                                     background: `linear-gradient(135deg, ${feature.iconGradient[0]}10, ${feature.iconGradient[1]}10)`,
//                                     transition: "left 0.6s",
//                                 },
//                             }}
//                         >
//                             <Box sx={{ position: "relative", zIndex: 1 }}>
//                                 <Box
//                                     className="icon-box"
//                                     sx={{
//                                         width: 64,
//                                         height: 64,
//                                         borderRadius: "16px",
//                                         background: `linear-gradient(135deg, ${feature.iconGradient[0]}, ${feature.iconGradient[1]})`,
//                                         display: "flex",
//                                         alignItems: "center",
//                                         justifyContent: "center",
//                                         mb: 2,
//                                         color: "#fff",
//                                         transition: "all 0.6s",
//                                     }}
//                                 >
//                                     <IconComponent gradient={["#fff", "#fff"]} />
//                                 </Box>

//                                 <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
//                                     {feature.title}
//                                 </Typography>

//                                 <Typography sx={{ fontSize: "15px", color: theme.textMuted }}>
//                                     {feature.description}
//                                 </Typography>
//                             </Box>
//                         </Box>
//                     );
//                 })}
//             </Box>
//         </Box>
//     );
// }





import React, { useState } from "react";
import { Box, Typography } from "@mui/material";

/* === ICONS (NO CHANGE) === */
const Lightning = ({ gradient }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <defs>
            <linearGradient id="lightning-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradient[0]} />
                <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
        </defs>
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="url(#lightning-grad)" />
    </svg>
);

/* other icons SAME as before */

export default function Features() {
    const [clickedCard, setClickedCard] = useState(null);

    const theme = {
        bg: "#f9fafb",
        cardBg: "#ffffff",
        text: "#1f2937",
        textMuted: "#6b7280",
        border: "rgba(0,0,0,0.08)",
        accent: "#ff5722",
    };

    const features = [
        /* SAME DATA – NO CHANGE */
    ];

    const handleCardClick = (index) => {
        setClickedCard(index);
        setTimeout(() => setClickedCard(null), 600);
    };

    return (
        <Box
            id="features"
            sx={{
                background: theme.bg,
                py: { xs: 6, sm: 8, md: 12 }, // 🔶 responsive padding
                px: { xs: 2, sm: 3 },        // 🔶 added horizontal padding
                color: theme.text,
            }}
        >
            {/* HEADER */}
            <Box textAlign="center" mb={{ xs: 5, sm: 6, md: 10 }}>
                <Box
                    display="inline-flex"
                    alignItems="center"
                    gap={1}
                    px={{ xs: 2, sm: 3 }}   // 🔶 responsive
                    py={1}
                    borderRadius="20px"
                    sx={{
                        fontSize: { xs: "11px", sm: "13px" }, // 🔶
                        fontWeight: 700,
                        color: theme.accent,
                        letterSpacing: "0.1em",
                        mb: 2,
                        background: "rgba(255, 87, 34, 0.08)",
                        border: "1px solid rgba(255, 87, 34, 0.15)",
                    }}
                >
                    ⚡ AI-Powered JD Features
                </Box>

                <Typography
                    variant="h2"
                    sx={{
                        fontSize: {
                            xs: "26px",  // 🔶 mobile
                            sm: "32px",
                            md: "44px",
                        },
                        fontWeight: 800,
                        mb: 2,
                        lineHeight: 1.2,
                    }}
                >
                    Why AI JD Analyzer?
                </Typography>

                <Typography
                    sx={{
                        fontSize: { xs: "15px", sm: "16px", md: "18px" }, // 🔶
                        color: theme.textMuted,
                        maxWidth: "600px",
                        mx: "auto",
                        lineHeight: 1.7,
                    }}
                >
                    Smart tools for analyzing, rewriting, and improving job descriptions.
                </Typography>
            </Box>

            {/* GRID */}
            {/* <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1fr 1fr",
                        md: "repeat(3, 1fr)",
                    },
                    gap: { xs: 2.5, sm: 3, md: 4 }, // 🔶 responsive gap
                    maxWidth: "1200px",
                    mx: "auto",
                }}
            >
                {features.map((feature, i) => {
                    const IconComponent = feature.icon;

                    return (
                        <Box
                            key={i}
                            onClick={() => handleCardClick(i)}
                            sx={{
                                background: theme.cardBg,
                                border: `1px solid ${theme.border}`,
                                borderRadius: "16px",
                                p: { xs: 2.5, sm: 3, md: 4 }, // 🔶 responsive padding
                                cursor: "pointer",
                                transition: "all 0.4s",
                                position: "relative",
                                overflow: "hidden",

                                "&:hover": {
                                    transform: "translateY(-6px)",
                                    borderColor: feature.color,
                                    boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
                                },

                                "&::before": {
                                    content: '""',
                                    position: "absolute",
                                    inset: 0,
                                    left: clickedCard === i ? 0 : "-100%",
                                    background: `linear-gradient(135deg, ${feature.iconGradient[0]}10, ${feature.iconGradient[1]}10)`,
                                    transition: "left 0.6s",
                                },
                            }}
                        >
                            <Box sx={{ position: "relative", zIndex: 1 }}>
                                <Box
                                    sx={{
                                        width: { xs: 52, sm: 60, md: 64 }, // 🔶 icon responsive
                                        height: { xs: 52, sm: 60, md: 64 },
                                        borderRadius: "16px",
                                        background: `linear-gradient(135deg, ${feature.iconGradient[0]}, ${feature.iconGradient[1]})`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mb: 2,
                                    }}
                                >
                                    <IconComponent gradient={["#fff", "#fff"]} />
                                </Box>

                                <Typography
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: { xs: "16px", sm: "17px", md: "18px" }, // 🔶
                                        mb: 1,
                                    }}
                                >
                                    {feature.title}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: { xs: "14px", sm: "15px" }, // 🔶
                                        color: theme.textMuted,
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {feature.description}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box> */}
        </Box>
    );
}
