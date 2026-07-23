"use client";

import { useState } from "react";
import {
  Quote,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Share2,
  Twitter,
  Heart,
} from "lucide-react";

import HeroSection from "./HeroSection";
export default function Main() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fetchQuote = async () => {
    setLoading(true);

    try {
      const response = await fetch("https://api.adviceslip.com/advice");
      const data = await response.json();

      setQuote({
        text: data.slip.advice,
        author: "Anonymous",
        tags: [],
      });
    } catch (error) {
      console.error("API error:", error);
      // fallback remains same
      const fallbackQuotes = [
        {
          text: "The only way to do great work is to love what you do.",
          author: "Steve Jobs",
        },
        {
          text: "Believe you can and you're halfway there.",
          author: "Theodore Roosevelt",
        },
      ];
      const randomQuote =
        fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      setQuote(randomQuote);
    } finally {
      setLoading(false);
    }
  };

  const copyQuote = () => {
    if (quote) {
      const text = `"${quote.text}"\n- ${quote.author}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnTwitter = () => {
    if (quote) {
      const text = `"${quote.text}" - ${quote.author}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}`;
      window.open(twitterUrl, "_blank");
    }
  };

  const shareQuote = () => {
    if (quote && navigator.share) {
      navigator
        .share({
          title: "Inspiring Quote",
          text: `"${quote.text}" - ${quote.author}`,
        })
        .catch(() => {});
    }
  };

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col items-center justify-center">
      <HeroSection />
      {/* Quote Card */}
      <div className="w-full max-w-3xl">
        <div className="bg-(--card) rounded-3xl shadow-xl border border-(--border) p-8 sm:p-10 md:p-12 mb-10 min-h-[380px] flex flex-col justify-center relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl opacity-70 translate-y-1/2 -translate-x-1/2" />

          {/* Opening Quote Mark */}
          {/* <div className="absolute top-6 left-6 text-(--muted-foreground)/10 text-9xl font-serif leading-none">
            "
          </div> */}

          {!quote ? (
            <div className="text-center relative z-10 py-8">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-(--border)">
                <Quote className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-(--foreground) mb-4">
                Ready for Inspiration?
              </h2>
              <p className="text-(--muted-foreground) text-lg max-w-md mx-auto">
                Click the button below to discover a motivational quote!
              </p>
            </div>
          ) : loading ? (
            <div className="text-center relative z-10 py-12">
              <div className="w-20 h-20 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-6" />
              <p className="text-(--muted-foreground) font-medium text-lg">
                Finding the perfect quote...
              </p>
            </div>
          ) : (
            <div className="relative z-10 space-y-8">
              <blockquote className="text-2xl sm:text-3xl font-serif text-(--foreground) leading-relaxed italic">
                {quote.text}
              </blockquote>

              <div className="flex items-center justify-between pt-6 border-t border-(--border)/50">
                <div>
                  <p className="text-xl font-bold text-primary">
                    — {quote.author}
                  </p>
                  {quote.tags && quote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {quote.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-(--muted)/50 text-(--foreground) px-3.5 py-1.5 rounded-full text-sm font-medium capitalize border border-(--border)"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Heart
                  className="w-10 h-10 text-pink-500/80"
                  fill="currentColor"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center pt-6">
                <button
                  onClick={copyQuote}
                  className="bg-(--card) hover:bg-accent text-(--foreground) font-medium px-5 py-2.5 rounded-xl border border-(--border) transition-all flex items-center gap-2.5 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label="Copy quote"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="bg-sky-500 hover:bg-sky-600 text-(--foreground) font-medium px-5 py-2.5 rounded-xl transition-all flex items-center gap-2.5 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                  Tweet
                </button>
                <button
                  onClick={shareQuote}
                  className="bg-(--card) hover:bg-accent text-(--foreground) font-medium px-5 py-2.5 rounded-xl border border-(--border) transition-all flex items-center gap-2.5 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label="Share quote"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>
          )}

          {/* Closing Quote Mark */}
          {quote && !loading && (
            <div className="absolute bottom-6 right-6 text-(--muted-foreground)/10 text-9xl font-serif leading-none">
              "
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={fetchQuote}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-(--foreground) font-bold text-lg px-8 py-5 rounded-2xl transition-all transform hover:scale-[1.02] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-primary/30"
        >
          <RefreshCw className={`w-6 h-6 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : quote ? "Get New Quote" : "Get Inspired"}
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-4xl">
        <div className="bg-(--card) rounded-2xl border border-(--border) p-7 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-bold text-(--foreground) text-xl mb-3">
            Fresh Quotes
          </h3>
          <p className="text-(--muted-foreground) text-base">
            Thousands of inspiring quotes from great minds
          </p>
        </div>
        <div className="bg-(--card) rounded-2xl border border-(--border) p-7 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Heart className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-bold text-(--foreground) text-xl mb-3">
            Motivational
          </h3>
          <p className="text-(--muted-foreground) text-base">
            Carefully curated motivational content
          </p>
        </div>
        <div className="bg-(--card) rounded-2xl border border-(--border) p-7 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mx-auto mb-5">
            <Share2 className="w-7 h-7 text-(--foreground)" />
          </div>
          <h3 className="font-bold text-(--foreground) text-xl mb-3  ">
            Easy Sharing
          </h3>
          <p className="text-(--muted-foreground) text-base">
            Share inspiration with friends instantly
          </p>
        </div>
      </div>
    </main>
  );
}
