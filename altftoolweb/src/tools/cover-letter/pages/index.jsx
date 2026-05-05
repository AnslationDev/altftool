
"use client";


import React, { useState } from "react";

import Generator from "../components/Generator";
import Landing from "../components/LandingPage";
import Features from "../components/Features";

const App = () => {
  const [isDark, setIsDark] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  return (
    <div
     className="bg-(--background) text-(--foreground)"
    >
      
      <main>
        {!showGenerator ? (
          <Landing onGetStarted={() => setShowGenerator(true)}  />
        ) : (
          <Generator />
        )}
      </main>
    <Features/>
    
      
    </div>
  );
};

export default App;
