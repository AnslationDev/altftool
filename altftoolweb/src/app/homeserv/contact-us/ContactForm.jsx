"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!showToast) return;

    const timeout = window.setTimeout(() => {
      setShowToast(false);
    }, 3200);

    return () => window.clearTimeout(timeout);
  }, [showToast]);

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      const messages = JSON.parse(window.localStorage.getItem("homeserv_contact_messages") || "[]");
      messages.push({ ...data, submittedAt: new Date().toISOString() });
      window.localStorage.setItem("homeserv_contact_messages", JSON.stringify(messages));
    } catch {
      // localStorage can be unavailable in private browsing; the success state still works.
    }
    form.reset();
    setShowToast(true);
  }

  return (
    <>
      <form className="hs-contact-form" onSubmit={handleSubmit}>
        <div className="hs-contact-grid">
          <label>
            Full name
            <input name="name" type="text" placeholder="Maya Bennett" required />
          </label>
          <label>
            Email address
            <input name="email" type="email" placeholder="maya@example.com" required />
          </label>
        </div>
        <div className="hs-contact-grid">
          <label>
            Phone number
            <input name="phone" type="tel" placeholder="(555) 123-4567" />
          </label>
          <label>
            ZIP code
            <input name="zip" inputMode="numeric" maxLength={5} pattern="[0-9]{5}" placeholder="10001" />
          </label>
        </div>
        <label>
          Reason for contacting us
          <select name="reason" defaultValue="" required>
            <option value="" disabled>
              Select a reason
            </option>
            <option>Help with a quote request</option>
            <option>Question about local pros</option>
            <option>Update my project details</option>
            <option>General support</option>
          </select>
        </label>
        <label>
          Message
          <textarea name="message" placeholder="Tell us what you need help with, including the service type and any timing details." rows={6} required />
        </label>
        <div className="hs-contact-submit">
          <button type="submit">Send Message</button>
          <span>Demo form — your message is saved only in this browser, not sent to anyone.</span>
        </div>
      </form>

      {showToast ? (
        <div className="hs-toast" role="status" aria-live="polite">
          <CheckCircle2 size={20} />
          <span>Saved locally. This is a demo form, so nothing was actually sent.</span>
          <button type="button" aria-label="Close notification" onClick={() => setShowToast(false)}>
            ×
          </button>
        </div>
      ) : null}
    </>
  );
}
