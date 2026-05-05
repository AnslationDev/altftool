"use client";
import Header from "../components/Header";
import Features from "../components/Features";
import Home from "../components/Home";
export default function ToolHome() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 w-full mx-auto py-6 px-3">
        <Home />
      </div>
      <Features />
    </div>
  );
}