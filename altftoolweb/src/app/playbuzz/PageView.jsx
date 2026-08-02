"use client";

import Header from './components/Header';
import Home from './components/Home';

// `children` is the server-rendered page h1 built in page.jsx; it is threaded
// through to Home so it lands at the top of <main> instead of above the header.
export default function PlaybuzzHomePage({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <Home>{children}</Home>
    </div>
  );
}
