import { useState } from 'react';
import './Header.css';

const CONTACT_URL = '/policypages/contact';

function LogoSVG() {
  return (
    <svg viewBox="0 0 180 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" fill="#4AAB3D"/>
      <text x="24" y="19" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">PEST</text>
      <text x="24" y="31" textAnchor="middle" fill="#fff" fontSize="7">KILLER</text>
      <text x="108" y="21" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="800">PEST KILLER</text>
      <text x="108" y="36" textAnchor="middle" fill="#4AAB3D" fontSize="9" fontWeight="600">COMPANY</text>
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: 'Home', href: '#' },
    { label: 'About Us', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Testimonial', href: '#testimonial' },
    { label: 'Contact Us', href: CONTACT_URL },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-logo" style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><LogoSVG /></div>
        <nav className="header-nav">
          {links.map(l => <a key={l.label} href={l.href}>{l.label}</a>)}
        </nav>
        <div className="header-cta">
          <a href={CONTACT_URL} className="btn-green">Book Free Inspection</a>
        </div>
        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="menu">
          <i className={open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'}></i>
        </button>
      </div>
      <div className={`mobile-nav ${open ? 'open' : ''}`}>
        {links.map(l => <a key={l.label} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
        <a href={CONTACT_URL} className="btn-green">Book Free Inspection</a>
      </div>
    </header>
  );
}
