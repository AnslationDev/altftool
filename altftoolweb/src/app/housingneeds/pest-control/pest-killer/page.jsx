"use client";

import Topbar from './components/Topbar.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Services from './components/Services.jsx';
import About from './components/About.jsx';
import Approach from './components/Approach.jsx';
import Testimonials from './components/Testimonials.jsx';
import Footer from './components/Footer.jsx';
import FloatingButtons from './components/FloatingButtons.jsx';
import ScrollReveal from './components/ScrollReveal.jsx';
import './index.css';

export default function Page() {
  return (
    <div className="pest-killer-root">
      <ScrollReveal />
      <Topbar />
      <Header />
      <Hero />
      <Services />
      <About />
      <Approach />
      <Testimonials />
      <Footer />
      <FloatingButtons />
    </div>
  );
}
