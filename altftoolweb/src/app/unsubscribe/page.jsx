"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, Mail } from "lucide-react";

export default function UnsubscribePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const API_URL =
    "https://ads.ads-astra.com/api/ndatalab_workspace/receiver-bucket1";

  // ✅ Hide header, footer, chatbot, cookie, etc.
  useEffect(() => {
    const hideLayout = () => {
      // Hide header
      const header = document.querySelector("header");
      if (header) header.style.display = "none";

      // Hide footer
      const footer = document.querySelector("footer");
      if (footer) footer.style.display = "none";

      // Hide popups / widgets
      const selectors = [
        '[class*="cookie"]',
        '[class*="newsletter"]',
        '[class*="chat"]',
        '[id*="cookie"]',
        '[id*="newsletter"]',
        '[id*="chat"]',
      ];

      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
          el.style.display = "none";
        });
      });
    };

    hideLayout();

    // Watch for dynamically loaded elements
    const observer = new MutationObserver(hideLayout);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  // ✅ Auto redirect after success (optional UX)
//   useEffect(() => {
//     if (success) {
//       setTimeout(() => {
//         window.location.href = "/";
//       }, 3000);
//     }
//   }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken":
            "0SGf2FTPgeyUgPnYTYVc9anlbIQZGm7IxMpoojKCMfNlzykSuW93sk4yqD14TMPr",
        },
        body: JSON.stringify({
          secret_token: "cc-ASJFSNFRGF",
          data_list: [
            {
              source_name: "unsubscribe_page",
              json_data: {
                email,
                status: "unsubscribed",
              },
            },
          ],
        }),
      });

      if (!res.ok) throw new Error("Failed");

      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-white px-4">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-50 -z-10" />

      <div className="w-full max-w-lg">
        {!success ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-8">
            
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mail className="text-blue-700 w-5 h-5" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-semibold text-center text-gray-900">
              Unsubscribe from emails
            </h2>

            {/* Subtext */}
            <p className="text-center text-gray-500 text-sm mt-2 leading-relaxed">
              We’ll stop sending updates to your inbox. <br />
              No spam, no follow-ups — just peace ✨
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Processing...
                  </>
                ) : (
                  "Unsubscribe"
                )}
              </button>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
            </form>

            {/* Footer text */}
            <p className="text-xs text-center text-gray-400 mt-6">
              You can re-subscribe anytime if you change your mind.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-10 flex flex-col items-center text-center">
            
            <div className="bg-green-100 p-4 rounded-full mb-3">
              <CheckCircle className="text-green-600 w-7 h-7" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-900">
              You’re unsubscribed
            </h2>

            <p className="text-gray-500 text-md mt-1">
              Your inbox just got quieter 🙂
            </p>
          </div>
        )}
      </div>
    </div>
  );
}