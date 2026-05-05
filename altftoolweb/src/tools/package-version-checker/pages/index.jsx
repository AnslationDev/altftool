"use client";
import React from "react";
import HomePage from "../components/HomePage";
import Features from "../components/Features";
// import HowItWorksPage from "../components/HowItWorksPage";

const PackageVersionChecker = () => {
  return (
    <div className="min-h-screen flex flex-col bg-(--background) text-(--foreground) transition-colors duration-300">
      <HomePage />
      <Features/>
      {/* <HowItWorksPage /> */}
    </div>
  );
};

export default PackageVersionChecker;
