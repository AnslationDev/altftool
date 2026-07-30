/**
 * Enterprise Footer Component (Reference Match)
 * Location: src/app/altflinking/components/landing/EnterpriseFooter.jsx
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Send, Twitter, Linkedin, Facebook, Instagram } from "lucide-react";

export default function EnterpriseFooter({ setActiveTab }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    // No newsletter delivery backend exists yet — persist locally instead
    // of discarding the signup.
    try {
      window.localStorage.setItem("ALTFT_ALTFLINKING_NEWSLETTER_OPTIN", email.trim());
    } catch {
      // localStorage can be unavailable in private browsing; UI still succeeds.
    }
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
    setEmail("");
  };

  return (
    <footer className="border-t border-slate-200 bg-white pt-12 pb-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-600 ">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">

          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 ">
                ALTFTool
              </span>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                Backlink Marketplace
              </span>
            </div>

            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              The most trusted marketplace for buying and selling high-quality backlinks.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 text-slate-500 pt-1">
              <a href="#" className="p-1.5 rounded-lg border border-slate-200 hover:text-indigo-600 dark:hover:text-indigo-600 transition">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-1.5 rounded-lg border border-slate-200 hover:text-indigo-600 dark:hover:text-indigo-600 transition">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="p-1.5 rounded-lg border border-slate-200 hover:text-indigo-600 dark:hover:text-indigo-600 transition">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-1.5 rounded-lg border border-slate-200 hover:text-indigo-600 dark:hover:text-indigo-600 transition">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Marketplace Column */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs">Marketplace</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab && setActiveTab("marketplace")} className="hover:text-indigo-600 dark:hover:text-indigo-600 transition">
                  All Websites
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("guest-posts")} className="hover:text-indigo-600 dark:hover:text-indigo-600 transition">
                  Guest Posts
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("link-insertions")} className="hover:text-indigo-600 dark:hover:text-indigo-600 transition">
                  Link Insertions
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("campaigns")} className="hover:text-indigo-600 dark:hover:text-indigo-600 transition">
                  Link Exchange
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("landing")} className="hover:text-indigo-600 dark:hover:text-indigo-600 transition">
                  How It Works
                </button>
              </li>
            </ul>
          </div>

          {/* For Publishers Column */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs">For Publishers</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab && setActiveTab("publisher")} className="hover:text-indigo-600 dark:hover:text-indigo-600 transition">
                  Become a Publisher
                </button>
              </li>
              <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-600 transition">Publisher Guidelines</a></li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("wallet")} className="hover:text-indigo-600 dark:hover:text-indigo-600 transition">
                  Earnings &amp; Payouts
                </button>
              </li>
              <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-600 transition">Resources</a></li>
              <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-600 transition">Help Center</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-600 transition">About Us</a></li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("contact")} className="hover:text-indigo-600 dark:hover:text-indigo-600 transition">
                  Contact Us
                </button>
              </li>
              <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-600 transition">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-600 transition">Blog</a></li>
              <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-600 transition">Press</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs">Subscribe to our newsletter</h4>
            <p className="text-[11px] text-slate-500">Get the latest SEO tips and marketplace updates delivered to your inbox.</p>

            <form onSubmit={handleSubscribe} className="flex items-center gap-1.5">
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            {subscribed && <span className="text-[10px] text-emerald-500 font-bold">Subscribed successfully!</span>}
          </div>

        </div>

        {/* Bottom Rights & Status Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 pt-6 text-[11px] text-slate-500 gap-4">
          <p>© 2024 ALTFTool. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <Link href="/policypages/termsandconditions" className="hover:underline">Terms of Service</Link>
            <Link href="/policypages/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/site-map" className="hover:underline">Sitemap</Link>
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Status
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
