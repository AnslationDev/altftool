import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  Stack,
} from "@mui/material";
import {
  ArrowForward,
  Security,
  Speed,
  Smartphone,
  Language,
  Compress,
  AutoFixHigh,
} from "@mui/icons-material";

const LandingPage = ({ onStart }) => {
  const features = [
    {
      icon: <Security color="success" fontSize="large" />,
      title: "Privacy First",
      desc: "Client-side processing. Your code never leaves your browser.",
    },
    {
      icon: <Speed color="primary" fontSize="large" />,
      title: "Lightning Fast",
      desc: "Powered by React for zero-latency formatting.",
    },
    {
      icon: <Smartphone color="secondary" fontSize="large" />,
      title: "Fully Responsive",
      desc: "Code on the go. Optimized for mobile and tablet devices.",
    },
    {
      icon: <Language color="warning" fontSize="large" />,
      title: "Multi-Language",
      desc: "Support for JSON, XML, HTML, SQL, CSS, and JS.",
    },
    {
      icon: <Compress color="error" fontSize="large" />,
      title: "Minification",
      desc: "Reduce file size for production environments instantly.",
    },
    {
      icon: <AutoFixHigh color="info" fontSize="large" />,
      title: "Auto Detection",
      desc: "Paste code and let us figure out the language for you.",
    },
  ];

  return (
    <Box sx={{ width: "100%", animate: "fadeIn 0.5s" }}>
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 8, md: 10 },
          pb: { xs: 8, md: 12 },
          bgcolor: "background.default",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: "radial-gradient(#475569 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            label="v2.0 Now Live"
            color="primary"
            variant="outlined"
            sx={{
              mb: 3,
              fontWeight: "bold",
              borderRadius: 4,
              px: 1,
              backgroundColor: "rgba(14, 165, 233, 0.1)",
            }}
          />

          {/* Responsive Hero Heading */}
          <Typography
            variant="h1"
            fontWeight={800}
            sx={{
              fontSize: { xs: "2.2rem", sm: "3rem", md: "4.5rem" },
              mb: 3,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            Code formatting, <br />
            <Box
              component="span"
              sx={{
                background: "linear-gradient(to right, #60a5fa, #c084fc)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Reimagined.
            </Box>
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              mb: 6,
              maxWidth: 650,
              mx: "auto",
              lineHeight: 1.6,
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}
          >
            Stop wrestling with messy indentation. Beautify, minify, and
            validate your JSON, HTML, SQL, and CSS instantly.
            <Box component="span" color="text.primary" fontWeight={600}>
              {" "}
              No server uploads. 100% Private.
            </Box>
          </Typography>

          {/* Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              onClick={onStart}
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                borderRadius: 3,
                boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Open Editor
            </Button>
            {/* <Button
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                borderRadius: 3,
                borderColor: "divider",
                color: "text.primary",
                "&:hover": {
                  borderColor: "text.primary",
                  bgcolor: "rgba(255,255,255,0.05)",
                },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Documentation
            </Button> */}
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, bgcolor: "background.paper" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight="bold" textAlign="center" mb={6}>
            Everything you need
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, idx) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={idx}
                sx={{ display: "flex" }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, sm: 4 }, // padding increases on bigger screens
                    width: 600, // always full width first
                    maxWidth: { xs: "100%", sm: 450, md: 500, lg: 550 },
                    // mobile = 100%, tablet = 450px, laptop = 500px, desktop = 550px

                    mx: "auto", // center on ALL screens
                    height: "100%",
                    borderRadius: 4,
                    bgcolor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>

                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    lineHeight={1.6}
                  >
                    {feature.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
