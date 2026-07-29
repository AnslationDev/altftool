import { useState } from 'react';
import heroBg from '../assets/hero-bg.webp';
import './Hero.css';

export default function Hero() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    e.target.reset();
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
            <a href="tel:+919711177747" className="btn-green">
              <i className="fa-solid fa-phone" style={{ marginRight: '8px' }}></i> Call Now
            </a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-form-box">
            <h3>Get a Free Quote</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Your Name" required />
              <input type="tel" placeholder="Phone Number" required onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} />
              <input type="email" placeholder="Email Address" required />
              <textarea placeholder="Message"></textarea>
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
