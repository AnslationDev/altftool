"use client";

import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Use relative paths instead of absolute paths
import Header from './components/Header';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';

import Features from './components/Features';
import How_it_works from './components/How_it_works';
import FAQ from './components/Faq';
import Privacy from './components/Privacy';
import AnalyzerPage from './pages/AnalyzerPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* <Header /> */}
      <HeroSection/>
      <AnalyzerPage />
      <Features />
      <How_it_works />
      <FAQ />
      <Privacy />
      <Footer />
    </ThemeProvider>
  );
}

export default App;
