import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
        background: {
            default: "#f5f7fa",
            paper: "#ffffff",
        },
        text: {
            primary: "#1a202c",
            secondary: "#4a5568",
        },
        primary: {
            main: "#667eea",
            light: "#7c8ff0",
            dark: "#5568d3",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#764ba2",
            light: "#9b6fc9",
            dark: "#5d3a7f",
            contrastText: "#ffffff",
        },
        success: {
            main: "#48bb78",
            light: "#68d391",
            dark: "#38a169",
            contrastText: "#ffffff",
        },
        error: {
            main: "#f56565",
            light: "#fc8181",
            dark: "#e53e3e",
            contrastText: "#ffffff",
        },
        warning: {
            main: "#ed8936",
            light: "#f6ad55",
            dark: "#dd6b20",
            contrastText: "#ffffff",
        },
        info: {
            main: "#4299e1",
            light: "#63b3ed",
            dark: "#3182ce",
            contrastText: "#ffffff",
        },
        divider: "rgba(0, 0, 0, 0.08)",
        action: {
            hover: "rgba(102, 126, 234, 0.08)",
            selected: "rgba(102, 126, 234, 0.12)",
            disabled: "rgba(0, 0, 0, 0.26)",
            disabledBackground: "rgba(0, 0, 0, 0.12)",
        },
    },
    typography: {
        fontFamily: "'Inter', 'SF Pro Display', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
        h1: {
            fontSize: "3.5rem",
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
        },
        h2: {
            fontSize: "3rem",
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
        },
        h3: {
            fontSize: "2.5rem",
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
        },
        h4: {
            fontSize: "2rem",
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h5: {
            fontSize: "1.5rem",
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h6: {
            fontSize: "1.25rem",
            fontWeight: 600,
            lineHeight: 1.5,
        },
        subtitle1: {
            fontSize: "1rem",
            fontWeight: 500,
            lineHeight: 1.6,
        },
        subtitle2: {
            fontSize: "0.875rem",
            fontWeight: 500,
            lineHeight: 1.6,
        },
        body1: {
            fontSize: "1rem",
            lineHeight: 1.6,
        },
        body2: {
            fontSize: "0.875rem",
            lineHeight: 1.6,
        },
        button: {
            textTransform: "none",
            fontWeight: 600,
            letterSpacing: "0.02em",
        },
        caption: {
            fontSize: "0.75rem",
            lineHeight: 1.5,
        },
        overline: {
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        "none",
        "0px 2px 4px rgba(0, 0, 0, 0.05)",
        "0px 4px 8px rgba(0, 0, 0, 0.08)",
        "0px 6px 12px rgba(0, 0, 0, 0.10)",
        "0px 8px 16px rgba(0, 0, 0, 0.12)",
        "0px 10px 20px rgba(0, 0, 0, 0.14)",
        "0px 12px 24px rgba(0, 0, 0, 0.16)",
        "0px 16px 32px rgba(0, 0, 0, 0.18)",
        "0px 20px 40px rgba(0, 0, 0, 0.20)",
        "0px 24px 48px rgba(0, 0, 0, 0.22)",
        "0px 2px 4px rgba(0, 0, 0, 0.05)",
        "0px 4px 8px rgba(0, 0, 0, 0.08)",
        "0px 6px 12px rgba(0, 0, 0, 0.10)",
        "0px 8px 16px rgba(0, 0, 0, 0.12)",
        "0px 10px 20px rgba(0, 0, 0, 0.14)",
        "0px 12px 24px rgba(0, 0, 0, 0.16)",
        "0px 16px 32px rgba(0, 0, 0, 0.18)",
        "0px 20px 40px rgba(0, 0, 0, 0.20)",
        "0px 24px 48px rgba(0, 0, 0, 0.22)",
        "0px 28px 56px rgba(0, 0, 0, 0.24)",
        "0px 32px 64px rgba(0, 0, 0, 0.26)",
        "0px 36px 72px rgba(0, 0, 0, 0.28)",
        "0px 40px 80px rgba(0, 0, 0, 0.30)",
        "0px 44px 88px rgba(0, 0, 0, 0.32)",
        "0px 48px 96px rgba(0, 0, 0, 0.34)",
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: "10px 24px",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textTransform: "none",
                    boxShadow: "none",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                        boxShadow: "0px 4px 12px rgba(102, 126, 234, 0.3)",
                        transform: "translateY(-2px)",
                    },
                    "&:active": {
                        transform: "translateY(0)",
                    },
                },
                contained: {
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                        background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    },
                },
                outlined: {
                    borderWidth: "2px",
                    "&:hover": {
                        borderWidth: "2px",
                        backgroundColor: "rgba(102, 126, 234, 0.08)",
                    },
                },
                text: {
                    "&:hover": {
                        backgroundColor: "rgba(102, 126, 234, 0.08)",
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
                        transform: "translateY(-4px)",
                    },
                },
            },
        },
        MuiCardHeader: {
            styleOverrides: {
                root: {
                    padding: "24px",
                },
                title: {
                    fontWeight: 700,
                    fontSize: "1.25rem",
                },
                subheader: {
                    marginTop: "4px",
                    color: "#4a5568",
                },
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: "24px",
                    "&:last-child": {
                        paddingBottom: "24px",
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 12,
                        transition: "all 0.2s ease-in-out",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#667eea",
                            borderWidth: "2px",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#667eea",
                            borderWidth: "2px",
                        },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                        color: "#667eea",
                    },
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: "12px 16px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                },
                standardSuccess: {
                    backgroundColor: "#e6fffa",
                    color: "#234e52",
                },
                standardError: {
                    backgroundColor: "#fff5f5",
                    color: "#742a2a",
                },
                standardWarning: {
                    backgroundColor: "#fffaf0",
                    color: "#744210",
                },
                standardInfo: {
                    backgroundColor: "#ebf8ff",
                    color: "#2c5282",
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                },
            },
        },
        MuiLink: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    color: "#667eea",
                    textDecoration: "none",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                        color: "#764ba2",
                        textDecoration: "underline",
                        textUnderlineOffset: "4px",
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                },
            },
        },
        MuiToolbar: {
            styleOverrides: {
                root: {
                    minHeight: "64px",
                    padding: "0 24px",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
                elevation1: {
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                },
                elevation2: {
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.10)",
                },
                elevation3: {
                    boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.12)",
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: "rgba(0, 0, 0, 0.08)",
                },
            },
        },
        MuiCircularProgress: {
            styleOverrides: {
                root: {
                    animationDuration: "1s",
                },
            },
        },
    },
    transitions: {
        duration: {
            shortest: 150,
            shorter: 200,
            short: 250,
            standard: 300,
            complex: 375,
            enteringScreen: 225,
            leavingScreen: 195,
        },
        easing: {
            easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
            easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
            easeIn: "cubic-bezier(0.4, 0, 1, 1)",
            sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
        },
    },
});

// Dark mode theme variant
export const darkTheme = createTheme({
    ...theme,
    palette: {
        mode: "dark",
        background: {
            default: "#0a0e27",
            paper: "#141b3d",
        },
        text: {
            primary: "#f8fafc",
            secondary: "rgba(255,255,255,0.7)",
        },
        primary: {
            main: "#7c8ff0",
            light: "#9ba8f5",
            dark: "#667eea",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#9b6fc9",
            light: "#b491d8",
            dark: "#764ba2",
            contrastText: "#ffffff",
        },
        divider: "rgba(255, 255, 255, 0.12)",
        action: {
            hover: "rgba(124, 143, 240, 0.12)",
            selected: "rgba(124, 143, 240, 0.16)",
        },
    },
});

export default theme;