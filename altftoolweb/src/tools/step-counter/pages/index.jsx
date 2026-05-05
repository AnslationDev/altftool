"use client";
import React, { useState } from "react";

import LandingPage from "../components/LandingPage.jsx";
import Count from "../components/Count.jsx";

const StepApp = () => {
  const [currentPage, setCurrentPage] = useState("landing");

  const navigate = (page) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage(page);
  };

  return (
    <div className="bg-(--background) flex flex-col font-secondary">
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {currentPage === "landing" && (
          <LandingPage onStart={() => navigate("app")} />
        )}

       {currentPage === "app" && (
  <Count onBack={() => navigate("landing")} />
)}
      </main>
    </div>
  );
};

export default StepApp;
