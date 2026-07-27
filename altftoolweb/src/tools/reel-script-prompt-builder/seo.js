const seo = {
  intro:
    "The Reel Script Prompt Builder generates an AI script-writing prompt with a second-by-second beat sheet: hook inside the first 3 seconds, setup, value body, a payoff filling the final 20% of the runtime, and a CTA compressed into the last 2–5 seconds. Timings follow the retention guidance published for Reels, TikTok and Shorts — viewers decide within about 3 seconds, and completion rate drives distribution. It is built for creators and social media managers who want scripts paced to the second rather than a wall of undifferentiated copy.",
  useCases: [
    "A fitness creator planning a 30-second Instagram Reel who needs the hook, demo and payoff mapped to exact seconds before writing a single line",
    "A social media manager briefing ChatGPT for a batch of 45-second TikToks who wants every script to follow the same hook-payoff-CTA structure",
    "A founder recording a 60-second YouTube Short who needs a word budget so the voiceover actually fits the runtime",
  ],
  benefits: [
    ["Time-coded beat sheet", "Every prompt includes exact start and end seconds for hook, setup, body, payoff and CTA."],
    ["Platform length limits enforced", "Runtime is validated against each platform's published maximum (90s to 10 min)."],
    ["Word budget included", "The prompt caps spoken lines at roughly 2.5 words per second so scripts fit the runtime."],
  ],
  faqs: [
    [
      "How long should the hook of a reel be?",
      "About 3 seconds or less. Creator guidance from Meta and TikTok consistently reports that viewers decide whether to keep watching within the first ~3 seconds, so the hook line and its visual must land inside that window — this tool locks the hook beat to a maximum of 3 seconds regardless of total runtime.",
    ],
    [
      "How many words fit in a 30-second reel?",
      "Roughly 75 spoken words. Conversational voiceover runs at about 150 words per minute (2.5 words per second), so a 30-second script has a budget of ~75 words and a 60-second script ~150. The generated prompt states this budget so the AI does not overwrite the runtime.",
    ],
    [
      "How long can a reel or short actually be?",
      "As of mid-2025: Instagram Reels and YouTube Shorts allow up to 3 minutes (Shorts expanded from 60 seconds in October 2024), TikTok allows uploads up to 10 minutes, and Facebook Reels up to 90 seconds. The tool validates your chosen runtime against the selected platform's limit.",
    ],
    [
      "What is a payoff in a short-form video script?",
      "The payoff is the moment the video delivers exactly what the hook promised — the answer, result or reveal. This tool places it in the final 20% of the runtime because videos that reward a full watch score higher on completion rate, which every short-form algorithm uses as a ranking signal.",
    ],
  ],
};

export default seo;
