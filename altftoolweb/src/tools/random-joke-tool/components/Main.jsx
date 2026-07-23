"use client";

import { useState } from "react";
import {
  Smile,
  Laugh,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Share2,
} from "lucide-react";

export default function Main() {
  const [joke, setJoke] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchJoke = async () => {
    setLoading(true);
    try {
      // Using JokeAPI as backup with CORS proxy
      const response = await fetch("https://v2.jokeapi.dev/joke/Any?safe-mode");
      const data = await response.json();

      if (data.type === "twopart") {
        setJoke({
          setup: data.setup,
          punchline: data.delivery,
        });
      } else {
        // Fallback to single joke
        setJoke({
          setup: "Here's a funny one:",
          punchline: data.joke,
        });
      }
    } catch (error) {
      console.error("Error fetching joke:", error);
      // Fallback jokes if API fails
      const fallbackJokes = [
        {
          setup: "Why don't scientists trust atoms?",
          punchline: "Because they make up everything!",
        },
        { setup: "What do you call a fake noodle?", punchline: "An impasta!" },
        {
          setup: "Why did the scarecrow win an award?",
          punchline: "He was outstanding in his field!",
        },
        {
          setup: "What do you call a bear with no teeth?",
          punchline: "A gummy bear!",
        },
        {
          setup: "Why don't eggs tell jokes?",
          punchline: "They'd crack each other up!",
        },
      ];
      const randomJoke =
        fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
      setJoke(randomJoke);
    } finally {
      setLoading(false);
    }
  };

  const copyJoke = () => {
    if (joke) {
      const text = `${joke.setup}\n${joke.punchline}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareJoke = () => {
    if (joke && navigator.share) {
      navigator
        .share({
          title: "Check out this joke!",
          text: `${joke.setup}\n${joke.punchline}`,
        })
        .catch(() => {});
    }
  };

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-16 flex flex-col items-center justify-center">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 border border-indigo-300 dark:border-indigo-700 rounded-full px-4 py-2 mb-6">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-indigo-700 dark:text-indigo-300 text-sm font-semibold">
            Premium Humor Experience
          </span>
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-(--foreground) dark:text-(--foreground) mb-6 leading-tight">
          Ready for a
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
            Laugh?
          </span>
        </h1>
        <p className=" text-black/80 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto font-medium">
          Get instant jokes and brighten your day with our premium joke
          generator
        </p>
      </div>

      {/* Joke Card */}
      <div className="w-full max-w-3xl">
        <div className="bg-(--background) dark:bg-gray-800 rounded-2xl shadow-lg border border-(--border) dark:border p-6 mb-6">
          {!joke ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Laugh className="w-8 h-8 text-(--foreground)" />
              </div>
              <h2 className="text-2xl font-bold text-(--foreground) dark:text-(--foreground) mb-2">
                Ready for a Joke?
              </h2>
              <p className="text-(--muted-foreground) dark:text-gray-300">
                Click the button below to get started
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-10">
              <div className="flex justify-center mb-4">
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-(--foreground) dark:text-gray-300">
                Loading your joke...
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Setup Card */}
              <div className="bg-(--muted) rounded-lg p-5 border border-(--border)">
                <p className="text-lg font-medium text-(--foreground)">
                  {joke.setup}
                </p>
              </div>

              {/* Punchline Card */}
              <div className="bg-(--card) rounded-lg p-5 border border-(--border)">
                <p className="text-xl font-bold text-(--foreground)">
                  {joke.punchline} 😄
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {/* COPY BUTTON */}
                <button
                  onClick={copyJoke}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium border border-(--border)
        ${
          copied
            ? "bg-green-500 text-white"
            : "bg-(--muted) hover:bg-(--muted)/80 text-(--foreground)"
        }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Joke</span>
                    </>
                  )}
                </button>

                {/* SHARE BUTTON */}
                <button
                  onClick={shareJoke}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium
                 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {joke && (
            <button
              onClick={() => setJoke(null)}
              className="flex-1 flex items-center justify-center gap-2 bg-(--muted) hover:bg-(--muted) dark:bg-gray-700 dark:hover:bg-gray-600 text-(--foreground) dark:text-gray-100 font-medium px-4 py-3 rounded-lg border border-(--border) dark:border-gray-600"
            >
              <Smile className="w-4 h-4" />
              <span>Start Over</span>
            </button>
          )}
          <button
            onClick={fetchJoke}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 font-medium px-4 py-3 rounded-lg ${
              joke ? "" : "w-full"
            } ${
              loading
                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600 text-(--foreground)"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>
              {loading
                ? "Loading..."
                : joke
                ? "Get Another Joke"
                : "Get a Joke"}
            </span>
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-3xl">
        <div className="bg-(--background) dark:bg-gray-800 rounded-lg border border-(--border) dark:border p-5 text-center">
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Smile className="w-5 h-5 text-(--foreground)" />
          </div>
          <h3 className="font-bold text-(--foreground) dark:text-(--foreground) mb-1">
            Fresh Jokes
          </h3>
          <p className="text-(--muted-foreground) dark:text-gray-300 text-sm">
            New random jokes every time
          </p>
        </div>
        <div className="bg-(--background) dark:bg-gray-800 rounded-lg border dark:border border-(--border) p-5 text-center">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-5 h-5 text-(--foreground)" />
          </div>
          <h3 className="font-bold text-(--foreground) dark:text-(--foreground) mb-1">
            Family Friendly
          </h3>
          <p className="text-(--muted-foreground) dark:text-gray-300 text-sm">
            Clean humor for everyone
          </p>
        </div>
        <div className="bg-(--background) dark:bg-gray-800 rounded-lg   border dark:border border-(--border) p-5 text-center">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Share2 className="w-5 h-5 text-(--foreground)" />
          </div>
          <h3 className="font-bold text-(--foreground) dark:text-(--foreground) mb-1">
            Easy Sharing
          </h3>
          <p className="text-(--muted-foreground) dark:text-gray-300 text-sm">
            Copy or share with friends
          </p>
        </div>
      </div>
    </main>
  );
}
