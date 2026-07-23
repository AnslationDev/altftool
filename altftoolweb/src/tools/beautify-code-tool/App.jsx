"use client";

import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import EditorPage from './components/EditorPage';
import HowItWorks from './components/howitworks';

// --- DARK THEME CONFIGURATION ---
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0f172a', // Slate-950
      paper: '#1e293b',   // Slate-800
    },
    primary: {
      main: '#3b82f6',    // Blue-500
      light: '#60a5fa',
      dark: '#2563eb',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    text: {
      primary: '#f1f5f9', // Slate-100
      secondary: '#94a3b8', // Slate-400
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none', // More modern look
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default Material elevation overlay
        },
      },
    },
  },
});

const App = () => {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'editor'

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* <Header
          currentView={currentView}
          setView={setCurrentView}
        /> */}

        {currentView === 'landing' ? (
          <LandingPage onStart={() => setCurrentView('editor')} />
        ) : (
          <EditorPage />
        )}




 <howitworks />


        {/* <Footer /> */}
      </Box>
    </ThemeProvider>
  );
};

export default App;
