import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Container,
  Link,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Lightbulb as LightbulbIcon,
} from "@mui/icons-material";

// ==== CUSTOM SUN AND MOON SVG ICONS ====
const SunIconCustom = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIconCustom = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// ==== UPDATED HEADER COMPONENT ====
const Header = ({ darkMode, setDarkMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const menuItems = [
    { text: "How It Works", href: "#how-it-works" },
    { text: "Generate", href: "#generate" },
    { text: "FAQ", href: "#faq" },
    { text: "Privacy", href: "#privacy" },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleDrawerToggle = () => {
    setMenuOpen(false);
  };

  // --- LOGO GRADIENT DEFINITION ---
  // This fixed gradient ensures the logo always looks blue/purple, as requested.
  const logoGradient = "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)";

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: {
            xs: 110, //  mobile: Hub header + search bar
            sm: 72, // tablet: Hub header
            md: 64, //  desktop: Hub header
          },
          background: darkMode
            ? "linear-gradient(135deg, #0a0e27 0%, #1f2040 50%, #3b1f59 100%)"
            : "linear-gradient(135deg, #e0f2f7 0%, #e3f2fd 50%, #e8f5e9 100%)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          borderBottom: "1px solid",
          borderColor: darkMode ? theme.palette.divider : "rgba(0,0,0,0.08)",
          zIndex: 14, //
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            sx={{
              minHeight: { xs: 64, sm: 72, md: 75 },
              py: { xs: 1, sm: 0 },
              justifyContent: "space-between",
              px: { xs: 1.5, sm: 4 },
            }}
          >
            {/* LEFT: Logo + Title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* Logo Icon Box (Fixed Blue Gradient) */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  background: logoGradient, // Apply fixed blue gradient
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  // Use a subtle shadow that works well on both light/dark backgrounds
                  boxShadow: darkMode
                    ? "0 4px 10px rgba(124, 58, 237, 0.5)"
                    : "0 4px 10px rgba(59, 130, 246, 0.4)",
                }}
              >
                <LightbulbIcon sx={{ color: "#fff", fontSize: 24 }} />
              </Box>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: {
                    xs: "0.95rem",
                    sm: "1.05rem",
                    md: "1.15rem",
                  },
                  lineHeight: 1.2,
                  maxWidth: { xs: 160, sm: "unset" },
                  whiteSpace: "normal",
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Startup Idea Generator
              </Typography>
            </Box>

            {/* CENTER: Navigation Links (Desktop Only) */}
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 4, alignItems: "center" }}>
                {menuItems.map((item) => (
                  <Link
                    key={item.text}
                    href={item.href}
                    underline="none"
                    sx={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: theme.palette.text.secondary,
                      transition: "color 0.2s ease",
                      "&:hover": { color: theme.palette.primary.main },
                    }}
                  >
                    {item.text}
                  </Link>
                ))}
              </Box>
            )}

            {/* RIGHT: DARK / LIGHT TOGGLE & Mobile Menu Button */}
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              {/* Theme Toggle Button */}
              <IconButton
                onClick={toggleDarkMode}
                sx={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: darkMode
                    ? theme.palette.action.hover
                    : theme.palette.grey[200],
                  color: theme.palette.text.primary,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.main,
                    color: "#fff",
                    transform: "scale(1.1)",
                  },
                }}
                aria-label="Toggle Theme"
              >
                {darkMode ? <SunIconCustom /> : <MoonIconCustom />}
              </IconButton>

              {/* Mobile Menu Button (Hamburger) */}
              {isMobile && (
                <IconButton
                  onClick={() => setMenuOpen(true)}
                  sx={{
                    backgroundColor: darkMode
                      ? theme.palette.action.hover
                      : theme.palette.grey[200],
                    color: theme.palette.text.primary,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                      color: "#fff",
                    },
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: "280px",
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        <Box
          sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: theme.palette.text.primary }}
            >
              Menu
            </Typography>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{ color: theme.palette.text.primary }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component="a"
                href={item.href}
                onClick={handleDrawerToggle}
                sx={{
                  py: 1.75,
                  color: theme.palette.text.primary,
                  "&:hover": { backgroundColor: theme.palette.action.hover },
                }}
              >
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: "14px", fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Header;
