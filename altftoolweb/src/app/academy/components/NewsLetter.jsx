"use client";

import { Mail, X, CircleCheck } from "lucide-react";
import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const handleSubmit = (event) => {
    event?.preventDefault();
    if (!email) return setError("Email address is required.");
    if (!validate(email)) return setError("Please enter a valid email address.");
    setError("");
    setSuccess(true);
  };

  return (
    <div className="flex flex-col ">
      {/* Heading */}
      <h2 className="section-title">
        Don&apos;t miss any Information from us!
      </h2>


      <p className="section-subtitle">
        Sign up to our regular newsletter for news, insights, new product
        releases &amp; more.
      </p>


      <form onSubmit={handleSubmit} className="mt-2 flex w-full max-w-[31.75rem] flex-col gap-3 sm:mt-3 sm:flex-row sm:items-center sm:gap-4">


        <div className={`flex h-11 w-full items-center gap-2 rounded-[8px] border bg-[var(--background)] px-4 transition-all duration-300 ease-out sm:h-14 sm:flex-1 sm:px-6
                focus-within:shadow-[0px_12px_24px_0px_#0F172A05,0px_4px_20px_0px_#2563EB33]
                ${error ? "border-red-500" : success ? "border-green-500" : "border-[#D1D1D1] focus-within:border-[var(--primary)]"}`}>
          <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--muted-foreground)] shrink-0" />
          <input
            type="email"
            placeholder="Input email address"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); setSuccess(false); }}
            className="border-none outline-none bg-transparent text-sm sm:text-base text-[var(--foreground)] placeholder:text-[var(--secondary)] w-full font-[var(--font-secondary)]"
          />
        </div>


        <button type="submit" className="h-11 w-full shrink-0 cursor-pointer rounded-[8px] bg-[var(--primary)] px-4 py-2 text-sm font-bold capitalize text-[var(--primary-foreground)] transition-opacity hover:opacity-90 active:opacity-80 sm:h-14 sm:w-auto sm:px-[1.125rem] sm:py-[0.875rem] sm:text-[1.125rem]">
          Subscribe
        </button>

      </form>




      {error && (
        <p className="flex items-center gap-1.5 text-xs sm:text-sm text-red-500 pl-4 mt-1">
          <X className="w-4 h-4 shrink-0" /> {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-1.5 text-xs sm:text-sm text-green-500 pl-4 mt-1">
          <CircleCheck className="w-4 h-4 shrink-0" /> Thank you for subscribing!
        </p>
      )}

      {/* <p className="text-xs sm:text-sm md:text-base leading-[1.6] text-[var(--muted-foreground)] font-[var(--font-secondary)] max-w-[31.75rem] mt-3 sm:mt-4"> */}
      <p className="section-subtitle mt-3 sm:mt-6">
        By subscribing, you agree to our Privacy Policy and consent to receive
        updates from our company.
      </p>
    </div>

  );
}
