import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const FOOTER_LINKS = [
  {
    heading: "Discover",
    links: [
      { label: "All Festivals", href: "/lookouts/festival/calendar" },
      { label: "Upcoming Festivals", href: "/lookouts/festival/calendar" },
      { label: "Categories", href: "/lookouts/festival#categories" },
      { label: "Religions", href: "/lookouts/festival#religions" },
    ],
  },
  {
    heading: "Browse By",
    links: [
      { label: "Countries", href: "/lookouts/festival#countries" },
      { label: "Religions", href: "/lookouts/festival#religions" },
      { label: "Categories", href: "/lookouts/festival#categories" },
      { label: "Monthly Calendar", href: "/lookouts/festival/calendar" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { label: "Festival History", href: "/lookouts/festival#featured" },
      { label: "Cultural Traditions", href: "/lookouts/festival#featured" },
      { label: "Traditional Foods", href: "/lookouts/festival#food" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/policypages/about" },
      { label: "Contact", href: "/policypages/contact" },
      { label: "Privacy Policy", href: "/policypages/privacy" },
      { label: "Terms of Service", href: "/policypages/termsandconditions" },
    ],
  },
];

export default function FestivalFooter() {
  return (
    <footer className="festival-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>World Festival Hub</h3>
          <p>Explore every celebration, tradition, and festival from across the globe.</p>
          <div className="social-links">
            <a href="https://twitter.com" target="_blank" rel="noreferrer noopener" aria-label="Twitter">
              <Twitter size={15} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer noopener" aria-label="Instagram">
              <Instagram size={15} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer noopener" aria-label="YouTube">
              <Youtube size={15} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer noopener" aria-label="Facebook">
              <Facebook size={15} />
            </a>
          </div>
        </div>

        <div className="footer-links">
          {FOOTER_LINKS.map((group) => (
            <div key={group.heading}>
              <h4>{group.heading}</h4>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} World Festival Hub. All rights reserved.</span>
        <span>Made with ♥ for culture lovers worldwide</span>
      </div>
    </footer>
  );
}
