import { motion } from "framer-motion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

function Accordion(props) {
  return <AccordionPrimitive.Root {...props} />;
}

function AccordionItem({ className = "", ...props }) {
  return <AccordionPrimitive.Item className={className} {...props} />;
}

function AccordionTrigger({ className = "", children, ...props }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={`faq-trigger ${className}`}
        {...props}
      >
        {children}
        <ChevronDown />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className = "", children, ...props }) {
  return (
    <AccordionPrimitive.Content
      className={`faq-content ${className}`}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </AccordionPrimitive.Content>
  );
}

const faqs = [
  { q: "What is Helios Solar Roofing?", a: "Helios Solar Roofing replaces your existing roof with beautiful glass tiles that generate clean electricity. With a fully integrated design, each tile is highly durable and engineered to provide seamless aesthetic appeal while producing energy for your home." },
  { q: "How does installation work?", a: "Installation is handled by our certified Helios professionals. The process involves removing your old roof (if applicable), installing the new solar system including flashing and underlayment, and integrating it with battery storage and your electrical system." },
  { q: "How do Helios Solar Panels compare to traditional panels?", a: "Our high-efficiency monocrystalline solar panels deliver 22.8% conversion efficiency — the highest in their class. They feature a sleek low-profile design and an all-black finish that looks great on any roof." },
  { q: "Are Helios systems compatible with battery storage?", a: "Yes. All our solar solutions are designed to work seamlessly with Helios Battery Storage, allowing you to store the energy you produce during the day for use at night or during grid outages." },
  { q: "What warranty do Helios systems come with?", a: "Both our Solar Roofing and Solar Panels come with an industry-leading 25-year warranty that covers performance, weatherization, and durability." },
  { q: "How long does a typical installation take?", a: "Most Solar Panel installations are completed in 1-2 days. Solar Roofing installations may take 5-7 days depending on the size and complexity of your roof. We handle all permits and inspections to make the process completely hands-off for you." }
];

export default function FAQSection() {
  return (
    <section id="faq" className="faq-section">
      <div className="container--narrow">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="section-overline section-overline--dark text-center block">Support</span>
          <h2 className="section-heading text-center">Common Questions</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="faq-accordion-item">
                <AccordionTrigger>
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
