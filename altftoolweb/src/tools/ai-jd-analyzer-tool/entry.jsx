"use client";

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import AnalyzerPage from './pages/AnalyzerPage';
import lightTheme, { darkTheme } from './theme';

// AltFTool switches light/dark via a `data-theme` attribute on <html>
// (see globals.css: `@custom-variant dark (&:where([data-theme="dark"]))`).
// Read it reactively so this MUI-based tool follows the site theme toggle,
// without depending on `next-themes` (which isn't installed or used anywhere
// else in the app).
function useResolvedTheme() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const root = document.documentElement;
    const read = () =>
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

export default function AIJDAnalyzerEntry() {
  const resolvedTheme = useResolvedTheme();

  return (
    <ThemeProvider theme={resolvedTheme === 'dark' ? darkTheme : lightTheme}>
      <AnalyzerPage />
    </ThemeProvider>
  );
}
