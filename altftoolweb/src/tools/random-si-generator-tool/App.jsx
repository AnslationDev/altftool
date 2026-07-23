"use client";

import React, { useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useTheme as useNextTheme } from 'next-themes';
// Use relative paths instead of absolute paths
import Header from "./components/Header";
// import Footer from './components/Footer';

import IdeaGenerator from "./components/IdeaGenerator";
import SavedIdeas from "./components/SavedIdeas";
import HowItWorks from "./components/HowItWorks";
import FAQ from "./components/Faq";
import Privacy from "./components/Privacy";

function App() {
  const { resolvedTheme } = useNextTheme();
  const darkMode = resolvedTheme === 'dark';
  const [savedIdeas, setSavedIdeas] = useState(() => {
    const saved = localStorage.getItem("savedIdeas");
    return saved ? JSON.parse(saved) : [];
  });

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#3b82f6",
      },
      secondary: {
        main: "#7c3aed",
      },
      background: {
        default: darkMode ? "#0a0e27" : "#f5f7fa",
        paper: darkMode ? "#141b3d" : "#ffffff",
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
  });

  const saveIdea = (idea) => {
    const newSaved = [
      ...savedIdeas,
      { ...idea, savedAt: new Date().toISOString() },
    ];
    setSavedIdeas(newSaved);
    localStorage.setItem("savedIdeas", JSON.stringify(newSaved));
  };

  const deleteIdea = (ideaId) => {
    const filtered = savedIdeas.filter((idea) => idea.id !== ideaId);
    setSavedIdeas(filtered);
    localStorage.setItem("savedIdeas", JSON.stringify(filtered));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          minHeight: "100vh",
          background: darkMode
            ? "linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%)"
            : "linear-gradient(135deg, #f0f9ff 0%, #fef3f8 100%)",
        }}
      >
        <IdeaGenerator
          darkMode={darkMode}
          onSave={saveIdea}
          savedIdeas={savedIdeas}
        />
        <SavedIdeas
          ideas={savedIdeas}
          onDelete={deleteIdea}
          darkMode={darkMode}
        />
        <HowItWorks darkMode={darkMode} />
        <FAQ darkMode={darkMode} />
        <Privacy darkMode={darkMode} />
        {/* <Footer darkMode={darkMode} /> */}
      </div>
    </ThemeProvider>
  );
}

export default App;
