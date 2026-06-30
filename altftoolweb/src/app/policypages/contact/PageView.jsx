"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Handshake,
  Mail,
  MapPin,
  MessageSquareText,
  PhoneCall,
  Send,
} from "lucide-react";
import "../../styles/landing.css";
import "./contact.css";

const contactMethods = [
  {
    icon: MapPin,
    title: "Our Address",
    text: "AltFTool Digital Workspace, Online Support Desk",
  },
  {
    icon: Mail,
    title: "Email Address",
    text: "altftool@gmail.com",
  },
  {
    icon: PhoneCall,
    title: "Support Window",
    text: "Replies usually arrive within 24-48 hours",
  },
];

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const updateField = (field) => (event) => {
    setSent(false);
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <main className="altf-home altf-contact">
      <section className="contact-hero-banner">
        <div className="contact-hero-overlay" aria-hidden="true" />
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <nav aria-label="Breadcrumb" className="contact-breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span>Contact Us</span>
          </nav>
          <p>
            Send questions, feedback, partnerships, bug reports, or tool ideas to
            the AltFTool team. We read every message carefully.
          </p>
        </div>
      </section>

      <section className="contact-section contact-intro-section">
        <div className="contact-container contact-intro-grid">
          <div className="contact-copy">
            <div className="home-reference-badge contact-theme-badge">
              <Handshake className="h-4 w-4" strokeWidth={2.35} />
              Let&apos;s Connect
            </div>

            <h2>
              Stay In <span>Touch</span> With Us
            </h2>
            <p>
              Whether it is a bug report, feature request, partnership question,
              or general feedback, your message helps improve AltFTool for
              everyone.
            </p>

            <div className="contact-method-list">
              {contactMethods.map(({ icon: Icon, title, text }) => (
                <div className="contact-method" key={title}>
                  <span className="contact-method-icon">
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <small>{text}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-visual-card" aria-label="AltFTool support highlight">
            <div className="contact-visual-image" aria-hidden="true" />
            <div className="contact-quote-card">
              <MessageSquareText className="h-10 w-10" strokeWidth={1.95} />
              <p>
                Tell us what you are building, improving, or trying to solve. A
                clear message helps us respond with the right next step.
              </p>
              <span>AltFTool Support Team</span>
              <small>Product & User Success</small>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section contact-form-section">
        <div className="contact-container contact-form-grid">
          <div className="contact-map-panel" aria-label="AltFTool online support map">
            <iframe
              className="contact-map-embed"
              title="AltFTool location map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-0.155%2C51.498%2C-0.105%2C51.522&layer=mapnik"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="contact-map-card">
              <strong>AltFTool Support</strong>
              <span>Online workspace for tools, extensions, and apps</span>
              <small>Average reply: 24-48 hours</small>
            </div>
          </div>

          <form className="contact-form-card" onSubmit={handleSubmit}>
            <h2>
              Lets Send <span>Message</span> For Us
            </h2>

            <div className="contact-form-fields">
              <label>
                <span>Name</span>
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  value={formData.name}
                  onChange={updateField("name")}
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  placeholder="Your email"
                  required
                  value={formData.email}
                  onChange={updateField("email")}
                />
              </label>

              <label className="contact-form-wide">
                <span>Subject</span>
                <select
                  value={formData.subject}
                  onChange={updateField("subject")}
                  aria-label="Choose subject"
                >
                  <option value="">Choose subject</option>
                  <option value="bug">Bug report</option>
                  <option value="feature">Feature request</option>
                  <option value="partnership">Partnership</option>
                  <option value="support">General support</option>
                </select>
              </label>

              <label className="contact-form-wide">
                <span>Message</span>
                <textarea
                  placeholder="Your message..."
                  required
                  value={formData.message}
                  onChange={updateField("message")}
                />
              </label>
            </div>

            {sent ? (
              <p className="contact-success" role="status">
                Message sent. We&apos;ll get back to you shortly.
              </p>
            ) : null}

            <button type="submit" className="contact-submit-button">
              Send Message
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </form>
        </div>
      </section>

      <section className="contact-section contact-newsletter-section">
        <div className="contact-container">
          <div className="contact-newsletter-card">
            <div className="contact-newsletter-icon">
              <Send className="h-7 w-7" strokeWidth={2.1} />
            </div>
            <div>
              <h2>
                Subscribe Our <span>Newsletter</span>
              </h2>
              <p>
                Get the latest updates, tools, and productivity tips delivered
                to your inbox.
              </p>
            </div>
            <form className="contact-newsletter-form">
              <label className="sr-only" htmlFor="contact-newsletter-email">
                Email Address
              </label>
              <input
                id="contact-newsletter-email"
                type="email"
                placeholder="Email Address"
              />
              <button type="submit">
                Subscribe
                <ArrowRight className="h-4 w-4" strokeWidth={2.35} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
