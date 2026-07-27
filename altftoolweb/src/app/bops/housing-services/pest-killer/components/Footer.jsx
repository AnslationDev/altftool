import { useState } from 'react';
import './Footer.css';

const CONTACT_URL = '/policypages/contact';

function LogoSVG() {
  return (
    <svg viewBox="0 0 180 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '180px' }}>
      <circle cx="24" cy="24" r="20" fill="#4AAB3D" />
      <text x="24" y="19" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">PEST</text>
      <text x="24" y="31" textAnchor="middle" fill="#fff" fontSize="7">KILLER</text>
      <text x="108" y="21" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="800">Pest Killer</text>
      <text x="108" y="31" textAnchor="middle" fill="#ddd" fontSize="8" fontWeight="500">Providing Pest Control Since 1998</text>
      <text x="108" y="40" textAnchor="middle" fill="#aaa" fontSize="6" fontWeight="400">ISO 9001:2015 certified company</text>
    </svg>
  );
}

export default function Footer() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    e.target.reset();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">

          {/* Left Column */}
          <div className="footer-about">
            <div className="footer-logo"><LogoSVG /></div>
            <p>We are pleased to introduce ourselves as professional pest control experts with experienced staff handling all pest problems efficiently.</p>

            <div className="divider"></div>

            <div className="social-heading">Follow Us On Socials:</div>
            <div className="footer-social">
              <a href="https://pinterest.com" target="_blank" rel="noreferrer"><i className="fa-brands fa-pinterest-p"></i></a>
              <a href="https://x.com" target="_blank" rel="noreferrer"><i className="fa-brands fa-x-twitter"></i></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer"><i className="fa-brands fa-instagram"></i></a>
            </div>

          </div>

          {/* Right Box containing 3 columns */}
          <div className="footer-right-box">
            <div className="footer-col footer-links">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#services">Our Services</a></li>
                {/* <li><a href="#">Blogs</a></li> */}
                <li><a href={CONTACT_URL}>Contact Us</a></li>
              </ul>
            </div>

            <div className="footer-col footer-links">
              <h3>Our Services</h3>
              <ul>
                <li><a href="#services">Cockroach Control</a></li>
                <li><a href="#services">Rodent Control</a></li>
                <li><a href="#services">Mosquito Control</a></li>
                <li><a href="#services">Spider Control</a></li>
                <li><a href="#services">Fly Control</a></li>
                <li><a href="#services">Ant Control</a></li>
                <li><a href="#services">Bed Bug Control</a></li>
                <li><a href="#services">General Pest Control</a></li>
                <li><a href="#services">Anti Termite Treatment</a></li>
              </ul>
            </div>

            <div className="footer-col footer-form-col">
              <h3>Get Free Pest Control Consultation</h3>
              <p>Fill the form and our team will contact you quickly with the best pest control solution.</p>
              <form className="footer-form" onSubmit={handleSubmit}>
                <input type="text" placeholder="Your Name *" required />
                <input type="tel" placeholder="Phone Number *" required onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} />
                <input type="email" placeholder="Email Address *" required />
                <input type="text" placeholder="Your Message" />
                <button type="submit" className="btn-green">Submit Now <i className="fa-solid fa-arrow-up-right-from-square" style={{ marginLeft: '6px', fontSize: '13px' }}></i></button>
                {sent && <div className="toast-msg">We will contact you soon!</div>}
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-contact-bar">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-item">
              <div className="contact-item-icon"><i className="fa-solid fa-envelope"></i></div>
              <div className="contact-item-text">
                <p>Get in touch</p>
                <h4>Contact us</h4>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-item-icon"><i className="fa-solid fa-envelope"></i></div>
              <div className="contact-item-text">
                <p>Email Address</p>
                <h4>pcds.ggn@gmail.com</h4>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-item-icon"><i className="fa-solid fa-location-dot"></i></div>
              <div className="contact-item-text">
                <p>Regd. Off</p>
                <h4>Office No. 005,Near Daultabad Flyover, Sec 105, Gurugram</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-copyright">
        <div className="container">
          <p>Copyright &copy; 2026 All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
