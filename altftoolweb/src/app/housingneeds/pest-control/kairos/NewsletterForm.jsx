"use client";

import { ArrowRight } from "lucide-react";

export default function NewsletterForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for subscribing!");
  };

  return (
    <form className="kairos-footer-subscribe-form" onSubmit={handleSubmit}>
      <input type="email" placeholder="Your email address" required aria-label="Email Address" />
      <button type="submit" aria-label="Subscribe"><ArrowRight size={18} /></button>
    </form>
  );
}
