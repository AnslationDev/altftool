"use client";

import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@altftool/ui";
import { SITE_ROUTES } from "@/platform/navigation/siteRoutes";

/**
 * Links into the site's real, already-working Contact page rather than a
 * new fake "submitted!" form with nowhere for the message to actually go.
 */
const ContactSupportCard = () => (
  <section className="support-utility-section support-contact-card" aria-label="Contact support">
    <div className="support-contact-icon" aria-hidden="true">
      <MessageCircle className="h-5 w-5" />
    </div>
    <div className="support-contact-copy">
      <h2>Still need help?</h2>
      <p>Reach the AltFTool team directly and we'll get back to you.</p>
    </div>
    <Link href={SITE_ROUTES.contact.href}>
      <Button variant="primary" size="sm">
        Contact Support
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </Link>
  </section>
);

export default ContactSupportCard;
