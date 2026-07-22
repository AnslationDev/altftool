import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Lightbulb as LightbulbIcon } from "@mui/icons-material";

export default function FAQSection({ darkMode }) {
  const muiTheme = useTheme();

  // Updated theme colors using a mix of props and MUI standards for a cleaner look
  const colors = {
    bg: darkMode
      ? muiTheme.palette.background.default
      : muiTheme.palette.grey[50], // Very light grey for light mode background
    cardBg: darkMode ? "#1c212a" : muiTheme.palette.background.paper, // Slightly darker card in dark mode
    text: darkMode ? muiTheme.palette.text.primary : muiTheme.palette.grey[900],
    textMuted: darkMode
      ? muiTheme.palette.text.secondary
      : muiTheme.palette.grey[600],
    accent: muiTheme.palette.primary.main || "#3b82f6", // Use primary color as accent
    border: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
    shadow: darkMode
      ? "0 6px 15px rgba(0, 0, 0, 0.4)"
      : "0 6px 15px rgba(0, 0, 0, 0.05)",
  };

  const faqs = [
    {
      q: "How does the Startup Idea Generator work?",
      a: "Just enter keywords or select categories. Our AI analyzes trends, business models, and real-world data to generate powerful, unique startup ideas.",
    },
    {
      q: "Is it free to use?",
      a: "Yes, the core idea generator is free. Premium features may come later, offering advanced analysis and full business plan generation.",
    },
    {
      q: "Can I save my generated ideas?",
      a: "Yes, ideas get stored securely in your local browser history (Local Storage), so you can revisit and refine them anytime without needing an account.",
    },
    {
      q: "Does it generate complete business plans?",
      a: "It currently generates execution steps, market analysis, monetization models, and detailed persona outlines. Full, exportable business plan generation is coming soon.",
    },
    {
      q: "Is my input text stored?",
      a: "Absolutely not. We prioritize user privacy. Your content stays on your device. We do not store, track, or log anything on our servers.",
    },
  ];

  return (
    <Box
      id="faq"
      sx={{
        py: { xs: 8, md: 12 },
        px: 3,
        // background: colors.bg,
        color: colors.text,
      }}
    >
      <Box sx={{ maxWidth: "900px", mx: "auto" }}>
        {/* Header Section */}
        <Box textAlign="center" mb={{ xs: 6, md: 8 }}>
          <LightbulbIcon sx={{ color: colors.accent, fontSize: 40, mb: 1.5 }} />
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "30px", md: "42px" },
              marginBottom: 1,
              // Use a solid primary color for cleaner title (Modern UI preference)
              color: colors.accent,
            }}
          >
            Got Questions?
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: colors.text, fontWeight: 700, mb: 3 }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            sx={{ color: colors.textMuted, maxWidth: 600, mx: "auto" }}
          >
            Everything you need to know about how the Startup Idea Generator
            works, and how we handle your data.
          </Typography>
        </Box>
        {/* End Header Section */}

        {/* FAQ Accordions */}
        {faqs.map((item, i) => (
          <Accordion
            key={i}
            elevation={0} // Remove default shadow
            sx={{
              mb: 2.5,
              background: colors.cardBg,
              color: colors.text,
              //   borderRadius: 3, // Increased border radius
              border: `1px solid ${colors.border}`,
              boxShadow: colors.shadow, // Apply custom, subtle shadow
              transition: "all 0.3s ease",
              "&:before": { display: "none" },
              "&.Mui-expanded": {
                // Slight accent border on expansion for modern feel
                borderColor: colors.accent,
                boxShadow: darkMode
                  ? colors.shadow
                  : "0 8px 20px rgba(59, 130, 246, 0.15)",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: colors.accent }} />}
              aria-controls={`panel${i}-content`}
              id={`panel${i}-header`}
              sx={{
                py: 1,
                // Subtle hover effect on the summary bar
                "&:hover": {
                  backgroundColor: darkMode
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.02)",
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "16px", md: "18px" },
                  color: colors.text, // Question remains primary color
                }}
              >
                {item.q}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                borderTop: `1px solid ${colors.border}`,
                pt: 2,
                pb: 3,
                px: 3,
              }}
            >
              <Typography
                sx={{
                  color: colors.textMuted,
                  lineHeight: 1.6,
                  fontSize: "15px",
                }}
              >
                {item.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
        {/* End FAQ Accordions */}
      </Box>
    </Box>
  );
}
