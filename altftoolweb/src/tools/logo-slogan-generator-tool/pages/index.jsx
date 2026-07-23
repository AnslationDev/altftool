"use client";

import { useState, useCallback } from "react";
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Sparkles, Sliders, Server, Zap, Shield, HelpCircle } from "lucide-react";

const LogoSloganGenerator = () => {
  const [brandName, setBrandName] = useState("");
  const [style, setStyle] = useState("");
  const [slogans, setSlogans] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const generateSlogans = useCallback(async () => {
    if (!brandName.trim() || !style.trim()) {
      setError(
        "Please enter both the Brand Name and a description of the style/industry."
      );
      return;
    }
    setIsLoading(true);
    setSlogans(null);
    setError(null);
    try {
      const response = await fetch("/api/tools/logo-slogan-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName: brandName.trim(), style: style.trim() }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Slogan generation failed.");
      }

      const text = result?.text;
      if (text) {
        setSlogans(
          text
            .split("\n")
            .map((line) => line.replace(/^[*\-.\d)]+\s*/, "").trim())
            .filter(Boolean)
            .slice(0, 7),
        );
      } else {
        setError(
          "Failed to generate slogans. The AI response was empty or malformed."
        );
      }
    } catch (err) {
      setError(
        `A network error occurred while contacting the API. Please try again. (${err.message})`
      );
    } finally {
      setIsLoading(false);
    }
  }, [brandName, style]);
  const handleClear = () => {
    setBrandName("");
    setStyle("");
    setSlogans(null);
    setError(null);
    setIsLoading(false);
  };
  return <div className="space-y-6">
      {
    /* Description Card */
  }
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <h2 className="text-xl font-semibold text-black mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Logo Slogan Generator
        </h2>
        <p className="text-(--muted-foreground)">
          Generate catchy, brand-friendly taglines for your logo and branding using AI.
          Simply provide your brand name and a description of your style/industry.
        </p>
      </Card>

      {
    /* Generator Card */
  }
      <Card className="p-6">
        <div className="space-y-6">
          {
    /* Brand Name Input */
  }
          <div>
            <label
    htmlFor="brandName"
    className="block text-sm font-medium text-(--foreground) mb-2"
  >
              Brand Name
            </label>
            <Input
    id="brandName"
    type="text"
    value={brandName}
    onChange={(e) => setBrandName(e.target.value)}
    placeholder="e.g., Stellar Coffee Co."
    disabled={isLoading}
  />
          </div>

          {
    /* Style/Description Input */
  }
          <div>
            <label
    htmlFor="style"
    className="block text-sm font-medium text-(--foreground) mb-2"
  >
              Brand Style / Description
            </label>
            <Textarea
    id="style"
    rows={3}
    value={style}
    onChange={(e) => setStyle(e.target.value)}
    placeholder="e.g., Premium, sustainable, and friendly coffee shop for remote workers."
    disabled={isLoading}
  />
          </div>

          {
    /* Action Buttons */
  }
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
    onClick={generateSlogans}
    disabled={isLoading || !brandName.trim() || !style.trim()}
    className="flex-1 w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
  >
              {isLoading ? <div className="flex items-center">
                  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-(--foreground)"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
                    <circle
    className="opacity-25"
    cx="12"
    cy="12"
    r="10"
    stroke="currentColor"
    strokeWidth="4"
  />
                    <path
    className="opacity-75"
    fill="currentColor"
    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  />
                  </svg>
                  Generating...
                </div> : "Generate Slogans"}
            </Button>
            <Button
    onClick={handleClear}
    variant="outline"
    disabled={isLoading}
  >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {
    /* Results Section */
  }
      {(error || slogans) && <Card className="p-6">
          <h2 className="text-xl font-bold text-(--foreground) mb-4 border-b pb-2">
            {error ? "Generation Error" : `Suggested Slogans for ${brandName.toUpperCase()}`}
          </h2>

          {error && <div className="p-4 bg-red-100 text-red-700 border-l-4 border-red-500 rounded-lg">
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-1">
                Please check your input and network connection, or try again
                later.
              </p>
            </div>}

          {slogans && <ol className="list-decimal space-y-2 pl-6 text-(--foreground)">
              {slogans.map((slogan) => <li key={slogan}>{slogan}</li>)}
            </ol>}
        </Card>}

      {
    /* How It Works Section */
  }
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-(--foreground) mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-purple-50 rounded-lg">
            <Sliders className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-black mb-2">1. Define Parameters</h3>
            <p className="text-(--muted-foreground) text-sm">
              Provide your brand name and a detailed description of your style, industry, and target audience.
            </p>
          </div>
          <div className="p-4 bg-pink-50 rounded-lg">
            <Server className="w-8 h-8 text-pink-600 mb-3" />
            <h3 className="font-semibold text-black mb-2">2. AI Processing</h3>
            <p className="text-(--muted-foreground) text-sm">
              The Gemini API uses a specialized instruction set to brainstorm unique, memorable taglines.
            </p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <Sparkles className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-black mb-2">3. Instant Results</h3>
            <p className="text-(--muted-foreground) text-sm">
              Get 5-7 powerful slogans instantly that you can use immediately for your branding efforts.
            </p>
          </div>
        </div>
      </Card>

      {
    /* Privacy and FAQs Section */
  }
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-(--foreground) mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Privacy Policy
          </h2>
          <ul className="space-y-3 text-(--muted-foreground) text-sm">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>We collect only the text input you provide - no personal data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>Your input is used strictly for generating slogans via the Gemini API</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>Data is not stored permanently or used for training AI models</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>All data transmission is secured with HTTPS/SSL encryption</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-(--foreground) mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-pink-600" />
            Quick FAQs
          </h2>
          <ul className="space-y-3 text-(--muted-foreground) text-sm">
            <li className="flex items-start gap-2">
              <span className="text-pink-600 mt-1">•</span>
              <span>Results are unique but not guaranteed to be 100% original</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-600 mt-1">•</span>
              <span>Be specific in your description for better results</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-600 mt-1">•</span>
              <span>Slight variations in results are normal due to AI creativity</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-600 mt-1">•</span>
              <span>This tool is completely free to use</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>;
};
export default LogoSloganGenerator;
