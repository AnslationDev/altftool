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
      <title>Pest Killer Company | Trusted Pest Control Services</title>
      <meta name="description" content="Trusted Termite & Pest Control Services in Gurugram. Safe for Kids & Pets. Free Inspection & Same-Day Service." />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

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
