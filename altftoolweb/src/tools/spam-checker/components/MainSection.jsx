"use client";
import { useState } from "react";
import Features from "./Features";

export default function MainSection() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

 
  //  SIMPLE SPAM SCORE CALCULATOR
  
  function simpleSpamScore({ from, to, subject, body }) {
    const text = `${subject} ${body}`.toLowerCase();

    const spamWords = [
      "free",
      "discount",
      "buy now",
      "limited time",
      "click here",
      "order now",
      "congratulations",
      "winner",
      "money back",
      "act now",
      "urgent",
      "guarantee",
      "no obligation",
      "risk free",
      "cash bonus",
      "prize",
      "claim now",
    ];

    let penalty = 0;

    // 1) Spam keywords
    let keywordsFound = spamWords.filter((w) => text.includes(w)).length;
    penalty += Math.min(5, keywordsFound);

    // 2) URLs
    const urlRegex =
      /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-z0-9-]+\.(com|net|org|io|co)[^\s]*)/gi;
    const urls = (text.match(urlRegex) || []).length;
    penalty += Math.min(3, urls);

    // 3) special chars
    const specialChars = (body.match(/[!$%*#]{2,}/g) || []).length;
    penalty += Math.min(2, specialChars);

    // 4 ALL CAPS
    const words = body.split(/\s+/);
    const allCapsWords = words.filter(
      (w) => w.length > 3 && w === w.toUpperCase(),
    ).length;
    if (allCapsWords > 3) penalty += 1;

    // 5 sender email
    const fromDomain = from.split("@").pop() || "";
    if (!from.includes("@")) penalty += 2;

    const freeProviders = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "aol.com",
      "mail.com",
    ];

    if (
      freeProviders.includes(fromDomain.toLowerCase()) &&
      /\b(discount|offer|sale|free|buy)\b/i.test(subject + body)
    ) {
      penalty += 1;
    }

    // 6 Subject checks
    if (subject === subject.toUpperCase() && subject.length > 0) penalty += 1;
    if (subject.includes("RE:") || subject.includes("FW:")) penalty -= 0.5;

    const spamScore = Math.max(1, Math.min(10, Math.round(penalty)));

    const suggestions = [];
    if (keywordsFound > 0)
      suggestions.push(
        `Reduce promotional phrases (found ${keywordsFound} spam keywords)`,
      );
    if (urls > 2)
      suggestions.push(
        `Too many URLs detected (${urls}). Try to limit to 1–2 links.`,
      );
    if (specialChars > 0)
      suggestions.push("Avoid excessive punctuation (!!, $$, **)");
    if (allCapsWords > 3)
      suggestions.push("Reduce ALL CAPS words — they trigger spam filters");
    if (!from.includes("@"))
      suggestions.push("Sender email must include a valid @ address");
    if (freeProviders.includes(fromDomain) && spamScore > 5)
      suggestions.push("Use a business domain instead of free email services");
    if (subject === subject.toUpperCase())
      suggestions.push("Avoid using ALL CAPS in subject lines");

    if (suggestions.length === 0)
      suggestions.push("Your email looks natural & clean ✓");

    return {
      spamScore,
      suggestions,
      breakdown: {
        keywordsFound,
        urls,
        specialChars,
        allCapsWords,
        fromDomain,
        penalty,
      },
    };
  }


  //       FORM SUBMIT
 
  function handleCheck(e) {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!from.trim()) return alert("⚠️ Please enter a sender email.");
    if (!emailRegex.test(from)) return alert("⚠️ Invalid sender email.");

    if (!to.trim()) return alert("⚠️ Please enter a recipient email.");
    if (!emailRegex.test(to)) return alert("⚠️ Invalid recipient email.");

    if (!subject.trim()) return alert("⚠️ Please enter a subject.");
    if (!body.trim()) return alert("⚠️ Email body cannot be empty.");

    setLoading(true);
    setResult(null);

    setTimeout(() => {
      setResult(simpleSpamScore({ from, to, subject, body }));
      setLoading(false);
    }, 600);
  }

  //          UI SECTION
  
  return (
    <div
      id="check-spam"
      className="bg-(--background) text-(--foreground) mt-5"
    >
      <div className="max-w-5xl mx-auto px-4">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="heading text-(--primary)">
            Email Spam Checker
          </h1>
          <p className="text-(--muted-foreground) text-lg mt-2">
            Analyze your email content and improve deliverability
          </p>
        </div>

        {/* FORM CARD  */}
        <div className="bg-(--card) border border-(--border) rounded-2xl shadow-lg p-6 sm:p-8 mb-12">
          <form onSubmit={handleCheck} className="space-y-6">
            {/* ROW 1: FROM + TO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FROM */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-(--foreground)">
                  Sender Email *
                </label>

                <input
                  type="email"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="sender@example.com"
                  className="
                    w-full px-4 py-3 rounded-xl 
                    bg-(--background) border-2 border-(--border)
                    text-(--foreground)
                    focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/40
                    transition-all outline-none
                  "
                />
              </div>

              {/* TO */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-(--foreground)">
                  Recipient Email *
                </label>

                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="
                    w-full px-4 py-3 rounded-xl 
                    bg-(--background) border-2 border-(--border)
                    text-(--foreground)
                    focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/40
                    transition-all outline-none
                  "
                />
              </div>
            </div>

            {/* SUBJECT */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-(--foreground)">
                Subject Line *
              </label>

              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
                className="
                  w-full px-4 py-3 rounded-xl
                  bg-(--background) border-2 border-(--border)
                  text-(--foreground)
                  focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/40
                  outline-none transition
                "
              />
            </div>

            {/* BODY */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-(--foreground)">
                Email Body *
              </label>

              <textarea
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email..."
                className="
                  w-full px-4 py-3 rounded-xl resize-none
                  bg-(--background) border-2 border-(--border)
                  text-(--foreground)
                  focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/40
                  outline-none transition
                "
              />
            </div>

            {/* SUBMIT */}
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full md:w-auto 
                  inline-flex items-center justify-center gap-2
                  bg-(--primary) text-(--primary-foreground)
                  px-8 py-4 rounded-xl font-semibold
                  shadow-lg hover:shadow-xl
                  transition-all hover:scale-105 active:scale-95
                  disabled:opacity-50 cursor-pointer
                "
              >
                {loading ? "Analyzing..." : "Check for Spam"}
              </button>
            </div>
          </form>
        </div>

        {/* RESULTS  */}
        {result && (
          <div className="bg-(--card) border border-(--border) rounded-2xl shadow-lg p-6 sm:p-8 mb-12">
            {/* SCORE DISPLAY */}
            <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-(--border) pb-8 mb-8">
              <div
                className={`
                  w-28 h-28 flex items-center justify-center rounded-full shadow-lg
                  ${
                    result.spamScore <= 3
                      ? "bg-emerald-500"
                      : result.spamScore <= 6
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }
                `}
              >
                <div className="text-center text-white">
                  <div className="text-4xl font-bold">{result.spamScore}</div>
                  <div className="text-xs opacity-80">/ 10</div>
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-(--foreground)">
                  Spam Analysis Complete
                </h2>

                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mt-3 text-sm font-semibold
                    ${
                      result.spamScore <= 3
                        ? "bg-emerald-200 text-emerald-800"
                        : result.spamScore <= 6
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-red-200 text-red-800"
                    }
                  `}
                >
                  {result.spamScore <= 3
                    ? "Looks Good"
                    : result.spamScore <= 6
                      ? "Needs Improvement"
                      : "High Risk"}
                </div>

                {/* Progress bar */}
                <div className="mt-4 w-full bg-(--muted) rounded-full h-3 overflow-hidden">
                  <div
                    style={{ width: `${(result.spamScore / 10) * 100}%` }}
                    className={`h-3 transition-all rounded-full
                      ${
                        result.spamScore <= 3
                          ? "bg-emerald-500"
                          : result.spamScore <= 6
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }
                    `}
                  />
                </div>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SUGGESTIONS */}
              <div className="bg-(--background) border border-(--border) rounded-xl p-6">
                <h3 className="text-xl font-bold text-(--foreground) mb-4">
                  Improvement Tips
                </h3>

                <ul className="space-y-3">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-(--primary) text-(--primary-foreground) flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-(--foreground)/90">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* BREAKDOWN */}
              <div className="bg-(--background) border border-(--border) rounded-xl p-6">
                <h3 className="text-xl font-bold text-(--foreground) mb-4">
                  Analysis Breakdown
                </h3>

                <div className="space-y-3">
                  {[
                    ["Spam Keywords", result.breakdown.keywordsFound],
                    ["URLs Detected", result.breakdown.urls],
                    ["Special Characters", result.breakdown.specialChars],
                    ["ALL CAPS Words", result.breakdown.allCapsWords],
                    ["Sender Domain", result.breakdown.fromDomain],
                    ["Penalty Score", result.breakdown.penalty],
                  ].map(([label, value], i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-(--card) border border-(--border) rounded-lg p-3"
                    >
                      <span className="text-(--muted-foreground)">{label}</span>
                      <span className="font-bold text-(--foreground)">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        <Features/>
      </div>
    </div>
  );
}
