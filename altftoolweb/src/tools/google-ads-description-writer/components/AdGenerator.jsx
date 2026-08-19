"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Copy, Check, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

// Fisher-Yates shuffle: sort(() => Math.random() - 0.5) is a well-known
// biased "shuffle" whose output isn't a uniform random permutation.
function shuffleArray(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const AdGenerator = () => {
  const [input, setInput] = useState("");
  const [descriptions, setDescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const generateTimeoutRef = useRef(null);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  useEffect(() => {
    return () => {
      if (generateTimeoutRef.current) {
        clearTimeout(generateTimeoutRef.current);
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Please enter a product or service description");
      return;
    }
    setIsLoading(true);
    if (generateTimeoutRef.current) {
      clearTimeout(generateTimeoutRef.current);
    }
    generateTimeoutRef.current = setTimeout(() => {
      generateTimeoutRef.current = null;
      const mockDescriptions = [
        `Buy ${input.slice(0, 30)} at the best price. Shop now!`,
        `Get premium ${input.slice(0, 32)} with fast delivery.`,
        `${input.slice(0, 35)} at unbeatable prices. Order today!`,
        `Upgrade your needs with ${input.slice(0, 30)}. Buy now!`,
        `Top-quality ${input.slice(0, 34)} with easy returns.`,
        `Save more on ${input.slice(0, 30)}. Limited time deal!`,
        `Looking for ${input.slice(0, 32)}? Grab the offer now.`,
        `${input.slice(0, 36)} trusted by thousands. Shop today.`,
        `Premium ${input.slice(0, 30)} designed for performance.`,
        `Get the best ${input.slice(0, 34)} at lowest prices.`,
        `${input.slice(0, 38)} \u2013 quality guaranteed. Buy now!`,
        `Shop ${input.slice(0, 32)} with confidence. Order now.`,
        `Fast shipping on ${input.slice(0, 30)}. Buy today!`,
        `Upgrade now with top-rated ${input.slice(0, 28)}.`,
        `${input.slice(0, 35)} available at special discounts.`,
        `Don\u2019t miss deals on ${input.slice(0, 30)}.`,
        `Get original ${input.slice(0, 32)} at best value.`,
        `${input.slice(0, 34)} \u2013 perfect choice for you.`,
        `High-quality ${input.slice(0, 30)}. Shop online now.`,
        `Buy ${input.slice(0, 35)} with hassle-free returns.`,
        `${input.slice(0, 38)} at amazing prices. Order now.`,
        `Top deals on ${input.slice(0, 30)}. Hurry up!`,
        `Best-selling ${input.slice(0, 30)} available now.`,
        `Affordable ${input.slice(0, 34)} with premium quality.`,
        `Shop smart with ${input.slice(0, 30)} today.`,
        `${input.slice(0, 36)} crafted for daily use.`,
        `Order ${input.slice(0, 32)} today & save big.`,
        `Trusted quality ${input.slice(0, 30)} online.`,
        `Get your ${input.slice(0, 34)} delivered fast.`,
        `${input.slice(0, 30)} with best-in-class features.`,
        `Upgrade your lifestyle with ${input.slice(0, 28)}.`,
        `Top choice ${input.slice(0, 30)} for customers.`,
        `${input.slice(0, 35)} now available online.`,
        `Buy premium ${input.slice(0, 30)} today.`,
        `Best offer on ${input.slice(0, 32)}. Shop now!`,
        `${input.slice(0, 34)} \u2013 smart choice, great value.`,
        `High demand ${input.slice(0, 30)} in stock.`,
        `Quality-tested ${input.slice(0, 30)}. Order now.`,
        `Shop ${input.slice(0, 34)} & enjoy great savings.`,
        `${input.slice(0, 36)} made to last. Buy today!`
      ].map((desc) => desc.slice(0, 90));
      const shuffled = shuffleArray(mockDescriptions);
      const randomFive = shuffled.slice(0, 5);
      setDescriptions(randomFive);
      setIsLoading(false);
      toast.success("Google Ad descriptions generated successfully!");
    }, 2e3);
  };
  const copyToClipboard = (text, index) => {
    copy(index, text, { label: "Description" });
  };
  const handelReset = () => {
    if (
      (input.trim() || descriptions.length > 0) &&
      typeof window !== "undefined" &&
      !window.confirm("Reset will clear your input and generated descriptions. Continue?")
    ) {
      return;
    }
    if (generateTimeoutRef.current) {
      clearTimeout(generateTimeoutRef.current);
      generateTimeoutRef.current = null;
    }
    setInput("");
    setDescriptions([]);
    setIsLoading(false);
  };
  const charCount = input.length;
  const isOverLimit = charCount > 200;
  return <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-3">
                <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent mb-8">
                    Google Ads Description Writer
                </h1>
                <p className="text-(--muted-foreground) text-lg">
                    Generate compelling ad descriptions under 90 characters
                </p>
            </div>

            <Card className="p-6 space-y-4 shadow-md">
                <div className="space-y-2">
                    <label htmlFor="gadw-input" className="text-sm font-medium text-(--foreground)">
                        Product or Service Description
                    </label>
                    <Textarea
    id="gadw-input"
    placeholder="Enter your product or service details..."
    value={input}
    onChange={(e) => setInput(e.target.value)}
    className="min-h-[120px] resize-none"
  />
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-(--muted-foreground)">
                            Characters: {charCount}/200
                        </span>
                        {isOverLimit && <span className="text-destructive">Too long!</span>}
                    </div>
                </div>

                <Button
    onClick={handleGenerate}
    disabled={isLoading || !input.trim() || isOverLimit}
    className="w-full"
    size="lg"
  >
                    {isLoading ? <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin text-(--foreground)" />
                            Generating...
                        </> : <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Descriptions
                        </>}
                </Button>

<Button onClick={handelReset}>   Reset</Button>





            </Card>

            {descriptions.length > 0 && <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-(--foreground)">
                        Generated Descriptions
                    </h2>
                    {descriptions.map((desc, index) => <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    <p className="text-(--foreground)">{desc}</p>
                                    <span className="text-xs text-(--muted-foreground)">
                                        {desc.length} characters
                                    </span>
                                </div>
                                <Button
    variant="ghost"
    size="icon"
    onClick={() => copyToClipboard(desc, index)}
    className="shrink-0"
    aria-label={`Copy description ${index + 1} to clipboard`}
  >
                                    {isCopied(index) ? <Check className="w-4 h-4 text-(--primary-text)" /> : <Copy className="w-4 h-4" />}
                                </Button>



                            </div>
                        </Card>)}
                    <span aria-live="polite" role="status" className="sr-only">
                        {announcement}
                    </span>
                </div>}
        </div>;
};
export default AdGenerator;
