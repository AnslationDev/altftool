"use client";

import { useState } from "react";
import Header from "./Header";

const rashis = [
  { name: "Mesha (Aries)", start: "03-21", end: "04-19", element: "Fire", desc: "Energetic, confident, leader." },
  { name: "Vrishabh (Taurus)", start: "04-20", end: "05-20", element: "Earth", desc: "Stable, loyal, practical." },
  { name: "Mithun (Gemini)", start: "05-21", end: "06-20", element: "Air", desc: "Smart, curious, talkative." },
  { name: "Karka (Cancer)", start: "06-21", end: "07-22", element: "Water", desc: "Emotional, caring, family lover." },
  { name: "Singh (Leo)", start: "07-23", end: "08-22", element: "Fire", desc: "Bold, powerful, confident." },
  { name: "Kanya (Virgo)", start: "08-23", end: "09-22", element: "Earth", desc: "Intelligent, organized, kind." },
  { name: "Tula (Libra)", start: "09-23", end: "10-22", element: "Air", desc: "Balanced, romantic, peaceful." },
  { name: "Vrishchik (Scorpio)", start: "10-23", end: "11-21", element: "Water", desc: "Strong, mysterious, focused." },
  { name: "Dhanu (Sagittarius)", start: "11-22", end: "12-21", element: "Fire", desc: "Adventurous, honest, optimistic." },
  { name: "Makar (Capricorn)", start: "12-22", end: "01-19", element: "Earth", desc: "Hard-working, ambitious." },
  { name: "Kumbh (Aquarius)", start: "01-20", end: "02-18", element: "Air", desc: "Creative, modern, independent." },
  { name: "Meen (Pisces)", start: "02-19", end: "03-20", element: "Water", desc: "Emotional, artistic, gentle." },
];

const cosmicData = {
  love: ["Deep emotional connection forming", "A soulmate connection is near", "Unexpected romantic surprise", "Time to heal past wounds", "New sparks in existing relationship"],
  career: ["Promotion chance is high", "New project success", "Leadership role opportunity", "Skill growth will pay off", "Networking boost incoming"],
  finance: ["Unexpected profit incoming", "Save for a big investment", "Financial stability returning", "New income source opens", "Bonus or gift expected"],
  advice: ["Trust your instincts", "Stay calm in chaos", "Take bold steps", "Avoid negativity", "Focus on your goals"],
  luckyColors: ["Red","Blue","Green","Yellow","Purple","Orange","Pink","Black","White","Cyan"],
  luckyNumbers: Array.from({ length: 60 }, (_, i) => i + 1)
};

export default function MainComponent() {
  const [dob, setDob] = useState("");
  const [result, setResult] = useState(null);
  const [partnerDob, setPartnerDob] = useState("");
  const [compatibility, setCompatibility] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [mood, setMood] = useState("");

  const [horoscope, setHoroscope] = useState({});
  const [lucky, setLucky] = useState({});
  const [personality, setPersonality] = useState(null);
  const [todayAdvice, setTodayAdvice] = useState("");
  const [weekly, setWeekly] = useState(null);
  const [tomorrow, setTomorrow] = useState(null);

  const getSeededIndex = (seedString, modulo) => {
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = (hash << 5) - hash + seedString.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % modulo;
  };

  const getRashi = (dateStr) => {
    const date = new Date(dateStr);
    const md = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return rashis.find(r => (r.start <= md && md <= r.end) || (r.start > r.end && (md >= r.start || md <= r.end)));
  };

  const fetchAstroData = async (sign) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`, {
        method: "POST",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return null;
    }
  };

  const calculateRashi = async () => {
    if (!dob || dob.length !== 10) return;

    const found = getRashi(dob);
    if (!found) return;

    const todayDate = new Date().toDateString();
    const birthSeed = dob;
    const dailySeed = dob + todayDate;

    setResult(found);

    const sign = found.name.split("(")[1].replace(")", "").toLowerCase();
    const apiData = await fetchAstroData(sign);

    if (apiData) {
      setHoroscope({
        love: apiData.description,
        career: apiData.mood,
        finance: apiData.color,
      });
      setTodayAdvice(apiData.compatibility);
    } else {
      setHoroscope({
        love: cosmicData.love[getSeededIndex(dailySeed + "love", cosmicData.love.length)],
        career: cosmicData.career[getSeededIndex(dailySeed + "career", cosmicData.career.length)],
        finance: cosmicData.finance[getSeededIndex(dailySeed + "finance", cosmicData.finance.length)],
      });
      setTodayAdvice(cosmicData.advice[getSeededIndex(dailySeed, cosmicData.advice.length)]);
    }

    setLucky({
      number: cosmicData.luckyNumbers[getSeededIndex(birthSeed, cosmicData.luckyNumbers.length)],
      color: cosmicData.luckyColors[getSeededIndex(birthSeed, cosmicData.luckyColors.length)],
      time: `${(getSeededIndex(dailySeed, 12)) + 1} ${getSeededIndex(dailySeed, 2) === 0 ? "AM" : "PM"}`,
    });

    setPersonality({
      strengths: ["Strategic Thinking", "Fearless Leadership", "Deep Empathy", "Creative Vision", "Loyalty"][getSeededIndex(birthSeed, 5)],
      weaknesses: ["Occasional Overthinking", "Impatience", "Sensitivity", "Perfectionism", "Stubbornness"][getSeededIndex(birthSeed, 5)],
      hidden: ["Intuitive Powers", "Hidden Artistic Talent", "Strong Resilience", "Natural Wisdom"][getSeededIndex(birthSeed, 4)],
      career: ["Tech & Innovation", "Arts & Media", "Business & Finance", "Healthcare & Healing"][getSeededIndex(birthSeed, 4)],
      habits: ["Early Riser", "Strategic Planner", "Risk Taker", "Problem Solver"][getSeededIndex(birthSeed, 4)],
    });

    setWeekly({
      energy: `${65 + (getSeededIndex(dailySeed, 30))}%`,
      luck: `${50 + (getSeededIndex(dailySeed, 45))}%`,
      productivity: `${70 + (getSeededIndex(dailySeed, 25))}%`,
    });

    setTomorrow({
      love: cosmicData.love[getSeededIndex(dob + "tomorrow", cosmicData.love.length)],
      career: cosmicData.career[getSeededIndex(dob + "tomorrow_c", cosmicData.career.length)],
    });

    setCompatibility(null);
  };

  const checkCompatibility = () => {
    if (!dob || !partnerDob) return;

    const r1 = getRashi(dob);
    const r2 = getRashi(partnerDob);

    let score = 60;
    if (r1.element === r2.element) score += 30;
    else score += getSeededIndex(dob + partnerDob, 15);

    setCompatibility({
      score: score > 100 ? 98 : score,
      strengths: score > 80 ? "Excellent Cosmic Bond" : "Good Emotional Understanding",
      weaknesses: score < 75 ? "Communication hurdles" : "Occasional ego clashes",
    });
  };

  const askAI = () => {
    if (!question) return;
    const aiSeeds = [
      "Positive energy is surrounding you.",
      "Focus on your goals, success is near.",
      "Wait for the right moment.",
      "The universe favors your current path."
    ];
    setAnswer(aiSeeds[getSeededIndex(question + dob, aiSeeds.length)]);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-10 text-center shadow-lg">
          <h2 className="text-3xl font-bold text-[var(--primary)] mb-3">Discover Your Moon Sign</h2>
          <p className="text-xl text-[var(--muted-foreground)] mb-6">Enter your birth date to unlock your cosmic profile</p>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="w-full md:w-1/2 mx-auto px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)]"
          />
          <div className="mt-4">
            <button onClick={calculateRashi} className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg">Find Your Rashi</button>
          </div>
        </div>

        {result && (
          <div className="max-w-5xl mx-auto mt-8 grid gap-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow">
              <h3 className="text-2xl font-bold text-[var(--primary)]">{result.name}</h3>
              <p className="text-xl text-[var(--muted-foreground)] mt-1">{result.desc}</p>
              {tomorrow && (
                <p className="mt-3 text-ml">Tomorrow: {tomorrow.love} | {tomorrow.career}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
                <h4 className="font-semibold mb-2 text-xl">🌞 Horoscope</h4>
                <p>❤️ {horoscope.love}</p>
                <p>💼 {horoscope.career}</p>
                <p>💰 {horoscope.finance}</p>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
                <h4 className="font-semibold mb-2 text-xl">🧠 Personality</h4>
                {personality && (
                  <>
                    <p>💪 {personality.strengths}</p>
                    <p>⚠️ {personality.weaknesses}</p>
                    <p>👀 {personality.hidden}</p>
                    <p>💼 {personality.career}</p>
                    <p>🍀 {personality.habits}</p>
                  </>
                )}
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
                <h4 className="font-semibold mb-2 text-xl">📅 Today</h4>
                <p>{todayAdvice}</p>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
                <h4 className="font-semibold mb-2 text-xl">🍀 Lucky</h4>
                <p>{lucky.number} | {lucky.color} | {lucky.time}</p>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
                <h4 className="font-semibold mb-2 text-xl">📊 Weekly</h4>
                {weekly && (
                  <>
                    <p>⚡ Energy: {weekly.energy}</p>
                    <p>🍀 Luck: {weekly.luck}</p>
                    <p>📈 Productivity: {weekly.productivity}</p>
                  </>
                )}
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
                <h4 className="font-semibold mb-2 text-xl">💞 Compatibility</h4>
                <input type="date" value={partnerDob} onChange={(e) => setPartnerDob(e.target.value)} className="w-full mb-3 px-3 py-2 border border-[var(--border)] rounded" />
                <button onClick={checkCompatibility} className="w-full py-2 bg-[var(--primary)] text-white rounded-lg">Check Match</button>
                {compatibility && (
                  <>
                    <p className="mt-2 text-ml">{compatibility.score}% Match</p>
                    <p className="text-ml">{compatibility.strengths}</p>
                    <p className="text-ml">{compatibility.weaknesses}</p>
                  </>
                )}
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 md:col-span-2">
                <h4 className="font-semibold mb-2 text-xl">🔮 Ask Astro</h4>
                <input value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full mb-3 px-3 py-2 border border-[var(--border)] rounded" />
                <button onClick={askAI} className="w-full py-2 bg-[var(--primary)] text-white rounded-lg">Ask</button>
                {answer && <p className="mt-2">{answer}</p>}
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
                <h4 className="font-semibold mb-2 text-xl">💬 Mood</h4>
                <input value={mood} onChange={(e) => setMood(e.target.value)} className="w-full px-3 py-2 border border-[var(--border)] rounded" />
                {mood && <p className="mt-2">Stay calm ✨</p>}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}