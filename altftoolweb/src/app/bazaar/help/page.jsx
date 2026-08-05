import Link from "next/link";
import { LifeBuoy } from "lucide-react";

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import "../bazaar.css";
import BazaarShell from "../components/BazaarShell";
import { Breadcrumbs, LinkCloud, Note, SectionHead } from "../components/primitives";

/**
 * /bazaar/help — the help centre.
 *
 * Answers are grouped by the task someone is stuck on rather than by internal
 * team, because nobody arrives here wanting to read a policy — they arrive
 * because an ad was rejected or a promotion did not appear.
 *
 * Note the `forceMount` on every AccordionContent. Radix unmounts closed
 * panels, which would leave the answers out of the prerendered HTML while the
 * FAQPage JSON-LD on this page claimed they were there. forceMount keeps the
 * text in the document (radix hides it with the `hidden` attribute) so the
 * structured data describes a page that genuinely contains those answers.
 */

export const dynamic = "force-dynamic";

const PATH = "/bazaar/help";

const SECTIONS = [
  {
    id: "posting",
    title: "Posting an ad",
    items: [
      {
        question: "How do I post an ad on Bazaar?",
        answer:
          "Open Sell from the top bar, pick the category and subcategory that fits, then fill in the detail step. The fields you are asked for change with the category — a car asks for year, kilometres and ownership, a flat asks for BHK, carpet area and furnishing. Add photos, set a price and a locality, and publish. A standard ad is free.",
      },
      {
        question: "How many photos should I add, and what makes a good one?",
        answer:
          "Between four and eight, shot in daylight, from the angles a buyer would inspect in person. Include the flaws: a photographed scratch costs you a little on price, an unphotographed one costs you the entire meeting. Ads with real photos of the actual item get contacted several times more often than ads using a stock image.",
      },
      {
        question: "How should I price an ad?",
        answer:
          "Start from the price guide for your category, which shows the median asking price and the range most ads sit in, both nationally and in your city. Price near the median if you want a fast sale, above it only if the condition genuinely justifies it. Marking an ad negotiable brings more enquiries but also more haggling.",
      },
      {
        question: "Which city and locality should I choose?",
        answer:
          "The one you can actually meet a buyer in. Listing a Pune sofa under Mumbai for the bigger audience wastes everybody's time, and locality is the first filter most buyers apply — an accurate one puts you in front of people who can reach you this evening.",
      },
    ],
  },
  {
    id: "managing",
    title: "Editing, deleting and republishing",
    items: [
      {
        question: "How do I edit an ad after publishing?",
        answer:
          "Open My ads, choose the listing and edit any field — price, description, photos, locality. Edits go live immediately. Changing the category is the one thing an edit cannot do, because the whole attribute set belongs to the category; delete the ad and post it again under the right one.",
      },
      {
        question: "How do I delete an ad or mark it sold?",
        answer:
          "From My ads, use Mark as sold once the item is gone, or Delete to remove the ad entirely. Marking it sold is the better habit: it clears the listing from search while keeping it in your own history, so you can republish the same details later without retyping them.",
      },
      {
        question: "My ad expired. Can I republish it?",
        answer:
          "Yes. Ads run for 60 days and then drop out of search. An expired ad stays in My ads and can be republished in one tap, though it is worth refreshing the photos and revisiting the price first — a listing that did not sell in 60 days is usually a pricing signal.",
      },
      {
        question: "Why can I not find my own ad in search?",
        answer:
          "Three usual reasons: it is still in review, it was published under a different city or category than the one you are searching, or the search you are running has a filter applied that excludes it. Open the ad from My ads and check the category, city and price against the filters you are using.",
      },
    ],
  },
  {
    id: "moderation",
    title: "Why an ad was rejected",
    items: [
      {
        question: "My ad was rejected. What are the usual reasons?",
        answer:
          "The most common are: a prohibited item (weapons, live animals in restricted categories, tobacco, prescription medicine, counterfeit goods, adult material); a category mismatch; contact details or external links pasted into the title or description; a stock or watermarked photo that is not the item; duplicate ads for the same item; or a price of ₹1 used to game sorting. The rejection notice names the specific rule.",
      },
      {
        question: "Can I appeal a rejection?",
        answer:
          "Yes. Fix the issue the notice describes and resubmit — the corrected ad goes through the normal review. If you believe the rejection was wrong, reply to the notice; a person reviews the appeal, and appeals against automated decisions are read.",
      },
      {
        question: "Why was my account limited?",
        answer:
          "Repeated rejections, several reports from different buyers, or posting the same item many times across cities all trigger a limit. It is a rate limit rather than a ban in most cases, and it lifts once the flagged ads are corrected or removed.",
      },
      {
        question: "Why do you not allow phone numbers in the description?",
        answer:
          "Because scraped numbers end up in spam lists, and because a conversation held inside Bazaar leaves a record that moderation can read if something goes wrong. Buyers reach you through the contact button on the ad; your number stays yours until you choose to share it.",
      },
    ],
  },
  {
    id: "promotions",
    title: "Promotions and paid placement",
    items: [
      {
        question: "What do the Featured and Spotlight badges mean?",
        answer:
          "Both are paid placements. Featured lifts an ad higher in category and search results and marks it with a badge. Spotlight additionally places the ad in the rotating shelf on the Bazaar home page and the relevant category page. Every promoted ad is labelled wherever it appears — paid placement never masquerades as an organic result here.",
      },
      {
        question: "Is promotion worth buying?",
        answer:
          "It increases how many people see an ad; it does not make an overpriced item sell. If a listing has been live a fortnight with plenty of views and no contacts, the price is the problem and promotion will not fix it. If it has few views in a busy category, promotion is doing the job it is for.",
      },
      {
        question: "Do free ads get buried under promoted ones?",
        answer:
          "No. Promoted ads take a limited number of positions at the top of a result set, and the rest of the ordering is genuine relevance and recency. Sorting by Newest first or by price ignores promotion entirely, and that option is always available.",
      },
    ],
  },
  {
    id: "account",
    title: "Your account",
    items: [
      {
        question: "What do the verification badges mean?",
        answer:
          "Phone verified means someone confirmed a one-time code sent to that number. Email verified means the same for an email address. Neither badge says anything about identity, ownership of the item, or trustworthiness — the safety guide is explicit about the difference.",
      },
      {
        question: "How do I change my city?",
        answer:
          "Use the location control in the search bar at the top of any Bazaar page. It sets the default city for browsing and for new ads, and it is stored on your own device rather than on your profile, so changing it affects only this browser.",
      },
      {
        question: "Can I sell as a business?",
        answer:
          "Yes. Business profiles show a business badge, a response time, and the full list of the seller's live ads, which is what buyers of higher-value goods look for. Dealers should mark ads as listed by a dealer rather than an owner — misrepresenting that is one of the fastest routes to reports.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "Deleting an account removes the profile and every ad attached to it, including sold history, and it cannot be undone. If you only want to stop the enquiries, deleting or marking your live ads as sold achieves that without losing the account.",
      },
    ],
  },
  {
    id: "buying",
    title: "Buying safely",
    items: [
      {
        question: "How do I contact a seller?",
        answer:
          "Use the contact button on the ad. Ask specific questions the ad does not answer — reason for selling, how long they have had it, whether the bill exists — and propose a public meeting spot. A seller who avoids specifics or pushes for payment before a meeting is telling you something.",
      },
      {
        question: "Should I ever pay before seeing the item?",
        answer:
          "No, without exception. Booking amounts, transport charges, courier fees and documentation charges requested before an inspection are all the same fraud in different clothes. Pay when the item is in your hands.",
      },
      {
        question: "What if a listing turns out to be fraudulent?",
        answer:
          "Report the ad from the listing page so the account can be actioned, and keep screenshots of the ad and the chat before they disappear. If money has already moved, call 1930 or file at cybercrime.gov.in the same day — early reports are the ones that can still freeze a receiving account.",
      },
      {
        question: "Does Bazaar handle payment or delivery?",
        answer:
          "No. Bazaar lists ads and connects the two of you. There is no escrow, no payment processing and no shipping — every deal happens directly between buyer and seller, which is exactly why inspecting before paying matters here.",
      },
    ],
  },
];

const ALL_QUESTIONS = SECTIONS.flatMap((section) => section.items);

export async function generateMetadata() {
  return createPageMetadata({
    title: "Bazaar Help Centre — Posting, Editing, Promotions and Accounts",
    description:
      "Answers for AltF Bazaar: how to post and edit an ad, why an ad was rejected, how promotions work, managing your account and buying safely.",
    path: PATH,
    keywords: [
      "bazaar help",
      "how to post free ad",
      "why was my ad rejected",
      "classifieds promotion",
      "classifieds account help",
    ],
  });
}

export default async function BazaarHelpPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Bazaar", path: "/bazaar" },
    { name: "Help", path: PATH },
  ];

  return (
    <BazaarShell>
      <JsonLd
        id="bazaar-help"
        data={[
          createBreadcrumbJsonLd(crumbs),
          createFaqJsonLd({ path: PATH, questions: ALL_QUESTIONS }),
        ]}
      />

      <div className="section-container px-4 pb-16 sm:px-6">
        <Breadcrumbs items={crumbs} />

        <header className="max-w-3xl pt-2">
          <h1 className="bzr-section-title text-2xl sm:text-3xl">Bazaar help centre</h1>
          <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
            {ALL_QUESTIONS.length} answers, grouped by what you are trying to do. If your ad was
            rejected, the moderation section names the specific rules that trip people up; if money
            is involved, start with the <Link href="/bazaar/safety">safety guide</Link> instead.
          </p>
        </header>

        <nav className="bzr-section" aria-label="Help topics">
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="bzr-chip">
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="bzr-section scroll-mt-24">
            <SectionHead title={section.title} as="h2" />
            <Accordion
              type="single"
              collapsible
              className="rounded-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border) bg-(--card) px-4"
            >
              {section.items.map((item, index) => (
                <AccordionItem key={item.question} value={`${section.id}-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent forceMount>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}

        <Note icon={LifeBuoy}>
          Still stuck? Report the specific ad from its own page so moderation gets the listing, the
          account and the chat together — a general message without the ad attached takes far longer
          to resolve.
        </Note>

        <section className="bzr-section">
          <LinkCloud
            title="Related"
            links={[
              { href: "/bazaar/safety", label: "Safety guide" },
              { href: "/bazaar/post", label: "Post a free ad" },
              { href: "/bazaar/price-guide", label: "Price guides" },
              { href: "/bazaar/categories", label: "All categories" },
              { href: "/bazaar/cities", label: "All cities" },
              { href: "/bazaar", label: "Bazaar home" },
            ]}
          />
        </section>
      </div>
    </BazaarShell>
  );
}
