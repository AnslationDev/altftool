"use client";

import { useState, useCallback, useRef } from "react";
import {
  Search,
  Loader2,
  Link,
  Disc,
  Lightbulb,
  Lock,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
const MUSIC_DATA = [
  // --- MOTIVATIONAL / WORKOUT ---
  {
    mood: "Motivational Workout",
    trackName: "Higher (Instrumental)",
    artist: "Viral Beat Makers",
    vibe: "High Energy EDM",
    trendingUse: "Gym progress videos, pre-workout motivation, challenge completions, fast cuts."
  },
  {
    mood: "Motivational Workout",
    trackName: "Pump It Up (Remix)",
    artist: "The Fitness Collective",
    vibe: "Driving Hip-Hop/Pop",
    trendingUse: "Quick transition outfits, weightlifting montages, and health goal announcements."
  },
  {
    mood: "Motivational Workout",
    trackName: "Run Wild",
    artist: "Aurora Waves",
    vibe: "Uplifting Rock",
    trendingUse: "Outdoor running, transformation stories, and cinematic sports footage."
  },
  // --- SCENIC DRIVE / ROADTRIP (NEW) ---
  {
    mood: "Scenic Drive/Roadtrip",
    trackName: "Summer Drive",
    artist: "Chillwave Artists",
    vibe: "Vibrant Chillwave",
    trendingUse: "Hyperlapse car videos, sunset highway scenes, and positive energy road vlogs."
  },
  {
    mood: "Scenic Drive/Roadtrip",
    trackName: "Acoustic Horizon",
    artist: "Indie Folk Band",
    vibe: "Calm Indie Folk",
    trendingUse: "Open road montages, camping, nature trips, and emotional travel narratives."
  },
  {
    mood: "Scenic Drive/Roadtrip",
    trackName: "The Open Road",
    artist: "Mellow Coast",
    vibe: "Relaxed Acoustic Guitar",
    trendingUse: "Slow-motion scenic views, dashboard footage, and quiet reflection moments."
  },
  // --- AESTHETIC TRAVEL / EXPLORATION ---
  {
    mood: "Aesthetic Travel",
    trackName: "Amalfi Coast",
    artist: "SONIC REBEL",
    vibe: "Breezy Electronic/Chill",
    trendingUse: "Drone footage, resort highlights, and chic fashion content in beautiful locations."
  },
  {
    mood: "Aesthetic Travel",
    trackName: "Lo-fi Roadtrip",
    artist: "Mellow Tones",
    vibe: "Soft Lo-Fi Jazz",
    trendingUse: "Packing montages, calm, descriptive travel vlogs, and airport aesthetics."
  },
  {
    mood: "Aesthetic Travel",
    trackName: "Go Where The Wind Takes You",
    artist: "Saduereevesstevens",
    vibe: "Whimsical Acoustic",
    trendingUse: "Spontaneous moments, exploring new cities on foot, or feeling carefree."
  },
  // --- RELAXED COOKING / TUTORIALS (EXPANDED) ---
  {
    mood: "Relaxed Cooking",
    trackName: "Rose",
    artist: "Lukrembo",
    vibe: "Chill Lofi Piano",
    trendingUse: "Close-up food shots, step-by-step recipe tutorials, and cozy kitchen ambiance."
  },
  {
    mood: "Relaxed Cooking",
    trackName: "French Bistro",
    artist: "Caf\xE9 Society",
    vibe: "Upbeat Jazz Swing",
    trendingUse: "Baking videos, coffee routines, and quick meal prep montages."
  },
  {
    mood: "Tutorial/Explainer",
    trackName: "Corporate Calm",
    artist: "Minimal Music Co.",
    vibe: "Minimal Electronic",
    trendingUse: "Software tutorials, informative guides, whiteboard animations, and corporate explainers."
  },
  {
    mood: "Tutorial/Explainer",
    trackName: "Bright Ideas",
    artist: "Upbeat Acoustic",
    vibe: "Light Acoustic Pop",
    trendingUse: "DIY projects, craft videos, quick life hacks, and instructional design clips."
  },
  // --- FUNNY / MEME ---
  {
    mood: "Funny/Meme",
    trackName: "Wii Sports Theme",
    artist: "Nintendo (Nostalgia)",
    vibe: "Nostalgic Upbeat Instrumental",
    trendingUse: "Everyday fails, awkward situations, or turning mundane tasks into comedy."
  },
  {
    mood: "Funny/Meme",
    trackName: "Oh No No No (Sound)",
    artist: "Viral Sound Effect",
    vibe: "Dramatic Sound Cue",
    trendingUse: "Videos showing immediate regret or a surprise unfavorable result."
  },
  {
    mood: "Funny/Meme",
    trackName: "Dramatic Sound Cue",
    artist: "Cinematic Elements",
    vibe: "Suspenseful String Hit",
    trendingUse: "Exaggerated reactions, revealing shocking truths, or mock dramatic scenes."
  },
  // --- PRODUCT / UNBOXING ---
  {
    mood: "Product Reveal",
    trackName: "Man I Need (Vandelux Remix)",
    artist: "Vandelux",
    vibe: "Versatile Indie Dance",
    trendingUse: "Product unboxings, sleek app demos, and fast-paced B-roll marketing."
  },
  {
    mood: "Product Reveal",
    trackName: "Click, Click",
    artist: "Trend Audio",
    vibe: "Sharp, Perussive Pop",
    trendingUse: "Highlighting product features with quick cuts, fashion accessories, or technology reveals."
  },
  // --- FASHION / STYLE (NEW) ---
  {
    mood: "Fashion/Style",
    trackName: "Vogue Step",
    artist: "Urban Grooves",
    vibe: "Trendy House Beat",
    trendingUse: "Outfit of the Day (OOTD) transitions, runway walk videos, and high-fashion edits."
  },
  {
    mood: "Fashion/Style",
    trackName: "Smooth R&B Flow",
    artist: "Neo Soul Beat",
    vibe: "R&B/Trap Soul",
    trendingUse: "Makeup application, getting ready routines, and casual street style transitions."
  },
  {
    mood: "Fashion/Style",
    trackName: "Glam Up",
    artist: "Pop Collective",
    vibe: "Confident Pop",
    trendingUse: "Haul videos, wardrobe reveals, and aesthetic mirror selfies."
  },
  // --- PERSONAL VLOG / DAY IN LIFE ---
  {
    mood: "Personal Vlog/Day In Life",
    trackName: "Happy Place",
    artist: "Lenzspot",
    vibe: "Warm, Feel-Good Pop",
    trendingUse: "Morning routines, weekend getaways, and capturing simple joyful moments."
  },
  {
    mood: "Personal Vlog/Day In Life",
    trackName: "Birds of a Feather",
    artist: "Billie Eilish",
    vibe: "Soothing, Cinematic",
    trendingUse: "Heartfelt moments, aesthetic mood videos, or creative storytelling."
  },
  // --- ROMANTIC / LOVE ---
  {
    mood: "Romantic/Love",
    trackName: "Please Please Please",
    artist: "Sabrina Carpenter",
    vibe: "Emotional Pop Ballad",
    trendingUse: "Expressing vulnerability, romantic couple moments, or storytelling reels about relationships."
  },
  {
    mood: "Romantic/Love",
    trackName: "Love Story (Remix)",
    artist: "Taylor Swift",
    vibe: "Nostalgic Pop",
    trendingUse: "Fairytale romance, engagement announcements, or 'how we met' stories."
  },
  // --- SAD / EMOTIONAL ---
  {
    mood: "Sad/Emotional",
    trackName: "Rainy Days",
    artist: "Mariah the Scientist",
    vibe: "Spacey Lo-Fi R&B",
    trendingUse: "Introspective moments, cozy rainy day aesthetics, or emotional storytelling."
  },
  {
    mood: "Sad/Emotional",
    trackName: "Grey Sky",
    artist: "Lo-Fi Collective",
    vibe: "Smooth Chillhop",
    trendingUse: "Moody reels, slow moving scenes, or reflecting on past events."
  },
  // --- DANCING / UPBEAT ---
  {
    mood: "Dancing/Upbeat",
    trackName: "Maui Wowie",
    artist: "Kid Cudi",
    vibe: "Funky, Upbeat Hip-Hop",
    trendingUse: "Dance challenges, energetic montages, or humorous 'unbothered' energy videos."
  },
  {
    mood: "Dancing/Upbeat",
    trackName: "Espresso",
    artist: "Sabrina Carpenter",
    vibe: "Catchy Pop Banger",
    trendingUse: "Youthful energy, dance-offs, or playful fashion/lifestyle snippets."
  }
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getStandardizedMoods = (input) => {
  const standardized = /* @__PURE__ */ new Set();
  const lowerInput = input.toLowerCase();
  if (lowerInput.includes("workout") || lowerInput.includes("gym") || lowerInput.includes("fitness") || lowerInput.includes("motivation")) {
    standardized.add("Motivational Workout");
  }
  if (lowerInput.includes("driving") || lowerInput.includes("car") || lowerInput.includes("roadtrip") || lowerInput.includes("highway")) {
    standardized.add("Scenic Drive/Roadtrip");
  }
  if (lowerInput.includes("travel") || lowerInput.includes("vacation") || lowerInput.includes("explore")) {
    standardized.add("Aesthetic Travel");
  }
  if (lowerInput.includes("cook") || lowerInput.includes("recipe") || lowerInput.includes("kitchen") || lowerInput.includes("food")) {
    standardized.add("Relaxed Cooking");
  }
  if (lowerInput.includes("tutorial") || lowerInput.includes("how to") || lowerInput.includes("explainer") || lowerInput.includes("diy")) {
    standardized.add("Tutorial/Explainer");
  }
  if (lowerInput.includes("funny") || lowerInput.includes("meme") || lowerInput.includes("comedy") || lowerInput.includes("silly")) {
    standardized.add("Funny/Meme");
  }
  if (lowerInput.includes("product") || lowerInput.includes("reveal") || lowerInput.includes("unboxing") || lowerInput.includes("tech") || lowerInput.includes("marketing")) {
    standardized.add("Product Reveal");
  }
  if (lowerInput.includes("fashion") || lowerInput.includes("style") || lowerInput.includes("ootd") || lowerInput.includes("makeup")) {
    standardized.add("Fashion/Style");
  }
  if (lowerInput.includes("vlog") || lowerInput.includes("day in life") || lowerInput.includes("routine")) {
    standardized.add("Personal Vlog/Day In Life");
  }
  if (lowerInput.includes("love") || lowerInput.includes("romantic") || lowerInput.includes("couple") || lowerInput.includes("valentine")) {
    standardized.add("Romantic/Love");
  }
  if (lowerInput.includes("sad") || lowerInput.includes("emotional") || lowerInput.includes("moody") || lowerInput.includes("cry") || lowerInput.includes("breakup")) {
    standardized.add("Sad/Emotional");
  }
  if (lowerInput.includes("dance") || lowerInput.includes("upbeat") || lowerInput.includes("energetic") || lowerInput.includes("challenge")) {
    standardized.add("Dancing/Upbeat");
  }
  return Array.from(standardized);
};
const ReelBGMTool = () => {
  const [moodNiche, setMoodNiche] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openFAQ, setOpenFAQ] = useState(null);
  const howItWorksRef = useRef(null);
  const faqRef = useRef(null);
  const policyRef = useRef(null);
  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };
  const fetchSuggestions = useCallback(async () => {
    if (!moodNiche.trim()) {
      setError(
        "Please enter a mood or niche (e.g., 'motivational workout' or 'chill cooking video')."
      );
      return;
    }
    setLoading(true);
    setError(null);
    setSuggestions(null);
    await sleep(600);
    const lowerCaseInput = moodNiche.toLowerCase();
    const targetMoods = getStandardizedMoods(lowerCaseInput);
    const filtered = MUSIC_DATA.filter((item) => {
      if (targetMoods.includes(item.mood)) {
        return true;
      }
      if (item.vibe.toLowerCase().includes(lowerCaseInput) || item.trendingUse.toLowerCase().includes(lowerCaseInput) || item.mood.toLowerCase().includes(lowerCaseInput)) {
        return true;
      }
      return false;
    });
    let finalSuggestions;
    if (filtered.length > 0) {
      const uniqueSuggestions = [];
      const trackNames = /* @__PURE__ */ new Set();
      for (const item of filtered) {
        if (!trackNames.has(item.trackName)) {
          uniqueSuggestions.push(item);
          trackNames.add(item.trackName);
        }
        if (uniqueSuggestions.length >= 5) break;
      }
      finalSuggestions = uniqueSuggestions;
    } else {
      finalSuggestions = MUSIC_DATA.slice(0, 5).map((s) => ({
        ...s,
        trendingUse: `General trend suggestion, as no specific match was found for "${moodNiche}". Try refining your search.`
      }));
      setError(
        `No highly specific match found for "${moodNiche}". Showing general trending suggestions instead.`
      );
    }
    const suggestionsWithLinks = finalSuggestions.map((s) => ({
      ...s,
      // Creates a Google search link to find the track on YouTube/Spotify/etc.
      searchLink: `https://www.google.com/search?q=${encodeURIComponent(
        s.trackName
      )}%20${encodeURIComponent(s.artist)}%20song%20audio`
    }));
    setSuggestions(suggestionsWithLinks);
    setLoading(false);
  }, [moodNiche]);
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchSuggestions();
  };
  const inputClasses = "w-full p-4 text-lg border border border-(--border) bg-(--background) rounded-xl focus:ring-2 focus:ring-indigo-500 transition shadow-lg";
  const buttonClasses = "w-full sm:w-auto px-8 py-3 text-lg font-bold text-(--foreground) bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-300 transform hover:scale-[1.02] shadow-xl";
  const cardClasses = "p-6 sm:p-8 bg-(--background) rounded-2xl shadow-2xl border border border-(--border) transform transition-all duration-300 ease-in-out hover:shadow-indigo-500/30";
  const accordionItemClasses = "border border border-(--border) rounded-xl bg-(--background) shadow-lg";
  const accordionButtonClasses = "flex justify-between items-center w-full p-5 text-left font-semibold text-lg text-(--foreground) hover:bg-(--muted) transition duration-150";
  const accordionContentClasses = "p-5 pt-0 text-(--foreground) border-t border-gray-100 transition-all duration-300 ease-in-out";
  const HowItWorksSection = () => <div ref={howItWorksRef} className="mt-12 pt-4">
      <h2 className="text-3xl font-bold mb-6 text-indigo-700 flex items-center gap-2">
        <Lightbulb className="h-7 w-7" /> How Our Smart Search Logic Works
      </h2>
      <Card className={cardClasses}>
        <p className="text-lg text-(--foreground) mb-6 ">
          The Reel Music Trend Finder uses a two-tier, high-precision matching
          system to give you the most relevant suggestions from its stable
          internal dataset.
        </p>

        <div className="space-y-6">
          {
    /* Step 1 */
  }
          <div className="flex items-start p-4 border-l-4 border-pink-500 bg-pink-50 rounded-md">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-pink-500 text-(--foreground) rounded-full font-bold mr-4">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold text-(--foreground) dark:text-black/80">
                Standardized Mood Matching (High Priority)
              </h3>
              <p className="text-(--muted-foreground) mt-1">
                Your input (e.g., "gym vlog") is immediately mapped to
                predefined, stable categories like "Motivational Workout." This
                ensures you get highly relevant tracks even if your phrasing is
                slightly different.
              </p>
            </div>
          </div>

          {
    /* Step 2 */
  }
          <div className="flex items-start p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-md">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-500 text-(--foreground) rounded-full font-bold mr-4">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold text-(--foreground) dark:text-black/80">
                Keyword Fallback Search (Secondary Priority)
              </h3>
              <p className="text-(--muted-foreground) mt-1">
                If no direct mood is matched, the system searches your input
                keywords against the track's **Vibe** (e.g., "Lo-Fi," "EDM") and
                **Trending Use** (e.g., "Drone footage," "recipe tutorials").
                This catches subtle, non-standard trends.
              </p>
            </div>
          </div>

          {
    /* Step 3 */
  }
          <div className="flex items-start p-4 border-l-4 border-gray-500 bg-(--muted) rounded-md">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-muted0 text-(--foreground) rounded-full font-bold mr-4">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold text-(--foreground)">
                Unique Result Presentation (Max 5)
              </h3>
              <p className="text-(--muted-foreground) mt-1">
                Only the top 5 most unique and relevant tracks are displayed to
                prevent overwhelming you, ensuring each suggestion is a
                high-quality option for your video content.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>;
  const FAQSection = () => {
    const faqItems = [
      {
        id: "faq1",
        q: "Why is this tool operating in Offline Mode?",
        a: `The tool operates in **Offline Mode** using a stable, curated dataset to guarantee reliability and speed. Real-time API calls to music platforms are often prone to rate limiting, authentication issues, or sudden changes that can cause the application to break. Our internal dataset is manually vetted for current trends, providing consistent, fast, and predictable results every time, independent of external network issues.`
      },
      {
        id: "faq2",
        q: "How can I ensure the music is licensed for my Reels/TikToks?",
        a: `**Important:** This tool provides trending *suggestions*. The "Listen/Find Track (Playable)" link takes you to a general search. You must always use the music platform's official audio library (e.g., Instagram/TikTok's music library) to ensure the track is licensed for commercial or personal use on that specific platform. Using an audio file downloaded from an external source may violate copyright.`
      },
      {
        id: "faq3",
        q: "How current is the internal music dataset?",
        a: `The dataset is curated to include tracks and vibes that have been dominating short-form video content throughout the current year. While not updated in real-time like a live API, the mood categories and track types are based on perennial trends (e.g., Lo-Fi, EDM) and recent viral hits, ensuring the suggestions are highly relevant for content creation today.`
      },
      {
        id: "faq4",
        q: 'What should I do if my search yields "General trending suggestions"?',
        a: `If your search is too specific or uses niche terminology, the smart matching algorithm will resort to a general fallback. To get a better result, try simplifying your query. Instead of "ASMR soft whispering rainy day," try "Sad/Emotional" or "Relaxed Cooking" if the video is about coffee. Use general mood or content type keywords for best results.`
      }
    ];
    return <div ref={faqRef} className="mt-12 pt-4">
        <h2 className="text-3xl font-bold mb-6 text-indigo-700 flex items-center gap-2">
          <HelpCircle className="h-7 w-7" /> Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqItems.map((item) => <Card key={item.id} className={accordionItemClasses}>
              <button
      className={accordionButtonClasses}
      onClick={() => toggleFAQ(item.id)}
    >
                {item.q}
                {openFAQ === item.id ? <ChevronUp className="w-5 h-5 text-indigo-600" /> : <ChevronDown className="w-5 h-5 text-(--muted-foreground)" />}
              </button>
              {openFAQ === item.id && <div className={accordionContentClasses}>
                  <p dangerouslySetInnerHTML={{ __html: item.a }} />
                </div>}
            </Card>)}
        </div>
      </div>;
  };
  const PrivacyPolicyAccordion = () => {
    const policyItems = [
      {
        id: "policy1",
        q: "Data Collection Policy (Offline Mode)",
        a: `This tool operates entirely in a **stable offline mode** and does not connect to any external server or API (except for the final Google search link provided to you). **No personal data, search history, or usage metrics are collected, stored, or transmitted** by this application.`
      },
      {
        id: "policy2",
        q: "Use of Search Queries",
        a: `Your search queries are processed **locally** within your browser's memory using JavaScript functions (like \`getStandardizedMoods\`) to filter the static music data. These queries are immediately discarded after the suggestions are displayed and are never logged or sent to a remote server.`
      },
      {
        id: "policy3",
        q: "Cookies and Tracking Technologies",
        a: `This application is designed to respect user privacy completely. It **does not use cookies**, web beacons, or any form of persistent tracking technology to monitor your activity or device.`
      },
      {
        id: "policy4",
        q: "External Links (Playable Track)",
        a: `The "Listen/Find Track (Playable)" button generates a standard Google search URL based on the track name and artist. Clicking this link will take you to an external search engine, whose own privacy policy will then govern your activity. Our application does not track your clicks on this link.`
      }
    ];
    return <div ref={policyRef} className="mt-12 pt-4">
        <h2 className="text-3xl font-bold mb-6 text-indigo-700 flex items-center gap-2">
          <Lock className="h-7 w-7" /> Privacy Policy
        </h2>
        <div className="space-y-3">
          {policyItems.map((item) => <Card key={item.id} className={accordionItemClasses}>
              <button
      className={accordionButtonClasses}
      onClick={() => toggleFAQ(item.id)}
    >
                {item.q}
                {openFAQ === item.id ? <ChevronUp className="w-5 h-5 text-indigo-600" /> : <ChevronDown className="w-5 h-5 text-(--muted-foreground)" />}
              </button>
              {openFAQ === item.id && <div className={accordionContentClasses}>
                  <p dangerouslySetInnerHTML={{ __html: item.a }} />
                </div>}
            </Card>)}
        </div>
      </div>;
  };
  return <div className="space-y-8">
      {
    /* Welcome Message */
  }
      <Card className={cardClasses}>
        <h2 className="text-2xl font-bold mb-4">What's Your Vibe?</h2>
        <p className="text-(--muted-foreground) mb-6">
          This tool is running in a stable Offline Mode to avoid API errors.
          It uses smart search logic to match your input to the latest
          trending music niches.
        </p>
        <form
    onSubmit={handleSubmit}
    className="flex flex-col sm:flex-row gap-4"
  >
          <Input
    type="text"
    value={moodNiche}
    onChange={(e) => setMoodNiche(e.target.value)}
    placeholder="e.g., Aesthetic travel montage, motivational gym clip, sad video"
    className={inputClasses}
    disabled={loading}
    required
  />
          <Button type="submit" className={buttonClasses} disabled={loading}>
            {loading ? <Loader2 className="animate-spin h-6 w-6 inline mr-2" /> : <Search className="h-6 w-6 inline mr-2" />}
            Suggest Music
          </Button>
        </form>
      </Card>

      {
    /* Status and Error Messages Component */
  }
      {error && <Card className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-xl font-medium">
          <p>
            <strong>Notice:</strong> {error}
          </p>
        </Card>}
      {loading && <div className="p-4 text-center text-indigo-600 font-semibold">
          <Loader2 className="animate-spin h-8 w-8 inline mr-2" />
          Searching internal database with smart matching...
        </div>}

      {
    /* Suggestions List Component */
  }
      {suggestions && suggestions.length > 0 && <div className="mt-6">
          <h2 className="text-3xl font-bold mb-6 text-indigo-600">
            Top Suggested Audio Tracks
          </h2>
          <div className="space-y-6">
            {suggestions.map((s, index) => <Card
    key={index}
    className="flex flex-col md:flex-row gap-4 md:gap-6 p-6 bg-(--background) rounded-2xl shadow-xl border border-(--border) hover:ring-2 hover:ring-pink-500 transition duration-300"
  >
                <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 font-extrabold text-xl shadow-md">
                  <Disc size={20} />
                </div>
                <div className="grow">
                  <h3 className="text-xl font-extrabold text-indigo-600">
                    {s.trackName || "Unknown Track"}
                  </h3>
                  <p className="text-sm font-semibold text-pink-600 mb-2">
                    {s.artist || "Original Audio"}
                  </p>
                  <div className="space-y-1">
                    <p className="flex items-center text-sm font-medium">
                      <span className="inline-block px-3 py-1 mr-2 text-xs font-semibold rounded-full bg-(--muted) text-(--foreground)">
                        Mood: {s.mood || "General"}
                      </span>
                      <span className="inline-block px-3 py-1 mr-2 text-xs font-semibold rounded-full bg-(--muted) text-(--foreground)">
                        Vibe: {s.vibe || "General"}
                      </span>
                    </p>
                    <p className="text-(--foreground)">
                      <span className="font-semibold text-indigo-700">
                        Trending Use:
                      </span>{" "}
                      {s.trendingUse || "Highly versatile, use for various content types."}
                    </p>
                  </div>
                  {s.searchLink && <a
    href={s.searchLink}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-3 inline-flex items-center text-sm font-semibold text-(--foreground) bg-pink-600 px-4 py-2 rounded-full hover:bg-pink-700 transition duration-150 shadow-lg"
  >
                      <Link size={16} className="mr-1" />
                      Listen/Find Track (Playable)
                    </a>}
                </div>
              </Card>)}
          </div>
        </div>}

      {
    /* --- ADDED SECTIONS BELOW SUGGESTIONS --- */
  }
      <HowItWorksSection />
      <FAQSection />
      <PrivacyPolicyAccordion />
      {
    /* ------------------------------------- */
  }
    </div>;
};
export default ReelBGMTool;
