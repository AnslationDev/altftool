import Navigation from '../components/Navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../components/ui/accordion';
const FAQs = () => {
  const faqs = [
    {
      question: "What is the Google Ads Description Writer?",
      answer: "It's a free tool that helps you create compelling Google Ads descriptions under 90 characters, optimized for maximum impact and engagement."
    },
    {
      question: "How does the tool work?",
      answer: "Simply enter your product or service description, and the tool slots it into a set of proven direct-response ad-copy templates that comply with Google Ads character limits."
    },
    {
      question: "Is this tool free to use?",
      answer: "Yes! Our tool is completely free to use. Everything runs directly in your browser, so there's no server-side processing cost to pass on."
    },
    {
      question: "What is the character limit for Google Ads descriptions?",
      answer: "Google Ads descriptions must be under 90 characters. Our tool automatically ensures all generated descriptions meet this requirement."
    },
    {
      question: "Can I edit the generated descriptions?",
      answer: "Absolutely! The generated descriptions are meant to inspire and provide a starting point. Feel free to modify them to better match your brand voice."
    },
    {
      question: "How many descriptions are generated at once?",
      answer: "We generate 5 unique descriptions per request, giving you variety and options to choose from for your ad campaigns."
    },
    {
      question: "Do you store my input data?",
      answer: "No, we do not store your input data. Your description never leaves your browser — everything is generated locally, and nothing is retained after you navigate away."
    },
    {
      question: "What powers this tool?",
      answer: "The tool draws from a bank of 40 proven direct-response ad-copy templates and slots your product or service description into them. There's no AI model or external service involved — it all runs instantly in your browser."
    },
    {
      question: "Can I use these descriptions commercially?",
      answer: "Yes! All generated descriptions are free to use for your Google Ads campaigns or any other commercial purposes."
    },
    {
      question: "What makes a good ad description?",
      answer: "Good ad descriptions are concise, highlight key benefits, include a call-to-action, and appeal to your target audience's needs. These templates are built around those principles, but you should always tailor the final wording to your own brand voice."
    }
  ];
  return <div className="min-h-screen bg-(--background)">
            <Navigation />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="text-center mb-12 space-y-3">
                    <h1 className="text-4xl font-bold text-(--foreground)">Frequently Asked Questions</h1>
                    <p className="text-(--muted-foreground) text-lg">
                        Everything you need to know about our Google Ads Description Writer
                    </p>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                    {faqs.map((faq, index) => <AccordionItem
    key={index}
    value={`item-${index}`}
    className="border border-(--border) rounded-lg px-6 bg-(--card)"
  >
                            <AccordionTrigger className="text-left hover:no-underline">
                                <span className="font-semibold text-(--foreground)">{faq.question}</span>
                            </AccordionTrigger>
                            <AccordionContent className="text-(--muted-foreground) leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>)}
                </Accordion>
            </div>
        </div>;
};
export default FAQs;
