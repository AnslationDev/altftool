"use client";

import Header from './components/Header';
import Home from './components/Home';

export default function PlaybuzzHomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <Home />
    </div>
  );
}
