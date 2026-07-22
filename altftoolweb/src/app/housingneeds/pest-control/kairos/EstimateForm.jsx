"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, User, Mail, Phone, MapPin, MessageSquare, ShieldCheck, X } from "lucide-react";

export default function EstimateForm({ includeAddress = false }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    // Simulate a brief async action before confirming
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 900);
  };

  if (sent) {
    return (
      <div className="kairos-form-success" role="status">
        <button
          type="button"
          className="kairos-success-close-btn"
          onClick={() => setSent(false)}
          aria-label="Close confirmation"
        >
          <X size={16} />
        </button>
        <CheckCircle2 size={32} className="kairos-success-icon" aria-hidden="true" />
        <div className="kairos-success-text">
          <h3>Thank You!</h3>
          <p>Your request has been received. An ANSROS PEST CONTROL expert will contact you in minutes.</p>
        </div>
      </div>
    );
  }

  return (
    <form className="kairos-premium-form" onSubmit={handleSubmit}>
      <div className="kairos-form-row">
        <div className="kairos-form-field">
          <label htmlFor="form-name">Full Name</label>
          <div className="kairos-input-wrapper">
            <User className="kairos-field-icon" size={16} aria-hidden="true" />
            <input
              id="form-name"
              type="text"
              name="name"
              placeholder="Your Name..."
              required
            />
          </div>
        </div>

        <div className="kairos-form-field">
          <label htmlFor="form-email">Email Address</label>
          <div className="kairos-input-wrapper">
            <Mail className="kairos-field-icon" size={16} aria-hidden="true" />
            <input
              id="form-email"
              type="email"
              name="email"
              placeholder="example@yourmail.com"
              required
            />
          </div>
        </div>
      </div>

      <div className="kairos-form-row">
        <div className="kairos-form-field">
          <label htmlFor="form-phone">Phone Number</label>
          <div className="kairos-input-wrapper">
            <Phone className="kairos-field-icon" size={16} aria-hidden="true" />
            <input
              id="form-phone"
              type="tel"
              name="phone"
              placeholder="Phone Number..."
              required
            />
          </div>
        </div>

        {includeAddress && (
          <div className="kairos-form-field">
            <label htmlFor="form-address">Property Address</label>
            <div className="kairos-input-wrapper">
              <MapPin className="kairos-field-icon" size={16} aria-hidden="true" />
              <input
                id="form-address"
                type="text"
                name="address"
                placeholder="Property address..."
                required
              />
            </div>
          </div>
        )}
      </div>

      <div className="kairos-form-field full-width">
        <label htmlFor="form-message">How can we help you?</label>
        <div className="kairos-input-wrapper textarea-wrapper">
          <MessageSquare className="kairos-field-icon" size={16} aria-hidden="true" />
          <textarea
            id="form-message"
            name="message"
            placeholder="Tell us about your pest control needs..."
            rows={4}
          />
        </div>
      </div>

      <button className="kairos-form-submit-btn" type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 size={18} className="kairos-spin" aria-hidden="true" />
            Scheduling Inspection…
          </>
        ) : (
          <>
            GET A FREE TERMITE INSPECTION
          </>
        )}
      </button>

      <div className="kairos-form-footer-trust">
        <ShieldCheck size={14} className="kairos-trust-shield-icon" />
        <span>100% Confidential. We respect your privacy.</span>
      </div>
    </form>
  );
}
