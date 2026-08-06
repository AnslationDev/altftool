"use client";
import Link from "next/link";
import { useReveal } from "../hooks/useReveal";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";

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
              href="#demo-only"
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Demo only
            </a>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Sitemap"].map((l) => (
              <span key={l} className="text-[#6b6b6b] text-sm">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
