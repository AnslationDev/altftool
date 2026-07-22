"use client";

import { FAQS } from "../../data/faq";
import { SectionHeader } from "../shared/section-header";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion";

export function FaqSection() {
  return (
    <section id="faq" className="relative py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions, answered"
          subtitle="Everything you need to know about Imaginnex and the copy-to-OpenArt workflow."
        />
        <Accordion type="single" collapsible className="mt-12 space-y-3">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
