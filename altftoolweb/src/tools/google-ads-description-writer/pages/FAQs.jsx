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
      answer: "It's a free AI-powered tool that helps you create compelling Google Ads descriptions under 90 characters, optimized for maximum impact and engagement."
    },
    {
      question: "How does the tool work?",
      answer: "Simply enter your product or service description, and our AI will generate multiple optimized ad descriptions that comply with Google Ads character limits."
    },
    {
      question: "Is this tool free to use?",
      answer: "Yes! Our tool is completely free to use. We utilize free-tier APIs from HuggingFace and Cohere to provide this service at no cost."
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
      answer: "We generate 3 unique descriptions per request, giving you variety and options to choose from for your ad campaigns."
    },
    {
      question: "Do you store my input data?",
      answer: "No, we do not store your input data. All processing is done in real-time, and data is not retained after generating your descriptions."
    },
    {
      question: "Which AI models power this tool?",
      answer: "We use state-of-the-art language models from HuggingFace and Cohere, specifically chosen for their ability to generate concise, compelling marketing copy."
    },
    {
      question: "Can I use these descriptions commercially?",
      answer: "Yes! All generated descriptions are free to use for your Google Ads campaigns or any other commercial purposes."
    },
    {
      question: "What makes a good ad description?",
      answer: "Good ad descriptions are concise, highlight key benefits, include a call-to-action, and appeal to your target audience's needs. Our AI is trained to incorporate these elements."
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
