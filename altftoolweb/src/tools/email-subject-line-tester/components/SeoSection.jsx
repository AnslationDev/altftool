"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, ShieldAlert, Ruler, ArrowUpRight } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import Card from "./ui/Card";

const BEST_PRACTICES = [
  "Front-load the important words — most inboxes truncate after 40-70 characters, so put the value proposition first.",
  "Use one personalization token, not two — stacking merge tags can look automated rather than personal.",
  "Test on mobile first — the majority of opens happen on a phone-width inbox list, closer to 30-40 visible characters.",
  "Pair urgency with a real deadline — vague \"limited time\" language across every send erodes trust over a campaign.",
  "Save ALL CAPS and multiple exclamation marks for genuine emergencies — they're among the fastest ways into a spam folder.",
  "Change one variable at a time when A/B testing (length, personalization, emoji) so you know what actually moved the open rate.",
];

const COMMON_MISTAKES = [
  "Repeating the same spam-trigger phrases across an entire campaign — filters learn sender patterns over time, not just single messages.",
  "Writing the subject line after the body as an afterthought, instead of iterating on it as much as the call to action.",
  "Using the same subject for every segment — a re-engagement email and an order receipt need a different tone.",
  "Ignoring the preview text next to the subject line in most inbox lists — it's free real estate that gets wasted.",
  "Leaning on emoji or urgency to compensate for a genuinely weak headline instead of rewriting it.",
];

const FAQS = [
  {
    q: "Is this Email Subject Line Tester free to use?",
    a: "Yes. Every score is calculated in your browser using the rule-based engine described in the metric cards above — nothing is sent to a server, and there's no signup required.",
  },
  {
    q: "Does a high score guarantee my email won't go to spam?",
    a: "No. Subject-line quality is one signal among many that inbox providers weigh — sender reputation, authentication (SPF/DKIM/DMARC), list hygiene and recipient engagement history all matter too. This tool only evaluates the subject line text itself.",
  },
  {
    q: "What's a good score to aim for?",
    a: "80+ (grade A or A+) generally balances persuasiveness with deliverability. A lower score isn't automatically bad — a formal transactional email intentionally scoring low on Urgency or Emoji Usage is fine.",
  },
  {
    q: "Why do words like \"free\" and \"guaranteed\" count against me if they're also power words?",
    a: "Because the two effects are real and independent: those words are persuasive (they raise the Power Words score) and they're also common spam-filter triggers (they raise the Spam Risk score). The tool scores both honestly rather than picking one side.",
  },
  {
    q: "Can I test two subject lines against each other?",
    a: "Yes — open the Compare (A/B) tab above, type both subject lines, and the tool declares a winner based on the same overall scoring engine used for a single subject.",
  },
];

const RELATED_TOOLS = [
  { slug: "spam-checker", label: "Spam Checker" },
  { slug: "email-extractor", label: "Email Extractor" },
  { slug: "gmail-template-builder", label: "Gmail Template Builder" },
  { slug: "utm-link-builder", label: "UTM Link Builder" },
];

export default function SeoSection() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-(--foreground)">Best practices</h3>
          </div>
          <ul className="space-y-2.5 text-sm leading-relaxed text-(--foreground)/85">
            {BEST_PRACTICES.map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-danger" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-(--foreground)">Common mistakes</h3>
          </div>
          <ul className="space-y-2.5 text-sm leading-relaxed text-(--foreground)/85">
            {COMMON_MISTAKES.map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Ruler className="h-5 w-5 text-(--primary)" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-(--foreground)">Ideal subject length</h3>
          </div>
          <p className="text-sm leading-relaxed text-(--foreground)/85">
            Aim for <strong>30-50 characters</strong> (roughly 4-8 words). That&apos;s the range the Character Length
            metric above scores 100/100, and it&apos;s what fits without truncation on Gmail Desktop and Outlook —
            check the Inbox Preview tab to see exactly where your subject gets cut on each client.
          </p>
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-warning" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-(--foreground)">Spam-filter tips</h3>
          </div>
          <p className="text-sm leading-relaxed text-(--foreground)/85">
            Spam filters weigh signals, not single words: ALL-CAPS words, stacked exclamation marks, dollar signs next
            to &quot;free&quot;, and phrases like &quot;act now&quot; or &quot;click here&quot; all add risk. One of
            these rarely tanks deliverability — several together usually do. The Spam Risk card breaks down exactly
            which signals your subject triggered.
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="mb-2 text-lg font-semibold text-(--foreground)">Frequently asked questions</h3>
        <Accordion type="single" collapsible className="mt-2">
          {FAQS.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-(--foreground)">Related tools</h3>
        <div className="flex flex-wrap gap-2.5">
          {RELATED_TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/all/${tool.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--background) px-3.5 py-2 text-sm font-medium text-(--foreground) transition-colors hover:border-(--primary) hover:text-(--primary)"
            >
              {tool.label}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
