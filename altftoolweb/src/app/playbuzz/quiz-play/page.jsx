"use client";

import { useEffect } from 'react';
import Header from '../components/Header';
import QuizPage from '../components/QuizPage';

export default function PlaybuzzQuizPlayPage() {
  useEffect(() => {
    const selectors = [
      'header',
      '#main-header',
      '[data-cookie-banner]',
      '[data-newsletter-dialog]',
      '[data-chatbot]',
    ];

    const touched = [];
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((node) => {
        if (!node.closest('.app-container')) {
          touched.push({ node, display: node.style.display });
          node.style.display = 'none';
        }
      });
    });

    return () => {
      touched.forEach(({ node, display }) => {
        node.style.display = display;
      });
    };
  }, []);

  return (
    <>
      <div className="app-container">
        <Header />
        <QuizPage />
      </div>

      <style jsx global>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #ececec;
        }

        .main-content {
          flex-grow: 1;
          width: 100%;
          max-width: 1760px;
          margin: 0 auto;
          padding: 0 86px;
        }

        @media (max-width: 1400px) {
          .main-content {
            padding: 0 42px;
          }
        }

        @media (max-width: 900px) {
          .main-content {
            padding: 0 18px;
          }
        }
      `}</style>
    </>
  );
}
