"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

const QUESTIONS = [
  {
    question: "A stranger offers you a lottery ticket as a gift. What do you do?",
    options: [
      {
        text: "Thank them and accept it — you never know what might happen",
        scores: { luckyStar: 3, fourLeaf: 2, rabbitFoot: 2, horseshoe: 0, rainbow: 2, penny: 0 }
      },
      {
        text: "Politely decline — you prefer to earn your own fortune",
        scores: { luckyStar: 0, fourLeaf: 0, rabbitFoot: 0, horseshoe: 3, rainbow: 0, penny: 3 }
      },
      {
        text: "Accept it and immediately decide to split any winnings with them",
        scores: { luckyStar: 1, fourLeaf: 3, rabbitFoot: 1, horseshoe: 1, rainbow: 1, penny: 1 }
      },
      {
        text: "Take it as a sign that today is your lucky day and buy another ticket",
        scores: { luckyStar: 2, fourLeaf: 1, rabbitFoot: 3, horseshoe: 0, rainbow: 3, penny: 0 }
      }
    ]
  },
  {
    question: "You have an important exam or interview tomorrow. What is your mindset?",
    options: [
      {
        text: "I have prepared thoroughly and my effort will carry me through",
        scores: { luckyStar: 0, fourLeaf: 0, rabbitFoot: 0, horseshoe: 3, rainbow: 0, penny: 3 }
      },
      {
        text: "I feel like the universe is on my side today",
        scores: { luckyStar: 3, fourLeaf: 2, rabbitFoot: 1, horseshoe: 0, rainbow: 2, penny: 0 }
      },
      {
        text: "I will wear my lucky clothes and hope for the best",
        scores: { luckyStar: 0, fourLeaf: 1, rabbitFoot: 3, horseshoe: 0, rainbow: 1, penny: 0 }
      },
      {
        text: "Whatever happens, things usually work out in the end for me",
        scores: { luckyStar: 2, fourLeaf: 3, rabbitFoot: 1, horseshoe: 1, rainbow: 3, penny: 1 }
      }
    ]
  },
  {
    question: "How do you react when you experience a string of bad luck?",
    options: [
      {
        text: "I stay positive and trust the tide will turn soon",
        scores: { luckyStar: 3, fourLeaf: 2, rabbitFoot: 1, horseshoe: 0, rainbow: 3, penny: 1 }
      },
      {
        text: "I double down on effort and try to outwork the bad streak",
        scores: { luckyStar: 0, fourLeaf: 0, rabbitFoot: 0, horseshoe: 3, rainbow: 0, penny: 3 }
      },
      {
        text: "I check if I forgot my lucky charm or broke a superstition",
        scores: { luckyStar: 0, fourLeaf: 1, rabbitFoot: 3, horseshoe: 1, rainbow: 0, penny: 0 }
      },
      {
        text: "I shrug it off — patterns in randomness are just an illusion",
        scores: { luckyStar: 1, fourLeaf: 3, rabbitFoot: 0, horseshoe: 3, rainbow: 1, penny: 2 }
      }
    ]
  },
  {
    question: "You see a four-leaf clover on the ground. What crosses your mind?",
    options: [
      {
        text: "I pick it up immediately and keep it as a lucky charm",
        scores: { luckyStar: 0, fourLeaf: 3, rabbitFoot: 3, horseshoe: 0, rainbow: 1, penny: 0 }
      },
      {
        text: "I smile and consider it a nice omen for the day",
        scores: { luckyStar: 2, fourLeaf: 2, rabbitFoot: 1, horseshoe: 1, rainbow: 3, penny: 1 }
      },
      {
        text: "I leave it there — my fortune comes from my own decisions",
        scores: { luckyStar: 0, fourLeaf: 0, rabbitFoot: 0, horseshoe: 3, rainbow: 0, penny: 3 }
      },
      {
        text: "I take a photo but do not pick it, not wanting to disturb nature",
        scores: { luckyStar: 1, fourLeaf: 1, rabbitFoot: 0, horseshoe: 2, rainbow: 2, penny: 2 }
      }
    ]
  },
  {
    question: "How often do you take risks in everyday situations?",
    options: [
      {
        text: "Frequently — luck favors the bold and I trust my instincts",
        scores: { luckyStar: 3, fourLeaf: 1, rabbitFoot: 2, horseshoe: 0, rainbow: 2, penny: 1 }
      },
      {
        text: "Occasionally — I weigh probabilities and take calculated chances",
        scores: { luckyStar: 1, fourLeaf: 3, rabbitFoot: 1, horseshoe: 2, rainbow: 1, penny: 2 }
      },
      {
        text: "Rarely — I prefer certainty and careful planning",
        scores: { luckyStar: 0, fourLeaf: 1, rabbitFoot: 0, horseshoe: 3, rainbow: 0, penny: 3 }
      },
      {
        text: "Only when I feel the moment is cosmically aligned",
        scores: { luckyStar: 2, fourLeaf: 0, rabbitFoot: 3, horseshoe: 0, rainbow: 3, penny: 0 }
      }
    ]
  },
  {
    question: "When something good unexpectedly happens to you, what is your first thought?",
    options: [
      {
        text: "I deserve this because of my hard work and persistence",
        scores: { luckyStar: 0, fourLeaf: 1, rabbitFoot: 0, horseshoe: 2, rainbow: 0, penny: 3 }
      },
      {
        text: "The universe is smiling at me today",
        scores: { luckyStar: 3, fourLeaf: 1, rabbitFoot: 1, horseshoe: 0, rainbow: 2, penny: 0 }
      },
      {
        text: "This is a nice surprise — things tend to work out for me",
        scores: { luckyStar: 2, fourLeaf: 3, rabbitFoot: 2, horseshoe: 1, rainbow: 3, penny: 1 }
      },
      {
        text: "I wonder what I did to earn this stroke of good fortune",
        scores: { luckyStar: 0, fourLeaf: 2, rabbitFoot: 3, horseshoe: 1, rainbow: 1, penny: 2 }
      }
    ]
  },
  {
    question: "How superstitious would you say you are?",
    options: [
      {
        text: "Very superstitious — I avoid black cats, broken mirrors, and ladders",
        scores: { luckyStar: 1, fourLeaf: 1, rabbitFoot: 3, horseshoe: 0, rainbow: 1, penny: 0 }
      },
      {
        text: "Mildly superstitious — a few rituals but not ruled by them",
        scores: { luckyStar: 2, fourLeaf: 2, rabbitFoot: 2, horseshoe: 1, rainbow: 2, penny: 1 }
      },
      {
        text: "Not at all — I believe in cause and effect, not magic",
        scores: { luckyStar: 0, fourLeaf: 1, rabbitFoot: 0, horseshoe: 3, rainbow: 0, penny: 3 }
      },
      {
        text: "I am superstitious about good luck but not about bad luck",
        scores: { luckyStar: 3, fourLeaf: 3, rabbitFoot: 1, horseshoe: 0, rainbow: 3, penny: 0 }
      }
    ]
  },
  {
    question: "A friend tells you about an amazing investment opportunity that sounds too good to be true.",
    options: [
      {
        text: "I trust my friend and go all in — fortune favors the brave",
        scores: { luckyStar: 3, fourLeaf: 0, rabbitFoot: 2, horseshoe: 0, rainbow: 2, penny: 0 }
      },
      {
        text: "I research thoroughly and invest a modest amount I can afford to lose",
        scores: { luckyStar: 1, fourLeaf: 3, rabbitFoot: 1, horseshoe: 2, rainbow: 1, penny: 2 }
      },
      {
        text: "I pass — if it sounds too good to be true it probably is",
        scores: { luckyStar: 0, fourLeaf: 1, rabbitFoot: 0, horseshoe: 3, rainbow: 0, penny: 3 }
      },
      {
        text: "I ask about the timing and check my horoscope before deciding",
        scores: { luckyStar: 2, fourLeaf: 0, rabbitFoot: 3, horseshoe: 0, rainbow: 3, penny: 0 }
      }
    ]
  },
  {
    question: "If you had to describe your life's pattern of fortune, which sounds most accurate?",
    options: [
      {
        text: "Good things consistently and reliably come my way",
        scores: { luckyStar: 2, fourLeaf: 3, rabbitFoot: 1, horseshoe: 0, rainbow: 2, penny: 0 }
      },
      {
        text: "I create my own opportunities through sheer determination",
        scores: { luckyStar: 0, fourLeaf: 0, rabbitFoot: 0, horseshoe: 2, rainbow: 0, penny: 3 }
      },
      {
        text: "I have lucky bursts at unexpected moments that change everything",
        scores: { luckyStar: 2, fourLeaf: 0, rabbitFoot: 1, horseshoe: 0, rainbow: 3, penny: 1 }
      },
      {
        text: "My luck depends on the rituals and charms I keep",
        scores: { luckyStar: 0, fourLeaf: 1, rabbitFoot: 3, horseshoe: 1, rainbow: 1, penny: 1 }
      }
    ]
  },
  {
    question: "You spill salt at dinner. How do you respond?",
    options: [
      {
        text: "I quickly toss a pinch over my left shoulder to ward off bad luck",
        scores: { luckyStar: 0, fourLeaf: 1, rabbitFoot: 3, horseshoe: 0, rainbow: 1, penny: 0 }
      },
      {
        text: "I laugh it off and clean it up — accidents happen",
        scores: { luckyStar: 1, fourLeaf: 3, rabbitFoot: 1, horseshoe: 3, rainbow: 2, penny: 2 }
      },
      {
        text: "I see it as a minor setback that I will overcome through effort",
        scores: { luckyStar: 0, fourLeaf: 0, rabbitFoot: 0, horseshoe: 2, rainbow: 0, penny: 3 }
      },
      {
        text: "I take it as a signal that something exciting is about to happen",
        scores: { luckyStar: 3, fourLeaf: 1, rabbitFoot: 1, horseshoe: 0, rainbow: 3, penny: 0 }
      }
    ]
  }
];

const LUCK_PROFILES = {
  luckyStar: {
    name: "Lucky Star",
    summary: "Fortune always finds you. You move through life with a natural charisma and timing that seems to attract good outcomes without much effort. People marvel at how things just seem to work out for you.",
    luckScore: 92,
    traits: ["Naturally fortunate", "Optimistic outlook", "Serendipitous timing", "Attracts opportunities"],
    advice: "Share your good fortune with others. Use your natural luck to lift those around you and create opportunities for people who may not have the same wind at their back.",
    quote: "Luck is what happens when preparation meets opportunity — but in your case, opportunity seems to find you first."
  },
  fourLeaf: {
    name: "Four-Leaf Clover",
    summary: "Consistently fortunate in most areas of life. You experience a steady stream of good outcomes that build upon each other. Your balanced approach to risk and positivity creates a reliable foundation for success.",
    luckScore: 78,
    traits: ["Consistently fortunate", "Balanced risk-taker", "Positive realist", "Builds momentum"],
    advice: "Keep doing what you are doing. Your balanced mindset is your greatest asset. Document your successes to remind yourself of the patterns that work.",
    quote: "Good fortune is not about one big break — it is about the small, consistent choices that stack in your favor over time."
  },
  rabbitFoot: {
    name: "Rabbit's Foot",
    summary: "You have average luck with an extra dash of charm. You dabble in superstitions and rituals that give you a confidence boost, and often that confidence is enough to tilt the odds in your direction.",
    luckScore: 55,
    traits: ["Charmingly lucky", "Enjoys rituals", "Confidence seeker", "Moderate fortune"],
    advice: "Trust your rituals but do not depend on them entirely. Your real power lies in the confidence they give you — carry that confidence into every situation.",
    quote: "Whether or not the charm holds real power, believing it does might be enough to make your own luck."
  },
  horseshoe: {
    name: "Horseshoe",
    summary: "You rely more on effort than luck. You believe in hard work, preparation, and careful planning. Good things come to you, but usually because you have built the foundation brick by brick.",
    luckScore: 40,
    traits: ["Effort-driven", "Skeptical of luck", "Careful planner", "Self-reliant"],
    advice: "Remember to pause and enjoy your accomplishments. Not everything needs to be earned through struggle — sometimes it is okay to let good things come to you.",
    quote: "The harder you work, the luckier you get. Your fortune is written in the sweat of your own effort."
  },
  rainbow: {
    name: "Rainbow Chaser",
    summary: "Luck comes when you least expect it. Your life is full of surprising, unpredictable moments of fortune that arrive out of nowhere. You never know when the next rainbow will appear, but you know it will.",
    luckScore: 25,
    traits: ["Unpredictably lucky", "Embraces surprise", "Sporadic fortune", "Hopeful spirit"],
    advice: "Stay open to the unexpected. Your luck arrives through spontaneity, so say yes to more opportunities and keep your schedule flexible for life's delightful surprises.",
    quote: "The best things in life arrive unannounced. Your luck does not follow a calendar — it follows curiosity."
  },
  penny: {
    name: "Lucky Penny",
    summary: "You make your own luck through sheer perseverance. Every success you have is earned through grit, determination, and refusing to give up. You are proof that fortune favors the persistent.",
    luckScore: 15,
    traits: ["Self-made fortune", "Perseverant", "Resilient spirit", "Earns every win"],
    advice: "You are already doing the hard part — never giving up. Now learn to recognize when to pivot, ask for help, and let yourself receive grace. You do not have to do it all alone.",
    quote: "Luck is not a force that finds you. It is a reward that answers to those who refuse to stop trying."
  }
};

const PROFILE_KEYS = Object.keys(LUCK_PROFILES);

export default function ToolHome() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);

  const handleSelect = (optionIndex) => {
    const nextAnswers = { ...answers, [step]: optionIndex };
    setAnswers(nextAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setCalculating(true);
      setTimeout(() => {
        const scores = {};
        for (const key of PROFILE_KEYS) {
          scores[key] = 0;
        }
        for (const qIdx in nextAnswers) {
          const optIdx = nextAnswers[qIdx];
          const optionScores = QUESTIONS[qIdx].options[optIdx].scores;
          for (const key of PROFILE_KEYS) {
            scores[key] += optionScores[key];
          }
        }
        let maxKey = PROFILE_KEYS[0];
        let maxScore = scores[maxKey];
        for (const key of PROFILE_KEYS) {
          if (scores[key] > maxScore) {
            maxKey = key;
            maxScore = scores[key];
          }
        }
        setResult(maxKey);
        setCalculating(false);
      }, 2000);
    }
  };

  const handleRetake = () => {
    setStep(0);
    setAnswers({});
    setCalculating(false);
    setResult(null);
  };

  const currentQuestion = step < QUESTIONS.length ? QUESTIONS[step] : null;
  const progress = step < QUESTIONS.length
    ? ((step + 1) / QUESTIONS.length) * 100
    : 100;

  if (calculating) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "How Lucky Are You? Fortune Quiz",
              "description": "Take our fun luck quiz to measure your fortune score. Discover your luck profile and see how fate favors you in life.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-1">
              <Sparkles className="text-primary" size={32} />
            </div>
            <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              How Lucky Are You?
            </h1>
            <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              A quiz to measure your luck score and see how fortune favors you.
            </p>
          </div>
          <div className="bg-card border border-border rounded-3xl shadow-xl p-6 sm:p-8">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="alt-ui-spinner alt-ui-spinner--lg mb-6 border-t-primary" />
              <h4 className="font-semibold text-lg text-foreground animate-pulse">
                Consulting the stars...
              </h4>
              <p className="text-sm text-muted-foreground mt-2">
                Calculating your luck profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    const profile = LUCK_PROFILES[result];
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "How Lucky Are You? Fortune Quiz",
              "description": "Take our fun luck quiz to measure your fortune score. Discover your luck profile and see how fate favors you in life.",
              "applicationCategory": "QuizApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-1">
              <Sparkles className="text-primary" size={32} />
            </div>
            <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              How Lucky Are You?
            </h1>
            <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              A quiz to measure your luck score and see how fortune favors you.
            </p>
          </div>
          <div className="bg-card border border-border rounded-3xl shadow-xl p-6 sm:p-8">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="var(--border)"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-border"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="var(--primary)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 56}
                      strokeDashoffset={2 * Math.PI * 56 * (1 - profile.luckScore / 100)}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-3xl font-black text-foreground">
                    {profile.luckScore}
                    <span className="text-lg font-bold text-muted-foreground">/100</span>
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">
                    {profile.name}
                  </h3>
                </div>
              </div>

              <div className="bg-background rounded-2xl p-5 border border-border">
                <p className="text-sm text-foreground leading-relaxed">
                  {profile.summary}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Key Traits
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.traits.map((trait, i) => (
                    <span
                      key={i}
                      className="inline-block px-3 py-1.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-background rounded-2xl p-5 border border-border space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Advice
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {profile.advice}
                </p>
              </div>

              <div className="bg-background rounded-2xl p-5 border border-border border-l-4 border-l-primary">
                <p className="text-sm italic text-foreground leading-relaxed">
                  {profile.quote}
                </p>
              </div>

              <button
                onClick={handleRetake}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 shadow"
              >
                <RotateCcw size={18} /> Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "How Lucky Are You? Fortune Quiz",
            "description": "Take our fun luck quiz to measure your fortune score. Discover your luck profile and see how fate favors you in life.",
            "applicationCategory": "QuizApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-1">
            <Sparkles className="text-primary" size={32} />
          </div>
          <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            How Lucky Are You?
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Answer 10 questions to discover your luck profile and fortune score.
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>QUESTION</span>
                <span>{step + 1} of {QUESTIONS.length}</span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground leading-snug min-h-[3rem]">
                {currentQuestion.question}
              </h2>
              <div className="grid gap-3">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className="w-full text-left p-4 rounded-xl border border-border bg-background text-sm font-medium text-foreground hover:border-primary hover:bg-primary/5 cursor-pointer transition active:scale-[0.99] duration-100 focus:outline-none focus:ring-3 focus:ring-primary/25"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
