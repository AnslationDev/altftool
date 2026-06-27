import { Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark text-surface-soft py-6 text-sm font-medium">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        {/* Left: Address */}
        <div className="order-1 md:order-none w-full md:w-auto text-center md:text-left">
          1200 Maple Ridge Blvd, Suite 400, Atlanta, GA 30309
        </div>

        {/* Right: Phone */}
        <div className="order-2 md:order-none w-full md:w-auto flex justify-center">
          <a href="tel:+18005551234" className="inline-flex items-center gap-2 hover:text-secondary transition-colors duration-200">
            <Phone className="w-4 h-4 text-secondary" />
            (800) 555-1234
          </a>
        </div>

        {/* Center: Copyright */}
        <div className="order-3 md:order-none w-full md:w-auto text-center text-primary-foreground/50 text-xs md:text-sm">
          © 2026 EliteShield Siding Solutions. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
