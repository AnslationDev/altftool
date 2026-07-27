"use client";
import Link from "next/link";
import { useReveal } from "../hooks/useReveal";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const CONTACT_URL = "/policypages/contact";

export default function Footer() {
  const col1Ref = useReveal();
  const col2Ref = useReveal();
  const col3Ref = useReveal();
  const col4Ref = useReveal();

  return (
    <footer className="relative bg-[#F7F3EB] pt-10 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Bottom bar */}
        <div className="pt-4 border-t border-[#D4C9B5]/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#6b6b6b] text-sm">
            © 2026 ClimaTech. All rights reserved.
          </p>
          <a
              href={CONTACT_URL}
              className={`hidden md:flex items-center text-1xl font-semibold gap-2 text-[#6b6b6b] hover:text-[#929c9f] transition-colors duration-500
                }`}
            >
              <svg
                className={`w-5 h-5 transition-colors duration-500
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M21 11.5c0 4.142-4.03 7.5-9 7.5a10.2 10.2 0 01-3.4-.57L3 20.5l1.7-3.6A7.2 7.2 0 013 11.5C3 7.358 7.03 4 12 4s9 3.358 9 7.5z"
                />
              </svg>
              Contact us
            </a>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Sitemap"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-[#6b6b6b] hover:text-[#1a1a1a] text-sm transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
