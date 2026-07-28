"use client";

import Link from "next/link";
import { useState } from "react";

const columns = [
  { title: "Community", links: [["Forums", "/altfworld/forums"], ["Members", "/altfworld/members"], ["What’s new", "/altfworld/forums?view=latest"], ["About", "/altfworld/about"]] },
  { title: "Marketplace", links: [["Browse listings", "/altfworld/marketplace"], ["Services", "/altfworld/marketplace?type=services"], ["Templates", "/altfworld/marketplace?type=templates"], ["Guidelines", "/altfworld/about"]] },
  { title: "Resources", links: [["Reading room", "/altfworld/resources"], ["Community guides", "/altfworld/resources?type=guide"], ["Start here", "/altfworld/about"], ["Search", "/altfworld/search"]] },
];

export default function CommunityFooter() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <footer className="community-footer">
      <div className="footer-shell">
        <section className="footer-intro">
          <Link className="orbit-logo footer-logo" href="/altfworld"><span className="orbit-logo-mark"><i /><i /><i /></span><span>altf<span>world</span></span></Link>
          <p>A thoughtful space for people building useful things on the internet.</p>
          <div className="social-row"><a href="#social" aria-label="Social placeholder">◎</a><a href="#social" aria-label="Social placeholder">◌</a><a href="#social" aria-label="Social placeholder">◒</a></div>
        </section>
        {columns.map((column) => <section className="footer-column" key={column.title}><h2>{column.title}</h2>{column.links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</section>)}
        <section className="newsletter"><p className="footer-kicker">THE WEEKLY ORBIT</p><h2>Small signals. Good ideas.</h2><p>A quiet roundup of useful community conversations.</p><form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}><input type="email" required placeholder="Your email address" aria-label="Email address" /><button>{submitted ? "You’re in" : "Subscribe"}</button></form>{submitted && <small>Thanks — this is a mock newsletter signup.</small>}</section>
      </div>
      <div className="footer-floor"><div><span>© 2025 AltfWorld</span><span>v1.0 learning project</span></div><div><Link href="/altfworld/about">Terms</Link><Link href="/altfworld/about">Privacy</Link><Link href="/altfworld/about">Guidelines</Link></div></div>
    </footer>
  );
}
