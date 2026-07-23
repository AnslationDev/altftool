import { ArrowRight, Mail, Phone } from 'lucide-react';
import '../styles/Footer.css';

const companyLinks = [
  { label: 'Services', href: '#services' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
];

const supportLinks = [
  { label: '(800) 555-0100', href: 'tel:8005550100' },
  { label: 'info@flowpro.com', href: 'mailto:info@flowpro.com' },
  { label: 'Book a Plumber', href: '#book-form' },
  { label: 'Free Estimate', href: '#book-form' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="fp-footer">
      <div className="fp-footer__inner">
        <div className="fp-footer__top">
          <div className="fp-footer__brand">
            <a href="#" className="fp-footer__logo" aria-label="FlowPro home">

              <span className="fp-footer__logo-text">FlowPro</span>
            </a>
            <p className="fp-footer__tagline">
              Licensed plumbers at your door in under 60 minutes. Clear pricing, clean work, 24/7 response.
            </p>
            <div className="fp-footer__contact-row">
              <a href="tel:8005550100"><Phone size={14} /> Call</a>
              <a href="mailto:info@flowpro.com"><Mail size={14} /> Email</a>
            </div>
          </div>

          <div className="fp-footer__nav">
            <div className="fp-footer__cols">
              <div>
                <span className="fp-footer__col-heading">Company</span>
                <ul className="fp-footer__col-list">
                  {companyLinks.map((link) => (
                    <li key={link.label}><a href={link.href}>{link.label}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="fp-footer__col-heading">Support</span>
                <ul className="fp-footer__col-list">
                  {supportLinks.map((link) => (
                    <li key={link.label}><a href={link.href}>{link.label}</a></li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="fp-footer__cta">
              <span className="fp-footer__cta-label">Need help now?</span>
              <p>Book online or call dispatch. A licensed plumber can be on the way fast.</p>
              <a href="#book-form" className="fp-footer__cta-btn">
                Book Now <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>

        <div className="fp-footer__bottom">
          <p className="fp-footer__copy">© {year} FlowPro Inc. All rights reserved.</p>

        </div>
      </div>
    </footer>
  );
}
