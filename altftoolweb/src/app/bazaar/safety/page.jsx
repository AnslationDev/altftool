import Link from "next/link";
import { AlertTriangle, Flag, ShieldCheck, Users } from "lucide-react";

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

import "../bazaar.css";
import BazaarShell from "../components/BazaarShell";
import GeoFaq from "../components/GeoFaq";
import { Breadcrumbs, LinkCloud, Note, SectionHead } from "../components/primitives";

/**
 * /bazaar/safety — the trust page.
 *
 * Written as operational advice, not reassurance. The scam section describes
 * each fraud the way a victim first sees it, because "be careful online" has
 * never stopped anyone; recognising the specific opening line does. The
 * verification section is deliberately blunt about what Bazaar does NOT check.
 */

export const dynamic = "force-dynamic";

const PATH = "/bazaar/safety";

const MEETING_RULES = [
  {
    title: "Meet where there are cameras and people",
    body: "A bank forecourt, a mall entrance, a busy café or a police station lobby. Many police stations across India run designated safe-exchange zones for exactly this. Daylight, always — a torch-lit inspection in a parking basement hides every dent and scratch.",
  },
  {
    title: "Bring someone, and tell someone",
    body: "Take a second person if you can, and if you cannot, send the ad link, the meeting spot and the seller's number to someone who will notice if you go quiet. Two minutes of admin, and it changes the calculation for anyone with bad intentions.",
  },
  {
    title: "Inspect the item, not the description",
    body: "Switch it on. Drive it. Open the drawer. Count the pieces. Match the serial or chassis number against the bill in your hand. Every scam that survives contact with the buyer survives because the buyer did not look.",
  },
  {
    title: "Do not go to a stranger's home alone",
    body: "For furniture and appliances a home visit is unavoidable, so bring a companion and a vehicle, and agree the price before you arrive rather than negotiating in someone else's living room.",
  },
  {
    title: "Cash on collection, counted in front of you",
    body: "Pay when the item is physically in your hands. If the amount is large enough to make you nervous carrying it, do the transfer at a bank branch, with the item present.",
  },
];

const SCAMS = [
  {
    title: "The advance payment or token amount",
    looksLike:
      "A seller with an unusually cheap listing asks for a small token — a booking amount, a courier charge, a transport deposit — to hold the item for you. They are often warm, fast to reply, and describe a reason they cannot meet immediately.",
    doInstead:
      "There is no legitimate reason to pay anything before you have seen the item. Not a booking fee, not a delivery charge, not a documentation charge. Walk away the moment money is requested before a meeting.",
  },
  {
    title: "The QR code that takes instead of gives",
    looksLike:
      "A buyer says they will pay you and sends a QR code to scan, or asks you to enter your UPI PIN to receive money. They may send a small amount first so it feels real.",
    doInstead:
      "Scanning a QR code and entering a UPI PIN always SENDS money. It can never receive it. Receiving needs nothing from you beyond your UPI ID or phone number. Anyone insisting otherwise is stealing from you.",
  },
  {
    title: "The fake payment screenshot",
    looksLike:
      "A screenshot of a completed transfer arrives, sometimes with a plausible reference number, and the buyer wants to take the item now and let the money land later. Bank delay, weekend processing, NEFT batching — the excuse is always technical.",
    doInstead:
      "A screenshot is an image, and images are trivially edited. Do not hand anything over until the credit shows in your own bank app or passbook. Wait it out; a genuine buyer will.",
  },
  {
    title: "OTP phishing",
    looksLike:
      "Somebody claiming to be from Bazaar, a delivery service, or your bank asks for the one-time password sent to your phone, framed as verifying your ad, releasing a payment, or confirming a pickup.",
    doInstead:
      "Never read an OTP aloud or type it into anything you did not initiate. AltF Bazaar staff will never ask for an OTP, a UPI PIN, a card number or a password. Anyone asking is not from Bazaar.",
  },
  {
    title: "The extra payment sent by mistake",
    looksLike:
      "You are told a larger amount was transferred by accident, with a screenshot to prove it, and you are asked to refund the difference urgently. Sometimes the sender is polite and apologetic; sometimes they are aggressive about it.",
    doInstead:
      "Check your own bank balance before refunding a single rupee. In the overwhelming majority of these cases no money ever arrived, and the refund you send is the entire scam. If a genuine overpayment happened, the sender can reverse it through their bank.",
  },
  {
    title: "Armed forces and relocation stories",
    looksLike:
      "The seller is posted at a remote base, transferring cities next week, or abroad on deployment. They cannot meet, but a friend or a courier will deliver the item once you pay. Photos of an ID card sometimes accompany it.",
    doInstead:
      "This is the oldest classifieds fraud in circulation and it is designed to make demanding a meeting feel rude. Treat any story that explains why you cannot see the item as the reddest of flags, regardless of how sympathetic it is.",
  },
];

const VEHICLE_CHECKS = [
  "Match the chassis and engine number on the vehicle against the registration certificate, not against a photocopy.",
  "Check the RC is in the seller's name. If it is not, you are buying from someone who does not own it.",
  "Run the registration number through the government VAHAN service for hypothecation, blacklisting and insurance status.",
  "Ask for the pending challan status; unpaid traffic fines follow the vehicle, not the previous owner.",
  "Take the vehicle to a mechanic of your choosing, not one the seller recommends.",
  "Confirm the transfer paperwork — Forms 29 and 30 — before money changes hands, and follow up until the RC actually shows your name.",
];

const PROPERTY_CHECKS = [
  "See the property in person. Photographs of a flat prove nothing about the flat you are being offered.",
  "Ask for the title deed, the latest property tax receipt and the electricity bill, and check the names match the person in front of you.",
  "For a rental, insist on a written agreement and a receipt for the deposit. A verbal deposit is a donation.",
  "Never pay a token to reserve a flat you have not entered, however many other interested parties are mentioned.",
  "For a resale, an encumbrance certificate from the sub-registrar shows whether the property carries a loan.",
  "Brokerage should be agreed in writing before a viewing, not invented afterwards.",
];

const VERIFIED = [
  "The seller's phone number, if the phone-verified badge is shown.",
  "The seller's email address, if the email-verified badge is shown.",
  "That the ad passed automated checks against the prohibited-items policy.",
];

const NOT_VERIFIED = [
  "The identity of the person behind the account.",
  "That the seller owns the item, or has the right to sell it.",
  "The condition, age, mileage or working order of anything listed.",
  "Vehicle registration papers, property titles, warranties or original bills.",
  "That the photographs show the actual item rather than a stock image.",
  "Anything at all about a payment made outside Bazaar, which is every payment.",
];

const FAQS = [
  {
    question: "What does AltF Bazaar actually verify?",
    answer:
      "Phone number and email address, and only when the corresponding badge is shown on the profile. Bazaar does not verify identity documents, item ownership, vehicle papers, property titles, or the condition of anything listed. A verified badge means someone controls that phone number — nothing more.",
  },
  {
    question: "Is it safe to pay in advance to reserve an item?",
    answer:
      "No. Advance payment before inspection is the single most common way people lose money on classifieds, and there is no situation where it is necessary. Booking amounts, transport charges, courier fees and documentation charges requested before a meeting are all variations of the same fraud.",
  },
  {
    question: "Someone sent a QR code to pay me. Should I scan it?",
    answer:
      "No. Scanning a QR code and entering your UPI PIN sends money out of your account; it cannot bring money in. To receive a payment you only ever need to share your UPI ID or phone number. Anyone insisting you scan to receive is attempting theft.",
  },
  {
    question: "A buyer says they overpaid and wants a refund. What do I do?",
    answer:
      "Check your own bank statement first, in your own banking app, not the screenshot they sent. Almost always no money arrived at all and the refund is the scam. If a real overpayment occurred, the sender can reverse it through their bank without your help.",
  },
  {
    question: "How do I report a fraudulent ad or seller?",
    answer:
      "Use the Report link on the ad page, which captures the listing and the seller together. If money has already changed hands, file a complaint at cybercrime.gov.in or call the national cyber-fraud helpline on 1930 the same day — recovery odds drop sharply after the first 24 hours. Reporting to Bazaar removes the ad; reporting to 1930 is what can freeze the money.",
  },
  {
    question: "Does Bazaar hold payments in escrow?",
    answer:
      "No. Every transaction happens directly between buyer and seller, off-platform, and Bazaar has no visibility of it and no ability to reverse it. That is precisely why inspecting before paying matters so much here.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Bazaar Safety Guide — Meet Safely and Spot Payment Fraud",
    description:
      "How to buy and sell safely on AltF Bazaar: safe meeting rules, the six payment scams that cost people money, vehicle and property checks, and how to report fraud.",
    path: PATH,
    keywords: [
      "classifieds safety tips",
      "olx scam india",
      "upi qr code scam",
      "fake payment screenshot scam",
      "how to report online fraud india",
    ],
  });
}

export default async function BazaarSafetyPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Bazaar", path: "/bazaar" },
    { name: "Safety", path: PATH },
  ];

  return (
    <BazaarShell>
      <JsonLd
        id="bazaar-safety"
        data={[createBreadcrumbJsonLd(crumbs), createFaqJsonLd({ path: PATH, questions: FAQS })]}
      />

      <div className="section-container px-4 pb-16 sm:px-6">
        <Breadcrumbs items={crumbs} />

        <header className="max-w-3xl pt-2">
          <h1 className="bzr-section-title text-2xl sm:text-3xl">Staying safe on Bazaar</h1>
          <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
            Almost every loss on a classifieds marketplace comes down to one of two things: money
            that moved before the item did, or a meeting that happened somewhere private. Everything
            below is built around avoiding those two situations. It is worth ten minutes before your
            first deal.
          </p>
        </header>

        <Note icon={AlertTriangle}>
          AltF Bazaar never asks for an OTP, a UPI PIN, a card number, a CVV or a password — not by
          phone, not by SMS, not by WhatsApp, not by email. Anyone who does is not from Bazaar,
          however convincing the caller ID looks.
        </Note>

        <section className="bzr-section" aria-label="Meeting safely">
          <SectionHead title="Meeting safely" as="h2" />
          <div className="grid gap-3 sm:grid-cols-2">
            {MEETING_RULES.map((rule) => (
              <article
                key={rule.title}
                className="rounded-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border) bg-(--card) p-4"
              >
                <h3 className="flex items-start gap-2 text-sm font-bold text-(--foreground)">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
                  {rule.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">{rule.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bzr-section" aria-label="Payment fraud patterns">
          <SectionHead title="The payment scams, and how each one opens" as="h2" />
          <p className="-mt-3 mb-4 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
            These six account for the overwhelming majority of money lost on Indian classifieds.
            They are described here the way you will first encounter them, because recognising the
            opening line is what actually stops them.
          </p>
          <div className="grid gap-3 lg:grid-cols-2">
            {SCAMS.map((scam) => (
              <article
                key={scam.title}
                className="rounded-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border) bg-(--card) p-4"
              >
                <h3 className="text-sm font-bold text-(--foreground)">{scam.title}</h3>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
                  How it looks
                </p>
                <p className="mt-1 text-sm leading-6 text-(--muted-foreground)">{scam.looksLike}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
                  What to do
                </p>
                <p className="mt-1 text-sm leading-6 text-(--foreground)">{scam.doInstead}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bzr-section" aria-label="Category specific checks">
          <SectionHead title="Checks that only matter for some categories" as="h2" />
          <div className="grid gap-3 lg:grid-cols-2">
            <article className="rounded-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border) bg-(--card) p-4">
              <h3 className="text-sm font-bold text-(--foreground)">
                Buying a car, bike or commercial vehicle
              </h3>
              <ul className="mt-2 list-disc space-y-2 ps-5 text-sm leading-6 text-(--muted-foreground)">
                {VEHICLE_CHECKS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs">
                <Link href="/bazaar/c/cars" className="bzr-section-link">
                  Browse cars
                </Link>
              </p>
            </article>

            <article className="rounded-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border) bg-(--card) p-4">
              <h3 className="text-sm font-bold text-(--foreground)">
                Renting or buying property
              </h3>
              <ul className="mt-2 list-disc space-y-2 ps-5 text-sm leading-6 text-(--muted-foreground)">
                {PROPERTY_CHECKS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs">
                <Link href="/bazaar/c/properties" className="bzr-section-link">
                  Browse properties
                </Link>
              </p>
            </article>
          </div>
        </section>

        <section className="bzr-section" aria-label="What Bazaar verifies">
          <SectionHead title="What Bazaar checks, and what it does not" as="h2" />
          <div className="grid gap-3 lg:grid-cols-2">
            <article className="rounded-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border) bg-(--card) p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-(--foreground)">
                <ShieldCheck className="h-4 w-4 opacity-70" aria-hidden="true" />
                Verified by Bazaar
              </h3>
              <ul className="mt-2 list-disc space-y-2 ps-5 text-sm leading-6 text-(--muted-foreground)">
                {VERIFIED.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border) bg-(--card) p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-(--foreground)">
                <AlertTriangle className="h-4 w-4 opacity-70" aria-hidden="true" />
                Not verified by anyone
              </h3>
              <ul className="mt-2 list-disc space-y-2 ps-5 text-sm leading-6 text-(--muted-foreground)">
                {NOT_VERIFIED.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="bzr-section" aria-label="Reporting fraud">
          <SectionHead title="Reporting a scam" as="h2" />
          <ol className="max-w-3xl list-decimal space-y-3 ps-5 text-sm leading-6 text-(--muted-foreground)">
            <li>
              <span className="font-semibold text-(--foreground)">Report the ad.</span> Use the
              Report control on the listing page. It attaches the ad, the seller account and your
              chat history so moderation has the full picture, and a confirmed fraudulent ad is
              taken down along with the account behind it.
            </li>
            <li>
              <span className="font-semibold text-(--foreground)">Keep the evidence.</span>{" "}
              Screenshot the ad, the chat, the phone number and any payment reference before
              anything is deleted. Once an ad is removed you cannot go back for it.
            </li>
            <li>
              <span className="font-semibold text-(--foreground)">
                If money moved, act within 24 hours.
              </span>{" "}
              Call the national cyber-fraud helpline on 1930 or file at cybercrime.gov.in the same
              day. Banks can sometimes freeze a receiving account early on; after a day or two the
              money is usually gone for good.
            </li>
            <li>
              <span className="font-semibold text-(--foreground)">Tell your bank too.</span> A
              separate dispute with your own bank runs in parallel with the police complaint, and
              the complaint reference number is what they will ask for.
            </li>
          </ol>
        </section>

        <GeoFaq title="Safety questions" items={FAQS} headingId="safety-faq" />

        <Note icon={Flag}>
          Nothing here is legal advice, and Bazaar cannot recover money sent outside the platform.
          What it can do is remove the account and pass on what it has when the authorities ask.
        </Note>

        <section className="bzr-section">
          <LinkCloud
            title="Related"
            links={[
              { href: "/bazaar/help", label: "Help centre" },
              { href: "/bazaar/categories", label: "All categories" },
              { href: "/bazaar/cities", label: "All cities" },
              { href: "/bazaar/price-guide", label: "Price guides" },
              { href: "/bazaar/post", label: "Post a free ad" },
            ]}
          />
        </section>
      </div>
    </BazaarShell>
  );
}
