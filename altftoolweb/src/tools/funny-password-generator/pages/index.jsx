"use client";

import { useState, useCallback, useMemo } from "react";
import { Copy, Check, RefreshCw, Eye, EyeOff } from "lucide-react";

const ADJECTIVES = [
  "Silly", "Funky", "Wacky", "Zany", "Goofy", "Lazy", "Crazy", "Chubby",
  "Sneaky", "Giddy", "Fluffy", "Grumpy", "Cheeky", "Jolly", "Nerdy", "Dizzy",
  "Bouncy", "Clumsy", "Dopey", "Frizzy", "Gloomy", "Hairy", "Jumpy", "Kooky",
  "Loony", "Moody", "Nifty", "Perky", "Quirky", "Sassy", "Snoozy", "Zippy",
  "Angry", "Bald", "Brainy", "Breezy", "Bubbly", "Bumpy", "Chirpy", "Cozy",
  "Crafty", "Creaky", "Crispy", "Crunchy", "Curly", "Dandy", "Dinky", "Dorky",
  "Drowsy", "Fancy", "Fiesty", "Fizzy", "Flashy", "Floppy", "Frothy", "Funny",
  "Fuzzy", "Gamy", "Gassy", "Gaudy", "Gimpy", "Glad", "Gleeful", "Gloppy",
  "Greasy", "Grouchy", "Grubby", "Gummy", "Hairy", "Happy", "Harsh", "Hasty",
  "Hilly", "Hip", "Huffy", "Humble", "Hunky", "Husky", "Icy", "Itchy",
  "Jazzy", "Jittery", "Juicy", "Jumbo", "Kinky", "Kitschy", "Lanky", "Lazy",
  "Lemon", "Lively", "Lumpy", "Mellow", "Messy", "Mighty", "Milky", "Misty",
  "Mushy", "Mythic", "Nappy", "Nasty", "Nifty", "Nutty", "Pearly", "Peppy",
  "Perky", "Pesky", "Picky", "Pithy", "Plucky", "Plump", "Plush", "Prickly",
  "Puffy", "Puny", "Quacky", "Queasy", "Ragged", "Rambly", "Randy", "Raspy",
  "Risky", "Roasty", "Rough", "Rowdy", "Rusty", "Salty", "Sappy", "Saucy",
  "Scrappy", "Scruffy", "Shabby", "Shady", "Shaky", "Shiny", "Shoddy", "Shrill",
  "Shy", "Silly", "Sizzly", "Sketchy", "Skinny", "Sleek", "Slick", "Sloppy",
  "Smelly", "Smoggy", "Smooth", "Snappy", "Snazzy", "Sneaky", "Snug", "Soapy",
  "Soggy", "Sparky", "Spicy", "Splashy", "Spoony", "Sporty", "Spotty", "Spry",
  "Squaky", "Squeaky", "Stale", "Starchy", "Static", "Steady", "Steamy", "Sticky",
  "Stingy", "Stocky", "Stodgy", "Stoic", "Stormy", "Stout", "Strange", "Strawy",
  "Stretchy", "Strict", "Stuffy", "Sturdy", "Sugary", "Sulky", "Sunny", "Super",
  "Supreme", "Surly", "Swanky", "Sweet", "Swift", "Tacky", "Talented", "Tame",
  "Tangy", "Tasty", "Tawny", "Tedious", "Teeny", "Tender", "Tense", "Testy",
  "Thirsty", "Thorny", "Thrifty", "Thumpy", "Tidy", "Tight", "Tiny", "Tipsy",
  "Tired", "Tough", "Tranquil", "Trippy", "Tropical", "Troubled", "Tubby", "Tumid",
  "Tweedy", "Twiggy", "Twisty", "Ugly", "Uneven", "Unfair", "Unhappy", "Unique",
  "United", "Uplift", "Uppity", "Upset", "Urban", "Urgent", "Usable", "Utter",
  "Vacant", "Vague", "Vain", "Valid", "Vapid", "Vast", "Velvet", "Vexed",
  "Vibrant", "Vicious", "Victory", "Vigilant", "Vivid", "Vocal", "Vogue", "Volatile",
  "Wacky", "Warm", "Warped", "Wary", "Wasteful", "Watchful", "Wavy", "Waxen",
  "Wealthy", "Wearisome", "Weary", "Wee", "Weighty", "Weird", "Whimsical", "Whiny",
  "Whispered", "White", "Whole", "Wicked", "Wide", "Wiggly", "Wild", "Willing",
  "Windy", "Wiry", "Wise", "Wispy", "Witty", "Wobbly", "Woeful", "Wonderful",
  "Wooden", "Wordy", "Worldly", "Wormy", "Worried", "Worthless", "Worthy", "Wound",
  "Wrinkly", "Youthful", "Zany", "Zealous", "Zesty", "Zippy", "Zonked", "Zoppy",
];

const NOUNS = [
  "Banana", "Pizza", "Dragon", "Potato", "Ninja", "Penguin", "Wizard", "Duck",
  "Robot", "Panda", "Taco", "Koala", "Noodle", "Pickle", "Cheese", "Muffin",
  "Biscuit", "Waffle", "Gizmo", "Gadget", "Widget", "Doodle", "Sprocket", "Fidget",
  "Cactus", "Llama", "Flamingo", "Walrus", "Badger", "Raccoon", "Squirrel", "Otter",
  "Beaver", "Moose", "Sloth", "Ostrich", "Parrot", "Pigeon", "Sparrow", "Robin",
  "Hedgehog", "Porcupine", "Armadillo", "Platypus", "Kangaroo", "Chimpanzee", "Gorilla", "Orangutan",
  "Gibbon", "Lemur", "Meerkat", "Hyena", "Jackal", "Panther", "Leopard", "Cheetah",
  "Jaguar", "Lynx", "Bobcat", "Cougar", "Ocelot", "Serval", "Caracal", "Wildcat",
  "Bison", "Buffalo", "Yak", "Ox", "Goat", "Sheep", "Ram", "Ewe",
  "Lamb", "Hog", "Boar", "Sow", "Piglet", "Foal", "Colt", "Filly",
  "Mare", "Stallion", "Pony", "Donkey", "Mule", "Camel", "Dromedary", "Alpaca",
  "Llama", "Vicuna", "Guanaco", "Deer", "Fawn", "Doe", "Buck", "Stag",
  "Elk", "Moose", "Caribou", "Reindeer", "Antelope", "Gazelle", "Impala", "Springbok",
  "Wildebeest", "Gnu", "Zebra", "Quagga", "Okapi", "Giraffe", "Hippo", "Rhino",
  "Elephant", "Mammoth", "Mastodon", "Walrus", "Seal", "Sea Lion", "Fur Seal", "Leopard Seal",
  "Elephant Seal", "Manatee", "Dugong", "Dolphin", "Porpoise", "Whale", "Killer Whale", "Sperm Whale",
  "Blue Whale", "Humpback", "Beluga", "Narwhal", "Orca", "Shark", "Hammerhead", "Great White",
  "Tiger Shark", "Bull Shark", "Mako", "Ray", "Manta Ray", "Stingray", "Eel", "Moray",
  "Lobster", "Crab", "Shrimp", "Prawn", "Crayfish", "Krill", "Barnacle", "Limpet",
  "Snail", "Slug", "Clam", "Oyster", "Mussel", "Scallop", "Conch", "Whelk",
  "Octopus", "Squid", "Cuttlefish", "Nautilus", "Jellyfish", "Anemone", "Coral", "Sponge",
  "Starfish", "Sea Urchin", "Sea Cucumber", "Sea Horse", "Pipefish", "Pufferfish", "Anglerfish", "Clownfish",
  "Tang", "Blowfish", "Swordfish", "Marlin", "Tuna", "Salmon", "Trout", "Bass",
  "Catfish", "Carp", "Goldfish", "Koi", "Guppy", "Molly", "Platy", "Swordtail",
  "Tetra", "Angelfish", "Discus", "Oscar", "Cichlid", "Betta", "Gourami", "Loach",
  "Barb", "Danio", "Rasbora", "Corydoras", "Pleco", "Arowana", "Arapaima", "Piranha",
  "Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig", "Grape", "Honeydew",
  "Kiwi", "Lemon", "Mango", "Nectarine", "Orange", "Papaya", "Quince", "Raspberry",
  "Strawberry", "Tangerine", "Watermelon", "Blueberry", "Cranberry", "Blackberry", "Boysenberry", "Raisin",
  "Currant", "Gooseberry", "Mulberry", "Breadfruit", "Coconut", "Dragonfruit", "Jackfruit", "Lychee",
  "Pear", "Peach", "Plum", "Apricot", "Avocado", "Cucumber", "Pumpkin", "Squash",
  "Zucchini", "Eggplant", "Tomato", "Pepper", "Jalapeno", "Habanero", "Serrano", "Cayenne",
  "Carrot", "Potato", "Yam", "Sweet Potato", "Radish", "Beet", "Turnip", "Parsnip",
  "Onion", "Garlic", "Leek", "Shallot", "Scallion", "Celery", "Asparagus", "Broccoli",
  "Cauliflower", "Cabbage", "Kale", "Spinach", "Lettuce", "Arugula", "Endive", "Chard",
  "Frisco", "Cookie", "Brownie", "Cupcake", "Donut", "Croissant", "Bagel", "Muffin",
  "Pancake", "Waffle", "Toast", "Crepe", "Biscuit", "Scone", "Brioche", "Danish",
  "Strudel", "Eclair", "Macaron", "Truffle", "Bonbon", "Caramel", "Toffee", "Fudge",
  "Lollipop", "Gumball", "Jawbreaker", "Licorice", "Marshmallow", "Nougat", "Marzipan", "Halva",
  "Praline", "Ganache", "Mousse", "Pudding", "Custard", "Flan", "Creme Brulee", "Cheesecake",
  "Tiramisu", "Gelato", "Sorbet", "Sherbet", "Ice Cream", "Frozen Yogurt", "Milkshake", "Smoothie",
];

const SYMBOLS = "!@#$%^&*";

function getStrength(len) {
  if (len < 6) return { label: "Weak", color: "var(--danger)", pct: 20 };
  if (len < 10) return { label: "Fair", color: "var(--warning)", pct: 45 };
  if (len < 14) return { label: "Good", color: "var(--primary)", pct: 70 };
  return { label: "Strong", color: "var(--success)", pct: 95 };
}

export default function ToolHome() {
  const [length, setLength] = useState(14);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const generate = useCallback(() => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = useNumbers ? String(Math.floor(Math.random() * 900) + 100) : "";
    const sym = useSymbols ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : "";
    let pw = adj + noun + num + sym;
    if (pw.length > length) {
      pw = pw.slice(0, length);
    } else if (pw.length < length) {
      const padChars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" + (useSymbols ? SYMBOLS : "");
      while (pw.length < length) {
        pw += padChars[Math.floor(Math.random() * padChars.length)];
      }
    }
    setPassword(pw);
  }, [length, useNumbers, useSymbols]);

  const strength = useMemo(() => getStrength(password.length), [password]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Funny Password Generator - Memorable and Secure",
            "description": "Generate funny, memorable passwords online with adjectives, nouns, numbers, and symbols. Secure yet hilarious password ideas you won't forget.",
            "applicationCategory": "SecurityApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />
      <div className="max-w-lg mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>
            Funny Password Generator
          </h1>
          <p className="text-lg opacity-80" style={{ color: "var(--muted-foreground)" }}>
            Memorable passwords with a twist
          </p>
        </div>

        <div className="rounded-2xl p-6 border space-y-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div aria-live="polite" aria-atomic="true">
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                readOnly
                placeholder="Click generate to create a password"
                className="w-full px-4 py-3 pr-20 rounded-xl border text-lg font-mono outline-none"
                style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="p-2 rounded-lg"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!password}
                  aria-label={copied ? "Copied" : "Copy password to clipboard"}
                  className="p-2 rounded-lg disabled:opacity-40"
                  style={{ color: copied ? "var(--primary)" : "var(--muted-foreground)" }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div aria-live="polite" aria-atomic="true">
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${strength.pct}%`, background: strength.color }} />
            </div>
            <p className="text-xs font-bold mt-1 text-right" style={{ color: strength.color }}>{strength.label}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold mb-1 block" style={{ color: "var(--foreground)" }}>
                Password Length: {length}
              </label>
              <input
                type="range"
                min={6}
                max={30}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Numbers</span>
              <button
                onClick={() => setUseNumbers(!useNumbers)}
                role="switch"
                aria-checked={useNumbers}
                aria-label="Include numbers"
                className={`w-10 h-5 rounded-full transition-colors relative ${useNumbers ? "" : ""}`}
                style={{ background: useNumbers ? "var(--primary)" : "var(--border)" }}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${useNumbers ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Symbols</span>
              <button
                onClick={() => setUseSymbols(!useSymbols)}
                role="switch"
                aria-checked={useSymbols}
                aria-label="Include symbols"
                className={`w-10 h-5 rounded-full transition-colors relative ${useSymbols ? "" : ""}`}
                style={{ background: useSymbols ? "var(--primary)" : "var(--border)" }}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${useSymbols ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          <button
            onClick={generate}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-primary-foreground transition-all active:scale-[0.98]"
            style={{ background: "var(--primary)" }}
          >
            <RefreshCw size={18} /> Generate Password
          </button>
        </div>
      </div>
    </div>
  );
}
