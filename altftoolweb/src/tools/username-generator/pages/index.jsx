"use-client";
import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import HowItWorks from "../components/HowItWorks";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Features from "../components/Features";
// import FAQSection from "./src/components/FAQs";

export default function UsernameGenerator() {
  const [keyword, setKeyword] = useState("");
  const [style, setStyle] = useState("normal");
  const [usernames, setUsernames] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const styles = ["normal", "numbers", "underscores", "leet"];

  const generateRandomString = (len) => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let out = "";
    for (let i = 0; i < len; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  };

  const generateUsername = () => {
    if (!keyword.trim()) {
      toast.error("Please enter a keyword");
      return;
    }

    const list = [];

    for (let i = 0; i < 5; i++) {
      const r = generateRandomString(3);

      if (style === "normal") list.push(keyword + r);
      else if (style === "numbers")
        list.push(keyword + Math.floor(Math.random() * 999));
      else if (style === "underscores") list.push(`${keyword}_${r}`);
      else if (style === "leet") {
        const map = { a: "4", e: "3", i: "1", o: "0", s: "5" };
        const leetWord = keyword
          .split("")
          .map((c) => map[c.toLowerCase()] || c)
          .join("");

        list.push(leetWord + r);
      }
    }

    setUsernames(list);
    toast.success("Usernames generated!");
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");

    setCopiedIndex(index);

    // Reset icon after 1.2 seconds
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  return (
    <div className="space-y-6 pb-6 px-6 bg-(--background)">
      {/* Header */}
      <Header />
      {/* <div className="p-6 bg-(--card) border border-(--border) rounded-xl">
        <h2 className="text-xl font-semibold text-(--foreground) mb-2">
          How to Use
        </h2>
        <p className="text-(--muted-foreground)">
          Enter a keyword and style to generate usernames. Tap a username to
          copy it.
        </p>
      </div> */}

      {/* Generator Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* LEFT SIDE — INPUT FORM */}
        <div className="p-6 bg-(--card) border border-(--border) rounded-xl">
          <h3 className="text-lg font-semibold text-(--foreground) mb-4">
            Input
          </h3>

          <div className="space-y-4">
            {/* Keyword */}
            <div className="space-y-2">
              <label className="text-(--foreground)/75 font-semibold text-sm">
                Keyword
              </label>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter keyword"
                className="w-full px-4 py-3 rounded-lg bg-(--background) border border-(--border) text-(--foreground)"
              />
            </div>

            {/* Style */}
            <div className="space-y-2">
              <label className="text-(--foreground)/75 font-semibold text-sm">
                Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 bg-(--background) border border-(--border) rounded-lg text-(--foreground)"
              >
                {styles.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Button */}
            <button
              onClick={generateUsername}
              className="w-full py-3 bg-(--primary) text-(--primary-foreground) cursor-pointer rounded-lg font-semibold hover:opacity-90"
            >
              Generate Usernames
            </button>
          </div>
        </div>

        {/* RIGHT SIDE — OUTPUT */}
        <div className="p-6 bg-(--card) border border-(--border) rounded-xl">
          <h3 className="text-lg font-semibold text-(--foreground) mb-4">
            Generated Usernames
          </h3>

          <div className="min-h-50">
            {usernames.length > 0 ? (
              <ul className="space-y-2">
                {usernames.map((name, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 bg-(--muted) rounded-lg"
                  >
                    <span className="font-mono text-(--foreground)">
                      {name}
                    </span>

                    <button 
                    title="Copy"
                      onClick={() => copyToClipboard(name, index)}
                      className="p-2 rounded-lg cursor-pointer border border-(--border) bg-(--background)"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-(--foreground)" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-(--muted-foreground) text-center py-8">
                Generated usernames will appear here...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-6 bg-(--card) border border-(--border) rounded-xl">
        <h3 className="text-lg font-semibold text-(--foreground) mb-3">
          About Username Styles
        </h3>

        <ul className="space-y-2 text-(--muted-foreground)">
          <li className="flex gap-2">
            <span className="text-(--primary)">•</span> Normal: keyword + random
            text
          </li>
          <li className="flex gap-2">
            <span className="text-(--primary)">•</span> Numbers: keyword +
            random numbers
          </li>
          <li className="flex gap-2">
            <span className="text-(--primary)">•</span> Underscores:
            keyword_random
          </li>
          <li className="flex gap-2">
            <span className="text-(--primary)">•</span> Leet: replaces letters
            with numbers
          </li>
        </ul>
      </div>

      {/* More sections */}
      <div className="p-6 bg-(--card) border border-(--border) rounded-xl">
        <HowItWorks />
      </div>
      <div className="p-6 bg-(--card) border border-(--border) rounded-xl">
        <Features/>
      </div>

      {/* <div className="p-6 bg-(--card) border border-(--border) rounded-xl">
        <FAQSection />
      </div> */}
    </div>
  );
}
