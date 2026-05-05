"use client";
import React from "react";
import Hero from "../components/Hero";
import UrlOpener from "../components/UrlOpener";
import Features from "../components/Features";

// import Testimonials from "../components/Testimonials";

export default function BulkUrlOpenApp() {
  return (
    <div className="font-sans p-5">
      <Hero />
      <UrlOpener />
      <Features />
    </div>
  );
}