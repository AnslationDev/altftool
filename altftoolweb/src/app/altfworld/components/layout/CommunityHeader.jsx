"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const navItems = [
  ["Home", "/altfworld"],
  ["Forums", "/altfworld/forums"],
  ["Marketplace", "/altfworld/marketplace"],
  ["Resources", "/altfworld/resources"],
  ["Members", "/altfworld/members"],
];

function Glyph({ children }) {
  return <span className="glyph" aria-hidden="true">{children}</span>;
}

export default function CommunityHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState(null);
  const pathname = usePathname();

  const isActive = (href) => {
    if (!pathname) return false;
    if (href === "/altfworld") {
      return pathname === "/altfworld";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="community-header">
      <div className="nav-shell">
        <Link className="orbit-logo" href="/altfworld" aria-label="AltfWorld community home">
          <span className="orbit-logo-mark"><i /><i /><i /></span><span>altf<span>world</span></span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={isActive(href) ? "active" : ""}
              aria-current={isActive(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <Link className="new-link" href="/altfworld/forums?view=latest">What&apos;s new <b>•</b></Link>
        </nav>
        <div className="header-actions">
          <div className="popover-wrap">
            <button className="round-control badge-control" onClick={() => setPanel(panel === "alerts" ? null : "alerts")} aria-label="Show mock notifications"><Glyph>♧</Glyph><b>3</b></button>
            <AnimatePresence>{panel === "alerts" && <motion.div className="header-popover" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><p className="popover-label">NOTIFICATIONS</p><a href="#latest">Mira replied to your saved thread</a><a href="#latest">A new guide is trending today</a><a href="#latest">Your weekly community digest is ready</a><small>Mock notifications for this learning project</small></motion.div>}</AnimatePresence>
          </div>
          <div className="popover-wrap">
            <button className="round-control" onClick={() => setPanel(panel === "inbox" ? null : "inbox")} aria-label="Show mock inbox"><Glyph>✉</Glyph></button>
            <AnimatePresence>{panel === "inbox" && <motion.div className="header-popover inbox-popover" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><p className="popover-label">INBOX</p><a href="#latest"><span className="mini-avatar">MC</span> Mira shared a helpful note</a><a href="#latest"><span className="mini-avatar blue">JB</span> Jon sent a resource</a><small>Messaging is display-only in this demo</small></motion.div>}</AnimatePresence>
          </div>
          <Link className="premium-link" href="/altfworld/marketplace">Explore plus</Link>
          <Link className="return-tools-link" href="/">Return to AltfTools ↗</Link>
          <button className="mobile-trigger" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation"><span /><span /><span /></button>
        </div>
      </div>
      <AnimatePresence>{menuOpen && <motion.nav className="mobile-nav" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} aria-label="Mobile primary navigation">{navItems.map(([label, href]) => <Link onClick={() => setMenuOpen(false)} key={href} href={href} className={isActive(href) ? "active" : ""}>{label}</Link>)}<Link onClick={() => setMenuOpen(false)} href="/altfworld/search">Search community</Link><Link onClick={() => setMenuOpen(false)} href="/altfworld/about">About AltfWorld</Link><Link onClick={() => setMenuOpen(false)} href="/">Return to AltfTools ↗</Link></motion.nav>}</AnimatePresence>
    </header>
  );
}
