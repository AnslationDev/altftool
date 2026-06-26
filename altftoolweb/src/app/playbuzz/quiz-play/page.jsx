"use client";

import Header from '../components/Header';
import QuizPage from '../components/QuizPage';

export default function PlaybuzzQuizPlayPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <QuizPage />
    </div>
  );
}
