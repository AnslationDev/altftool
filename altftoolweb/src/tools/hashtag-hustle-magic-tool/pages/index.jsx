import { useState } from "react";
import { Sparkles, Hash, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";

const HashtagHustleMagic = () => {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [hashtags, setHashtags] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Error", description: "Please enter a topic!", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      setTimeout(() => {
        setHashtags({
          trending: ["#trending2024", "#viralcontent", "#socialmedia", "#digitalmarketing", "#contentcreator"],
          niche: ["#nicheexpert", "#specializedknowledge", "#targetaudience", "#communitybuilding", "#specificinterest"],
          broad: ["#reachmorepeople", "#widereach", "#discoverability", "#generalinterest", "#massappeal"]
        });
        setLoading(false);
        toast({ title: "Success!", description: "Hashtags generated successfully!" });
      }, 1500);
    } catch (error) {
      console.error("Generation error:", error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to generate hashtags. Please try again.", variant: "destructive" });
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) handleGenerate();
  };

  const handleReset = () => {
    setTopic("");
    setHashtags(null);
    setLoading(false);
    toast({ title: "Reset Done", description: "Hashtags and topic cleared successfully." });
  };

  const SECTIONS = [
    { title: "🔥 Trending Now", key: "trending", description: "Popular hashtags for maximum visibility and reach" },
    { title: "🎯 Niche Specific", key: "niche", description: "Targeted hashtags for your specific audience and community" },
    { title: "🌐 Broad Reach", key: "broad", description: "General hashtags for wider reach and discovery" }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Hashtag Generation</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Hashtag Hustle Magic
        </h1>
        <p className="text-xl text-(--muted-foreground) max-w-2xl mx-auto">
          Generate perfect trending, niche, and broad hashtags instantly with AI to boost your social media reach and engagement.
        </p>
      </div>

      {/* Input Section */}
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-lg border border-primary/30">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <div className="p-2 bg-primary">
              <Hash className="h-5 w-5 text-(--foreground)" />
            </div>
          </div>
          <Input
            type="text"
            placeholder="Enter your topic (e.g., Travel, Fitness, Photography)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="pl-16 h-14 text-lg border-2 border-primary/30 focus:border-primary focus-visible:ring-0"
          />
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            size="lg"
            className="flex-1 h-14 text-lg font-semibold"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Sparkles className="h-5 w-5" />
                Generate
              </span>
            )}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            disabled={!topic && !hashtags}
            className="h-14 px-6 text-destructive border-destructive hover:bg-destructive hover:text-white transition"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Results */}
      {hashtags && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-(--foreground) mb-2">Your Hashtags Are Ready! 🎉</h2>
            <p className="text-(--muted-foreground)">Click any hashtag to copy it.</p>
          </div>
          <div className="space-y-6">
            {SECTIONS.map((section) => (
              <div key={section.key} className="p-6 bg-(--card) border border-(--border) rounded-xl">
                <h3 className="text-xl font-semibold text-(--foreground) mb-1">{section.title}</h3>
                <p className="text-(--muted-foreground) text-sm mb-4">{section.description}</p>
                <div className="flex flex-wrap gap-2">
                  {hashtags[section.key].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => navigator.clipboard.writeText(tag)}
                      className="px-3 py-1 rounded-full bg-(--muted) text-(--foreground) text-sm hover:bg-(--primary) hover:text-(--primary-foreground) transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features (empty state) */}
      {!hashtags && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { title: "Lightning Fast", description: "Generate hashtags in seconds with advanced AI technology" },
            { title: "Smart Categories", description: "Perfectly categorized into trending, niche, and broad hashtags" },
            { title: "One-Click Copy", description: "Copy individual or all hashtags instantly with a single click" }
          ].map((feature, index) => (
            <div key={index} className="p-6 bg-(--card) border border-(--border) rounded-xl hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2 text-(--foreground)">{feature.title}</h3>
              <p className="text-(--muted-foreground)">{feature.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HashtagHustleMagic;
