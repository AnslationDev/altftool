import { useState } from 'react';
import heroBg from '../assets/hero-bg.webp';
import './Hero.css';

export default function Hero() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const lead = Object.fromEntries(new FormData(form).entries());
    try {
      const leads = JSON.parse(window.localStorage.getItem('pest_killer_leads') || '[]');
      leads.push({ ...lead, submittedAt: new Date().toISOString() });
      window.localStorage.setItem('pest_killer_leads', JSON.stringify(leads));
    } catch {
      // Local storage can be unavailable in private browsing; the success state still works.
    }
    form.reset();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <section className="hero">
      <div className="hero-bg"><img src={heroBg?.src || heroBg} alt="Pest Control" /></div>
      <div className="hero-overlay"></div>
      <div className="container">
        <div className="hero-left">
          <span className="hero-tag">Eco-Friendly Pest Control Solutions</span>
          <h1>Safe, Effective Pest Control for Cleaner Homes &amp; Businesses</h1>
          <ul className="hero-list">
            <li>Termite, Cockroach, Bed Bugs &amp; Mosquito Control</li>
            <li>Kid-safe, pet-conscious &amp; odorless treatments</li>
            <li>Free Inspection &amp; Same-Day Service</li>
          </ul>
          <div className="hero-actions">
            <a href="#demo-only" className="btn-green">
              <i className="fa-solid fa-phone" style={{ marginRight: '8px' }}></i> Call Now
            </a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-form-box">
            <h3>Get a Free Quote</h3>
            <form onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="pk-hero-name">Your Name</label>
              <input id="pk-hero-name" name="name" type="text" placeholder="Your Name" required />
              <label className="sr-only" htmlFor="pk-hero-phone">Phone Number</label>
              <input id="pk-hero-phone" name="phone" type="tel" placeholder="Phone Number" required onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} />
              <label className="sr-only" htmlFor="pk-hero-email">Email Address</label>
              <input id="pk-hero-email" name="email" type="email" placeholder="Email Address" required />
              <label className="sr-only" htmlFor="pk-hero-message">Message</label>
              <textarea id="pk-hero-message" name="message" placeholder="Message"></textarea>
              <button type="submit" className="btn-green" disabled={submitted}>
                {submitted ? "Thank you! We will call you back soon." : "Submit Enquiry"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
