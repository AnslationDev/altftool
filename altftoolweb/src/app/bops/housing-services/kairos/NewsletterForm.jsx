"use client";

import { ArrowRight } from "lucide-react";

export default function NewsletterForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const lead = Object.fromEntries(new FormData(form).entries());
    try {
      const leads = JSON.parse(window.localStorage.getItem("kairos_leads") || "[]");
      leads.push({ ...lead, submittedAt: new Date().toISOString() });
      window.localStorage.setItem("kairos_leads", JSON.stringify(leads));
    } catch {
      // Local storage can be unavailable in private browsing; the success state still works.
    }
    form.reset();
    alert("Thank you for subscribing!");
  };

  return (
    <form className="kairos-footer-subscribe-form" onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Your email address" required aria-label="Email Address" />
      <button type="submit" aria-label="Subscribe"><ArrowRight size={18} /></button>
    </form>
  );
}
