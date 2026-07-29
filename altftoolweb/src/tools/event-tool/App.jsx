"use client";

import React, { useState } from 'react';
import Header from './Components/Header';
import Footer from './Components/Footer';
import Landing from './pages/Landing';
import Event from './pages/Event';

const App = () => {
  // const [isDark, setIsDark] = useState(false);
  const [currentPage, setCurrentPage] = useState('landing');

  return (
    <div
      style={{
        minHeight: '100vh',
        background
          : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #fce7f3 100%)',
        color:  '#1e293b',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      {/* <Header
        isDark={isDark}
        setIsDark={setIsDark}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      /> */}

      {/* Main Content */}
      <main style={{ width: '100%', minHeight: 'calc(100vh - 400px)' }}>
        {currentPage === 'landing' ? (
          <Landing  setCurrentPage={setCurrentPage} />
        ) : (
          <Event />
        )}
      </main>

      {/* Footer */}
      {/* <Footer isDark={isDark} /> */}

      {/* Global Styles */}
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
              sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          button {
            font-family: inherit;
          }

          input[type="date"]::-webkit-calendar-picker-indicator {

            cursor: pointer;
          }

          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }

          /* Remove default input styling */
          input:focus,
          button:focus {
            outline: 2px solid #6366f1;
            outline-offset: 2px;
          }

          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 12px;
          }

          ::-webkit-scrollbar-track {
            background: ${ '#f8fafc'};
          }

          ::-webkit-scrollbar-thumb {
            background: ${ '#cbd5e1'};
            border-radius: 6px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: ${ '#94a3b8'};
          }
        `}
      </style>
    </div>
  );
};

export default App;
