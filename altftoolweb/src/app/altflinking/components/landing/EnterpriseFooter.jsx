"use client";

import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

const CONTACT_EMAIL = "altftool@gmail.com";

export default function EnterpriseFooter({ setActiveTab }) {
  const navigateTo = (tab) => {
    if (setActiveTab) setActiveTab(tab);
  };

  return (
    <footer className="border-t border-border bg-surface px-4 py-10 text-xs text-muted sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-black tracking-tight text-foreground">ALTFTool</span>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                AltFLinking
              </span>
            </div>
            <p className="max-w-sm leading-relaxed">
              A directory and placement-request workflow built from publisher-submitted listings and admin review. Metrics may be unavailable.
            </p>
          </div>

          <nav aria-label="AltFLinking" className="space-y-3">
            <h2 className="font-bold text-foreground">Marketplace</h2>
            <ul className="space-y-2">
              <li>
                <button type="button" onClick={() => navigateTo("marketplace")} className="transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  Browse listings
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo("guest-posts")} className="transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  Guest-post listings
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo("link-insertions")} className="transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  Link-insertion listings
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo("publisher")} className="transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  Submit a website
                </button>
              </li>
            </ul>
          </nav>

          <div className="space-y-3">
            <h2 className="font-bold text-foreground">Contact</h2>
            <p>Questions about a listing or placement request can be sent by email.</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2 font-bold text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {CONTACT_EMAIL}
            </a>
            <button type="button" onClick={() => navigateTo("contact")} className="block transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Open contact form
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p>© ALTFTool. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/policypages/termsandconditions" className="hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Terms of Service
            </Link>
            <Link href="/policypages/privacy" className="hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Privacy Policy
            </Link>
            <Link href="/site-map" className="hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
