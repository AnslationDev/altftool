import { Info, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark text-surface-soft py-6 text-sm font-medium">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div
          role="note"
          className="flex items-start gap-2.5 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 px-4 py-3 text-xs leading-relaxed text-primary-foreground/70 mb-5"
        >
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-secondary" aria-hidden="true" />
          <span>
            <strong className="text-primary-foreground/85">Demo template.</strong> EliteShield is a
            fictional brand built to showcase this page design — it is not a real siding company.
            The phone number and address below are placeholders; nothing submitted on this site is
            sent to, or reaches, an actual business.
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="order-1 md:order-none w-full md:w-auto text-center md:text-left">
            1200 Maple Ridge Blvd, Suite 400, Atlanta, GA 30309
          </div>

          <div className="order-2 md:order-none w-full md:w-auto flex justify-center">
            <a href="tel:+18005551234" className="inline-flex items-center gap-2 hover:text-secondary transition-colors duration-200">
              <Phone className="w-4 h-4 text-secondary" />
              (800) 555-1234
            </a>
          </div>

          <div className="order-3 md:order-none w-full md:w-auto text-center text-primary-foreground/50 text-xs md:text-sm">
            © 2026 EliteShield Siding Solutions. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
