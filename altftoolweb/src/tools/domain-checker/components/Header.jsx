import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Box,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Container,
    useTheme,
    useMediaQuery,
    Typography
} from '@mui/material';
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    LightMode as LightModeIcon,
    DarkMode as DarkModeIcon,

} from '@mui/icons-material';

const Shield = ({ color = 'currentColor' }) => (
    <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
);



export default function Header({ isDark, setIsDark }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const menuItems = ['Features', 'FAQ', 'Privacy'];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuClick = () => {
        setMobileOpen(false);
    };

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1a102b 0%, #3a1f5d 50%, #5b21b6 100%)'
                        : 'linear-gradient(135deg, #e0f2fe 0%, #c7d2fe 50%, #f3e8ff 100%)',
                    borderBottom: isDark
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.08)',
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar
                        disableGutters
                        sx={{
                            Height: { xs: 70, md: 75 },
                            display: 'flex',
                            justifyContent: 'space-between',
                            position: 'relative',
                        }}
                    >
                        {/* Logo - Left */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 1.5, flex: { md: 1 } }}>
                            {/* Logo Icon */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: isMobile ? 20 : 30,
                                    height: isMobile ? 20 : 30,
                                }}
                            >
                                <Shield color={isDark ? '#3b82f6' : '#2563eb'} size={isMobile ? 22 : 28} />
                            </Box>

                            {/* Logo Text */}
                            <Typography
                                component="h3"
                                sx={{
                                    fontWeight: 700,
                                    letterSpacing: "-0.02em",
                                    fontSize: {
                                        xs: "16px",
                                        sm: "20px",
                                        md: "24px",
                                        lg: "24px",
                                    },

                                    lineHeight: 1.2,

                                    background: !isDark
                                        ? "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)"
                                        : "none",
                                    WebkitBackgroundClip: !isDark ? "text" : "unset",
                                    WebkitTextFillColor: isDark ? "#fff" : "transparent",

                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                DomainChecker
                            </Typography>
                        </Box>

                        {/* Desktop Navigation - Center */}
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                gap: 3,
                                alignItems: 'center',
                                position: 'absolute',
                                left: '50%',
                                transform: 'translateX(-50%)',
                            }}
                        >
                            {menuItems.map((item) => (
                                <Button
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    sx={{
                                        color: isDark ? '#9ca3af' : '#6b6b6b',
                                        fontSize: 15,
                                        fontWeight: 400,
                                        textTransform: 'none',
                                        '&:hover': {
                                            color: isDark ? '#3b82f6' : '#2563eb',
                                            background: 'transparent',
                                        },
                                    }}
                                >
                                    {item}
                                </Button>
                            ))}
                        </Box>

                        {/* Right Actions */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: { md: 1 }, justifyContent: 'flex-end' }}>
                            {/* Theme Toggle */}
                            <IconButton
                                onClick={() => setIsDark(!isDark)}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: isDark ? '#141b3d' : '#f8f9fa',
                                    color: isDark ? '#9ca3af' : '#6b6b6b',
                                    '&:hover': {
                                        bgcolor: isDark ? '#3b82f6' : '#2563eb',
                                        color: '#fff',
                                        transform: 'scale(1.05)',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>

                            {/* Desktop CTA Button
                            <Button
                                variant="contained"
                                sx={{
                                    display: { xs: 'none', md: 'inline-flex' },
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
                                    color: '#fff',
                                    px: 3,
                                    py: 1.25,
                                    borderRadius: 2,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                Get Started
                            </Button> */}

                            {/* Mobile Menu Button */}
                            <IconButton
                                onClick={handleDrawerToggle}
                                sx={{
                                    display: { xs: 'inline-flex', md: 'none' },
                                    width: 40,
                                    height: 40,
                                    bgcolor: isDark ? '#141b3d' : '#f8f9fa',
                                    color: isDark ? '#9ca3af' : '#6b6b6b',
                                }}
                            >
                                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                            </IconButton>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="top"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        top: 70,
                        background: isDark
                            ? 'linear-gradient(135deg, #0a0e27 0%, #1f2040 50%, #3b1f59 100%)'
                            : 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #fce7f3 100%)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: isDark
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.08)',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    },
                }}
            >
                <Box sx={{ p: 3 }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item} disablePadding>
                                <ListItemButton
                                    href={`#${item.toLowerCase()}`}
                                    onClick={handleMenuClick}
                                    sx={{
                                        py: 1.5,
                                        '&:hover': {
                                            bgcolor: 'transparent',
                                            '& .MuiListItemText-primary': {
                                                color: isDark ? '#3b82f6' : '#2563eb',
                                            },
                                        },
                                    }}
                                >
                                    <ListItemText
                                        primary={item}
                                        sx={{
                                            '& .MuiListItemText-primary': {
                                                fontSize: 16,
                                                fontWeight: 500,
                                                color: isDark ? '#9ca3af' : '#6b6b6b',
                                                transition: 'color 0.2s ease',
                                            },
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    {/* <Button
                        variant="contained"
                        fullWidth
                        sx={{
                            mt: 2,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
                            color: '#fff',
                            py: 1.25,
                            borderRadius: 2,
                            fontSize: 14,
                            fontWeight: 600,
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
                            },
                        }}
                    >
                        Get Started
                    </Button> */}
                </Box>
            </Drawer>
        </>
    );
}