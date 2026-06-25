import Link from "next/link";
import { Home, Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-brand">
        <Link className="brand" href="/homeserv" aria-label="QuoteNest Pros home">
          <span className="brand-mark">
            <Home className="brand-home-icon" size={20} />
            <Sparkles className="brand-spark-icon" size={12} strokeWidth={2.6} />
          </span>
          <span>
            QuoteNest <strong>Pros</strong>
          </span>
        </Link>
        <p>Local home-service quotes with calmer comparison and clearer next steps.</p>
        <small>© 2026 QuoteNest Pros Inc. All rights reserved.</small>
      </div>
      <div className="footer-links">
        <Link href="/homeserv/privacy-policy">Privacy Policy</Link>
        <Link href="/homeserv/terms-of-use">Terms of Use</Link>
        <Link href="/homeserv/contact-us">Contact Us</Link>
      </div>
    </footer>
  );
}
