"use client";

import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react";
import SocialLinks from "../SocialLinks";
import Link from "next/link";
import Image from "next/image";


const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-100 ">
      <div className="mx-auto  py-12 lg:py-20 section">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-12">

          {/* Brand & Socials */}
          <div>
            <a href="/" className="mb-3 inline-block">
              <Image
                src="/assets/altf_white.png"
                alt="altf"
                width={120}
                color="white"
                height={32}
                className="h-15 w-auto"
              >
              </Image>
            </a>

            <p className="mb-6 max-w-sm text-md leading-relaxed text-zinc-400">
              AltFTool is a lightweight productivity platform that helps you simplify everyday digital work — from quick utilities to smart workflows
            </p>

            <SocialLinks
              variant="ghost"
              className="justify-start"
              iconClassName="w-5 h-5"
            />
          </div>
          {/* Sitemap*/}
          <div className="lg:justify-self-end">
            <h3 className="font-semibold text-white mb-4 text-lg">
              Site Map
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-md text-white hover:text-(--primary) transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/policypages/about"
                  className="text-md text-white hover:text-(--primary) transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/policypages/contact"
                  className="text-md text-white hover:text-(--primary) transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/policypages/disclaimer"
                  className="text-md text-white hover:text-(--primary) transition-colors"
                >
                  Disclaimer
                </Link>
              </li>

            </ul>
          </div>
          {/* Quick Links */}
          <div className="lg:justify-self-end">
            <h3 className="font-semibold text-white mb-4 text-lg">
              Quick Links
            </h3>
            <ul className="space-y-3">


              <li>
                <Link
                  href="/tools"
                  className="text-md text-white hover:text-(--primary) transition-colors"
                >
                  Productivity Tools
                </Link>

              </li>
              <li>
                <Link
                  href="/extensions"
                  className="text-md text-white hover:text-(--primary) transition-colors"
                >
                  Browser Extensions
                </Link>

              </li>
              <li>
                <Link
                  href="/games"
                  className="text-md text-white hover:text-(--primary) transition-colors"
                >
                  Casual Games
                </Link>

              </li>
              <li>
                <Link
                  href="/exclusivedeals"
                  className="text-md text-white hover:text-(--primary) transition-colors"
                >
                  Flash Deals
                </Link>

              </li>
            </ul>
          </div>



          {/* Legal Pages */}
          <div className="lg:justify-self-end">
            <h3 className="font-semibold text-white mb-4 text-lg">
              Our Policy
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/policypages/privacy"
                  className="text-md text-white hover:text-(--primary) transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/policypages/affiliate"
                  className="text-md text-white hover:text-(--primary) transition-colors"
                >
                  Affiliate Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/policypages/cookie"
                  className="text-md text-white hover:text-(--primary) transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/policypages/termsandconditions"
                  className="text-md text-white hover:text-(--primary) transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-700 bg-zinc-750">
        <div className="text-center px-4 py-6 text-md text-(--muted)">
          <p>© {new Date().getFullYear()} AltFTool — All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
