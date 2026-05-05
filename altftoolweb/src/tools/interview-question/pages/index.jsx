
"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import LandingPage from '../components/LandingPage';
import QuestionBank from '../components/QuestionBank';
import Features from '../components/Features';


export default function ToolHome() {
  const [selectedDomain, setSelectedDomain] = useState(null);

  return (
    <div className="bg-(--background) text-(--foreground) min-h-screen">
      <Header onHomeClick={() => setSelectedDomain(null)} />
      
      <main className="main-content">
        {!selectedDomain ? (
          <LandingPage onSelectDomain={(id) => setSelectedDomain(id)} />
        ) : (
          <QuestionBank 
            selectedDomainId={selectedDomain} 
            onBack={() => setSelectedDomain(null)} 
          />
        )}
        <Features/>
      </main>

  
    </div>
  );
}


