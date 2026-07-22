"use client";
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle, Skull, Star, SkipForward, Timer, Shuffle,
  RotateCcw, Heart, PartyPopper, Baby, Briefcase, Users,
  Bookmark, Plus, X, Sparkles,
} from "lucide-react";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const MODE_PACKS = {
  friends: { label: "Friends", icon: Users, desc: "Classic party fun" },
  family: { label: "Family", icon: Heart, desc: "Safe for all ages" },
  party: { label: "Party", icon: PartyPopper, desc: "Wild and crazy" },
  couples: { label: "Couples", icon: Heart, desc: "Romantic & fun" },
  kids: { label: "Kids", icon: Baby, desc: "Kid-friendly" },
  office: { label: "Office", icon: Briefcase, desc: "Professional fun" },
};

const TRUTHS = {
  friends: {
    easy: [
      "What is the most embarrassing thing you've done in front of a friend?",
      "What is your favorite memory with your best friend?",
      "What movie could you watch over and over?",
      "What is your hidden talent?",
      "What is the best gift you've ever received?",
      "What is your dream vacation destination?",
      "What is your favorite food?",
      "What song always gets you dancing?",
      "What is the best advice you've ever received?",
      "What superpower would you choose?",
    ],
    medium: [
      "Have you ever lied to your best friend? What about?",
      "What is your biggest fear in relationships?",
      "What is the weirdest dream you've ever had?",
      "Have you ever had a crush on a friend's ex?",
      "What is the most trouble you've gotten into?",
      "What is something you're insecure about?",
      "Have you ever cheated in a game?",
      "What is the most expensive thing you've broken?",
      "What is your guilty pleasure TV show?",
      "Have you ever read someone's text messages?",
    ],
    hard: [
      "What is the biggest secret you've kept from your friends?",
      "Have you ever betrayed a friend's trust?",
      "What is your biggest regret in life?",
      "Have you ever stolen something?",
      "What is the worst thing you've said in anger?",
      "Have you ever broken someone's heart?",
      "What is the biggest risk you've taken?",
      "What is something you've done that you're not proud of?",
      "Have you ever cheated on a partner?",
      "What is the most dangerous thing you've done?",
    ],
  },
  family: {
    easy: [
      "What is your favorite family tradition?",
      "Who is your favorite relative?",
      "What is the best meal your family makes?",
      "What is your favorite childhood memory?",
      "What is your favorite family vacation?",
      "What is your parents' best quality?",
      "What is your favorite holiday?",
      "What is the best gift you've given a family member?",
      "What family story do you love hearing?",
      "What is your favorite thing about your home?",
    ],
    medium: [
      "What is something you wish your parents understood?",
      "What is a family rule you would change?",
      "Who are you closest to in your family?",
      "What is a family secret you know?",
      "What is something you've hidden from your parents?",
      "What family member do you most resemble?",
      "What is the biggest argument you've had with a sibling?",
      "What family tradition would you start?",
      "What is something your parents don't know about you?",
      "What is the hardest thing about your family?",
    ],
    hard: [
      "What is the biggest lie you've told your parents?",
      "What family issue has affected you the most?",
      "What is something you wish you could change about your family?",
      "Have you ever felt let down by a family member?",
      "What is the most difficult conversation you've had with a parent?",
      "What family secret have you kept the longest?",
      "Have you ever blamed a sibling for something you did?",
      "What is something you resent about your upbringing?",
      "What family member have you hurt the most?",
      "What is the hardest truth about your family?",
    ],
  },
  party: {
    easy: [
      "What is the best party you've ever been to?",
      "What is your go-to karaoke song?",
      "What is the funniest thing you've seen at a party?",
      "What is your signature dance move?",
      "What is the best party game?",
      "What is your favorite party drink?",
      "Who is the most interesting person you've met at a party?",
      "What is the best party theme?",
      "What do you always bring to a party?",
      "What makes a party unforgettable?",
    ],
    medium: [
      "What is the wildest thing you've done at a party?",
      "Have you ever crashed a party?",
      "What is the most embarrassing thing you've done while drunk?",
      "Have you ever hookup at a party?",
      "What is the worst party you've been to?",
      "What is something you did at a party you regret?",
      "Have you ever been kicked out of a party?",
      "What is the most illegal thing you've done at a party?",
      "Have you ever started a fight at a party?",
      "What is the craziest dare you've seen?",
    ],
    hard: [
      "What is the most inappropriate thing you've done at a party?",
      "Have you ever cheated on someone at a party?",
      "What is the biggest secret you know about someone from a party?",
      "What is the worst decision you've made at a party?",
      "Have you ever done drugs at a party?",
      "What is something you saw at a party that you can't unsee?",
      "What is the most trouble you've gotten into after a party?",
      "Have you ever lied about what happened at a party?",
      "What is the most dangerous situation you've been in at a party?",
      "What is the one party memory you wish you could erase?",
    ],
  },
  couples: {
    easy: [
      "What was your first impression of me?",
      "What is your favorite thing about our relationship?",
      "What is the best date we've ever had?",
      "What song reminds you of us?",
      "What do you love most about me?",
      "What is your favorite memory of us?",
      "What is something new you want to try together?",
      "What is the sweetest thing I've done for you?",
      "What attracted you to me?",
      "What is your favorite way to spend time together?",
    ],
    medium: [
      "What is something you wish I understood better?",
      "What is a dealbreaker in a relationship?",
      "What is something you've been afraid to tell me?",
      "What is the biggest challenge in our relationship?",
      "What is something you want me to do more often?",
      "Have you ever doubted our relationship?",
      "What is something you miss from when we first started dating?",
      "What is a hard truth about our relationship?",
      "What is something you've compromised on?",
      "What is the most important quality in a partner?",
    ],
    hard: [
      "Have you ever been tempted to cheat?",
      "What is the biggest lie you've told me?",
      "What is something you've done that would hurt me if I knew?",
      "What is the hardest thing about being with me?",
      "Have you ever compared me to an ex?",
      "What is something you've hidden from me?",
      "What is the most difficult conversation we need to have?",
      "Have you ever thought about ending our relationship?",
      "What is a secret you've kept from me?",
      "What is the biggest sacrifice you've made for this relationship?",
    ],
  },
  kids: {
    easy: [
      "What is your favorite animal?",
      "What do you want to be when you grow up?",
      "What is your favorite color?",
      "What is the best game ever?",
      "Who is your best friend?",
      "What is your favorite food?",
      "What is the funniest joke you know?",
      "What superpower would you choose?",
      "What is your favorite movie?",
      "What makes you happy?",
    ],
    medium: [
      "What is something that scares you?",
      "What is the bravest thing you've ever done?",
      "What is something you want to learn?",
      "What is the nicest thing a friend has done for you?",
      "What is something you're really good at?",
      "What is the best dream you've ever had?",
      "What is something that makes you sad?",
      "What is the funniest thing that happened at school?",
      "What is something you've done that was wrong?",
      "What is your favorite thing about your family?",
    ],
    hard: [
      "What is something you're worried about?",
      "What is the hardest thing about being your age?",
      "What is something you wish adults understood?",
      "What is a time someone was mean to you?",
      "What is something you've kept secret?",
      "What is the most difficult thing you've had to do?",
      "What is something you wish was different?",
      "What is the biggest challenge at school?",
      "What is something you've never told anyone?",
      "What is the most important thing to you?",
    ],
  },
  office: {
    easy: [
      "What is your favorite coffee order?",
      "What is the best team lunch spot?",
      "What is your favorite work playlist?",
      "What is the best thing about your job?",
      "What is your dream role?",
      "What is a skill you want to learn?",
      "Who is the most interesting colleague you've worked with?",
      "What is the best career advice you've received?",
      "What is your favorite productivity tool?",
      "What is your ideal work environment?",
    ],
    medium: [
      "What is the most awkward meeting you've been in?",
      "Have you ever fallen asleep at work?",
      "What is the biggest mistake you've made at work?",
      "Have you ever had a crush on a coworker?",
      "What is something you've taken from the office?",
      "What is the worst job you've had?",
      "Have you ever lied on your resume?",
      "What is the most boring task at work?",
      "What is something you've said about a boss behind their back?",
      "What is the weirdest office policy you've had?",
    ],
    hard: [
      "Have you ever taken credit for someone else's work?",
      "What is the most unethical thing you've seen at work?",
      "Have you ever sabotaged a coworker?",
      "What is the biggest secret at your workplace?",
      "Have you ever been fired? Why?",
      "What is something you've stolen from work?",
      "Have you ever lied to get a job?",
      "What is the worst thing a boss has done to you?",
      "Have you ever broken a confidentiality agreement?",
      "What is something you regret doing at work?",
    ],
  },
};

const DARES = {
  friends: {
    easy: [
      "Do 10 pushups right now!",
      "Sing the chorus of your favorite song!",
      "Speak in an accent for 1 minute!",
      "Do your best dance move!",
      "Make a funny face and hold it for 10 seconds!",
      "Hop on one foot for 30 seconds!",
      "Say the alphabet backwards!",
      "Act like your favorite animal for 30 seconds!",
      "Compliment everyone in the room!",
      "Do 5 jumping jacks!",
    ],
    medium: [
      "Let someone write on your face with a marker!",
      "Talk without closing your mouth for 1 minute!",
      "Do your best celebrity impression!",
      "Eat a spoonful of something spicy!",
      "Sing the national anthem loudly!",
      "Act out a movie scene for 1 minute!",
      "Let someone go through your search history for 30 seconds!",
      "Do a dramatic reading of the last text you sent!",
      "Wear your shirt backwards for 3 rounds!",
      "Make up a rap about the person to your left!",
    ],
    hard: [
      "Post an embarrassing photo on social media!",
      "Let the group change your phone wallpaper!",
      "Do a TikTok dance in public!",
      "Call a friend and sing happy birthday to them!",
      "Let someone draw on your face permanently!",
      "Do 50 pushups in 2 minutes!",
      "Exchange an item of clothing with someone!",
      "Tell an embarrassing story in full detail!",
      "Let the group pick your next meal!",
      "Do a handstand against the wall for 30 seconds!",
    ],
  },
  family: {
    easy: [
      "Do your best impression of a family member!",
      "Sing a nursery rhyme!",
      "Show your best dance move!",
      "Do 5 somersaults!",
      "Make your siblings laugh without saying a word!",
      "Speak like a robot for 2 minutes!",
      "Hop like a frog across the room!",
      "Make a paper airplane!",
      "Do a funny walk across the room!",
      "Balance a book on your head for 30 seconds!",
    ],
    medium: [
      "Let a family member do your hair!",
      "Talk in a British accent for 5 minutes!",
      "Do a dramatic reading of a recipe!",
      "Let someone give you a makeover!",
      "Eat a spoonful of something without making a face!",
      "Do your best animal sounds for 1 minute!",
      "Let a family member pick your outfit for tomorrow!",
      "Sing everything you say for 3 minutes!",
      "Do a handstand for as long as you can!",
      "Let someone tickle you for 30 seconds without laughing!",
    ],
    hard: [
      "Let a family member post something on your social media!",
      "Do a karaoke performance of a song your parents love!",
      "Let your sibling be the boss of you for an hour!",
      "Eat a combination of foods chosen by the family!",
      "Wear a silly outfit for the rest of the game!",
      "Let your mom/dad call you by a silly nickname all day!",
      "Do a chore chosen by someone else right now!",
      "Let a family member go through your phone!",
      "Give a foot massage to the oldest person in the room!",
      "Do your best impression of each family member!",
    ],
  },
  party: {
    easy: [
      "Take a shot of your drink!",
      "Do a body shot!",
      "Make a rule that everyone must follow!",
      "Swap an item of clothing with someone!",
      "Do a keg stand!",
      "Take a selfie with a stranger!",
      "Do a flip or attempt one!",
      "Chug your drink!",
      "Do a bellringer!",
      "Make out with someone of the group's choosing!",
    ],
    medium: [
      "Let the group write on your body!",
      "Do a naked lap around the room!",
      "Let someone pour a drink on you!",
      "Do a strip tease!",
      "Make out with the person to your left!",
      "Let someone give you a hickey!",
      "Do a body shot off someone!",
      "Flash someone in the room!",
      "Let the group choose who you kiss!",
      "Do a keg stand for 10 seconds!",
    ],
    hard: [
      "Let everyone take a shot off your body!",
      "Do something illegal chosen by the group!",
      "Make out with everyone in the room!",
      "Let the group record you doing something embarrassing!",
      "Do a naked dance!",
      "Let someone spank you!",
      "Do body shots off three people!",
      "Let the group choose your sexual partner for the night!",
      "Do the most dangerous thing you're willing to do!",
      "Propose to a stranger!",
    ],
  },
  couples: {
    easy: [
      "Give your partner a piggyback ride!",
      "Whisper something sweet in your partner's ear!",
      "Kiss your partner for 10 seconds!",
      "Dance with your partner for 1 minute!",
      "Give your partner a massage for 2 minutes!",
      "Say 5 things you love about your partner!",
      "Slow dance with your partner!",
      "Feed your partner something!",
      "Hold hands and stare into each other's eyes for 30 seconds!",
      "Give your partner a compliment in the form of a poem!",
    ],
    medium: [
      "Let your partner blindfold you and feed you!",
      "Recreate your first kiss!",
      "Let your partner give you a makeover!",
      "Share a piece of food using only your mouths!",
      "Let your partner take a funny photo of you!",
      "Serenade your partner!",
      "Let your partner pick your next date activity!",
      "Do a couple's challenge together!",
      "Write a short love poem and read it aloud!",
      "Let your partner go through your phone!",
    ],
    hard: [
      "Propose to your partner as a joke!",
      "Let your partner post something on your social media!",
      "Share the most intimate secret you've never told anyone!",
      "Let your partner choose your outfit for the day!",
      "Tell your partner your biggest insecurity!",
      "Do a sexy dance for your partner!",
      "Let your partner tie you up!",
      "Confess something you've been scared to say!",
      "Let your partner have complete control for the next hour!",
      "Do something your partner asks without question!",
    ],
  },
  kids: {
    easy: [
      "Do 5 jumping jacks!",
      "Sing the ABC song backwards!",
      "Hop on one foot for 10 seconds!",
      "Make your silliest face!",
      "Roar like a lion!",
      "Do a crazy dance!",
      "Spin around 5 times!",
      "Pretend to be a monkey for 30 seconds!",
      "Say a tongue twister!",
      "Do a somersault!",
    ],
    medium: [
      "Walk like a crab across the room!",
      "Sing everything you say for 2 minutes!",
      "Do your best dinosaur impression!",
      "Balance a spoon on your nose!",
      "Talk with your tongue out for 1 minute!",
      "Do a dramatic reading of a children's book!",
      "Make up a dance and perform it!",
      "Act like a statue for 30 seconds!",
      "Do your best robot dance!",
      "Speak in rhymes for 3 minutes!",
    ],
    hard: [
      "Let someone draw on your face!",
      "Do a handstand for 10 seconds!",
      "Eat something blindfolded and guess what it is!",
      "Let someone style your hair however they want!",
      "Do 20 pushups!",
      "Let a sibling be your boss for 10 minutes!",
      "Perform a talent show for everyone!",
      "Let someone tickle you for 20 seconds without laughing!",
      "Do a magic trick!",
      "Make up a song about your family and sing it!",
    ],
  },
  office: {
    easy: [
      "Do your best boss impression!",
      "Talk in a professional tone about something silly!",
      "Give a 1-minute presentation on your favorite food!",
      "Write an email in pirate speak!",
      "Do 10 desk pushups!",
      "Use a fancy word in every sentence for 2 minutes!",
      "Compliment everyone in a professional manner!",
      "Do a dramatic reading of an email!",
      "Speak only in corporate jargon for 3 minutes!",
      "Make up a business idea and pitch it!",
    ],
    medium: [
      "Let someone send a message from your Slack!",
      "Do a presentation on something completely random!",
      "Let someone change your computer wallpaper!",
      "Speak in a different accent for an entire meeting!",
      "Do a karaoke performance of a work-appropriate song!",
      "Let someone choose your desktop background!",
      "Write a haiku about your job!",
      "Let someone pick your ringtone!",
      "Do a dramatic reading of the company mission statement!",
      "Let someone write your status update!",
    ],
    hard: [
      "Let someone send an email from your account!",
      "Do a stand-up comedy routine about your job!",
      "Let the team choose your lunch!",
      "Call a client and sing your greeting!",
      "Let someone go through your email inbox for 1 minute!",
      "Do a strip tease to your desk music!",
      "Let the team record a video of you doing something silly!",
      "Propose a ridiculous company policy!",
      "Let someone choose your outfit for a day!",
      "Do a trust fall with a coworker!",
    ],
  },
};

export default function ToolHome() {
  const [mode, setMode] = useState("truth");
  const [difficulty, setDifficulty] = useState("medium");
  const [pack, setPack] = useState("friends");
  const [current, setCurrent] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [skipped, setSkipped] = useState(0);
  const [customQuestions, setCustomQuestions] = useState([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customMode, setCustomMode] = useState("truth");
  const [customDiff, setCustomDiff] = useState("medium");

  const questionPool = useMemo(() => {
    const base = mode === "truth" ? TRUTHS : DARES;
    const packData = (base[pack] || base.friends) || {};
    return packData[difficulty] || packData.easy || [];
  }, [mode, pack, difficulty]);

  const allPool = useMemo(() => {
    const all = [...questionPool];
    customQuestions
      .filter((q) => q.mode === mode && q.difficulty === difficulty)
      .forEach((q) => all.push(q.text));
    if (shuffleMode) {
      for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [all[i], all[j]] = [all[j], all[i]];
      }
    }
    return all;
  }, [questionPool, customQuestions, mode, difficulty, shuffleMode]);

  const pickQuestion = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setShowCountdown(true);
    setCurrent(null);

    setTimeout(() => {
      setShowCountdown(false);
      if (allPool.length === 0) {
        setIsAnimating(false);
        setCurrent({ id: generateId(), text: "No more questions! Add custom ones or change filters.", mode, difficulty });
        return;
      }
      const text = allPool[Math.floor(Math.random() * allPool.length)];
      setCurrent({ id: generateId(), text, mode, difficulty, pack });
      setIsAnimating(false);
      setHistory((prev) => [{ id: generateId(), text, mode, difficulty, date: new Date().toLocaleString() }, ...prev.slice(0, 49)]);
    }, 1500);
  }, [isAnimating, allPool, mode, difficulty, pack]);

  const skip = useCallback(() => {
    setSkipped((prev) => prev + 1);
    pickQuestion();
  }, [pickQuestion]);

  const toggleFavorite = useCallback(() => {
    if (!current) return;
    setFavorites((prev) => {
      const exists = prev.find((f) => f.text === current.text);
      if (exists) return prev.filter((f) => f.text !== current.text);
      return [...prev, { ...current }];
    });
  }, [current]);

  const addCustom = useCallback((text, cMode, cDiff) => {
    setCustomQuestions((prev) => [...prev, { id: generateId(), text, mode: cMode, difficulty: cDiff }]);
  }, []);

  const removeCustom = useCallback((id) => {
    setCustomQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const reset = useCallback(() => {
    setCurrent(null);
    setHistory([]);
    setSkipped(0);
    setFavorites([]);
  }, []);

  const isFavorited = current && favorites.some((f) => f.text === current.text);

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-(--foreground)">Truth or Dare</h1>
          <p className="text-(--muted-foreground) mt-1">The ultimate party game with hundreds of challenges</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-(--card) border border-(--border) p-5 space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("truth")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition border ${
                    mode === "truth"
                      ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                      : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--primary)"
                  }`}
                >
                  <HelpCircle size="18" className="mx-auto mb-1" /> Truth
                </button>
                <button
                  onClick={() => setMode("dare")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition border ${
                    mode === "dare"
                      ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                      : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--primary)"
                  }`}
                >
                  <Skull size="18" className="mx-auto mb-1" /> Dare
                </button>
              </div>

              <div className="flex gap-2">
                {["easy", "medium", "hard"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize border transition ${
                      difficulty === d
                        ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                        : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--primary)"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {Object.entries(MODE_PACKS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setPack(key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1 ${
                      pack === key
                        ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                        : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--primary)"
                    }`}
                  >
                    <val.icon size="12" />
                    {val.label}
                  </button>
                ))}
              </div>

              <div className="min-h-[180px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {showCountdown ? (
                    <motion.div
                      key="countdown"
                      initial={{ scale: 2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="text-center"
                    >
                      <Timer size="56" className="mx-auto mb-2 text-(--primary) animate-pulse" />
                      <p className="text-xl font-bold text-(--foreground) animate-pulse">Get Ready...</p>
                    </motion.div>
                  ) : current ? (
                    <motion.div
                      key={current.id}
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      className="text-center w-full"
                    >
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase mb-3 bg-(--primary)/10 text-(--primary)">
                        <span>{mode} • {difficulty}</span>
                        {MODE_PACKS[pack] && (
                          <>
                            <span>•</span>
                            <val.icon size="12" />
                            <span>{MODE_PACKS[pack].label}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xl font-semibold text-(--foreground) mb-4 leading-relaxed px-4">
                        {current.text}
                      </p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={toggleFavorite}
                          className="p-2.5 rounded-xl hover:bg-(--muted) transition"
                        >
                          <Star size="18" className={isFavorited ? "fill-amber-400 text-amber-400" : "text-(--muted-foreground)"} />
                        </button>
                        <button onClick={skip} className="px-4 py-2.5 rounded-xl bg-(--muted) text-(--foreground) font-medium text-sm hover:bg-(--border) transition flex items-center gap-1.5">
                          <SkipForward size="16" /> Skip
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-(--muted-foreground)">
                      <Sparkles size="48" className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Press Pick to start!</p>
                      <p className="text-xs mt-1">Skipped: {skipped}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={pickQuestion}
                  disabled={isAnimating}
                  className="flex-1 py-3.5 rounded-xl bg-(--primary) text-(--primary-foreground) font-bold hover:opacity-90 disabled:opacity-40 transition shadow-lg shadow-(--primary)/20 text-lg"
                >
                  {isAnimating ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Sparkles size="20" />
                      </motion.span>
                      Picking...
                    </span>
                  ) : (
                    "Pick!"
                  )}
                </button>
              </div>

              <label className="flex items-center gap-2 text-sm text-(--muted-foreground) cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleMode}
                  onChange={(e) => setShuffleMode(e.target.checked)}
                  className="w-4 h-4 rounded border-(--border) text-(--primary) focus:ring-(--primary)"
                />
                <Shuffle size="14" /> Shuffle mode
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-(--card) border border-(--border) p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground) flex items-center gap-1">
                  <Plus size="12" /> Custom Questions
                </h4>
                <button onClick={() => setShowAddCustom(!showAddCustom)} className="p-1 rounded hover:bg-(--muted) text-(--muted-foreground) transition">
                  <Plus size="14" />
                </button>
              </div>

              {showAddCustom && (
                <div className="space-y-2 p-3 rounded-xl bg-(--muted)">
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Enter your question..."
                    className="w-full px-3 py-2 rounded-lg bg-(--card) border border-(--border) text-(--foreground) placeholder:text-(--muted-foreground) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary) resize-none"
                    rows="2"
                  />
                  <div className="flex gap-1">
                    {["truth", "dare"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setCustomMode(m)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition ${
                          customMode === m ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--card) text-(--muted-foreground)"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {["easy", "medium", "hard"].map((d) => (
                      <button
                        key={d}
                        onClick={() => setCustomDiff(d)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition ${
                          customDiff === d ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--card) text-(--muted-foreground)"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (!customText.trim()) return;
                      addCustom(customText.trim(), customMode, customDiff);
                      setCustomText("");
                      setShowAddCustom(false);
                    }}
                    disabled={!customText.trim()}
                    className="w-full py-2 rounded-lg bg-(--primary) text-(--primary-foreground) text-xs font-bold hover:opacity-90 disabled:opacity-40 transition"
                  >
                    Add Question
                  </button>
                </div>
              )}

              <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                {customQuestions.length === 0 ? (
                  <p className="text-xs text-(--muted-foreground) text-center py-4">No custom questions yet</p>
                ) : (
                  customQuestions.map((q) => (
                    <div key={q.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-(--muted) text-sm">
                      <span className="flex-1 truncate text-(--foreground)">{q.text}</span>
                      <span className="text-[10px] uppercase text-(--muted-foreground)">{q.mode}</span>
                      <button onClick={() => removeCustom(q.id)} className="p-0.5 text-(--muted-foreground) hover:text-red-500">
                        <X size="12" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {favorites.length > 0 && (
                <div className="pt-3 border-t border-(--border)">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star size="14" className="text-amber-400" />
                    <span className="text-xs font-semibold text-(--foreground)">Favorites ({favorites.length})</span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                    {favorites.map((f, i) => (
                      <div key={i} className="text-xs text-(--foreground) px-2.5 py-1.5 rounded-lg bg-(--muted)">
                        {f.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-(--card) border border-(--border) p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">History</h4>
                <span className="text-[10px] text-(--muted-foreground) bg-(--muted) px-2 py-0.5 rounded-full">{history.length}</span>
              </div>
              {history.length === 0 ? (
                <p className="text-xs text-(--muted-foreground) text-center py-4">No history yet</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {history.slice(0, 20).map((h) => (
                    <div key={h.id} className="px-2.5 py-1.5 rounded-lg bg-(--muted)">
                      <p className="text-xs text-(--foreground) truncate">{h.text}</p>
                      <p className="text-[10px] text-(--muted-foreground) mt-0.5">
                        {h.mode} • {h.difficulty}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={reset} className="mt-3 w-full py-2 rounded-lg bg-(--muted) text-(--muted-foreground) hover:text-(--foreground) text-xs font-medium transition flex items-center justify-center gap-1.5">
                <RotateCcw size="12" /> Reset All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
