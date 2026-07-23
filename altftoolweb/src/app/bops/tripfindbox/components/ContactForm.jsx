"use client";

import { useState } from "react";

const initialState = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function ContactForm() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSent(false);
  }

  function submitForm(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!form.message.trim()) nextErrors.message = "Please tell us how we can help.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setSent(true);
      setForm(initialState);
    }
  }

  return (
    <form className="tripnest-contact-form" onSubmit={submitForm} noValidate>
      <div className="tripnest-contact-form-grid">
        <label>
          <span>Name</span>
          <input
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Enter your name"
          />
          {errors.name ? <small>{errors.name}</small> : null}
        </label>
        <label>
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="Enter your email"
          />
          {errors.email ? <small>{errors.email}</small> : null}
        </label>
      </div>
      <label>
        <span>Phone Number</span>
        <input
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          placeholder="Enter your phone number"
        />
      </label>
      <label>
        <span>Message</span>
        <textarea
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          placeholder="Share your route, travel date, or booking question"
          rows={5}
        />
        {errors.message ? <small>{errors.message}</small> : null}
      </label>
      <button type="submit">Send Message</button>
      {sent ? <p className="tripnest-contact-success">Thanks. Your message has been received, and our TripFindBox team will get back to you soon.</p> : null}
    </form>
  );
}
