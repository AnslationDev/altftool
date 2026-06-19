import Image from "next/image";
import Link from "next/link";
import MobileMenu from "./MobileMenu";

export default function ResultsHeader() {
  return (
    <header className="results-brand-header">
      <Link href="/tripfindbox" className="results-logo">
        <Image
          src="/tripfindbox/tripfindbox_logo.png"
          alt="TripFindBox"
          width={710}
          height={176}
          priority
        />
      </Link>
      <nav aria-label="Results navigation">
        <Link href="/tripfindbox">Flights</Link>
        <Link href="/tripfindbox">Deals</Link>
        <Link href="/tripfindbox">Support</Link>
      </nav>
      <a className="results-call" href="tel:+17147827278">
        <span><PhoneIcon /></span>
        <strong>+1-714-782-7278</strong>
        <small>Call 24/7 for best deals</small>
      </a>
      <MobileMenu
        className="results-menu"
        iconSize={28}
        links={[
          { href: "/", label: "Flights" },
          { href: "/top-airline-deals", label: "Deals" },
          { href: "/site-map", label: "Sitemap" },
          { href: "/contact-us", label: "Support" },
        ]}
      />
    </header>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M6.6 10.8c1.4 2.8 3.7 5 6.5 6.5l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.6.6 4 .6.7 0 1.2.5 1.2 1.2v3.4c0 .7-.5 1.2-1.2 1.2C10.7 21.2 2.8 13.3 2.8 3.5c0-.7.5-1.2 1.2-1.2h3.4c.7 0 1.2.5 1.2 1.2 0 1.4.2 2.8.6 4 .1.4 0 .9-.3 1.2l-2.3 2.1Z"
        fill="currentColor"
      />
    </svg>
  );
}
