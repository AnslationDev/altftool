"use client";



import React from "react";

import DomainGeneratorPage from "../components/DomainGeneratorPage";
import Features from "../components/Features";
import { DomainProvider } from "../context/DomainContext";

export default function ToolHome() {
  

  return (
    <div className="min-h-auto bg-(--background) flex flex-col">
     
      <main className="grow">
        <DomainProvider>
        <DomainGeneratorPage />
        </DomainProvider>
        <Features/>
      </main>
    </div>
  );
};