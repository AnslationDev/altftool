import { useState } from "react";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "How does the joke generator work?",
    a: "The generator fetches jokes from JokeAPI. If the API fails, it automatically switches to offline fallback jokes so you always get a result.",
  },
  {
    q: "Is this tool free to use?",
    a: "Yes, the joke generator is completely free with unlimited daily usage. No login, subscription, or account is required.",
  },
  {
    q: "What happens when I press the copy button?",
    a: "The full joke text (setup + punchline) is copied instantly to your clipboard, and the button turns green to confirm the action.",
  },
  {
    q: "Can I share jokes directly?",
    a: "Yes! If your device supports native sharing, you can send jokes via WhatsApp, Instagram, Messages, and more.",
  },
  {
    q: "Why do some jokes show in single-line format?",
    a: "Some jokes come as one-liners. In these cases, the generator formats them into a readable joke card automatically.",
  },
  {
    q: "Does this tool work offline?",
    a: "If you're offline, live jokes cannot be fetched. But built-in offline jokes will still be available.",
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (idx) => setOpenIdx(openIdx === idx ? null : idx);

  return (
    <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-14 mb-5">
      <div className="flex items-center gap-2 mb-8 justify-center">
        <HelpCircle className="w-7 h-7 sm:w-9 sm:h-9 text-indigo-600" />
        <h2 className="text-xl sm:text-4xl font-extrabold text-black/80">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border bg-(--card) shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full px-4 py-4 flex items-center justify-between text-left text-(--foreground) text-base sm:text-lg font-semibold hover:bg-(--muted)/40 transition-colors"
            >
              <span>{item.q}</span>
              <span
                className="ml-4 shrink-0 transition-transform duration-300"
                style={{ transform: openIdx === idx ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                ▾
              </span>
            </button>
            {openIdx === idx && (
              <div className="px-4 pt-1 pb-4 text-(--muted-foreground) text-sm sm:text-base leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
