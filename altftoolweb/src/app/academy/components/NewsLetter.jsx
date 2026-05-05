"use client";

import { Mail, X, CircleCheck } from "lucide-react";
import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const handleSubmit = () => {
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


      <div className="flex  items-stretch sm:items-center gap-3 sm:gap-4 w-full max-w-[31.75rem] mt-2 sm:mt-3 ">


        <div className={`flex items-center gap-2 w-[75%] sm:flex-1 h-11 sm:h-14 px-4 sm:px-6 rounded-[3.125rem] border bg-[var(--background)] transition-all duration-300 ease-out
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


        <button onClick={handleSubmit} className="w-[35%] sm:w-auto h-11 sm:h-14 px-2 sm:px-[1.125rem] py-2 sm:py-[0.875rem] rounded-[3.125rem] bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-sm sm:text-[1.200rem] capitalize whitespace-nowrap shrink-0 hover:opacity-90 active:opacity-80 transition-opacity cursor-pointer  sm:w-auto">
          Subscribe
        </button>

      </div>




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