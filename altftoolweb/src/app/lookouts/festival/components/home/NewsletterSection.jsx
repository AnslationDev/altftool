"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <section className="festival-newsletter">
      <span className="newsletter-icon">
        <Mail size={22} />
      </span>
      <h2>Never Miss a Celebration</h2>
      <p className="newsletter-sub-lead">
        Get upcoming festival reminders, cultural stories, and travel tips delivered to your inbox.
      </p>

      {submitted ? (
        <p className="newsletter-sub">You&apos;re on the list — festival updates are on their way.</p>
      ) : (
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit">Subscribe</button>
        </form>
      )}
      <p className="newsletter-sub">No spam. Unsubscribe anytime.</p>
    </section>
  );
}
