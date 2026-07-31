"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

export default function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const [{ db }, { addDoc, collection, serverTimestamp }] = await Promise.all([
        import("@/lib/firebase"),
        import("firebase/firestore"),
      ]);
      await addDoc(collection(db, "newsletter_subscribers"), {
        email,
        source: "buzzfeed-banner",
        createdAt: serverTimestamp(),
      });
    } catch {
      // Storage failing shouldn't trap the user on the form.
    } finally {
      setSubmitting(false);
    }

    setSubmitted(true);
  };

  return (
    <div className="bf-newsletter-banner">
      <div className="bf-newsletter-container">
        {!submitted ? (
          <>
            <div className="bf-newsletter-text">
              <div className="bf-newsletter-title-wrap">
                <Mail className="bf-newsletter-icon" size={24} />
                <h3>Don't miss out on the fun!</h3>
              </div>
              <p>Get the best of AltF Pulse delivered to your inbox, from quick culture stories to playful quizzes.</p>
            </div>

            <form onSubmit={handleSubmit} className="bf-newsletter-form">
              <div className="bf-newsletter-input-wrap">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className={`bf-newsletter-input ${error ? "error" : ""}`}
                  required
                />
                {error && <span className="bf-newsletter-error">{error}</span>}
              </div>
              <button type="submit" className="bf-newsletter-submit-btn" disabled={submitting}>
                {submitting ? "SUBSCRIBING..." : "SUBSCRIBE"}
              </button>
            </form>
          </>
        ) : (
          <div className="bf-newsletter-success">
            <CheckCircle2 className="bf-success-check-icon" size={40} />
            <div className="bf-success-content">
              <h3>You are on the list! 📬</h3>
              <p>Thanks for subscribing. We will send the freshest quizzes and trending news straight to <strong>{email}</strong>.</p>
            </div>
            <button
              className="bf-success-reset-btn"
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
            >
              Subscribe another email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
