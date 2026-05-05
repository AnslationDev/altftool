import React from "react";
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Chip,
    useTheme,
    alpha,
} from "@mui/material";
import {
    Shield,
    Lock,
    Storage,
    VerifiedUser,
} from "@mui/icons-material";

export default function Privacy() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const privacyFeatures = [
        {
            icon: <Lock sx={{ fontSize: 40 }} />,
            title: 'Secure Connections',
            description: 'All domain checks use encrypted HTTPS connections',
        },
        {
            icon: <Storage sx={{ fontSize: 40 }} />,
            title: 'Real-Time Queries',
            description: 'Direct database queries with no data retention',
        },
        {
            icon: <VerifiedUser sx={{ fontSize: 40 }} />,
            title: 'No Tracking',
            description: 'We never log or store your search history',
        },
    ];

    return (
        <Box
            sx={{
                Height: '100vh',
                padding: '80px 32px',
                position: 'relative',
                overflow: 'hidden',

            }}
        >
            {/* Background Effects */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '5%',
                    width: 400,
                    height: 400,
                    background: isDark
                        ? 'radial-gradient(circle, rgba(129, 140, 248, 0.2) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(80px)',
                    pointerEvents: 'none',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '5%',
                    width: 400,
                    height: 400,
                    background: isDark
                        ? 'radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(118, 75, 162, 0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(80px)',
                    pointerEvents: 'none',
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Header Section */}
                <Box sx={{ textAlign: 'center', mb: 10 }}>
                    <Chip
                        icon={<Lock />}
                        label="Privacy First"
                        sx={{
                            mb: 4,
                            px: 2,
                            py: 3,
                            fontSize: 14,
                            fontWeight: 600,
                            borderRadius: '50px',
                            background: isDark
                                ? 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            boxShadow: isDark
                                ? '0 4px 16px rgba(129, 140, 248, 0.3)'
                                : '0 4px 16px rgba(102, 126, 234, 0.2)',
                            '& .MuiChip-icon': {
                                color: 'white',


                            },
                        }}
                    />

                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: 40, md: 64 },
                            fontWeight: 800,
                            mb: 3,
                            background: !isDark
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'transparent',
                            backgroundClip: !isDark ? 'text' : 'unset',
                            WebkitBackgroundClip: !isDark ? 'text' : 'unset',
                            WebkitTextFillColor: !isDark ? 'transparent' : 'inherit',
                            color: isDark ? 'white' : 'transparent',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.1,
                        }}
                    >
                        Your Privacy, Protected
                    </Typography>

                    <Typography
                        variant="h5"
                        sx={{
                            color: isDark ? 'grey.400' : 'grey.600',
                            maxWidth: 700,
                            mx: 'auto',
                            lineHeight: 1.6,
                        }}
                    >
                        Built with privacy and security as the foundation
                    </Typography>
                </Box>

                {/* Central Shield */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 10,
                    }}
                >
                    <Box
                        sx={{
                            width: 200,
                            height: 200,
                            borderRadius: 5,
                            background: isDark
                                ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                                : 'linear-gradient(135deg, #6366f1, #a855f7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isDark
                                ? '0 20px 60px rgba(129, 140, 248, 0.4), 0 0 100px rgba(167, 139, 250, 0.2)'
                                : '0 20px 60px rgba(102, 126, 234, 0.3), 0 0 100px rgba(118, 75, 162, 0.1)',
                            animation: 'float 3s ease-in-out infinite',
                            '@keyframes float': {
                                '0%, 100%': { transform: 'translateY(0px)' },
                                '50%': { transform: 'translateY(-20px)' },
                            },
                        }}
                    >
                        <Shield sx={{ fontSize: 100, color: 'white' }} />
                    </Box>
                </Box>

                {/* Privacy Description */}
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontSize: { xs: 32, md: 40 },
                            fontWeight: 700,
                            mb: 3,
                            background: !isDark
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'transparent',
                            backgroundClip: !isDark ? 'text' : 'unset',
                            WebkitBackgroundClip: !isDark ? 'text' : 'unset',
                            WebkitTextFillColor: !isDark ? 'transparent' : 'inherit',
                            color: isDark ? 'white' : 'transparent',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Privacy-First Design
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: 18,
                            color: isDark ? 'grey.400' : 'grey.600',
                            maxWidth: 900,
                            mx: 'auto',
                            lineHeight: 1.7,
                        }}
                    >
                        Domain Checker is designed with your privacy in mind. We use secure, encrypted connections for all domain queries and never store your search history. Your domain searches remain completely private and are never logged, tracked, or shared with third parties.
                    </Typography>
                </Box>

                {/* Features Grid */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: 'repeat(3, 1fr)',
                        },
                        gap: 4,
                    }}
                >
                    {privacyFeatures.map((feature, index) => (
                        <Card
                            key={index}
                            sx={{
                                background: isDark
                                    ? 'linear-gradient(135deg, #1a102b 0%, #3a1f5d 50%, #5b21b6 100%)'
                                    : 'linear-gradient(135deg, #e0f2fe 0%, #c7d2fe 50%, #f3e8ff 100%)',
                                border: `1px solid ${alpha(isDark ? '#818cf8' : '#667eea', 0.2)}`,
                                borderRadius: 3,
                                transition: 'all 0.4s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-12px)',
                                    borderColor: isDark ? '#818cf8' : '#667eea',
                                    boxShadow: isDark
                                        ? '0 24px 48px rgba(129, 140, 248, 0.2)'
                                        : '0 24px 48px rgba(102, 126, 234, 0.15)',
                                    '& .icon-box': {
                                        transform: 'scale(1.1)',
                                    },
                                },
                            }}
                        >
                            <CardContent
                                sx={{
                                    textAlign: 'center',
                                    py: 6,
                                    px: 4,
                                }}
                            >
                                <Box
                                    className="icon-box"
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 2.5,
                                        background: isDark
                                            ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                                            : 'linear-gradient(135deg, #6366f1, #a855f7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        margin: '0 auto 24px',
                                        boxShadow: isDark
                                            ? '0 12px 32px rgba(129, 140, 248, 0.3)'
                                            : '0 12px 32px rgba(102, 126, 234, 0.2)',
                                        transition: 'all 0.4s ease',
                                    }}
                                >
                                    {feature.icon}
                                </Box>

                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 1.5,
                                        color: isDark ? 'white' : 'grey.900',
                                    }}
                                >
                                    {feature.title}
                                </Typography>

                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: isDark ? 'grey.400' : 'grey.600',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {feature.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}