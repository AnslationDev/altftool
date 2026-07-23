"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  IconButton,
  Grid,
  Link,
  Divider,
} from "@mui/material";
import { GitHub, Language } from "@mui/icons-material";
import CodeIcon from "@mui/icons-material/Code";
import { useTheme } from "@mui/material/styles";

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        mt: "auto",
        py: 8,
        bgcolor: "background.default",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">

        <Grid
          container
          spacing={6}
          justifyContent="center"
          alignItems="flex-start"
        >

          {/* Logo Section */}
          <Grid item xs={12} sm={10} md={4}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                gap: 2,
                flexWrap: "wrap"
              }}
              onClick={() => {}}
            >
              <Box
                sx={{
                  p: 1,
                  bgcolor: "primary.main",
                  borderRadius: 2,
                  display: "flex",
                  boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)"
                }}
              >
                <CodeIcon sx={{ color: "#fff" }} />
              </Box>

              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Beautify
                <span style={{ color: theme.palette.primary.main }}>.io</span>
              </Typography>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              lineHeight={1.7}
              sx={{
                mt: 2,
                width: "100%",
                maxWidth: 500,     // responsive width
                mx: "auto"
              }}
            >
              Beautify.io helps designers & developers create clean, beautiful
              UIs with ready-to-use components, patterns, and tools designed
              with modern UX in mind.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Links
            </Typography>
            <Stack spacing={1.3}>
              <Link color="text.secondary" underline="hover">Home</Link>
              <Link color="text.secondary" underline="hover">Features</Link>
              <Link color="text.secondary" underline="hover">Docs</Link>
              <Link color="text.secondary" underline="hover">Contact</Link>
            </Stack>
          </Grid>

          {/* Resources */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Resources
            </Typography>
            <Stack spacing={1.3}>
              <Link color="text.secondary" underline="hover">Blog</Link>
              <Link color="text.secondary" underline="hover">Examples</Link>
              <Link color="text.secondary" underline="hover">Templates</Link>
              <Link color="text.secondary" underline="hover">Support</Link>
            </Stack>
          </Grid>

          {/* Social Icons */}
          <Grid item xs={12} sm={10} md={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Connect
            </Typography>
            <Stack direction="row" spacing={2}>
              <IconButton
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  "&:hover": { bgcolor: "action.hover", transform: "translateY(-3px)" },
                  transition: "0.25s",
                }}
              >
                <GitHub />
              </IconButton>

              <IconButton
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  "&:hover": { bgcolor: "action.hover", transform: "translateY(-3px)" },
                  transition: "0.25s",
                }}
              >
                <Language />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 6, mb: 3, opacity: 0.3 }} />

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ letterSpacing: 0.4 }}
        >
          © {new Date().getFullYear()} Beautify.io — Designed with ❤️ using React & MUI.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
